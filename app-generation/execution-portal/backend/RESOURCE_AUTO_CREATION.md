# 🤖 Sistema de Auto-Criação de Recursos

## Visão Geral

O **Sistema de Auto-Criação de Recursos** permite que o Squad Planner crie agentes e skills **dinamicamente** baseado nas necessidades do projeto, e também **importe recursos externos** de fontes confiáveis.

> **"A cereja do bolo"** 🍒🎂 - O sistema se enriquece automaticamente a cada projeto!

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    SQUAD PLANNER                         │
│                                                          │
│  1. Analisa documentação (requisitos, arquitetura)      │
│  2. Identifica necessidades de agentes/skills           │
│  3. Cria recursos dinamicamente OU importa externos     │
│  4. Registra no sistema (.claude/, database)            │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌─────────────────┐   ┌────────────────┐
│ Agent        │   │ Skill           │   │ External       │
│ Creator      │   │ Generator       │   │ Resource       │
│              │   │                 │   │ Finder         │
│ Cria agentes │   │ Gera skills     │   │ Busca GitHub,  │
│ customizados │   │ customizadas    │   │ npm, PyPI,     │
│              │   │                 │   │ MCP Registry   │
└──────────────┘   └─────────────────┘   └────────────────┘
```

---

## Componentes

### 1. Agent Creator (`agent_creator.py`)

**Responsabilidade**: Criar agentes dinamicamente baseado em necessidades do projeto.

**Funcionalidades**:
- ✅ Detecta necessidades de especialistas (ML, Blockchain, IoT, etc.)
- ✅ Cria configuração de agente com skills e permissões
- ✅ Salva em `.claude/agents/{nome-agente}.json`
- ✅ Registra justificativa de criação

**Especialidades Suportadas**:
- `ml-engineer` - Machine Learning Engineer
- `blockchain-developer` - Blockchain Developer
- `iot-specialist` - IoT Specialist
- `data-scientist` - Data Scientist
- `mobile-developer` - Mobile Developer
- `devops-engineer` - DevOps Engineer
- `security-specialist` - Security Specialist

**Exemplo de Uso**:

```python
from agent_creator import AgentCreator

creator = AgentCreator(base_dir)

# Criar ML Engineer
agent = creator.create_agent(
    name="ml-engineer",
    role="Machine Learning Engineer",
    squad="engenharia",
    skills=["TensorFlow", "Model Training", "MLOps"],
    description="Specialist in ML model development",
    justification="Project requires ML model for price prediction",
    technologies=["TensorFlow", "Keras", "Python"]
)
```

**Output** (`.claude/agents/ml-engineer.json`):
```json
{
  "name": "ml-engineer",
  "role": "Machine Learning Engineer",
  "squad": "engenharia",
  "skills": ["TensorFlow", "Model Training", "MLOps"],
  "description": "Specialist in ML model development",
  "technologies": ["TensorFlow", "Keras", "Python"],
  "auto_generated": true,
  "created_by": "agent-creator",
  "creation_justification": "Project requires ML model for price prediction",
  "created_at": "2024-12-22T23:15:00Z",
  "permissions": {
    "can_read_files": true,
    "can_write_files": true,
    "can_run_commands": true,
    "can_commit_changes": true,
    "allowed_paths": [
      "/app-artefacts/engenharia/",
      "/app-solution/backend/",
      "/app-solution/frontend/"
    ]
  }
}
```

---

### 2. Skill Generator (`skill_generator.py`)

**Responsabilidade**: Gerar skills customizadas baseadas em necessidades do projeto.

**Funcionalidades**:
- ✅ Detecta necessidades de skills (ML training, blockchain deploy, etc.)
- ✅ Gera skills de 3 tipos: `command`, `mcp`, `workflow`
- ✅ Salva em `.claude/skills/auto-generated/{skill-name}.json`
- ✅ Cria templates de comandos, parâmetros e workflows

**Tipos de Skills**:

1. **Command Skill**: Executa comando shell
   ```json
   {
     "type": "command",
     "command": "python3 scripts/ml/train-ml-model.py",
     "parameters": [
       {"name": "dataset", "type": "string", "required": true},
       {"name": "epochs", "type": "integer", "default": 100}
     ]
   }
   ```

2. **MCP Skill**: Expõe tools via MCP
   ```json
   {
     "type": "mcp",
     "mcp_config": {
       "server_name": "database-query",
       "tools": [
         {"name": "query", "description": "Execute SQL queries"}
       ]
     }
   }
   ```

3. **Workflow Skill**: Sequência de steps
   ```json
   {
     "type": "workflow",
     "steps": [
       {"step": "validate", "description": "Validate config"},
       {"step": "plan", "description": "Generate plan"},
       {"step": "apply", "description": "Apply changes"}
     ]
   }
   ```

**Exemplo de Uso**:

```python
from skill_generator import SkillGenerator

