"""Model management Pydantic models."""

from pydantic import BaseModel, Field


class ModelDetails(BaseModel):
    """Details about a model's architecture."""

    format: str = Field(default="", description="Model format (gguf, etc.)")
    family: str = Field(default="", description="Model family (llama, mistral, etc.)")
    parameter_size: str = Field(default="", description="Parameter count (7B, 13B, etc.)")
    quantization_level: str = Field(
        default="", description="Quantization level (Q4_0, Q8_0, etc.)"
    )


class ModelInfo(BaseModel):
    """Information about an available model."""

    name: str = Field(..., description="Model name with tag")
    modified_at: str = Field(default="", description="Last modification timestamp")
    size: int = Field(default=0, description="Model size in bytes")
    digest: str = Field(default="", description="Model digest/hash")
    details: ModelDetails = Field(
        default_factory=ModelDetails, description="Model architecture details"
    )


class PullModelRequest(BaseModel):
    """Request to pull a model."""

    name: str = Field(..., description="Model name to pull (e.g., llama3.2, mistral)")
    insecure: bool = Field(
        default=False, description="Allow insecure connections to registry"
    )

    model_config = {"json_schema_extra": {"examples": [
        {"name": "llama3.2"},
        {"name": "mistral:7b-instruct"},
    ]}}


class PullProgress(BaseModel):
    """Progress update while pulling a model."""

    status: str = Field(..., description="Current status message")
    digest: str | None = Field(default=None, description="Layer digest being downloaded")
    total: int | None = Field(default=None, description="Total bytes")
    completed: int | None = Field(default=None, description="Completed bytes")
    percent: float | None = Field(default=None, description="Download percentage")


class DeleteModelRequest(BaseModel):
    """Request to delete a model."""

    name: str = Field(..., description="Model name to delete")

    model_config = {"json_schema_extra": {"examples": [
        {"name": "llama3.2:latest"},
    ]}}
