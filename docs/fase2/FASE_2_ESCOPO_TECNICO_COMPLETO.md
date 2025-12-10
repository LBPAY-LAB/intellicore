# FASE 2 - BRAIN: Architect Agent (Consciência Geradora)

> **"A plataforma não apenas executa. Ela PENSA, APRENDE e CRIA."**

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Objetivos da Fase 2](#objetivos-da-fase-2)
3. [Arquitetura do Architect Agent](#arquitetura-do-architect-agent)
4. [Componentes Principais](#componentes-principais)
5. [Fluxo de Geração Automática](#fluxo-de-geração-automática)
6. [Sprints de Implementação](#sprints-de-implementação)
7. [Métricas de Sucesso](#métricas-de-sucesso)
8. [Exemplos Concretos](#exemplos-concretos)

---

## 🎯 Visão Geral

### O Que é a Fase 2?

A Fase 2 transforma a plataforma SuperCore de um **executor de objetos** em um **criador de objetos**.

**Fase 1** (Foundation):
```
Humano → Assistente → object_definition → Instâncias
```

**Fase 2** (Brain):
```
Documento BACEN → Architect Agent → object_definitions + validation_rules + FSMs
         ↓
    Módulo Completo Gerado Automaticamente
```

### Por Que é Revolucionário?

1. **Time de Produto/Compliance não precisa mais descrever objetos** - apenas fornece PDFs
2. **Architect Agent lê, interpreta e implementa** - igual a um desenvolvedor sênior
3. **Geração de módulos completos** - PIX, TED, KYC, Limites, tudo em dias
4. **Versionamento automático** - Agent detecta mudanças em normas e atualiza
5. **Compliance sempre atualizado** - Agent monitora site do BACEN

---

## 🎯 Objetivos da Fase 2

### Objetivos Técnicos

1. ✅ **Document Intelligence System**
   - Parser de PDFs (Circulares, Resoluções, Manuais BACEN)
   - Extração de estruturas (tabelas, listas, regras)
   - OCR para documentos escaneados
   - Detecção de mudanças em documentos versionados

2. ✅ **Architect Agent Core**
   - LLM especializado em modelagem de dados
   - Gerador de JSON Schema a partir de texto normativo
   - Gerador de FSM a partir de fluxos descritos
   - Gerador de validation_rules a partir de regras BACEN
   - Gerador de UI hints automaticamente

3. ✅ **Knowledge Base (Vector Store)**
   - Embeddings de toda documentação BACEN
   - Semantic search para contexto
   - Cross-referencing entre normas
   - Timeline de mudanças regulatórias

4. ✅ **Validation & Testing**
   - Testes unitários gerados automaticamente
   - Validação contra schemas existentes
   - Detecção de conflitos entre normas
   - Rollback automático se validação falhar

5. ✅ **Monitoring & Alerting**
   - Crawler do site BACEN para novas publicações
   - Notificação de mudanças em normas vigentes
   - Dashboard de compliance status
   - Auditoria de gerações automáticas

### Objetivos de Negócio

1. **Reduzir tempo de implementação de módulos de 3 meses para 3 dias**
2. **Eliminar 90% do trabalho manual de modelagem**
3. **Garantir compliance 100% com regulamentações**
4. **Permitir updates instantâneos quando BACEN muda normas**
5. **Documentação automática de todo módulo gerado**

---

## 🏗️ Arquitetura do Architect Agent

### Visão de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 2: BRAIN LAYER                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  INPUT LAYER: Document Sources                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. BACEN Documents                                             │
│     ├─ Circulares (ex: 3.978 - PLD/FT)                         │
│     ├─ Resoluções (ex: 4.753 - KYC)                            │
│     ├─ Manuais (ex: Manual PIX)                                │
│     └─ Comunicados                                              │
│                                                                 │
│  2. Internal Docs                                               │
│     ├─ Políticas internas                                       │
│     ├─ Regras de negócio                                        │
│     └─ Requisitos de produto                                    │
│                                                                 │
│  3. API Specifications                                          │
│     ├─ Swagger/OpenAPI                                          │
│     ├─ GraphQL schemas                                          │
│     └─ gRPC protos                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PROCESSING LAYER: Architect Agent Pipeline                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 1. DOCUMENT INGESTION                                  │   │
│  │    ├─ PDF Parser (PyMuPDF, pdfplumber)                │   │
│  │    ├─ OCR (Tesseract, AWS Textract)                   │   │
│  │    ├─ Table Extraction (Camelot, Tabula)              │   │
│  │    └─ Structure Detection (layouts, sections)         │   │
│  └────────────────────────────────────────────────────────┘   │
│                       ↓                                         │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 2. SEMANTIC ANALYSIS                                   │   │
│  │    ├─ Chunking (semantic splitting)                    │   │
│  │    ├─ Embedding (OpenAI text-embedding-3-large)       │   │
│  │    ├─ Vector Store (pgvector)                         │   │
│  │    └─ Entity Extraction (NER for objects, fields)     │   │
│  └────────────────────────────────────────────────────────┘   │
│                       ↓                                         │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 3. SCHEMA GENERATION                                   │   │
│  │    ├─ LLM Prompt Engineering (Claude Opus 4)          │   │
│  │    ├─ JSON Schema Generator                           │   │
│  │    ├─ FSM Generator (states + transitions)            │   │
│  │    ├─ Validation Rules Mapper                         │   │
│  │    └─ UI Hints Generator                              │   │
│  └────────────────────────────────────────────────────────┘   │
│                       ↓                                         │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 4. VALIDATION & REFINEMENT                             │   │
│  │    ├─ JSON Schema Validator                           │   │
│  │    ├─ FSM Validator (no orphan states)                │   │
│  │    ├─ Conflict Detection (vs existing objects)        │   │
│  │    ├─ Test Generation (unit tests)                    │   │
│  │    └─ Human Review Queue (ambiguities)                │   │
│  └────────────────────────────────────────────────────────┘   │
│                       ↓                                         │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 5. DEPLOYMENT                                          │   │
│  │    ├─ object_definition insertion                      │   │
│  │    ├─ validation_rules creation                        │   │
│  │    ├─ Migration generation (if schema changes)        │   │
│  │    ├─ Documentation generation                        │   │
│  │    └─ Notification (Slack, Email)                     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  OUTPUT LAYER: Generated Artifacts                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Database Objects                                            │
│     ├─ object_definitions (JSON Schema, FSM, rules)            │
│     ├─ validation_rules (regex, functions, API calls)          │
│     └─ Migrations (if needed)                                   │
│                                                                 │
│  2. Documentation                                               │
│     ├─ README.md (módulo overview)                             │
│     ├─ API_SPEC.md (endpoints gerados)                         │
│     ├─ COMPLIANCE.md (normas BACEN referenciadas)             │
│     └─ CHANGELOG.md (histórico de versões)                     │
│                                                                 │
│  3. Tests                                                       │
│     ├─ Unit tests (Go)                                         │
│     ├─ Integration tests                                       │
│     └─ E2E tests (Playwright)                                  │
│                                                                 │
│  4. UI Components                                               │
│     ├─ Dynamic forms (gerados automaticamente)                 │
│     ├─ Dashboards (para visualização)                          │
│     └─ Reports (compliance reports)                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes Principais

### 1. Document Intelligence Engine

**Responsabilidade**: Transformar documentos não estruturados em dados estruturados.

**Stack Tecnológico**:
- **PyMuPDF (fitz)** - Parser PDF de alta performance
- **pdfplumber** - Extração de tabelas e texto
- **Tesseract OCR** - Para PDFs escaneados
- **AWS Textract** (opcional) - OCR avançado com ML
- **Camelot** - Extração precisa de tabelas
- **spaCy** - NER (Named Entity Recognition)

**Arquitetura**:

```python
# document_intelligence/parser.py

from dataclasses import dataclass
from typing import List, Dict, Any
import fitz  # PyMuPDF
import pdfplumber
from pydantic import BaseModel

@dataclass
class DocumentSection:
    """Seção extraída do documento"""
    title: str
    level: int  # 1=Capítulo, 2=Seção, 3=Subseção
    content: str
    page_start: int
    page_end: int
    tables: List[Dict[str, Any]]
    lists: List[List[str]]
    metadata: Dict[str, Any]

class BACENDocumentParser:
    """Parser especializado em documentos BACEN"""

    def __init__(self):
        self.pdf_parser = None
        self.ocr_enabled = True
        self.table_extractor = None

    def parse(self, pdf_path: str) -> DocumentStructure:
        """
        Parse completo de documento BACEN

        Passos:
        1. Extração de texto (OCR se necessário)
        2. Detecção de estrutura (capítulos, seções)
        3. Extração de tabelas
        4. Identificação de listas (enumerações, requisitos)
        5. Extração de metadados (número da norma, data, vigência)
        """

        doc = fitz.open(pdf_path)

        # 1. EXTRAÇÃO DE METADADOS
        metadata = self._extract_metadata(doc)
        # Ex: {"norma": "Circular 3.978", "data": "2020-01-23", "vigencia": "2020-03-01"}

        # 2. EXTRAÇÃO DE ESTRUTURA
        sections = self._extract_sections(doc)

        # 3. EXTRAÇÃO DE TABELAS
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                tables = page.extract_tables()
                sections[i].tables.extend(tables)

        # 4. DETECÇÃO DE LISTAS E ENUMERAÇÕES
        for section in sections:
            section.lists = self._extract_lists(section.content)

        # 5. ENTITY EXTRACTION (objetos, campos, regras)
        entities = self._extract_entities(sections)

        return DocumentStructure(
            metadata=metadata,
            sections=sections,
            entities=entities,
            raw_text=self._get_full_text(doc)
        )

    def _extract_metadata(self, doc: fitz.Document) -> Dict[str, Any]:
        """Extrai metadados do documento"""

        # REGEX patterns para documentos BACEN
        patterns = {
            'circular': r'Circular\s+nº?\s*(\d{1,5})',
            'resolucao': r'Resolução\s+nº?\s*(\d{1,5})',
            'data': r'(\d{2}/\d{2}/\d{4})',
            'vigencia': r'vigência.*?(\d{2}/\d{2}/\d{4})'
        }

        first_page = doc[0].get_text()

        metadata = {}
        for key, pattern in patterns.items():
            match = re.search(pattern, first_page, re.IGNORECASE)
            if match:
                metadata[key] = match.group(1)

        return metadata

    def _extract_sections(self, doc: fitz.Document) -> List[DocumentSection]:
        """Detecta estrutura hierárquica do documento"""

        sections = []
        current_section = None

        for page_num, page in enumerate(doc):
            blocks = page.get_text("dict")["blocks"]

            for block in blocks:
                if "lines" not in block:
                    continue

                for line in block["lines"]:
                    text = " ".join([span["text"] for span in line["spans"]])

                    # Detecta títulos por tamanho de fonte e formato
                    font_size = line["spans"][0]["size"]
                    is_bold = "Bold" in line["spans"][0]["font"]
                    is_uppercase = text.isupper()

                    if font_size > 12 or (is_bold and is_uppercase):
                        # Novo título detectado
                        if current_section:
                            sections.append(current_section)

                        current_section = DocumentSection(
                            title=text,
                            level=self._infer_level(font_size, is_bold),
                            content="",
                            page_start=page_num,
                            page_end=page_num,
                            tables=[],
                            lists=[],
                            metadata={}
                        )
                    elif current_section:
                        current_section.content += text + "\n"
                        current_section.page_end = page_num

        if current_section:
            sections.append(current_section)

        return sections

    def _extract_entities(self, sections: List[DocumentSection]) -> Dict[str, List[str]]:
        """
        Extrai entidades mencionadas no documento usando NER

        Entidades alvo:
        - OBJECT_TYPE: "Cliente", "Conta", "Transação"
        - FIELD: "CPF", "Valor", "Data"
        - RULE: "limite", "validação", "prazo"
        - STATE: "ATIVO", "PENDENTE", "CANCELADO"
        """

        import spacy
        nlp = spacy.load("pt_core_news_lg")

        entities = {
            'objects': [],
            'fields': [],
            'rules': [],
            'states': [],
            'amounts': [],
            'dates': []
        }

        for section in sections:
            doc = nlp(section.content)

            # Entidades nomeadas
            for ent in doc.ents:
                if ent.label_ == "PER":  # Pode ser tipo de cliente
                    entities['objects'].append(ent.text)
                elif ent.label_ == "MONEY":
                    entities['amounts'].append(ent.text)
                elif ent.label_ == "DATE":
                    entities['dates'].append(ent.text)

            # Pattern matching para campos
            field_patterns = [
                r'campo\s+["\']?(\w+)["\']?',
                r'informação\s+de\s+(\w+)',
                r'dado\s+["\']?(\w+)["\']?'
            ]

            for pattern in field_patterns:
                matches = re.findall(pattern, section.content, re.IGNORECASE)
                entities['fields'].extend(matches)

            # Pattern matching para regras
            rule_patterns = [
                r'deve\s+(?:ser|conter|ter)\s+(.+?)(?:\.|,|;)',
                r'é\s+(?:obrigatório|vedado|permitido)\s+(.+?)(?:\.|,|;)',
                r'limite\s+de\s+(.+?)(?:\.|,|;)'
            ]

            for pattern in rule_patterns:
                matches = re.findall(pattern, section.content, re.IGNORECASE)
                entities['rules'].extend(matches)

        # Deduplica e limpa
        for key in entities:
            entities[key] = list(set([e.strip() for e in entities[key] if e.strip()]))

        return entities
```

**Output Exemplo**:

```json
{
  "metadata": {
    "norma": "Circular 3.978",
    "titulo": "Prevenção à Lavagem de Dinheiro (PLD) e Financiamento do Terrorismo (FT)",
    "data_publicacao": "2020-01-23",
    "vigencia_inicio": "2020-03-01",
    "orgao": "BACEN",
    "tipo": "Circular"
  },
  "sections": [
    {
      "title": "CAPÍTULO I - DISPOSIÇÕES GERAIS",
      "level": 1,
      "content": "Art. 1º Esta Circular dispõe sobre as políticas, procedimentos...",
      "page_start": 1,
      "page_end": 3,
      "tables": [],
      "lists": [
        ["identificação do cliente", "cadastro atualizado", "análise de risco"]
      ]
    },
    {
      "title": "CAPÍTULO II - LIMITES TRANSACIONAIS",
      "level": 1,
      "content": "Art. 5º As instituições devem estabelecer limites...",
      "page_start": 4,
      "page_end": 6,
      "tables": [
        [
          ["Tipo Transação", "Limite Diário", "Limite Noturno"],
          ["PIX", "R$ 20.000,00", "R$ 1.000,00"],
          ["TED", "Sem limite", "Sem limite"],
          ["Saque", "R$ 5.000,00", "Não permitido"]
        ]
      ],
      "lists": []
    }
  ],
  "entities": {
    "objects": ["Cliente", "Transação", "Conta"],
    "fields": ["CPF", "Nome", "Valor", "Data", "Tipo"],
    "rules": [
      "limite diário de R$ 20.000,00 para PIX",
      "limite noturno de R$ 1.000,00 entre 20h e 6h",
      "validação de CPF obrigatória"
    ],
    "states": ["PENDENTE", "APROVADO", "REJEITADO"],
    "amounts": ["R$ 20.000,00", "R$ 1.000,00", "R$ 5.000,00"],
    "dates": ["2020-03-01"]
  }
}
```

### 2. Schema Generation Engine

**Responsabilidade**: Transformar documento estruturado em object_definition válido.

**Arquitetura**:

```python
# architect_agent/schema_generator.py

from typing import Dict, Any, List
from pydantic import BaseModel
import anthropic
import json

class SchemaGenerationPrompt(BaseModel):
    """Template de prompt para geração de schema"""
    document_section: str
    entities_extracted: Dict[str, List[str]]
    context: str  # Contexto de outros objetos já definidos
    requirements: List[str]  # Requisitos específicos

class SchemaGenerator:
    """Gera JSON Schema + FSM + Validation Rules a partir de documentos"""

    def __init__(self, llm_client: anthropic.Anthropic):
        self.llm = llm_client
        self.system_prompt = self._load_system_prompt()

    def generate_object_definition(
        self,
        document: DocumentStructure,
        target_object: str
    ) -> Dict[str, Any]:
        """
        Gera object_definition completo a partir de documento

        Args:
            document: Documento parseado (ex: Circular BACEN)
            target_object: Nome do objeto a ser gerado (ex: "transacao_pix")

        Returns:
            object_definition completo com schema, FSM, rules, UI hints
        """

        # 1. EXTRAÇÃO DE CONTEXTO RELEVANTE
        relevant_sections = self._find_relevant_sections(document, target_object)

        # 2. BUSCA DE OBJETOS RELACIONADOS (RAG)
        related_objects = self._find_related_objects(target_object)

        # 3. GERAÇÃO DE JSON SCHEMA
        schema = self._generate_json_schema(
            sections=relevant_sections,
            entities=document.entities,
            related_objects=related_objects
        )

        # 4. GERAÇÃO DE FSM
        fsm = self._generate_fsm(relevant_sections)

        # 5. GERAÇÃO DE VALIDATION RULES
        rules = self._generate_validation_rules(relevant_sections, schema)

        # 6. GERAÇÃO DE UI HINTS
        ui_hints = self._generate_ui_hints(schema)

        # 7. GERAÇÃO DE RELACIONAMENTOS PERMITIDOS
        relationships = self._generate_relationships(
            target_object,
            related_objects,
            document.entities
        )

        return {
            "name": self._slugify(target_object),
            "display_name": target_object.title(),
            "description": self._generate_description(relevant_sections),
            "schema": schema,
            "states": fsm,
            "rules": rules,
            "ui_hints": ui_hints,
            "relationships": relationships,
            "metadata": {
                "source_document": document.metadata.get("norma"),
                "generated_at": datetime.now().isoformat(),
                "generator_version": "2.0.0",
                "review_status": "PENDING"  # Requer revisão humana
            }
        }

    def _generate_json_schema(
        self,
        sections: List[DocumentSection],
        entities: Dict[str, List[str]],
        related_objects: List[Dict]
    ) -> Dict[str, Any]:
        """Gera JSON Schema usando LLM"""

        # Monta contexto para o LLM
        context = self._build_context(sections, entities, related_objects)

        prompt = f"""Você é um especialista em modelagem de dados para Core Banking e JSON Schema Draft 7.

TAREFA: Gerar JSON Schema completo para um objeto de negócio baseado em documentação regulatória BACEN.

CONTEXTO DO DOCUMENTO:
{context}

CAMPOS IDENTIFICADOS:
{json.dumps(entities['fields'], indent=2, ensure_ascii=False)}

REGRAS IDENTIFICADAS:
{json.dumps(entities['rules'], indent=2, ensure_ascii=False)}

OBJETOS RELACIONADOS JÁ EXISTENTES:
{json.dumps([obj['name'] for obj in related_objects], indent=2)}

INSTRUÇÕES:
1. Crie um JSON Schema Draft 7 válido
2. Use tipos apropriados (string, number, boolean, object, array)
3. Defina "required" para campos obrigatórios
4. Use "pattern" para validações regex (CPF, CNPJ, email, etc)
5. Use "enum" para campos de seleção
6. Use "minimum", "maximum" para limites numéricos
7. Use "format" (date, date-time, email, uri) quando apropriado
8. Use "description" em português para cada campo
9. Se um campo referencia outro objeto, use:
   {{
     "type": "string",
     "format": "uuid",
     "x-relationship": {{
       "target_object": "nome_do_objeto",
       "relationship_type": "TIPO_RELACAO"
     }}
   }}
10. Para valores monetários, use:
    {{
      "type": "integer",
      "description": "Valor em centavos (ex: 10000 = R$ 100,00)",
      "minimum": 0
    }}

RETORNE APENAS O JSON SCHEMA VÁLIDO, SEM EXPLICAÇÕES.
"""

        response = self.llm.messages.create(
            model="claude-opus-4-20250514",
            max_tokens=4000,
            temperature=0.1,  # Baixa temperatura para output determinístico
            system=self.system_prompt,
            messages=[{"role": "user", "content": prompt}]
        )

        schema_json = response.content[0].text

        # Parse e valida
        try:
            schema = json.loads(schema_json)
            self._validate_json_schema(schema)
            return schema
        except Exception as e:
            raise ValueError(f"Schema inválido gerado: {e}")

    def _generate_fsm(self, sections: List[DocumentSection]) -> Dict[str, Any]:
        """Gera Finite State Machine a partir de descrições de fluxo"""

        # Busca seções que mencionam estados, fluxos, processos
        flow_sections = [
            s for s in sections
            if any(keyword in s.content.lower() for keyword in [
                'estado', 'fluxo', 'processo', 'etapa', 'fase',
                'aprovação', 'análise', 'conclusão'
            ])
        ]

        if not flow_sections:
            # FSM padrão se não houver informação
            return {
                "initial": "ATIVO",
                "states": ["ATIVO", "INATIVO"],
                "transitions": [
                    {
                        "from": "ATIVO",
                        "to": "INATIVO",
                        "event": "inativar",
                        "conditions": []
                    }
                ]
            }

        context = "\n\n".join([s.content for s in flow_sections])

        prompt = f"""Você é um especialista em Finite State Machines (FSM) e processos de negócio.

TAREFA: Extrair estados e transições de um processo descrito em texto.

DESCRIÇÃO DO PROCESSO:
{context}

INSTRUÇÕES:
1. Identifique todos os ESTADOS mencionados (ex: PENDENTE, APROVADO, REJEITADO)
2. Identifique o ESTADO INICIAL
3. Identifique todas as TRANSIÇÕES possíveis entre estados
4. Para cada transição, identifique:
   - Estado de origem (from)
   - Estado de destino (to)
   - Evento que dispara (event)
   - Condições necessárias (conditions, se houver)
5. Use nomes em UPPER_SNAKE_CASE para estados
6. Use nomes em snake_case para eventos

FORMATO DE OUTPUT (JSON):
{{
  "initial": "ESTADO_INICIAL",
  "states": ["ESTADO_1", "ESTADO_2", ...],
  "transitions": [
    {{
      "from": "ESTADO_1",
      "to": "ESTADO_2",
      "event": "nome_evento",
      "conditions": [
        {{
          "field": "campo",
          "operator": "==|!=|>|<|>=|<=",
          "value": "valor"
        }}
      ]
    }}
  ]
}}

RETORNE APENAS O JSON VÁLIDO, SEM EXPLICAÇÕES.
"""

        response = self.llm.messages.create(
            model="claude-opus-4-20250514",
            max_tokens=2000,
            temperature=0.1,
            system=self.system_prompt,
            messages=[{"role": "user", "content": prompt}]
        )

        fsm_json = response.content[0].text

        try:
            fsm = json.loads(fsm_json)
            self._validate_fsm(fsm)
            return fsm
        except Exception as e:
            raise ValueError(f"FSM inválido gerado: {e}")

    def _generate_validation_rules(
        self,
        sections: List[DocumentSection],
        schema: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Gera validation_rules a partir de regras mencionadas no documento"""

        # Extrai regras mencionadas
        rule_texts = []
        for section in sections:
            # Pattern matching para regras
            patterns = [
                r'deve\s+(.+?)(?:\.|;)',
                r'é\s+obrigatório\s+(.+?)(?:\.|;)',
                r'não\s+pode\s+(.+?)(?:\.|;)',
                r'limite\s+de\s+(.+?)(?:\.|;)',
                r'validação\s+de\s+(.+?)(?:\.|;)'
            ]

            for pattern in patterns:
                matches = re.findall(pattern, section.content, re.IGNORECASE)
                rule_texts.extend(matches)

        if not rule_texts:
            return []

        prompt = f"""Você é um especialista em validação de dados e regras de negócio.

TAREFA: Converter regras de negócio em validation_rules executáveis.

JSON SCHEMA DO OBJETO:
{json.dumps(schema, indent=2, ensure_ascii=False)}

REGRAS MENCIONADAS NO DOCUMENTO:
{json.dumps(rule_texts, indent=2, ensure_ascii=False)}

TIPOS DE VALIDATION_RULES DISPONÍVEIS:
1. regex: {{
     "type": "regex",
     "field": "campo",
     "pattern": "regex_pattern",
     "error_message": "mensagem"
   }}

2. range: {{
     "type": "range",
     "field": "campo",
     "min": valor_minimo,
     "max": valor_maximo,
     "error_message": "mensagem"
   }}

3. api_call: {{
     "type": "api_call",
     "endpoint": "/api/validate/something",
     "method": "POST",
     "error_message": "mensagem"
   }}

4. function: {{
     "type": "function",
     "code": "código_javascript",
     "error_message": "mensagem"
   }}

5. required_if: {{
     "type": "required_if",
     "field": "campo_alvo",
     "condition": {{
       "field": "campo_condicao",
       "operator": "==",
       "value": "valor"
     }},
     "error_message": "mensagem"
   }}

INSTRUÇÕES:
1. Para cada regra, crie uma validation_rule executável
2. Use o tipo mais apropriado
3. Seja específico nos patterns e condições
4. Mensagens de erro devem ser claras em português
5. Se a regra referenciar outra tabela/API, use api_call

RETORNE ARRAY DE VALIDATION_RULES EM JSON, SEM EXPLICAÇÕES.
"""

        response = self.llm.messages.create(
            model="claude-opus-4-20250514",
            max_tokens=3000,
            temperature=0.1,
            system=self.system_prompt,
            messages=[{"role": "user", "content": prompt}]
        )

        rules_json = response.content[0].text

        try:
            rules = json.loads(rules_json)
            return rules
        except Exception as e:
            raise ValueError(f"Validation rules inválidas: {e}")

    def _generate_ui_hints(self, schema: Dict[str, Any]) -> Dict[str, Any]:
        """Gera UI hints baseado no schema"""

        ui_hints = {
            "widgets": {},
            "labels": {},
            "help_text": {},
            "groups": []
        }

        for field_name, field_schema in schema.get("properties", {}).items():
            field_type = field_schema.get("type")
            field_format = field_schema.get("format")
            field_pattern = field_schema.get("pattern")

            # Inferir widget apropriado
            if field_pattern == r"^\d{11}$":
                ui_hints["widgets"][field_name] = "cpf"
            elif field_pattern == r"^\d{14}$":
                ui_hints["widgets"][field_name] = "cnpj"
            elif field_format == "date":
                ui_hints["widgets"][field_name] = "date"
            elif field_format == "date-time":
                ui_hints["widgets"][field_name] = "datetime"
            elif field_format == "email":
                ui_hints["widgets"][field_name] = "email"
            elif "enum" in field_schema:
                ui_hints["widgets"][field_name] = "select"
            elif field_type == "integer" and "valor" in field_name.lower():
                ui_hints["widgets"][field_name] = "currency"
            elif field_type == "string" and field_schema.get("maxLength", 0) > 200:
                ui_hints["widgets"][field_name] = "textarea"
            else:
                ui_hints["widgets"][field_name] = "text"

            # Label e help text
            ui_hints["labels"][field_name] = field_schema.get("title", field_name.replace("_", " ").title())
            ui_hints["help_text"][field_name] = field_schema.get("description", "")

        return ui_hints

    def _validate_json_schema(self, schema: Dict[str, Any]):
        """Valida se o schema gerado é JSON Schema Draft 7 válido"""
        from jsonschema import Draft7Validator, ValidationError

        try:
            Draft7Validator.check_schema(schema)
        except ValidationError as e:
            raise ValueError(f"JSON Schema inválido: {e}")

    def _validate_fsm(self, fsm: Dict[str, Any]):
        """Valida se o FSM é válido (sem estados órfãos, etc)"""

        initial = fsm.get("initial")
        states = set(fsm.get("states", []))
        transitions = fsm.get("transitions", [])

        # Check 1: Initial state existe em states
        if initial not in states:
            raise ValueError(f"Estado inicial '{initial}' não está em states")

        # Check 2: Nenhum estado órfão (sem transição de entrada ou saída)
        states_in_transitions = set()
        for t in transitions:
            states_in_transitions.add(t["from"])
            states_in_transitions.add(t["to"])

        orphan_states = states - states_in_transitions - {initial}
        if orphan_states:
            raise ValueError(f"Estados órfãos detectados: {orphan_states}")

        # Check 3: Transições referenciam apenas estados válidos
        for t in transitions:
            if t["from"] not in states:
                raise ValueError(f"Transição referencia estado inválido: {t['from']}")
            if t["to"] not in states:
                raise ValueError(f"Transição referencia estado inválido: {t['to']}")
```

### 3. Knowledge Base & Vector Store

**Responsabilidade**: Armazenar embeddings de documentos para RAG context.

```python
# architect_agent/knowledge_base.py

from typing import List, Dict, Any
import openai
from dataclasses import dataclass

@dataclass
class DocumentChunk:
    """Chunk de documento com embedding"""
    document_id: str
    chunk_id: str
    content: str
    embedding: List[float]
    metadata: Dict[str, Any]
    page_number: int
    section_title: str

class KnowledgeBase:
    """Vector store para documentação BACEN e contexto"""

    def __init__(self, pg_conn, openai_client: openai.OpenAI):
        self.pg = pg_conn
        self.openai = openai_client
        self.embedding_model = "text-embedding-3-large"

    async def ingest_document(self, document: DocumentStructure):
        """
        Ingere documento na knowledge base

        Passos:
        1. Chunk semântico (por seção)
        2. Gera embeddings
        3. Armazena em pgvector
        """

        chunks = []

        for section in document.sections:
            # Chunking por seção (ou subdivide se muito grande)
            section_chunks = self._chunk_section(section)

            for chunk_text in section_chunks:
                # Gera embedding
                embedding = await self._generate_embedding(chunk_text)

                chunk = DocumentChunk(
                    document_id=document.metadata.get("norma"),
                    chunk_id=f"{document.metadata.get('norma')}_{section.title}_{len(chunks)}",
                    content=chunk_text,
                    embedding=embedding,
                    metadata=document.metadata,
                    page_number=section.page_start,
                    section_title=section.title
                )

                chunks.append(chunk)

        # Insere no banco
        await self._insert_chunks(chunks)

    async def search(
        self,
        query: str,
        top_k: int = 5,
        filters: Dict[str, Any] = None
    ) -> List[DocumentChunk]:
        """Busca semântica na knowledge base"""

        # Gera embedding da query
        query_embedding = await self._generate_embedding(query)

        # Busca por similaridade (cosine)
        sql = """
            SELECT
                document_id,
                chunk_id,
                content,
                metadata,
                page_number,
                section_title,
                1 - (embedding <=> $1::vector) as similarity
            FROM document_embeddings
            WHERE 1=1
        """

        params = [query_embedding]

        # Aplica filtros
        if filters:
            if "document_type" in filters:
                sql += " AND metadata->>'tipo' = $2"
                params.append(filters["document_type"])

            if "date_after" in filters:
                sql += " AND (metadata->>'data_publicacao')::date >= $3"
                params.append(filters["date_after"])

        sql += f" ORDER BY similarity DESC LIMIT {top_k}"

        results = await self.pg.fetch(sql, *params)

        return [
            DocumentChunk(
                document_id=r["document_id"],
                chunk_id=r["chunk_id"],
                content=r["content"],
                embedding=[],  # Não retorna embedding completo
                metadata=r["metadata"],
                page_number=r["page_number"],
                section_title=r["section_title"]
            )
            for r in results
        ]

    async def _generate_embedding(self, text: str) -> List[float]:
        """Gera embedding usando OpenAI"""

        response = self.openai.embeddings.create(
            model=self.embedding_model,
            input=text,
            dimensions=3072  # text-embedding-3-large
        )

        return response.data[0].embedding

    def _chunk_section(self, section: DocumentSection, max_size: int = 1000) -> List[str]:
        """Divide seção em chunks se necessário"""

        if len(section.content) <= max_size:
            return [section.content]

        # Divide por parágrafos
        paragraphs = section.content.split("\n\n")

        chunks = []
        current_chunk = ""

        for para in paragraphs:
            if len(current_chunk) + len(para) <= max_size:
                current_chunk += para + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = para + "\n\n"

        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks
```

---

## 🔄 Fluxo de Geração Automática

### Caso de Uso 1: Gerar Módulo PIX Completo

**Input**: Manual PIX BACEN (PDF de 300 páginas)

**Fluxo**:

```
1. UPLOAD DO DOCUMENTO
   └─> POST /api/architect/documents/upload
       Body: {file: manual_pix.pdf}

2. PARSING (5-10 minutos)
   ├─> Document Intelligence Engine processa PDF
   ├─> Extrai 50 seções, 30 tabelas, 200 regras
   └─> Armazena estrutura + embeddings

3. ENTITY DETECTION
   ├─> Identifica objetos: TransacaoPix, ChavePix, DevolucaoPix
   ├─> Identifica campos: chave, valor, infoPagador, endToEndId
   └─> Identifica regras: limite_noturno, validacao_chave

4. GERAÇÃO AUTOMÁTICA (por objeto)

   4.1. TransacaoPix
        ├─> Schema Generator cria JSON Schema
        │   └─> 25 campos (chave, valor, timestamp, status, etc)
        ├─> FSM Generator cria máquina de estados
        │   └─> 8 estados: INICIADA → VALIDANDO → LIQUIDADA → ...
        ├─> Validation Rules Generator
        │   └─> 15 regras (valor_minimo, chave_valida, limite_noturno, etc)
        └─> UI Hints Generator
            └─> Widgets para cada campo

   4.2. ChavePix
        ├─> 12 campos (tipo, valor, titular, etc)
        ├─> 4 estados (CRIADA, ATIVA, BLOQUEADA, EXCLUIDA)
        └─> 8 regras de validação

   4.3. DevolucaoPix
        ├─> 10 campos
        ├─> 5 estados
        └─> 6 regras

5. VALIDAÇÃO
   ├─> Valida JSON Schemas (Draft 7)
   ├─> Valida FSMs (sem órfãos)
   ├─> Detecta conflitos com objetos existentes
   └─> Gera testes unitários automaticamente

6. REVIEW QUEUE
   ├─> Notifica time de Compliance
   ├─> Dashboard mostra preview dos objetos gerados
   ├─> Permite ajustes manuais
   └─> Aguarda aprovação

7. DEPLOYMENT (após aprovação)
   ├─> INSERT em object_definitions (3 objetos)
   ├─> INSERT em validation_rules (29 regras)
   ├─> Gera migration SQL (se necessário)
   ├─> Gera documentação automática
   ├─> Notifica time via Slack
   └─> Frontend já renderiza formulários automaticamente

8. TESTING AUTOMÁTICO
   ├─> Executa testes unitários gerados
   ├─> Executa testes de validação
   ├─> Valida integração com frontend
   └─> Relatório de cobertura

OUTPUT FINAL:
✅ Módulo PIX completo implementado em 30 minutos
✅ 3 object_definitions
✅ 29 validation_rules
✅ 50+ testes unitários
✅ Documentação completa
✅ UI funcionando automaticamente
```

### Caso de Uso 2: Atualizar Regra Existente

**Input**: Circular 4.XXX altera limite noturno PIX de R$ 1.000 para R$ 2.500

**Fluxo**:

```
1. BACEN CRAWLER detecta nova publicação
   └─> Webhook: nova_circular_publicada

2. DOWNLOAD & PARSING
   ├─> Download automático do PDF
   └─> Parsing da circular

3. CHANGE DETECTION
   ├─> Compara com circular anterior
   ├─> Detecta: "limite noturno PIX alterado"
   └─> Identifica validation_rule afetada: "limite_pix_noturno"

4. UPDATE AUTOMÁTICO (com aprovação)
   ├─> Cria versão 2 da validation_rule
   ├─> Mantém versão 1 para histórico
   ├─> Agenda vigência para data especificada
   └─> Notifica Compliance para aprovação

5. DEPLOYMENT AGENDADO
   └─> No dia da vigência, ativa automaticamente

6. AUDITORIA
   └─> Registra mudança em audit_log com referência à circular
```

---

## 📅 Sprints de Implementação (Fase 2 - 12 semanas)

### Sprint 7-8: Document Intelligence Engine (Semanas 1-2)

**Objetivos**:
- [ ] Parser PDF com PyMuPDF + pdfplumber
- [ ] OCR com Tesseract
- [ ] Table extraction com Camelot
- [ ] Structure detection (sections, headings)
- [ ] Entity extraction com spaCy
- [ ] API endpoint: POST /api/architect/documents/upload

**Entregas**:
- DocumentParser class completa
- Testes com 5 documentos BACEN reais
- Cobertura ≥ 80%

### Sprint 9-10: Schema Generation Engine (Semanas 3-4)

**Objetivos**:
- [ ] SchemaGenerator com Claude Opus 4
- [ ] FSM Generator
- [ ] Validation Rules Generator
- [ ] UI Hints Generator
- [ ] Validation pipeline (schema + FSM)
- [ ] API endpoint: POST /api/architect/generate

**Entregas**:
- SchemaGenerator class completa
- Testes com 3 objetos diferentes
- Validação automática funcionando

### Sprint 11-12: Knowledge Base & Vector Store (Semanas 5-6)

**Objetivos**:
- [ ] Knowledge base schema (pgvector)
- [ ] Document chunking
- [ ] Embedding generation (OpenAI)
- [ ] Semantic search
- [ ] API endpoint: GET /api/architect/search

**Entregas**:
- KnowledgeBase class completa
- 10 documentos BACEN indexados
- Search latency < 200ms

### Sprint 13-14: Review & Deployment System (Semanas 7-8)

**Objetivos**:
- [ ] Review Queue UI (frontend)
- [ ] Preview de objetos gerados
- [ ] Edição manual (se necessário)
- [ ] Approval workflow
- [ ] Deployment automático após aprovação
- [ ] Rollback mechanism

**Entregas**:
- Review dashboard completo
- Workflow de aprovação funcionando
- Deployment testado

### Sprint 15-16: BACEN Crawler & Monitoring (Semanas 9-10)

**Objetivos**:
- [ ] Crawler do site BACEN
- [ ] Detecção de novas publicações
- [ ] Download automático
- [ ] Change detection (diff entre versões)
- [ ] Alerting (Slack, email)
- [ ] Scheduler (cron jobs)

**Entregas**:
- Crawler funcionando (daily)
- Alerting configurado
- Dashboard de publicações

### Sprint 17-18: Integration & Polish (Semanas 11-12)

**Objetivos**:
- [ ] Integração end-to-end testada
- [ ] Geração de Módulo PIX completo (teste real)
- [ ] Performance optimization
- [ ] Documentation completa
- [ ] Monitoring dashboards
- [ ] User training

**Entregas**:
- Módulo PIX gerado com sucesso
- Documentação completa
- Training materials
- Production-ready

---

## 📊 Métricas de Sucesso

### KPIs Técnicos

| Métrica | Objetivo | Medição |
|---------|----------|---------|
| **Document Parsing Accuracy** | ≥ 95% | Comparação manual vs automático |
| **Schema Generation Quality** | ≥ 90% | Aprovação em review |
| **Entity Extraction Precision** | ≥ 85% | F1-score em dataset anotado |
| **Knowledge Base Search Relevance** | ≥ 80% | NDCG@5 |
| **End-to-End Generation Time** | < 30 min | Tempo total (upload → deployment) |
| **False Positive Rate (conflicts)** | < 5% | Conflitos detectados incorretamente |
| **Test Coverage (generated code)** | ≥ 80% | Cobertura de testes gerados |

### KPIs de Negócio

| Métrica | Objetivo | Impacto |
|---------|----------|---------|
| **Tempo de Implementação de Módulo** | 3 dias (vs 3 meses) | 30x mais rápido |
| **Custo de Modelagem** | -90% | Elimina trabalho manual |
| **Compliance Updates** | < 24h | Automático após publicação BACEN |
| **Qualidade de Documentação** | 100% | Gerada automaticamente |
| **Erros de Implementação** | -70% | Validação automática |

---

## 🎯 Exemplos Concretos

### Exemplo 1: Geração de TransacaoPix

**Input**: Manual PIX BACEN - Capítulo "Iniciação de Transação"

**Document Section**:
```
Artigo 5º - A transação PIX deve conter os seguintes campos:

1. endToEndId: identificador único da transação (32 caracteres alfanuméricos)
2. valor: valor em reais, mínimo de R$ 0,01
3. chave: chave PIX do destinatário (CPF, CNPJ, email, telefone ou aleatória)
4. infoPagador: informação do pagador (até 140 caracteres, opcional)
5. timestamp: data e hora da iniciação

Artigo 6º - Limites transacionais:
- Limite diário: R$ 20.000,00 por usuário
- Limite noturno (20h às 6h): R$ 1.000,00 por transação

Artigo 7º - Estados da transação:
INICIADA → VALIDANDO → APROVADA → LIQUIDADA
         ↓            ↓
      REJEITADA    CANCELADA
```

**Generated object_definition**:

```json
{
  "name": "transacao_pix",
  "display_name": "Transação PIX",
  "description": "Transação de pagamento instantâneo via sistema PIX do Banco Central",
  "version": 1,
  "schema": {
    "type": "object",
    "properties": {
      "end_to_end_id": {
        "type": "string",
        "pattern": "^[A-Za-z0-9]{32}$",
        "description": "Identificador único da transação (E2EID)"
      },
      "valor": {
        "type": "integer",
        "minimum": 1,
        "description": "Valor em centavos (ex: 10000 = R$ 100,00)"
      },
      "chave": {
        "type": "string",
        "description": "Chave PIX do destinatário"
      },
      "tipo_chave": {
        "type": "string",
        "enum": ["CPF", "CNPJ", "EMAIL", "TELEFONE", "ALEATORIA"]
      },
      "info_pagador": {
        "type": "string",
        "maxLength": 140,
        "description": "Informação adicional do pagador (opcional)"
      },
      "timestamp": {
        "type": "string",
        "format": "date-time",
        "description": "Data e hora da iniciação da transação"
      },
      "pagador_id": {
        "type": "string",
        "format": "uuid",
        "x-relationship": {
          "target_object": "cliente_pf",
          "relationship_type": "PAGADOR_DE"
        }
      },
      "beneficiario_id": {
        "type": "string",
        "format": "uuid",
        "x-relationship": {
          "target_object": "cliente_pf",
          "relationship_type": "BENEFICIARIO_DE"
        }
      }
    },
    "required": ["end_to_end_id", "valor", "chave", "tipo_chave", "timestamp", "pagador_id"]
  },
  "states": {
    "initial": "INICIADA",
    "states": [
      "INICIADA",
      "VALIDANDO",
      "APROVADA",
      "LIQUIDADA",
      "REJEITADA",
      "CANCELADA"
    ],
    "transitions": [
      {
        "from": "INICIADA",
        "to": "VALIDANDO",
        "event": "validar",
        "conditions": []
      },
      {
        "from": "INICIADA",
        "to": "REJEITADA",
        "event": "rejeitar",
        "conditions": []
      },
      {
        "from": "VALIDANDO",
        "to": "APROVADA",
        "event": "aprovar",
        "conditions": [
          {
            "field": "valor",
            "operator": "<=",
            "value": 2000000,
            "error": "Valor excede limite diário"
          }
        ]
      },
      {
        "from": "VALIDANDO",
        "to": "REJEITADA",
        "event": "rejeitar",
        "conditions": []
      },
      {
        "from": "APROVADA",
        "to": "LIQUIDADA",
        "event": "liquidar",
        "conditions": []
      },
      {
        "from": "APROVADA",
        "to": "CANCELADA",
        "event": "cancelar",
        "conditions": []
      }
    ]
  },
  "rules": [
    {
      "name": "valor_minimo",
      "type": "range",
      "field": "valor",
      "min": 1,
      "error_message": "Valor mínimo: R$ 0,01"
    },
    {
      "name": "limite_diario",
      "type": "api_call",
      "endpoint": "/api/validate/limite-diario-pix",
      "method": "POST",
      "payload": {
        "pagador_id": "{{pagador_id}}",
        "valor": "{{valor}}"
      },
      "error_message": "Limite diário de R$ 20.000,00 excedido"
    },
    {
      "name": "limite_noturno",
      "type": "function",
      "code": "const hora = new Date(data.timestamp).getHours(); if (hora >= 20 || hora < 6) { return data.valor <= 100000; } return true;",
      "error_message": "Limite noturno (20h-6h): R$ 1.000,00 por transação"
    },
    {
      "name": "chave_valida",
      "type": "api_call",
      "endpoint": "/api/bacen/dict/consultar-chave",
      "method": "GET",
      "error_message": "Chave PIX inválida ou não cadastrada"
    }
  ],
  "ui_hints": {
    "widgets": {
      "end_to_end_id": "text",
      "valor": "currency",
      "chave": "text",
      "tipo_chave": "select",
      "info_pagador": "textarea",
      "timestamp": "datetime",
      "pagador_id": "relationship",
      "beneficiario_id": "relationship"
    },
    "labels": {
      "end_to_end_id": "End-to-End ID",
      "valor": "Valor",
      "chave": "Chave PIX Destino",
      "tipo_chave": "Tipo de Chave",
      "info_pagador": "Informação do Pagador",
      "timestamp": "Data/Hora",
      "pagador_id": "Pagador",
      "beneficiario_id": "Beneficiário"
    },
    "help_text": {
      "end_to_end_id": "Gerado automaticamente pelo sistema. 32 caracteres alfanuméricos.",
      "valor": "Valor da transação em reais. Mínimo: R$ 0,01. Limite diário: R$ 20.000,00.",
      "chave": "Chave PIX do destinatário (CPF, CNPJ, email, telefone ou chave aleatória).",
      "info_pagador": "Mensagem opcional do pagador (até 140 caracteres)."
    },
    "groups": [
      {
        "title": "Dados da Transação",
        "fields": ["end_to_end_id", "valor", "timestamp"]
      },
      {
        "title": "Destinatário",
        "fields": ["chave", "tipo_chave", "beneficiario_id"]
      },
      {
        "title": "Informações Adicionais",
        "fields": ["info_pagador"]
      }
    ]
  },
  "relationships": [
    "PAGADOR_DE",
    "BENEFICIARIO_DE"
  ],
  "metadata": {
    "source_document": "Manual PIX BACEN v3.1",
    "generated_at": "2024-01-15T10:30:00Z",
    "generator_version": "2.0.0",
    "review_status": "APPROVED",
    "approved_by": "compliance@lbpay.com.br",
    "approved_at": "2024-01-15T14:00:00Z"
  }
}
```

**Generated Tests** (auto):

```go
// backend/internal/handlers/transacao_pix_test.go
// AUTO-GENERATED by Architect Agent

func TestTransacaoPix_ValorMinimo(t *testing.T) {
    instance := &Instance{
        ObjectDefinitionID: uuid.MustParse("transacao-pix-id"),
        Data: map[string]interface{}{
            "end_to_end_id": "E12345678202401151030ABCD1234",
            "valor":         0, // Inválido
            "chave":         "12345678901",
            "tipo_chave":    "CPF",
            "timestamp":     "2024-01-15T10:30:00Z",
            "pagador_id":    uuid.New().String(),
        },
    }

    err := validator.Validate(instance)
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "Valor mínimo: R$ 0,01")
}

func TestTransacaoPix_LimiteNoturno(t *testing.T) {
    instance := &Instance{
        ObjectDefinitionID: uuid.MustParse("transacao-pix-id"),
        Data: map[string]interface{}{
            "end_to_end_id": "E12345678202401152100ABCD1234",
            "valor":         150000, // R$ 1.500,00 às 21h - excede limite
            "chave":         "12345678901",
            "tipo_chave":    "CPF",
            "timestamp":     "2024-01-15T21:00:00Z", // Horário noturno
            "pagador_id":    uuid.New().String(),
        },
    }

    err := validator.Validate(instance)
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "Limite noturno")
}

// ... mais 15 testes gerados automaticamente
```

---

## 🚀 Próximos Passos

1. **Aprovar este documento** (FASE_2_ESCOPO_TECNICO_COMPLETO.md)
2. **Definir Stack de Implementação**:
   - Python 3.11+ para Document Intelligence
   - Go mantém backend core
   - PostgreSQL + pgvector para Knowledge Base
3. **Setup ambiente Python**:
   - PyMuPDF, pdfplumber, Tesseract
   - spaCy com modelo pt_core_news_lg
   - OpenAI SDK, Anthropic SDK
4. **Criar repositório de documentos BACEN** (seed inicial)
5. **Iniciar Sprint 7**: Document Intelligence Engine

---

**Status**: 📝 **ESPECIFICAÇÃO COMPLETA - AGUARDANDO APROVAÇÃO**

**Próxima Fase**: Implementação (12 semanas)

**Impacto Esperado**:
- ✅ Redução de 90% no tempo de modelagem
- ✅ Compliance 100% com regulamentações
- ✅ Updates automáticos quando BACEN muda normas
- ✅ Documentação automática completa
- ✅ Módulos completos gerados em dias (vs meses)

---

*Documento criado por: Architect Team*
*Data: 2024-01-15*
*Versão: 1.0*
