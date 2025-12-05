"""Ollama integration service for LLM operations."""

from typing import AsyncIterator

import httpx
import structlog

from app.config import get_settings
from app.models.chat import ChatMessage, ChatRequest, ChatResponse, StreamChunk
from app.models.model import ModelInfo, ModelDetails

logger = structlog.get_logger()
settings = get_settings()


class OllamaService:
    """Service for interacting with Ollama API."""

    def __init__(self) -> None:
        """Initialize Ollama service with HTTP client."""
        self.base_url = settings.ollama_url
        self.timeout = settings.ollama_timeout
        self._client: httpx.AsyncClient | None = None

    @property
    def client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=httpx.Timeout(self.timeout, connect=10.0),
            )
        return self._client

    async def close(self) -> None:
        """Close HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None

    async def health_check(self) -> bool:
        """Check if Ollama is available."""
        try:
            response = await self.client.get("/api/tags")
            return response.status_code == 200
        except httpx.RequestError:
            return False

    # ==================== Model Management ====================

    async def list_models(self) -> list[ModelInfo]:
        """List all available models in Ollama."""
        try:
            response = await self.client.get("/api/tags")
            response.raise_for_status()
            data = response.json()

            models = []
            for model_data in data.get("models", []):
                models.append(
                    ModelInfo(
                        name=model_data.get("name", ""),
                        modified_at=model_data.get("modified_at", ""),
                        size=model_data.get("size", 0),
                        digest=model_data.get("digest", ""),
                        details=ModelDetails(
                            format=model_data.get("details", {}).get("format", ""),
                            family=model_data.get("details", {}).get("family", ""),
                            parameter_size=model_data.get("details", {}).get(
                                "parameter_size", ""
                            ),
                            quantization_level=model_data.get("details", {}).get(
                                "quantization_level", ""
                            ),
                        ),
                    )
                )
            return models
        except httpx.RequestError as e:
            logger.error("Failed to list models", error=str(e))
            return []

    async def get_model(self, model_name: str) -> ModelInfo | None:
        """Get details of a specific model."""
        models = await self.list_models()
        for model in models:
            if model.name == model_name or model.name.startswith(f"{model_name}:"):
                return model
        return None

    async def pull_model(self, model_name: str) -> AsyncIterator[dict]:
        """
        Pull a model from Ollama registry.

        Yields progress updates as the model downloads.
        """
        logger.info("Pulling model", model=model_name)

        async with self.client.stream(
            "POST",
            "/api/pull",
            json={"name": model_name},
            timeout=httpx.Timeout(600.0, connect=10.0),  # 10 min for large models
        ) as response:
            async for line in response.aiter_lines():
                if line:
                    import json

                    try:
                        data = json.loads(line)
                        yield data
                    except json.JSONDecodeError:
                        continue

    async def delete_model(self, model_name: str) -> bool:
        """Delete a model from Ollama."""
        try:
            response = await self.client.delete(
                "/api/delete",
                json={"name": model_name},
            )
            return response.status_code == 200
        except httpx.RequestError as e:
            logger.error("Failed to delete model", model=model_name, error=str(e))
            return False

    # ==================== Chat Completion ====================

    async def chat(self, request: ChatRequest) -> ChatResponse:
        """
        Send a chat completion request.

        Non-streaming response.
        """
        messages = [
            {"role": msg.role, "content": msg.content} for msg in request.messages
        ]

        payload = {
            "model": request.model,
            "messages": messages,
            "stream": False,
            "options": {},
        }

        if request.temperature is not None:
            payload["options"]["temperature"] = request.temperature
        if request.top_p is not None:
            payload["options"]["top_p"] = request.top_p
        if request.max_tokens is not None:
            payload["options"]["num_predict"] = request.max_tokens

        logger.info("Chat request", model=request.model, messages_count=len(messages))

        response = await self.client.post("/api/chat", json=payload)
        response.raise_for_status()
        data = response.json()

        return ChatResponse(
            model=data.get("model", request.model),
            message=ChatMessage(
                role="assistant",
                content=data.get("message", {}).get("content", ""),
            ),
            done=data.get("done", True),
            total_duration=data.get("total_duration"),
            load_duration=data.get("load_duration"),
            prompt_eval_count=data.get("prompt_eval_count"),
            prompt_eval_duration=data.get("prompt_eval_duration"),
            eval_count=data.get("eval_count"),
            eval_duration=data.get("eval_duration"),
        )

    async def chat_stream(self, request: ChatRequest) -> AsyncIterator[StreamChunk]:
        """
        Send a streaming chat completion request.

        Yields chunks as they are generated.
        """
        messages = [
            {"role": msg.role, "content": msg.content} for msg in request.messages
        ]

        payload = {
            "model": request.model,
            "messages": messages,
            "stream": True,
            "options": {},
        }

        if request.temperature is not None:
            payload["options"]["temperature"] = request.temperature
        if request.top_p is not None:
            payload["options"]["top_p"] = request.top_p
        if request.max_tokens is not None:
            payload["options"]["num_predict"] = request.max_tokens

        logger.info(
            "Streaming chat request", model=request.model, messages_count=len(messages)
        )

        async with self.client.stream("POST", "/api/chat", json=payload) as response:
            async for line in response.aiter_lines():
                if line:
                    import json

                    try:
                        data = json.loads(line)
                        yield StreamChunk(
                            model=data.get("model", request.model),
                            content=data.get("message", {}).get("content", ""),
                            done=data.get("done", False),
                        )
                    except json.JSONDecodeError:
                        continue

    # ==================== Embeddings ====================

    async def generate_embedding(self, text: str, model: str | None = None) -> list[float]:
        """Generate embedding vector for text."""
        model = model or settings.ollama_embedding_model

        response = await self.client.post(
            "/api/embeddings",
            json={"model": model, "prompt": text},
        )
        response.raise_for_status()
        data = response.json()

        return data.get("embedding", [])

    async def generate_embeddings_batch(
        self, texts: list[str], model: str | None = None
    ) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        embeddings = []
        for text in texts:
            embedding = await self.generate_embedding(text, model)
            embeddings.append(embedding)
        return embeddings

    # ==================== Generation ====================

    async def generate(
        self,
        prompt: str,
        model: str | None = None,
        system: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> str:
        """
        Simple text generation (non-chat format).

        For backwards compatibility and simple use cases.
        """
        model = model or settings.ollama_default_model

        payload: dict = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {},
        }

        if system:
            payload["system"] = system
        if temperature is not None:
            payload["options"]["temperature"] = temperature
        if max_tokens is not None:
            payload["options"]["num_predict"] = max_tokens

        response = await self.client.post("/api/generate", json=payload)
        response.raise_for_status()
        data = response.json()

        return data.get("response", "")
