"""
Field Candidate Identification - Identify potential fields for object_definition schema

A FieldCandidate represents a potential property in the generated JSON Schema.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class FieldType(str, Enum):
    """JSON Schema types for field candidates"""

    STRING = "string"
    NUMBER = "number"
    INTEGER = "integer"
    BOOLEAN = "boolean"
    ARRAY = "array"
    OBJECT = "object"
    DATE = "string"  # with format: "date"
    DATETIME = "string"  # with format: "date-time"
    EMAIL = "string"  # with format: "email"
    URI = "string"  # with format: "uri"


class ValidationRuleType(str, Enum):
    """Types of validation rules that can be applied to fields"""

    REGEX = "regex"
    MIN_LENGTH = "min_length"
    MAX_LENGTH = "max_length"
    MINIMUM = "minimum"
    MAXIMUM = "maximum"
    ENUM = "enum"
    PATTERN = "pattern"
    FORMAT = "format"
    CUSTOM = "custom"


@dataclass
class FieldCandidate:
    """
    A potential field identified in the document

    Example:
        FieldCandidate(
            name="cpf",
            display_name="CPF",
            field_type=FieldType.STRING,
            description="Cadastro de Pessoa Física",
            required=True,
            validation_rules=[
                {"type": "regex", "pattern": r"^\d{11}$"},
                {"type": "custom", "rule_name": "cpf_validation"}
            ],
            example_values=["12345678901", "98765432100"]
        )
    """

    name: str  # Field name (snake_case)
    display_name: str  # Human-readable name
    field_type: FieldType
    description: str = ""
    required: bool = False
    validation_rules: list[dict[str, Any]] = field(default_factory=list)
    example_values: list[Any] = field(default_factory=list)
    enum_values: list[Any] = field(default_factory=list)
    default_value: Any = None
    ui_widget: str = "text"  # UI hint for rendering
    confidence: float = 1.0
    metadata: dict = field(default_factory=dict)

    def to_json_schema_property(self) -> dict[str, Any]:
        """
        Convert to JSON Schema property definition

        Returns:
            dict: JSON Schema property object
        """
        schema: dict[str, Any] = {
            "type": self.field_type.value,
            "title": self.display_name,
        }

        if self.description:
            schema["description"] = self.description

        if self.default_value is not None:
            schema["default"] = self.default_value

        # Add validation constraints
        for rule in self.validation_rules:
            rule_type = rule.get("type")

            if rule_type == "regex" or rule_type == "pattern":
                schema["pattern"] = rule.get("pattern")
            elif rule_type == "min_length":
                schema["minLength"] = rule.get("value")
            elif rule_type == "max_length":
                schema["maxLength"] = rule.get("value")
            elif rule_type == "minimum":
                schema["minimum"] = rule.get("value")
            elif rule_type == "maximum":
                schema["maximum"] = rule.get("value")
            elif rule_type == "format":
                schema["format"] = rule.get("value")
            elif rule_type == "enum":
                schema["enum"] = rule.get("values", [])

        # Add enum values if present
        if self.enum_values:
            schema["enum"] = self.enum_values

        # Add examples
        if self.example_values:
            schema["examples"] = self.example_values

        return schema

    def to_ui_hint(self) -> dict[str, Any]:
        """
        Generate UI hint for this field

        Returns:
            dict: UI hint configuration
        """
        hint = {
            "widget": self.ui_widget,
            "label": self.display_name,
        }

        if self.description:
            hint["help_text"] = self.description

        if self.example_values:
            hint["placeholder"] = str(self.example_values[0])

        return hint


@dataclass
class FSMStateCandidate:
    """A potential state identified for FSM (Finite State Machine)"""

    name: str  # State name (UPPERCASE_SNAKE_CASE)
    display_name: str
    description: str = ""
    is_initial: bool = False
    is_final: bool = False
    confidence: float = 1.0


@dataclass
class FSMTransitionCandidate:
    """A potential transition between states"""

    from_state: str
    to_state: str
    trigger: str  # Action name that triggers transition
    description: str = ""
    conditions: list[str] = field(default_factory=list)
    confidence: float = 1.0


@dataclass
class ObjectDefinitionCandidate:
    """
    Complete candidate for object_definition generation

    This aggregates all identified fields, states, and metadata
    to generate a complete object_definition
    """

    name: str  # Object name (snake_case)
    display_name: str
    description: str
    fields: list[FieldCandidate]
    states: list[FSMStateCandidate] = field(default_factory=list)
    transitions: list[FSMTransitionCandidate] = field(default_factory=list)
    relationships: list[str] = field(default_factory=list)  # Relationship types
    confidence_score: float = 1.0
    source_document_id: str = ""
    metadata: dict = field(default_factory=dict)

    def to_json_schema(self) -> dict[str, Any]:
        """
        Generate complete JSON Schema for this object

        Returns:
            dict: JSON Schema Draft 7 compliant schema
        """
        properties = {}
        required = []

        for field_candidate in self.fields:
            properties[field_candidate.name] = field_candidate.to_json_schema_property()
            if field_candidate.required:
                required.append(field_candidate.name)

        schema = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "type": "object",
            "title": self.display_name,
            "description": self.description,
            "properties": properties,
        }

        if required:
            schema["required"] = required

        return schema

    def to_fsm_definition(self) -> dict[str, Any]:
        """
        Generate FSM definition

        Returns:
            dict: FSM configuration with states and transitions
        """
        # Find initial state
        initial_state = next(
            (s.name for s in self.states if s.is_initial),
            self.states[0].name if self.states else "DRAFT",
        )

        return {
            "initial": initial_state,
            "states": [
                {
                    "name": s.name,
                    "display_name": s.display_name,
                    "description": s.description,
                    "is_final": s.is_final,
                }
                for s in self.states
            ],
            "transitions": [
                {
                    "from": t.from_state,
                    "to": t.to_state,
                    "trigger": t.trigger,
                    "description": t.description,
                    "conditions": t.conditions,
                }
                for t in self.transitions
            ],
        }

    def to_ui_hints(self) -> dict[str, Any]:
        """
        Generate UI hints for all fields

        Returns:
            dict: Complete UI hints configuration
        """
        return {
            "widgets": {fc.name: fc.to_ui_hint() for fc in self.fields},
            "field_order": [fc.name for fc in self.fields],
            "groups": self._infer_field_groups(),
        }

    def _infer_field_groups(self) -> list[dict[str, Any]]:
        """
        Infer logical groupings of fields

        Returns:
            list: Field groups for UI organization
        """
        # TODO: Implement intelligent grouping based on field types and relationships
        # For now, simple categorization
        groups = {
            "Identificação": [],
            "Dados Pessoais": [],
            "Contato": [],
            "Financeiro": [],
            "Outros": [],
        }

        for fc in self.fields:
            name_lower = fc.name.lower()
            if any(x in name_lower for x in ["cpf", "cnpj", "id", "codigo"]):
                groups["Identificação"].append(fc.name)
            elif any(x in name_lower for x in ["nome", "nascimento", "idade"]):
                groups["Dados Pessoais"].append(fc.name)
            elif any(x in name_lower for x in ["email", "telefone", "endereco", "cep"]):
                groups["Contato"].append(fc.name)
            elif any(x in name_lower for x in ["valor", "saldo", "limite", "taxa"]):
                groups["Financeiro"].append(fc.name)
            else:
                groups["Outros"].append(fc.name)

        # Filter out empty groups
        return [
            {"name": name, "fields": fields} for name, fields in groups.items() if fields
        ]
