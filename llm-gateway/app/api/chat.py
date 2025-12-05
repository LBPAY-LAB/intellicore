"""Chat completion API endpoints."""

import json
from typing import AsyncIterator

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.config import get_settings
from app.models.chat import (
    ChatRequest,
    ChatResponse,
    EmbeddingRequest,
    EmbeddingResponse,
    GenerateRequest,
    GenerateResponse,
)

router = APIRouter()
settings = get_settings()


@router.post("/completions", response_model=ChatResponse)
async def chat_completion(body: ChatRequest, request: Request) -> ChatResponse | StreamingResponse:
    """
    Create a chat completion.

    Supports both streaming and non-streaming responses.
    """
    ollama = request.app.state.ollama

    # Validate model
    model_base = body.model.split(":")[0]
    allowed_bases = [m.split(":")[0] for m in settings.allowed_models]
    if model_base not in allowed_bases:
        raise HTTPException(
            status_code=400,
            detail=f"Model '{body.model}' is not allowed. Allowed: {settings.allowed_models}",
        )

    if body.stream:
        async def generate_stream() -> AsyncIterator[bytes]:
            """Generate SSE stream."""
            async for chunk in ollama.chat_stream(body):
                data = {
                    "model": chunk.model,
                    "content": chunk.content,
                    "done": chunk.done,
                }
                yield f"data: {json.dumps(data)}\n\n".encode()

            yield b"data: [DONE]\n\n"

        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    # Non-streaming response
    response = await ollama.chat(body)
    return response


@router.post("/generate", response_model=GenerateResponse)
async def generate_text(body: GenerateRequest, request: Request) -> GenerateResponse:
    """
    Simple text generation (non-chat format).

    For backwards compatibility and simple use cases.
    """
    ollama = request.app.state.ollama

    # Validate model
    model_base = body.model.split(":")[0]
    allowed_bases = [m.split(":")[0] for m in settings.allowed_models]
    if model_base not in allowed_bases:
        raise HTTPException(
            status_code=400,
            detail=f"Model '{body.model}' is not allowed",
        )

    response_text = await ollama.generate(
        prompt=body.prompt,
        model=body.model,
        system=body.system,
        temperature=body.temperature,
        max_tokens=body.max_tokens,
    )

    return GenerateResponse(model=body.model, response=response_text)


@router.post("/embeddings", response_model=EmbeddingResponse)
async def generate_embedding(body: EmbeddingRequest, request: Request) -> EmbeddingResponse:
    """
    Generate embedding vector for text.

    Uses the configured embedding model (default: nomic-embed-text).
    """
    ollama = request.app.state.ollama

    embedding = await ollama.generate_embedding(body.text, body.model)

    return EmbeddingResponse(
        model=body.model,
        embedding=embedding,
        dimensions=len(embedding),
    )


@router.post("/embeddings/batch")
async def generate_embeddings_batch(
    texts: list[str],
    request: Request,
    model: str = "nomic-embed-text",
) -> dict:
    """
    Generate embeddings for multiple texts.

    More efficient than calling embeddings endpoint multiple times.
    """
    ollama = request.app.state.ollama

    embeddings = await ollama.generate_embeddings_batch(texts, model)

    return {
        "model": model,
        "embeddings": embeddings,
        "count": len(embeddings),
        "dimensions": len(embeddings[0]) if embeddings else 0,
    }


@router.post("/validate")
async def validate_field(
    field_name: str,
    field_type: str,
    value: str,
    rules: str | None = None,
    request: Request = None,
) -> dict:
    """
    Validate a field value using LLM.

    Convenience endpoint using the field-validation template.
    """
    from app.api.templates import get_prompt_manager
    from app.models.chat import ChatMessage, ChatRequest

    ollama = request.app.state.ollama
    manager = get_prompt_manager()

    # Render validation template
    try:
        rendered = manager.render_template(
            "field-validation",
            {
                "field_name": field_name,
                "field_type": field_type,
                "value": value,
                "rules": rules or "No specific rules",
            },
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Build chat request
    messages = []
    if rendered.system_prompt:
        messages.append(ChatMessage(role="system", content=rendered.system_prompt))
    messages.append(ChatMessage(role="user", content=rendered.rendered))

    chat_request = ChatRequest(
        model=rendered.model or settings.ollama_default_model,
        messages=messages,
        temperature=rendered.temperature or 0.1,
    )

    # Get response
    response = await ollama.chat(chat_request)

    # Try to parse as JSON
    try:
        result = json.loads(response.message.content)
    except json.JSONDecodeError:
        # If not valid JSON, return raw response
        result = {
            "valid": None,
            "reason": response.message.content,
            "raw_response": True,
        }

    return {
        "field_name": field_name,
        "field_type": field_type,
        "value": value,
        "validation": result,
        "model": response.model,
    }


@router.post("/suggest-fields")
async def suggest_fields(
    object_type_name: str,
    description: str,
    domain: str | None = None,
    existing_fields: str | None = None,
    request: Request = None,
) -> dict:
    """
    Suggest fields for an ObjectType using LLM.

    Convenience endpoint using the object-type-suggestion template.
    """
    from app.api.templates import get_prompt_manager
    from app.models.chat import ChatMessage, ChatRequest

    ollama = request.app.state.ollama
    manager = get_prompt_manager()

    # Render suggestion template
    try:
        rendered = manager.render_template(
            "object-type-suggestion",
            {
                "object_type_name": object_type_name,
                "description": description,
                "domain": domain or "",
                "existing_fields": existing_fields or "",
            },
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Build chat request
    messages = []
    if rendered.system_prompt:
        messages.append(ChatMessage(role="system", content=rendered.system_prompt))
    messages.append(ChatMessage(role="user", content=rendered.rendered))

    chat_request = ChatRequest(
        model=rendered.model or settings.ollama_default_model,
        messages=messages,
        temperature=rendered.temperature or 0.3,
        max_tokens=2000,
    )

    # Get response
    response = await ollama.chat(chat_request)

    # Try to parse as JSON
    try:
        suggested_fields = json.loads(response.message.content)
    except json.JSONDecodeError:
        suggested_fields = {"raw_response": response.message.content}

    return {
        "object_type_name": object_type_name,
        "description": description,
        "suggested_fields": suggested_fields,
        "model": response.model,
    }
