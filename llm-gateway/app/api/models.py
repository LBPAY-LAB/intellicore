"""Model management API endpoints."""

import json
from typing import AsyncIterator

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.config import get_settings
from app.models.model import (
    DeleteModelRequest,
    ModelInfo,
    PullModelRequest,
    PullProgress,
)

router = APIRouter()
settings = get_settings()


@router.get("", response_model=list[ModelInfo])
async def list_models(request: Request) -> list[ModelInfo]:
    """
    List all available models.

    Returns a list of models currently available in Ollama.
    """
    ollama = request.app.state.ollama
    models = await ollama.list_models()
    return models


@router.get("/{model_name}", response_model=ModelInfo)
async def get_model(model_name: str, request: Request) -> ModelInfo:
    """
    Get details of a specific model.

    Returns detailed information about the requested model.
    """
    ollama = request.app.state.ollama
    model = await ollama.get_model(model_name)

    if not model:
        raise HTTPException(
            status_code=404,
            detail=f"Model '{model_name}' not found",
        )

    return model


@router.post("/pull")
async def pull_model(body: PullModelRequest, request: Request) -> StreamingResponse:
    """
    Pull a model from the Ollama registry.

    Streams progress updates as the model downloads.
    """
    # Validate model is allowed
    model_base = body.name.split(":")[0]
    if model_base not in [m.split(":")[0] for m in settings.allowed_models]:
        raise HTTPException(
            status_code=400,
            detail=f"Model '{body.name}' is not in the allowed models list. "
            f"Allowed: {settings.allowed_models}",
        )

    ollama = request.app.state.ollama

    async def generate_progress() -> AsyncIterator[bytes]:
        """Generate progress events."""
        async for update in ollama.pull_model(body.name):
            progress = PullProgress(
                status=update.get("status", ""),
                digest=update.get("digest"),
                total=update.get("total"),
                completed=update.get("completed"),
                percent=(
                    (update.get("completed", 0) / update.get("total", 1) * 100)
                    if update.get("total")
                    else None
                ),
            )
            yield f"data: {json.dumps(progress.model_dump())}\n\n".encode()

        yield b"data: {\"status\": \"complete\"}\n\n"

    return StreamingResponse(
        generate_progress(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.delete("/{model_name}")
async def delete_model(model_name: str, request: Request) -> dict:
    """
    Delete a model from Ollama.

    Removes the model and frees up disk space.
    """
    ollama = request.app.state.ollama

    # Check if model exists
    model = await ollama.get_model(model_name)
    if not model:
        raise HTTPException(
            status_code=404,
            detail=f"Model '{model_name}' not found",
        )

    success = await ollama.delete_model(model_name)

    if not success:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete model '{model_name}'",
        )

    return {"message": f"Model '{model_name}' deleted successfully"}


@router.get("/allowed/list")
async def list_allowed_models() -> dict:
    """
    List models that are allowed to be pulled.

    Returns the configured allowed models list.
    """
    return {
        "allowed_models": settings.allowed_models,
        "default_model": settings.ollama_default_model,
        "embedding_model": settings.ollama_embedding_model,
    }
