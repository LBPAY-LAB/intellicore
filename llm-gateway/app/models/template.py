"""Prompt template Pydantic models."""

from typing import Any

from pydantic import BaseModel, Field


class TemplateVariable(BaseModel):
    """A variable in a prompt template."""

    name: str = Field(..., description="Variable name")
    description: str = Field(default="", description="Variable description")
    required: bool = Field(default=True, description="Whether the variable is required")
    default: Any = Field(default=None, description="Default value if not provided")
    type: str = Field(default="string", description="Variable type (string, number, etc.)")


class PromptTemplate(BaseModel):
    """A prompt template definition."""

    id: str = Field(..., description="Unique template identifier")
    name: str = Field(..., description="Human-readable template name")
    description: str = Field(default="", description="Template description")
    template: str = Field(..., description="Template content with Jinja2 syntax")
    system_prompt: str | None = Field(
        default=None, description="Optional system prompt for the template"
    )
    variables: list[TemplateVariable] = Field(
        default_factory=list, description="Template variables"
    )
    model: str | None = Field(
        default=None, description="Recommended model for this template"
    )
    temperature: float | None = Field(
        default=None, description="Recommended temperature"
    )
    max_tokens: int | None = Field(
        default=None, description="Recommended max tokens"
    )
    tags: list[str] = Field(default_factory=list, description="Template tags/categories")

    model_config = {"json_schema_extra": {"examples": [
        {
            "id": "field-validation",
            "name": "Field Validation",
            "description": "Validates a field value against business rules",
            "template": "Validate if '{{ value }}' is a valid {{ field_type }} for the field '{{ field_name }}'.\n\nRules:\n{{ rules }}\n\nRespond with JSON: {\"valid\": true/false, \"reason\": \"...\"}",
            "system_prompt": "You are a data validation assistant. Always respond with valid JSON.",
            "variables": [
                {"name": "value", "description": "Value to validate", "required": True},
                {"name": "field_type", "description": "Field type", "required": True},
                {"name": "field_name", "description": "Field name", "required": True},
                {"name": "rules", "description": "Validation rules", "required": True},
            ],
            "model": "llama3.2",
            "temperature": 0.1,
            "tags": ["validation", "field"],
        }
    ]}}


class RenderTemplateRequest(BaseModel):
    """Request to render a template."""

    template_id: str = Field(..., description="Template ID to render")
    variables: dict[str, Any] = Field(
        default_factory=dict, description="Variable values"
    )

    model_config = {"json_schema_extra": {"examples": [
        {
            "template_id": "field-validation",
            "variables": {
                "value": "john.doe@email.com",
                "field_type": "email",
                "field_name": "customer_email",
                "rules": "Must be a valid email format",
            },
        }
    ]}}


class RenderTemplateResponse(BaseModel):
    """Response from rendering a template."""

    template_id: str = Field(..., description="Template ID that was rendered")
    rendered: str = Field(..., description="Rendered template content")
    system_prompt: str | None = Field(
        default=None, description="System prompt if defined"
    )
    model: str | None = Field(default=None, description="Recommended model")
    temperature: float | None = Field(default=None, description="Recommended temperature")
