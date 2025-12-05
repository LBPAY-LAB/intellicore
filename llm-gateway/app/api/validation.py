"""Validation API endpoints for Sprint 9 - LLM Validation Engine."""

import json
from typing import Any

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.config import get_settings
from app.models.chat import ChatMessage, ChatRequest

router = APIRouter()
settings = get_settings()


# ============================================================
# Pydantic Models for Validation API
# ============================================================


class FieldDefinition(BaseModel):
    """Definition of a field for extraction."""

    name: str
    type: str
    description: str
    required: bool = False


class ExtractFieldsRequest(BaseModel):
    """Request to extract fields from free-text."""

    object_type_name: str
    object_type_description: str
    fields: list[FieldDefinition]
    input_text: str


class ExtractedField(BaseModel):
    """A single extracted field value."""

    value: Any | None
    confidence: float
    source_text: str | None = None


class ExtractFieldsResponse(BaseModel):
    """Response from field extraction."""

    extracted_fields: dict[str, ExtractedField]
    unmatched_text: str | None
    warnings: list[str]
    model: str


class BatchExtractRequest(BaseModel):
    """Request to extract fields from multiple records."""

    object_type_name: str
    fields: list[FieldDefinition]
    records: list[str]


class RecordExtractionResult(BaseModel):
    """Result of extracting fields from a single record."""

    record_index: int
    extracted_fields: dict[str, dict]
    status: str
    warnings: list[str]


class BatchExtractResponse(BaseModel):
    """Response from batch field extraction."""

    records: list[RecordExtractionResult]
    summary: dict
    model: str


class EntityRecognitionRequest(BaseModel):
    """Request to recognize financial entities."""

    text: str


class RecognizedEntity(BaseModel):
    """A recognized entity."""

    type: str
    value: str
    normalized: str | None
    position: dict | None
    confidence: float


class EntityRecognitionResponse(BaseModel):
    """Response from entity recognition."""

    entities: list[RecognizedEntity]
    text_with_annotations: str | None
    model: str


class ValidateBusinessRulesRequest(BaseModel):
    """Request to validate against business rules."""

    data: dict[str, Any]
    object_type: str
    operation: str = "create"
    rag_context: str | None = None
    custom_rules: str | None = None


class ValidationResult(BaseModel):
    """A single validation result."""

    rule: str
    passed: bool
    severity: str
    message: str
    affected_fields: list[str] = []


class ValidateBusinessRulesResponse(BaseModel):
    """Response from business rules validation."""

    compliant: bool
    validation_results: list[ValidationResult]
    risk_score: float
    recommendations: list[str]
    requires_review: bool
    model: str


class CrossFieldValidationRequest(BaseModel):
    """Request for cross-field validation."""

    fields: dict[str, Any]
    object_type: str
    dependencies: list[dict] = Field(default_factory=list)


class CrossValidationResult(BaseModel):
    """A cross-validation result."""

    fields_involved: list[str]
    rule_type: str
    passed: bool
    message: str


class SuggestedCorrection(BaseModel):
    """A suggested correction for a field."""

    field: str
    current_value: Any
    suggested_value: Any
    reason: str


class CrossFieldValidationResponse(BaseModel):
    """Response from cross-field validation."""

    valid: bool
    cross_validations: list[CrossValidationResult]
    suggested_corrections: list[SuggestedCorrection]
    model: str


class ContextualValidationRequest(BaseModel):
    """Request for contextual validation with RAG."""

    object_type: str
    data: dict[str, Any]
    context_documents: list[dict]


class ContextualValidationResult(BaseModel):
    """A contextual validation result."""

    rule: str
    source_document: str
    citation: str | None
    field: str
    passed: bool
    explanation: str


class ContextualValidationResponse(BaseModel):
    """Response from contextual validation."""

    validation_results: list[ContextualValidationResult]
    overall_compliant: bool
    unverifiable_aspects: list[str]
    confidence: float
    recommendations: list[str]
    model: str


# ============================================================
# Helper Functions
# ============================================================


def get_prompt_manager():
    """Get the prompt manager instance."""
    from app.api.templates import get_prompt_manager as _get_pm

    return _get_pm()


async def execute_template(
    template_id: str,
    variables: dict,
    ollama,
    max_tokens: int | None = None,
) -> tuple[dict, str]:
    """
    Execute a template and return parsed JSON response.

    Returns:
        Tuple of (parsed_response, model_name)
    """
    manager = get_prompt_manager()

    # Render template
    try:
        rendered = manager.render_template(template_id, variables)
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
        max_tokens=max_tokens or 2000,
    )

    # Get response
    response = await ollama.chat(chat_request)

    # Parse JSON response
    try:
        result = json.loads(response.message.content)
    except json.JSONDecodeError:
        # Try to extract JSON from response
        content = response.message.content
        json_start = content.find("{")
        json_end = content.rfind("}") + 1
        if json_start >= 0 and json_end > json_start:
            try:
                result = json.loads(content[json_start:json_end])
            except json.JSONDecodeError:
                result = {"raw_response": content, "parse_error": True}
        else:
            result = {"raw_response": content, "parse_error": True}

    return result, response.model