generator = SkillGenerator(base_dir)

# Gerar skill de ML training
skill_file = generator.generate_skill(
    skill_name="train-lstm-model",
    context={"current_phase": 3, "complexity": "HIGH"},
    technologies=["TensorFlow", "Keras"],
    skill_type="command"
)
```

---

### 3. External Resource Finder (`external_resource_finder.py`)

**Responsabilidade**: Buscar recursos reutilizáveis em fontes externas confiáveis.

**Fontes Suportadas**:

1. **GitHub** (repositórios confiáveis):
   - `anthropics/claude-sdk`
   - `anthropics/anthropic-sdk-python`
   - `langchain-ai/langchain`
   - `crewAIInc/crewAI`
   - `modelcontextprotocol/servers`

2. **npm** (pacotes TypeScript/JavaScript):
   - `@anthropic-ai/sdk`
   - `@modelcontextprotocol/sdk`
   - `langchain`

3. **PyPI** (pacotes Python):
   - `anthropic`
   - `langchain`
   - `crewai`
   - `mcp`

4. **MCP Server Registry**:
   - `mcp-server-postgres` - PostgreSQL database access
   - `mcp-server-sqlite` - SQLite database access
   - `mcp-server-filesystem` - Filesystem operations
   - `mcp-server-fetch` - Web fetching
   - `mcp-server-puppeteer` - Browser automation

**Exemplo de Uso**:

```python
from external_resource_finder import ExternalResourceFinder

finder = ExternalResourceFinder(base_dir)

# Buscar MCP server para database
db_servers = finder.search_mcp_servers("database")

# Buscar melhor match para ML
best = finder.find_best_match(
    need="machine learning model training",
    technologies=["Python", "TensorFlow"],
    search_all_sources=True
)
```

**Output**:
```python
{
  "name": "mcp-server-postgres",
  "source": "github",
  "repo": "modelcontextprotocol/servers/postgres",
  "description": "PostgreSQL database MCP server",
  "tools": ["query", "schema", "tables"],
  "install": "pip install mcp-server-postgres"
}
```

---

## Integração com Squad Planner

O Squad Planner usa os 3 módulos automaticamente durante a análise:

```python
class SquadPlanner:
    def analyze_and_allocate(self, session_id: str = None):
        # 1. Analisa documentação
        scope = self._analyze_scope(requirements, architecture, stack)

        # 2. Cria recursos especializados (NOVO!)
        if RESOURCE_CREATION_ENABLED:
            self._create_specialized_resources(scope)

        # 3. Aloca squads
        squad_structures = []
        for squad_id in ["management", "produto", "arquitetura", "engenharia", "qa", "deploy"]:
            structure = self._allocate_squad(squad_id, scope, base_config, session_id)
            squad_structures.append(structure)

        return squad_structures

    def _create_specialized_resources(self, scope):
        # 1. Detecta necessidades de agentes
        for specialty in ["ml-engineer", "blockchain-developer", ...]:
            if self.agent_creator.needs_specialist(scope, specialty):
                agent = self.agent_creator.create_agent(...)
                created_agents.append(agent)

        # 2. Gera skills customizadas
        skill_suggestions = self.skill_generator.get_skill_suggestions(scope)
        for suggestion in skill_suggestions:
            skill_file = self.skill_generator.generate_skill(...)
            created_skills.append(skill_file)

        # 3. Busca recursos externos
        mcp_needs = self._detect_mcp_needs(scope)
        for need in mcp_needs:
            best_match = self.resource_finder.find_best_match(...)
            imported_resources.append(best_match)
