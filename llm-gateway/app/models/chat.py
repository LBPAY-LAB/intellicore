"""Chat-related Pydantic models."""

from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """A single message in a chat conversation."""

    role: Literal["system", "user", "assistant"] = Field(
        ..., description="Role of the message sender"
    )
    content: str = Field(..., description="Content of the message")


class ChatRequest(BaseModel):
    """Request for chat completion."""

    model: str = Field(default="llama3.2", description="Model to use for completion")
    messages: list[ChatMessage] = Field(
        ..., description="List of messages in the conversation"
    )
    temperature: float | None = Field(
        default=None, ge=0.0, le=2.0, description="Sampling temperature"
    )
    top_p: float | None = Field(
        default=None, ge=0.0, le=1.0, description="Nucleus sampling parameter"
    )
    max_tokens: int | None = Field(
        default=None, ge=1, description="Maximum tokens to generate"
    )
    stream: bool = Field(default=False, description="Enable streaming response")

    model_config = {"json_schema_extra": {"examples": [
        {
            "model": "llama3.2",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Hello!"},
            ],
            "temperature": 0.7,
            "stream": False,
        }
    ]}}


class ChatResponse(BaseModel):
    """Response from chat completion."""

    model: str = Field(..., description="Model used for completion")
    message: ChatMessage = Field(..., description="Generated message")
    done: bool = Field(..., description="Whether generation is complete")
    total_duration: int | None = Field(
        default=None, description="Total duration in nanoseconds"
    )
    load_duration: int | None = Field(
        default=None, description="Model load duration in nanoseconds"
    )
    prompt_eval_count: int | None = Field(
        default=None, description="Number of tokens in prompt"
    )
    prompt_eval_duration: int | None = Field(
        default=None, description="Prompt evaluation duration in nanoseconds"
    )
    eval_count: int | None = Field(
        default=None, description="Number of tokens generated"
    )
    eval_duration: int | None = Field(
        default=None, description="Generation duration in nanoseconds"
    )


class StreamChunk(BaseModel):
    """A single chunk in a streaming response."""

    model: str = Field(..., description="Model used for completion")
    content: str = Field(..., description="Generated content chunk")
    done: bool = Field(..., description="Whether generation is complete")


class GenerateRequest(BaseModel):
    """Request for simple text generation."""

    model: str = Field(default="llama3.2", description="Model to use")
    prompt: str = Field(..., description="Prompt text")
    system: str | None = Field(default=None, description="System prompt")
    temperature: float | None = Field(default=None, ge=0.0, le=2.0)
    max_tokens: int | None = Field(default=None, ge=1)

    model_config = {"json_schema_extra": {"examples": [
        {
            "model": "llama3.2",
            "prompt": "What is the capital of France?",
            "temperature": 0.7,
        }
    ]}}


class GenerateResponse(BaseModel):
    """Response from text generation."""

    model: str = Field(..., description="Model used")
    response: str = Field(..., description="Generated text")


class EmbeddingRequest(BaseModel):
    """Request for embedding generation."""

    text: str = Field(..., description="Text to embed")
    model: str = Field(
        default="nomic-embed-text", description="Embedding model to use"
    )


class EmbeddingResponse(BaseModel):
    """Response from embedding generation."""

    model: str = Field(..., description="Model used")
    embedding: list[float] = Field(..., description="Embedding vector")
    dimensions: int = Field(..., description="Vector dimensions")