# ============================================================
# API Endpoints - Field Extraction (US-042)
# ============================================================


@router.post("/extract-fields", response_model=ExtractFieldsResponse)
async def extract_fields(body: ExtractFieldsRequest, request: Request) -> ExtractFieldsResponse:
    """
    Extract structured field values from free-text input.

    Uses the field-extraction template to analyze unstructured text
    and extract values for the specified fields.
    """
    ollama = request.app.state.ollama

    # Convert fields to the format expected by the template
    fields_data = [
        {
            "name": f.name,
            "type": f.type,
            "description": f.description,
            "required": f.required,
        }
        for f in body.fields
    ]

    result, model = await execute_template(
        "field-extraction",
        {
            "object_type_name": body.object_type_name,
            "object_type_description": body.object_type_description,
            "fields": fields_data,
            "input_text": body.input_text,
        },
        ollama,
    )

    # Handle parse errors
    if result.get("parse_error"):
        return ExtractFieldsResponse(
            extracted_fields={},
            unmatched_text=result.get("raw_response"),
            warnings=["Failed to parse LLM response as JSON"],
            model=model,
        )

    # Convert extracted fields to proper format
    extracted = {}
    for field_name, field_data in result.get("extracted_fields", {}).items():
        if isinstance(field_data, dict):
            extracted[field_name] = ExtractedField(
                value=field_data.get("value"),
                confidence=field_data.get("confidence", 0.0),
                source_text=field_data.get("source_text"),
            )
        else:
            extracted[field_name] = ExtractedField(
                value=field_data,
                confidence=0.5,
                source_text=None,
            )

    return ExtractFieldsResponse(
        extracted_fields=extracted,
        unmatched_text=result.get("unmatched_text"),
        warnings=result.get("warnings", []),
        model=model,
    )


@router.post("/extract-fields/batch", response_model=BatchExtractResponse)
async def extract_fields_batch(body: BatchExtractRequest, request: Request) -> BatchExtractResponse:
    """
    Extract fields from multiple text records in a single call.

    More efficient for processing multiple records.
    """
    ollama = request.app.state.ollama

    fields_data = [
        {"name": f.name, "type": f.type, "description": f.description}
        for f in body.fields
    ]

    result, model = await execute_template(
        "field-extraction-batch",
        {
            "object_type_name": body.object_type_name,
            "fields": fields_data,
            "records": body.records,
        },
        ollama,
        max_tokens=4000,
    )

    if result.get("parse_error"):
        return BatchExtractResponse(
            records=[],
            summary={"total": len(body.records), "error": "parse_failed"},
            model=model,
        )

    records = []
    for record_data in result.get("records", []):
        records.append(
            RecordExtractionResult(
                record_index=record_data.get("record_index", 0),
                extracted_fields=record_data.get("extracted_fields", {}),
                status=record_data.get("status", "unknown"),
                warnings=record_data.get("warnings", []),
            )
        )

    return BatchExtractResponse(
        records=records,
        summary=result.get("summary", {}),
        model=model,
    )


@router.post("/recognize-entities", response_model=EntityRecognitionResponse)
async def recognize_entities(body: EntityRecognitionRequest, request: Request) -> EntityRecognitionResponse:
    """
    Recognize financial entities in text.

    Identifies CPF, CNPJ, bank accounts, PIX keys, currency values, etc.
    """
    ollama = request.app.state.ollama

    result, model = await execute_template(
        "entity-recognition",
        {"text": body.text},
        ollama,
    )

    if result.get("parse_error"):
        return EntityRecognitionResponse(
            entities=[],
            text_with_annotations=None,
            model=model,
        )

    entities = []
    for entity_data in result.get("entities", []):
        entities.append(
            RecognizedEntity(
                type=entity_data.get("type", "unknown"),
                value=entity_data.get("value", ""),
                normalized=entity_data.get("normalized"),
                position=entity_data.get("position"),
                confidence=entity_data.get("confidence", 0.0),
            )
        )

    return EntityRecognitionResponse(
        entities=entities,
        text_with_annotations=result.get("text_with_annotations"),
        model=model,
    )


# ============================================================
# API Endpoints - Business Rules Validation (US-043)
# ============================================================


