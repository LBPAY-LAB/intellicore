"""Prompt template API endpoints."""

from typing import Any

from fastapi import APIRouter, HTTPException, Request

from app.models.template import (
    PromptTemplate,
    RenderTemplateRequest,
    RenderTemplateResponse,
)
from app.services.prompt_manager import PromptManager

router = APIRouter()

# Initialize prompt manager (singleton)
_prompt_manager: PromptManager | None = None


def get_prompt_manager() -> PromptManager:
    """Get or create prompt manager instance."""
    global _prompt_manager
    if _prompt_manager is None:
        _prompt_manager = PromptManager()
    return _prompt_manager


@router.get("", response_model=list[PromptTemplate])
async def list_templates(tag: str | None = None) -> list[PromptTemplate]:
    """
    List all available prompt templates.

    Optionally filter by tag.
    """
    manager = get_prompt_manager()
    return manager.list_templates(tag=tag)


@router.get("/tags")
async def list_tags() -> dict:
    """
    List all available template tags.

    Returns unique tags across all templates.
    """
    manager = get_prompt_manager()
    templates = manager.list_templates()

    tags: set[str] = set()
    for template in templates:
        tags.update(template.tags)

    return {"tags": sorted(tags)}


@router.get("/{template_id}", response_model=PromptTemplate)
async def get_template(template_id: str) -> PromptTemplate:
    """
    Get a specific template by ID.

    Returns the full template definition including variables.
    """
    manager = get_prompt_manager()
    template = manager.get_template(template_id)

    if not template:
        raise HTTPException(
            status_code=404,
            detail=f"Template '{template_id}' not found",
        )

    return template


@router.post("/render", response_model=RenderTemplateResponse)
async def render_template(body: RenderTemplateRequest) -> RenderTemplateResponse:
    """
    Render a template with provided variables.

    Returns the rendered prompt ready for LLM consumption.
    """
    manager = get_prompt_manager()

    try:
        result = manager.render_template(body.template_id, body.variables)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/render-and-chat")
async def render_and_chat(
    body: RenderTemplateRequest,
    request: Request,
    stream: bool = False,
) -> dict:
    """
    Render a template and immediately send it to the LLM.

    Combines template rendering with chat completion in one call.
    """
    manager = get_prompt_manager()
    ollama = request.app.state.ollama

    # Render template
    try:
        rendered = manager.render_template(body.template_id, body.variables)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Get template for model settings
    template = manager.get_template(body.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Build messages
    messages = []
    if rendered.system_prompt:
        messages.append({"role": "system", "content": rendered.system_prompt})
    messages.append({"role": "user", "content": rendered.rendered})

    # Call LLM
    from app.models.chat import ChatMessage, ChatRequest

    chat_request = ChatRequest(
        model=template.model or "llama3.2",
        messages=[ChatMessage(**m) for m in messages],
        temperature=template.temperature,
        max_tokens=template.max_tokens,
    )

    response = await ollama.chat(chat_request)

    return {
        "template_id": body.template_id,
        "rendered_prompt": rendered.rendered,
        "response": response.message.content,
        "model": response.model,
        "usage": {
            "prompt_tokens": response.prompt_eval_count,
            "completion_tokens": response.eval_count,
            "total_duration_ms": (response.total_duration or 0) / 1_000_000,
        },
    }


@router.post("", response_model=PromptTemplate)
async def create_template(template: PromptTemplate) -> PromptTemplate:
    """
    Create a new custom template.

    Templates are stored in memory (add persistence as needed).
    """
    manager = get_prompt_manager()

    # Check if template already exists
    existing = manager.get_template(template.id)
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Template '{template.id}' already exists",
        )

    manager.add_template(template)
    return template


@router.put("/{template_id}", response_model=PromptTemplate)
async def update_template(template_id: str, template: PromptTemplate) -> PromptTemplate:
    """
    Update an existing template.

    The template_id in the path must match the template.id in the body.
    """
    if template_id != template.id:
        raise HTTPException(
            status_code=400,
            detail="Template ID in path must match template.id in body",
        )

    manager = get_prompt_manager()
    manager.add_template(template)
    return template


@router.delete("/{template_id}")
async def delete_template(template_id: str) -> dict:
    """
    Delete a custom template.

    Built-in templates cannot be deleted.
    """
    manager = get_prompt_manager()

    # Check if it's a built-in template
    from app.services.prompt_manager import BUILTIN_TEMPLATES

    if template_id in BUILTIN_TEMPLATES:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete built-in template '{template_id}'",
        )

    success = manager.remove_template(template_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"Template '{template_id}' not found",
        )

    return {"message": f"Template '{template_id}' deleted successfully"}