```

---

## Fluxo Completo

```
┌─────────────────────────────────────────────────────────┐
│ 1. ANÁLISE DA DOCUMENTAÇÃO                              │
│    - Requisitos (requisitos_funcionais_v2.0.md)         │
│    - Arquitetura (arquitetura_supercore_v2.0.md)        │
│    - Stack (stack_supercore_v2.0.md)                    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ 2. DETECÇÃO DE NECESSIDADES                             │
│    Scope identificado:                                   │
│    - Fase: 1                                             │
│    - Tecnologias: [TensorFlow, Solidity, PostgreSQL]    │
│    - Componentes: [ML Model, Smart Contracts, RAG]      │
│    - Complexidade: HIGH                                  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ 3. CRIAÇÃO DE RECURSOS                                   │
│                                                          │
│ 🤖 AGENTES CRIADOS:                                      │
│    ✅ ml-engineer (Machine Learning Engineer)           │
│    ✅ blockchain-developer (Blockchain Developer)       │
│                                                          │
│ 💡 SKILLS CRIADAS:                                       │
│    ✅ train-ml-model (command)                           │
│    ✅ deploy-smart-contract (workflow)                   │
│                                                          │
│ 🌐 RECURSOS EXTERNOS IMPORTADOS:                         │
│    ✅ mcp-server-postgres (GitHub)                       │
│    ✅ mcp-server-fetch (GitHub)                          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ 4. REGISTRO NO SISTEMA                                   │
│    - Agentes salvos em .claude/agents/                   │
│    - Skills salvas em .claude/skills/auto-generated/     │
│    - Recursos externos registrados no journal            │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ 5. ALOCAÇÃO DE SQUADS                                    │
│    Squad Engenharia agora inclui:                        │
│    - backend-lead, golang-developer, python-developer    │
│    - ml-engineer 🆕                                       │
│    - blockchain-developer 🆕                              │
└─────────────────────────────────────────────────────────┘
```

---

## Exemplo Real: Projeto de Trading com ML

### Documentação do Projeto

**requisitos_funcionais_v2.0.md**:
```markdown
RF042: Sistema deve prever preços de ativos usando LSTM neural networks
RF043: Modelo de ML deve ser retreinado diariamente com novos dados
RF044: Precisão do modelo deve ser >= 85%
```

**stack_supercore_v2.0.md**:
```markdown
## Machine Learning
- TensorFlow 2.15
- Keras
- Scikit-learn
- MLflow (experiment tracking)
```

### Output do Squad Planner

```
🔍 Squad Planner: Iniciando análise de documentação...
   📖 Requirements loaded: 45230 chars
   📖 Architecture loaded: 38120 chars
   📖 Stack loaded: 28940 chars

   ✅ Escopo identificado:
      - Fase: 3
      - Tecnologias: PostgreSQL, Redis, Go, Python, TensorFlow, Keras...
      - Complexidade: HIGH

🔍 Analyzing project needs for specialized resources...

   🎯 Detected need for: ml-engineer

🤖 AgentCreator: Creating agent 'ml-engineer'...
   ✅ Agent 'ml-engineer' created successfully
      Role: Machine Learning Engineer
      Squad: engenharia
      Skills: TensorFlow, Model Training, MLOps...

   💡 Creating skill: train-ml-model

💡 SkillGenerator: Creating skill 'train-ml-model'...
   ✅ Skill 'train-ml-model' created at .claude/skills/auto-generated/train-ml-model.json

   🌐 Searching external sources for: database access and querying

🔍 ExternalResourceFinder: Searching MCP servers for 'database'...
   ✅ Found 2 MCP servers for 'database'
      🔹 mcp-server-postgres: PostgreSQL database MCP server
      🔹 mcp-server-sqlite: SQLite database MCP server