@router.post("/validate-business-rules", response_model=ValidateBusinessRulesResponse)
async def validate_business_rules(
    body: ValidateBusinessRulesRequest,
    request: Request,
) -> ValidateBusinessRulesResponse:
    """
    Validate data against business rules.

    Uses LLM to evaluate compliance with business rules,
    optionally using RAG context for regulatory requirements.
    """
    ollama = request.app.state.ollama

    result, model = await execute_template(
        "business-rule-validation",
        {
            "data": body.data,
            "object_type": body.object_type,
            "operation": body.operation,
            "rag_context": body.rag_context or "",
            "custom_rules": body.custom_rules or "",
        },
        ollama,
    )

    if result.get("parse_error"):
        return ValidateBusinessRulesResponse(
            compliant=False,
            validation_results=[
                ValidationResult(
                    rule="parse_error",
                    passed=False,
                    severity="error",
                    message="Failed to parse validation response",
                    affected_fields=[],
                )
            ],
            risk_score=1.0,
            recommendations=["Manual review required"],
            requires_review=True,
            model=model,
        )

    validation_results = []
    for vr in result.get("validation_results", []):
        validation_results.append(
            ValidationResult(
                rule=vr.get("rule", "unknown"),
                passed=vr.get("passed", False),
                severity=vr.get("severity", "warning"),
                message=vr.get("message", ""),
                affected_fields=vr.get("affected_fields", []),
            )
        )

    return ValidateBusinessRulesResponse(
        compliant=result.get("compliant", False),
        validation_results=validation_results,
        risk_score=result.get("risk_score", 0.5),
        recommendations=result.get("recommendations", []),
        requires_review=result.get("requires_review", False),
        model=model,
    )


@router.post("/validate-cross-fields", response_model=CrossFieldValidationResponse)
async def validate_cross_fields(
    body: CrossFieldValidationRequest,
    request: Request,
) -> CrossFieldValidationResponse:
    """
    Validate cross-field dependencies and relationships.

    Checks for consistency between related fields.
    """
    ollama = request.app.state.ollama

    result, model = await execute_template(
        "cross-field-validation",
        {
            "fields": body.fields,
            "object_type": body.object_type,
            "dependencies": body.dependencies,
        },
        ollama,
    )

    if result.get("parse_error"):
        return CrossFieldValidationResponse(
            valid=False,
            cross_validations=[],
            suggested_corrections=[],
            model=model,
        )

    cross_validations = []
    for cv in result.get("cross_validations", []):
        cross_validations.append(
            CrossValidationResult(
                fields_involved=cv.get("fields_involved", []),
                rule_type=cv.get("rule_type", "unknown"),
                passed=cv.get("passed", False),
                message=cv.get("message", ""),
            )
        )

    suggested_corrections = []
    for sc in result.get("suggested_corrections", []):
        suggested_corrections.append(
            SuggestedCorrection(
                field=sc.get("field", ""),
                current_value=sc.get("current_value"),
                suggested_value=sc.get("suggested_value"),
                reason=sc.get("reason", ""),
            )
        )

    return CrossFieldValidationResponse(
        valid=result.get("valid", False),
        cross_validations=cross_validations,
        suggested_corrections=suggested_corrections,
        model=model,
    )


# ============================================================
# API Endpoints - RAG Integration (US-044)
# ============================================================


@router.post("/validate-contextual", response_model=ContextualValidationResponse)
async def validate_contextual(
    body: ContextualValidationRequest,
    request: Request,
) -> ContextualValidationResponse:
    """
    Validate data using retrieved document context (RAG).

    Uses provided context documents to validate against
    specific regulatory and business rules.
    """
    ollama = request.app.state.ollama

    result, model = await execute_template(
        "contextual-validation",
        {
            "object_type": body.object_type,
            "data": body.data,
            "context_documents": body.context_documents,
        },
        ollama,
        max_tokens=2500,
    )

    if result.get("parse_error"):
        return ContextualValidationResponse(
            validation_results=[],
            overall_compliant=False,
            unverifiable_aspects=["Failed to parse response"],
            confidence=0.0,
            recommendations=["Manual review required"],
            model=model,
        )

    validation_results = []
    for vr in result.get("validation_results", []):
        validation_results.append(
            ContextualValidationResult(
                rule=vr.get("rule", ""),
                source_document=vr.get("source_document", ""),
                citation=vr.get("citation"),
                field=vr.get("field", ""),
                passed=vr.get("passed", False),
                explanation=vr.get("explanation", ""),
            )
        )

    return ContextualValidationResponse(
        validation_results=validation_results,
        overall_compliant=result.get("overall_compliant", False),
        unverifiable_aspects=result.get("unverifiable_aspects", []),
        confidence=result.get("confidence", 0.0),
        recommendations=result.get("recommendations", []),
        model=model,
    )


@router.post("/generate-validation-queries")
async def generate_validation_queries(
    object_type: str,
    operation: str,
    fields: dict[str, Any],
    request: Request,
) -> dict:
    """
    Generate RAG search queries for validation context.

    Returns queries that can be used to retrieve relevant
    documents for contextual validation.
    """
    ollama = request.app.state.ollama

    result, model = await execute_template(
        "rag-validation-context",
        {
            "object_type": object_type,
            "operation": operation,
            "fields": fields,
        },
        ollama,
    )

    return {
        "queries": result.get("queries", []),
        "keywords": result.get("keywords", []),
        "document_types": result.get("document_types", []),
        "model": model,
    }
