"""Prompt template management service."""

import json
from pathlib import Path
from typing import Any

import structlog
from jinja2 import Environment, FileSystemLoader, TemplateNotFound, UndefinedError

from app.config import get_settings
from app.models.template import PromptTemplate, RenderTemplateResponse, TemplateVariable

logger = structlog.get_logger()
settings = get_settings()


# Built-in templates for intelliCore
BUILTIN_TEMPLATES: dict[str, PromptTemplate] = {
    "field-validation": PromptTemplate(
        id="field-validation",
        name="Field Validation",
        description="Validates a field value against business rules and constraints",
        template="""Analyze if the following value is valid for the specified field.

Field: {{ field_name }}
Type: {{ field_type }}
Value: {{ value }}
{% if rules %}
Validation Rules:
{{ rules }}
{% endif %}

Respond with a JSON object:
{
  "valid": true or false,
  "reason": "explanation of why the value is valid or invalid",
  "suggestions": ["optional array of suggestions if invalid"]
}""",
        system_prompt="You are a data validation assistant for a banking/financial system. "
        "Be strict about data quality. Always respond with valid JSON only.",
        variables=[
            TemplateVariable(name="field_name", description="Name of the field", required=True),
            TemplateVariable(name="field_type", description="Type of the field", required=True),
            TemplateVariable(name="value", description="Value to validate", required=True),
            TemplateVariable(name="rules", description="Validation rules", required=False, default=""),
        ],
        model="llama3.2",
        temperature=0.1,
        max_tokens=500,
        tags=["validation", "field", "core"],
    ),
    "object-type-suggestion": PromptTemplate(
        id="object-type-suggestion",
        name="ObjectType Field Suggestions",
        description="Suggests fields for a new ObjectType based on its name and description",
        template="""Based on the following ObjectType definition, suggest appropriate fields.

ObjectType Name: {{ object_type_name }}
Description: {{ description }}
{% if domain %}Domain: {{ domain }}{% endif %}
{% if existing_fields %}
Existing Fields: {{ existing_fields }}
{% endif %}

For each suggested field, provide:
1. Field name (snake_case)
2. Field type (TEXT, NUMBER, DATE, BOOLEAN, SELECT, FILE, RELATION)
3. Whether it's required
4. Description
5. Validation rules if applicable

Respond with a JSON array of field objects:
[
  {
    "name": "field_name",
    "type": "TEXT",
    "required": true,
    "description": "Description of the field",
    "validation_rules": "Optional validation rules"
  }
]""",
        system_prompt="You are a data modeling assistant specializing in financial and banking systems. "
        "Suggest fields that follow best practices for regulatory compliance (BACEN, BCB, PIX). "
        "Always respond with valid JSON only.",
        variables=[
            TemplateVariable(name="object_type_name", description="Name of the ObjectType", required=True),
            TemplateVariable(name="description", description="Description of the ObjectType", required=True),
            TemplateVariable(name="domain", description="Business domain", required=False, default=""),
            TemplateVariable(name="existing_fields", description="Already defined fields", required=False, default=""),
        ],
        model="llama3.2",
        temperature=0.3,
        max_tokens=2000,
        tags=["suggestion", "object-type", "modeling"],
    ),
    "relationship-validation": PromptTemplate(
        id="relationship-validation",
        name="Relationship Validation",
        description="Validates if a relationship between ObjectTypes makes sense",
        template="""Analyze if the following relationship between ObjectTypes is valid and makes sense.

Source ObjectType: {{ source_name }}
Source Description: {{ source_description }}

Target ObjectType: {{ target_name }}
Target Description: {{ target_description }}

Relationship Type: {{ relationship_type }}
Cardinality: {{ cardinality }}
Bidirectional: {{ is_bidirectional }}

Consider:
1. Does this relationship make logical sense?
2. Is the cardinality appropriate?
3. Should it be bidirectional?
4. Are there any potential issues or concerns?

Respond with JSON:
{
  "valid": true or false,
  "confidence": 0.0 to 1.0,
  "reasoning": "explanation",
  "suggestions": ["optional improvements"]
}""",
        system_prompt="You are a data modeling expert. Analyze relationships between entities "
        "considering business logic, data integrity, and best practices.",
        variables=[
            TemplateVariable(name="source_name", description="Source ObjectType name", required=True),
            TemplateVariable(name="source_description", description="Source description", required=True),
            TemplateVariable(name="target_name", description="Target ObjectType name", required=True),
            TemplateVariable(name="target_description", description="Target description", required=True),
            TemplateVariable(name="relationship_type", description="Type of relationship", required=True),
            TemplateVariable(name="cardinality", description="Relationship cardinality", required=True),
            TemplateVariable(name="is_bidirectional", description="Is bidirectional", required=True, type="boolean"),
        ],
        model="llama3.2",
        temperature=0.2,
        max_tokens=800,
        tags=["validation", "relationship", "modeling"],
    ),
    "document-summarize": PromptTemplate(
        id="document-summarize",
        name="Document Summarization",
        description="Summarizes a document's content for RAG indexing",
        template="""Summarize the following document content for indexing and search.

Document Type: {{ document_type }}
Document Title: {{ title }}

Content:
{{ content }}

Provide:
1. A brief summary (2-3 sentences)
2. Key topics/themes
3. Important entities mentioned
4. Relevant keywords for search

Respond with JSON:
{
  "summary": "brief summary",
  "topics": ["topic1", "topic2"],
  "entities": ["entity1", "entity2"],
  "keywords": ["keyword1", "keyword2"]
}""",
        system_prompt="You are a document analysis assistant. Extract key information "
        "for efficient search and retrieval. Be concise but comprehensive.",
        variables=[
            TemplateVariable(name="document_type", description="Type of document", required=True),
            TemplateVariable(name="title", description="Document title", required=True),
            TemplateVariable(name="content", description="Document content", required=True),
        ],
        model="llama3.2",
        temperature=0.2,
        max_tokens=1000,
        tags=["document", "summarization", "rag"],
    ),
    "rag-answer": PromptTemplate(
        id="rag-answer",
        name="RAG Answer Generation",
        description="Generates answers using retrieved context from documents",
        template="""Answer the user's question using ONLY the provided context.

Context from documents:
{% for chunk in context_chunks %}
---
Source: {{ chunk.source }}
{{ chunk.content }}
---
{% endfor %}

User Question: {{ question }}

Instructions:
- Answer based ONLY on the provided context
- If the context doesn't contain the answer, say so clearly
- Cite sources when possible
- Be concise and accurate

Answer:""",
        system_prompt="You are a helpful assistant that answers questions based on provided documents. "
        "Never make up information. Always cite your sources.",
        variables=[
            TemplateVariable(name="context_chunks", description="Retrieved context chunks", required=True, type="array"),
            TemplateVariable(name="question", description="User's question", required=True),
        ],
        model="llama3.2",
        temperature=0.3,
        max_tokens=1500,
        tags=["rag", "qa", "answer"],
    ),
    "natural-language-query": PromptTemplate(
        id="natural-language-query",
        name="Natural Language to Query",
        description="Converts natural language to structured queries",
        template="""Convert the following natural language request into a structured query.

Available ObjectTypes:
{{ object_types }}

User Request: {{ user_request }}

Generate a structured query that can be executed against our data model.
Include:
- Target ObjectType(s)
- Filters/conditions
- Fields to return
- Sorting if applicable

Respond with JSON:
{
  "objectType": "primary ObjectType to query",
  "filters": [{"field": "name", "operator": "eq", "value": "..."}],
  "fields": ["field1", "field2"],
  "sort": {"field": "...", "order": "asc|desc"},
  "limit": 10
}""",
        system_prompt="You are a query assistant. Convert natural language into structured queries. "
        "Be precise about field names and operators.",
        variables=[
            TemplateVariable(name="object_types", description="Available ObjectTypes", required=True),
            TemplateVariable(name="user_request", description="Natural language request", required=True),
        ],
        model="llama3.2",
        temperature=0.1,
        max_tokens=800,
        tags=["query", "nlp", "search"],
    ),
    # Sprint 9 - Field Extraction Templates (US-042)
    "field-extraction": PromptTemplate(
        id="field-extraction",
        name="Field Extraction from Free Text",
        description="Extracts structured field values from unstructured free-text input",
        template="""Extract structured field values from the following free-text input.

ObjectType: {{ object_type_name }}
ObjectType Description: {{ object_type_description }}

Expected Fields:
{% for field in fields %}
- {{ field.name }} ({{ field.type }}{% if field.required %}, required{% endif %}): {{ field.description }}
{% endfor %}

Free-text Input:
\"\"\"
{{ input_text }}
\"\"\"

Instructions:
1. Analyze the free-text input carefully
2. Extract values for each expected field
3. For fields not found in the text, return null
4. Apply appropriate type conversions (dates, numbers, etc.)
5. Flag any ambiguous or uncertain extractions

Respond with JSON:
{
  "extracted_fields": {
    "field_name": {
      "value": "extracted value or null",
      "confidence": 0.0-1.0,
      "source_text": "the text fragment this was extracted from"
    }
  },
  "unmatched_text": "any text that couldn't be mapped to fields",
  "warnings": ["list of any warnings or ambiguities"]
}""",
        system_prompt="You are a data extraction specialist for a banking/financial system. "
        "Extract field values accurately from unstructured text. Be conservative with confidence scores. "
        "When unsure, flag it as a warning. Always respond with valid JSON only.",
        variables=[
            TemplateVariable(name="object_type_name", description="Name of the ObjectType", required=True),
            TemplateVariable(name="object_type_description", description="Description of the ObjectType", required=True),
            TemplateVariable(name="fields", description="List of expected fields with metadata", required=True, type="array"),
            TemplateVariable(name="input_text", description="Free-text input to extract from", required=True),
        ],
        model="llama3.2",
        temperature=0.1,
        max_tokens=2000,
        tags=["extraction", "field", "nlp", "sprint9"],
    ),
    "field-extraction-batch": PromptTemplate(
        id="field-extraction-batch",
        name="Batch Field Extraction",
        description="Extracts fields from multiple text records in a single call",
        template="""Extract structured field values from multiple text records.

ObjectType: {{ object_type_name }}

Expected Fields:
{% for field in fields %}
- {{ field.name }} ({{ field.type }}): {{ field.description }}
{% endfor %}

Records to process:
{% for record in records %}
[Record {{ loop.index }}]:
{{ record }}
---
{% endfor %}

For each record, extract field values and provide confidence scores.

Respond with JSON:
{
  "records": [
    {
      "record_index": 1,
      "extracted_fields": {"field_name": {"value": "...", "confidence": 0.9}},
      "status": "success|partial|failed",
      "warnings": []
    }
  ],
  "summary": {
    "total": number,
    "success": number,
    "partial": number,
    "failed": number
  }
}""",
        system_prompt="You are a batch data extraction processor. Process multiple records efficiently. "
        "Maintain consistent extraction quality across all records. Always respond with valid JSON only.",
        variables=[
            TemplateVariable(name="object_type_name", description="Name of the ObjectType", required=True),
            TemplateVariable(name="fields", description="List of expected fields", required=True, type="array"),
            TemplateVariable(name="records", description="List of text records to process", required=True, type="array"),
        ],
        model="llama3.2",
        temperature=0.1,
        max_tokens=4000,
        tags=["extraction", "batch", "nlp", "sprint9"],
    ),
    "entity-recognition": PromptTemplate(
        id="entity-recognition",
        name="Financial Entity Recognition",
        description="Recognizes financial entities like CPF, CNPJ, bank accounts, PIX keys",
        template="""Identify and extract financial entities from the following text.

Text:
\"\"\"
{{ text }}
\"\"\"

Recognize and extract the following entity types:
- CPF (Brazilian individual tax ID): ###.###.###-##
- CNPJ (Brazilian company tax ID): ##.###.###/####-##
- Bank Account: agency, account number, bank code
- PIX Keys: CPF, CNPJ, email, phone, random key (EVP)
- Currency Values: amounts with currency (BRL, USD, etc.)
- Dates: any date formats
- Phone Numbers: with country/area codes
- Email Addresses

Respond with JSON:
{
  "entities": [
    {
      "type": "cpf|cnpj|bank_account|pix_key|currency|date|phone|email",
      "value": "extracted value",
      "normalized": "normalized/formatted value",
      "position": {"start": 0, "end": 10},
      "confidence": 0.95
    }
  ],
  "text_with_annotations": "original text with [ENTITY:type] markers"
}""",
        system_prompt="You are a financial document entity extraction specialist. "
        "Accurately identify Brazilian financial identifiers and common financial entities. "
        "Validate formats where possible (CPF/CNPJ check digits). Always respond with valid JSON only.",
        variables=[
            TemplateVariable(name="text", description="Text to analyze", required=True),
        ],
        model="llama3.2",
        temperature=0.1,
        max_tokens=2000,
        tags=["extraction", "entity", "financial", "sprint9"],
    ),
    # Sprint 9 - Business Rules Validation Templates (US-043)
    "business-rule-validation": PromptTemplate(
        id="business-rule-validation",
        name="Business Rule Validation",
        description="Validates data against complex business rules using RAG context",
        template="""Validate the following data against business rules.

Data to Validate:
{% for field, value in data.items() %}
- {{ field }}: {{ value }}
{% endfor %}

Business Rules Context:
{% if rag_context %}
{{ rag_context }}
{% else %}
No specific context provided. Use general banking/financial best practices.
{% endif %}

{% if custom_rules %}
Custom Rules:
{{ custom_rules }}
{% endif %}

ObjectType: {{ object_type }}
Operation: {{ operation }}

Evaluate:
1. Does the data comply with all applicable rules?
2. Are there any regulatory concerns (BACEN, BCB)?
3. Are there data quality issues?
4. Identify any risk flags

Respond with JSON:
{
  "compliant": true or false,
  "validation_results": [
    {
      "rule": "rule name or description",
      "passed": true or false,
      "severity": "error|warning|info",
      "message": "explanation",
      "affected_fields": ["field1", "field2"]
    }
  ],
  "risk_score": 0.0-1.0,
  "recommendations": ["list of recommendations"],
  "requires_review": true or false
}""",
        system_prompt="You are a compliance and business rules validation expert for Brazilian banking. "
        "Apply BACEN regulations, PIX rules, and financial best practices. "
        "Be thorough but avoid false positives. Always respond with valid JSON only.",
        variables=[
            TemplateVariable(name="data", description="Data fields to validate", required=True, type="object"),
            TemplateVariable(name="object_type", description="ObjectType being validated", required=True),
            TemplateVariable(name="operation", description="Operation type (create, update, delete)", required=True),
            TemplateVariable(name="rag_context", description="Relevant context from RAG", required=False, default=""),
            TemplateVariable(name="custom_rules", description="Custom validation rules", required=False, default=""),
        ],
        model="llama3.2",
        temperature=0.1,
        max_tokens=2000,
        tags=["validation", "business-rules", "compliance", "sprint9"],
    ),
    "cross-field-validation": PromptTemplate(
        id="cross-field-validation",
        name="Cross-Field Validation",
        description="Validates relationships and dependencies between fields",
        template="""Validate cross-field dependencies and relationships.

Fields and Values:
{% for field, value in fields.items() %}
- {{ field }}: {{ value }}
{% endfor %}

Known Dependencies:
{% for dep in dependencies %}
- {{ dep.description }}: {{ dep.rule }}
{% endfor %}

ObjectType: {{ object_type }}

Check for:
1. Field value consistency (e.g., dates in correct order)
2. Required field combinations
3. Mutually exclusive fields
4. Calculated field accuracy
5. Reference integrity issues

Respond with JSON:
{
  "valid": true or false,
  "cross_validations": [
    {
      "fields_involved": ["field1", "field2"],
      "rule_type": "dependency|exclusion|calculation|consistency",
      "passed": true or false,
      "message": "explanation"
    }
  ],
  "suggested_corrections": [
    {
      "field": "field_name",
      "current_value": "...",
      "suggested_value": "...",
      "reason": "..."
    }
  ]
}""",
        system_prompt="You are a data consistency validator. Check for logical relationships between fields. "
        "Identify inconsistencies and suggest corrections. Always respond with valid JSON only.",
        variables=[
            TemplateVariable(name="fields", description="Field values to validate", required=True, type="object"),
            TemplateVariable(name="object_type", description="ObjectType being validated", required=True),
            TemplateVariable(name="dependencies", description="Known field dependencies", required=False, type="array", default=[]),
        ],
        model="llama3.2",
        temperature=0.1,
        max_tokens=1500,
        tags=["validation", "cross-field", "consistency", "sprint9"],
    ),
    # Sprint 9 - RAG Integration Template (US-044)
    "rag-validation-context": PromptTemplate(
        id="rag-validation-context",
        name="RAG Validation Context",
        description="Generates validation context queries for RAG retrieval",
        template="""Generate search queries to retrieve relevant validation context.

ObjectType: {{ object_type }}
Operation: {{ operation }}
Fields being validated:
{% for field, value in fields.items() %}
- {{ field }}: {{ value }}
{% endfor %}

Generate queries to find:
1. Regulatory requirements for this ObjectType
2. Business rules documentation
3. Historical validation patterns
4. Related compliance guidelines

Respond with JSON:
{
  "queries": [
    {
      "query": "search query text",
      "purpose": "what this query will find",
      "priority": "high|medium|low"
    }
  ],
  "keywords": ["relevant", "keywords", "for", "search"],
  "document_types": ["regulation", "policy", "procedure"]
}""",
        system_prompt="You are a document retrieval specialist. Generate effective search queries "
        "to find relevant validation context from a document corpus.",
        variables=[
            TemplateVariable(name="object_type", description="ObjectType being validated", required=True),
            TemplateVariable(name="operation", description="Operation type", required=True),
            TemplateVariable(name="fields", description="Fields to validate", required=True, type="object"),
        ],
        model="llama3.2",
        temperature=0.2,
        max_tokens=800,
        tags=["rag", "context", "search", "sprint9"],
    ),
    "contextual-validation": PromptTemplate(
        id="contextual-validation",
        name="Contextual Validation with RAG",
        description="Validates data using retrieved document context",
        template="""Validate the data using the provided regulatory/business context.

=== DATA TO VALIDATE ===
ObjectType: {{ object_type }}
{% for field, value in data.items() %}
{{ field }}: {{ value }}
{% endfor %}

=== RETRIEVED CONTEXT ===
{% for doc in context_documents %}
--- Document: {{ doc.title }} (Score: {{ doc.score }}) ---
{{ doc.content }}
---
{% endfor %}

=== VALIDATION TASK ===
Using ONLY the provided context documents:
1. Identify applicable rules from the context
2. Check if the data complies with these rules
3. Note any rules that cannot be verified from context
4. Provide specific citations for each validation

Respond with JSON:
{
  "validation_results": [
    {
      "rule": "specific rule from context",
      "source_document": "document title",
      "citation": "exact quote from document",
      "field": "field being validated",
      "passed": true or false,
      "explanation": "detailed explanation"
    }
  ],
  "overall_compliant": true or false,
  "unverifiable_aspects": ["aspects that couldn't be verified from context"],
  "confidence": 0.0-1.0,
  "recommendations": ["based on context"]
}""",
        system_prompt="You are a regulatory compliance validator. Validate strictly based on provided context. "
        "Always cite your sources. If context is insufficient, explicitly state what cannot be verified. "
        "Never assume rules not present in the context. Always respond with valid JSON only.",
        variables=[
            TemplateVariable(name="object_type", description="ObjectType being validated", required=True),
            TemplateVariable(name="data", description="Data to validate", required=True, type="object"),
            TemplateVariable(name="context_documents", description="Retrieved context documents", required=True, type="array"),
        ],
        model="llama3.2",
        temperature=0.1,
        max_tokens=2500,
        tags=["validation", "rag", "contextual", "compliance", "sprint9"],
    ),
}


