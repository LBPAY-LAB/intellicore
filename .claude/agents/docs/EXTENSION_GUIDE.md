# Agent Extension Guide

Este guia documenta como estender o ecossistema de agentes do intelliCore, baseado na análise do repositório [wshobson/agents](https://github.com/wshobson/agents).

## Status Atual (2025-12-04)

### Estatísticas do Ecossistema Local

| Componente | Quantidade |
|------------|------------|
| **Plugins** | 66 |
| **Agentes** | 291 |
| **Skills** | 58 |
| **Commands** | 70 |

### Comparação com wshobson/agents

| Aspecto | wshobson/agents | intelliCore |
|---------|-----------------|-------------|
| Plugins | 66 | 66 |
| Agentes Documentados | 86 | 86 |
| Skills | 57 | 58 |
| Arquitetura | Idêntica | Idêntica |

**Conclusão**: Nossa base já está **100% sincronizada** com o repositório de referência.

---

## Padrões de Extensão

### 1. Estrutura de Plugin

Cada plugin segue esta estrutura:

```
plugins/{plugin-name}/
├── agents/           # Agentes especializados (opcional)
│   └── {agent-name}.md
├── commands/         # Ferramentas e workflows (opcional)
│   └── {command-name}.md
└── skills/           # Pacotes de conhecimento modular (opcional)
    └── {skill-name}/
        └── SKILL.md
```

### 2. Formato de Agente

```markdown
---
name: agent-name
model: sonnet|opus|haiku
description: Descrição concisa do agente. Use PROACTIVELY para [casos de uso].
---

# Agent Name - Expert Title

You are an elite [domain] specialist focused on [focus area].

## Core Expertise

### [Category 1]
- Point 1
- Point 2

### [Category 2]
...

## Coding Standards

### Style Guidelines
...

### Mandatory Practices
...

## Workflow
1. Step 1
2. Step 2
...

## Anti-Patterns to Avoid
- Don't do X
- Don't do Y
```

### 3. Formato de Skill

```markdown
---
name: skill-name
description: O que a skill faz. Use when [trigger de ativação].
---

# Skill Content

## Overview
...

## Key Patterns
...

## Examples
...

## References
...
```

### 4. Formato de Command

```markdown
---
name: command-name
description: O que o comando faz
arguments:
  - name: arg1
    description: Descrição do argumento
    required: true
---

# Command Instructions

## Purpose
...

## Workflow
...

## Output
...
```

---

## Guia para Adicionar Novos Componentes

### Adicionar um Novo Agente

1. **Identifique o plugin correto** ou crie um novo:
   ```bash
   mkdir -p .claude/agents/plugins/{plugin-name}/agents
   ```

2. **Crie o arquivo do agente**:
   ```bash
   touch .claude/agents/plugins/{plugin-name}/agents/{agent-name}.md
   ```

3. **Siga o formato**:
   - Frontmatter YAML com `name`, `model`, `description`
   - Descrição deve incluir "Use PROACTIVELY" ou "Use when"
   - Conteúdo estruturado com expertise, padrões, workflow

4. **Atualize a documentação**:
   - `docs/agents.md` - Adicione à tabela apropriada
   - `docs/plugins.md` - Atualize contagens se necessário

### Adicionar uma Nova Skill

1. **Crie a estrutura**:
   ```bash
   mkdir -p .claude/agents/plugins/{plugin-name}/skills/{skill-name}
   touch .claude/agents/plugins/{plugin-name}/skills/{skill-name}/SKILL.md
   ```

2. **Siga a especificação**:
   - Frontmatter com `name` (hyphen-case) e `description` (< 1024 chars)
   - Descrição deve incluir "Use when [trigger]"
   - Conteúdo com progressive disclosure

3. **Atualize `docs/agent-skills.md`**

### Adicionar um Novo Plugin

1. **Crie a estrutura base**:
   ```bash
   mkdir -p .claude/agents/plugins/{plugin-name}/{agents,commands,skills}
   ```

2. **Adicione pelo menos um agente OU command**

3. **Atualize a documentação**:
   - `docs/plugins.md` - Nova entrada na categoria apropriada
   - `docs/architecture.md` - Atualize contagens

---

## Categorias de Modelo

### Haiku (Fast Execution)
Use para tarefas:
- Geração de código a partir de specs definidas
- Criação de testes seguindo padrões estabelecidos
- Documentação com templates claros
- Operações de infraestrutura
- Otimização de queries SQL
- Respostas de suporte
- Tarefas de SEO

### Sonnet (Complex Reasoning)
Use para tarefas:
- Design de arquitetura
- Decisões de seleção de tecnologia
- Auditorias de segurança
- Revisão de código arquitetural
- Pipelines de AI/ML complexos
- Expertise específica de linguagem
- Orquestração multi-agente
- Questões legais/HR críticas

### Opus (Advanced Reasoning)
Use para tarefas:
- Arquitetura de sistemas críticos
- Decisões com impacto business significativo
- Análises de segurança profundas
- Design de sistemas distribuídos complexos

---

## Padrões de Orquestração

### Pattern 1: Planning → Execution
```
Sonnet: backend-architect (design)
  ↓
Haiku: code generation (implement)
  ↓
Haiku: test-automator (test)
  ↓
Sonnet: code-reviewer (review)
```

### Pattern 2: Reasoning → Action (Incident)
```
Sonnet: incident-responder (diagnose)
  ↓
Haiku: devops-troubleshooter (fix)
  ↓
Haiku: deployment-engineer (deploy)
```

### Pattern 3: Complex → Simple (Database)
```
Sonnet: database-architect (design)
  ↓
Haiku: sql-pro (generate migrations)
  ↓
Haiku: database-admin (execute)
  ↓
Haiku: database-optimizer (tune)
```

---

## Melhores Práticas

### Nomenclatura
- **Plugins**: hyphen-case, descritivo (e.g., `julia-development`)
- **Agentes**: hyphen-case com sufixo de expertise (e.g., `julia-pro`)
- **Skills**: hyphen-case descritivo (e.g., `async-python-patterns`)
- **Commands**: hyphen-case com verbo (e.g., `python-scaffold`)

### Conteúdo
- Descrições concisas (5-10 palavras para plugins)
- Triggers claros ("Use when", "Use PROACTIVELY")
- Exemplos práticos em cada skill
- Anti-patterns documentados em cada agente

### Token Efficiency
- Progressive disclosure em skills (3 níveis)
- Plugins focados (média de 3.4 componentes)
- Carregar apenas o necessário

---

## Recursos

### Especificações Oficiais
- [Anthropic Agent Skills Specification](https://github.com/anthropics/skills/blob/main/agent_skills_spec.md)
- [Claude Code Skills Documentation](https://docs.claude.com/en/docs/claude-code/skills)

### Repositório de Referência
- [wshobson/agents](https://github.com/wshobson/agents)

### Documentação Local
- [agents.md](./agents.md) - Catálogo de agentes
- [agent-skills.md](./agent-skills.md) - Skills disponíveis
- [plugins.md](./plugins.md) - Plugins disponíveis
- [architecture.md](./architecture.md) - Princípios de design
- [usage.md](./usage.md) - Guia de uso

---

## Changelog

### 2025-12-04
- Sincronização completa com wshobson/agents
- Adicionado plugin `julia-development` com agente `julia-pro`
- Criado este guia de extensão
- Atualizadas documentações (agents.md, plugins.md)