📊 Resource Creation Summary:
   🤖 Agents created: 1
   💡 Skills created: 1
   🌐 External resources found: 2

   Created Agents:
      • ml-engineer (Machine Learning Engineer)

   Created Skills:
      • train-ml-model (command)

   External Resources:
      • mcp-server-postgres from github
```

---

## Benefícios

### ✅ Zero Configuração Manual
- Sistema detecta necessidades automaticamente
- Nenhuma edição manual de configs
- Adaptação instantânea a novos tipos de projeto

### ✅ Enriquecimento Contínuo
- `.claude/` cresce a cada projeto
- Biblioteca de agentes e skills reutilizáveis
- Histórico de criações com justificativas

### ✅ Fontes Confiáveis
- Busca APENAS em repositórios verificados
- MCP servers oficiais (Model Context Protocol)
- Pacotes npm/PyPI com boa reputação

### ✅ Rastreabilidade Total
- Cada agente/skill tem `created_by` e `creation_justification`
- Journal registra todas as criações
- Possível auditar e remover recursos não utilizados

### ✅ Fallback Seguro
- Se criação falhar → usa configuração estática
- Se busca externa falhar → cria localmente
- Sistema NUNCA bloqueia execução

---

## Estrutura de Arquivos

```
app-generation/execution-portal/backend/
├── agent_creator.py                    # Cria agentes dinamicamente
├── skill_generator.py                  # Gera skills customizadas
├── external_resource_finder.py         # Busca recursos externos
├── squad_planner.py                    # Orquestrador principal (MODIFICADO)
└── RESOURCE_AUTO_CREATION.md          # Esta documentação

supercore/
└── .claude/
    ├── agents/
    │   ├── ml-engineer.json           # Agente auto-gerado
    │   ├── blockchain-developer.json  # Agente auto-gerado
    │   └── ...
    └── skills/
        └── auto-generated/
            ├── train-ml-model.json    # Skill auto-gerada
            ├── deploy-smart-contract.json
            └── ...
```

---

## Próximos Passos

### 🚀 Fase 1 (Implementado)
- ✅ Agent Creator
- ✅ Skill Generator
- ✅ External Resource Finder
- ✅ Integração com Squad Planner

### 🔮 Fase 2 (Futuro)
- [ ] API real para GitHub/npm/PyPI (atualmente mock)
- [ ] Auto-instalação de MCPs descobertos
- [ ] Versionamento de agentes/skills
- [ ] UI no portal mostrando recursos auto-gerados com badge 🤖✨
- [ ] Remoção automática de recursos não utilizados (cleanup)
- [ ] Analytics: quais agentes/skills são mais criados

---

## Como Testar

### Teste 1: Criar ML Engineer

```bash
cd app-generation/execution-portal/backend/
python3 agent_creator.py
```

**Output esperado**:
```
✅ ML Engineer needed!
🤖 AgentCreator: Creating agent 'ml-engineer'...
   ✅ Agent 'ml-engineer' created successfully
```

### Teste 2: Gerar Skill de ML

```bash
python3 skill_generator.py
```

**Output esperado**:
```
📋 Skill Suggestions: 1 found
   🔹 train-ml-model
💡 SkillGenerator: Creating skill 'train-ml-model'...
   ✅ Skill 'train-ml-model' created
```

### Teste 3: Buscar MCP Servers

```bash
python3 external_resource_finder.py
```

**Output esperado**:
```
🔍 ExternalResourceFinder: Searching MCP servers for 'database'...
   ✅ Found 2 MCP servers for 'database'
      🔹 mcp-server-postgres
      🔹 mcp-server-sqlite
```

### Teste 4: Squad Planner Completo

```bash
python3 squad_planner.py
```

**Output esperado**: Análise completa + criação de recursos + alocação de squads

---

**Documentado por**: Claude Sonnet 4.5
**Versão**: 1.0.0
**Data**: 2024-12-22
**Status**: ✅ **IMPLEMENTADO** 🍒🎂