class PromptManager:
    """Manages prompt templates with Jinja2 rendering."""

    def __init__(self, templates_dir: str | None = None) -> None:
        """Initialize prompt manager."""
        self.templates_dir = Path(templates_dir or settings.templates_dir)
        self._templates: dict[str, PromptTemplate] = {}
        self._jinja_env: Environment | None = None

        # Load built-in templates
        self._templates.update(BUILTIN_TEMPLATES)

        # Load custom templates from directory
        self._load_custom_templates()

    def _load_custom_templates(self) -> None:
        """Load custom templates from the templates directory."""
        if not self.templates_dir.exists():
            logger.info("Templates directory not found, using built-in only", path=str(self.templates_dir))
            return

        for template_file in self.templates_dir.glob("*.json"):
            try:
                with open(template_file) as f:
                    data = json.load(f)
                    template = PromptTemplate(**data)
                    self._templates[template.id] = template
                    logger.info("Loaded custom template", id=template.id)
            except Exception as e:
                logger.error("Failed to load template", file=str(template_file), error=str(e))

    @property
    def jinja_env(self) -> Environment:
        """Get Jinja2 environment."""
        if self._jinja_env is None:
            self._jinja_env = Environment(
                loader=FileSystemLoader(str(self.templates_dir)) if self.templates_dir.exists() else None,
                autoescape=False,
            )
        return self._jinja_env

    def list_templates(self, tag: str | None = None) -> list[PromptTemplate]:
        """List all available templates, optionally filtered by tag."""
        templates = list(self._templates.values())

        if tag:
            templates = [t for t in templates if tag in t.tags]

        return sorted(templates, key=lambda t: t.name)

    def get_template(self, template_id: str) -> PromptTemplate | None:
        """Get a template by ID."""
        return self._templates.get(template_id)

    def render_template(
        self,
        template_id: str,
        variables: dict[str, Any],
    ) -> RenderTemplateResponse:
        """
        Render a template with the provided variables.

        Raises:
            ValueError: If template not found or required variables missing.
        """
        template = self.get_template(template_id)
        if not template:
            raise ValueError(f"Template '{template_id}' not found")

        # Validate required variables
        missing = []
        for var in template.variables:
            if var.required and var.name not in variables:
                if var.default is None:
                    missing.append(var.name)
                else:
                    variables[var.name] = var.default

        if missing:
            raise ValueError(f"Missing required variables: {missing}")

        # Add defaults for optional variables
        for var in template.variables:
            if var.name not in variables and var.default is not None:
                variables[var.name] = var.default

        # Render with Jinja2
        try:
            jinja_template = self.jinja_env.from_string(template.template)
            rendered = jinja_template.render(**variables)
        except UndefinedError as e:
            raise ValueError(f"Template rendering error: {e}")

        return RenderTemplateResponse(
            template_id=template_id,
            rendered=rendered,
            system_prompt=template.system_prompt,
            model=template.model,
            temperature=template.temperature,
        )

    def add_template(self, template: PromptTemplate) -> None:
        """Add or update a template."""
        self._templates[template.id] = template
        logger.info("Template added", id=template.id)

    def remove_template(self, template_id: str) -> bool:
        """Remove a template."""
        if template_id in self._templates:
            del self._templates[template_id]
            logger.info("Template removed", id=template_id)
            return True
        return False
