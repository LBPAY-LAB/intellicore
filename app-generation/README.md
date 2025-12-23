# 🏭 app-generation/

**Fábrica de Aplicações** - Onde apps são GERADOS pela IA

## Estrutura

```
app-generation/
├── documentation-base/        # 📚 Documentação de entrada (READ-ONLY)
│   ├── requisitos_funcionais_v2.0.md
│   ├── arquitetura_supercore_v2.0.md
│   └── stack_supercore_v2.0.md
│
├── app-execution/             # ⚙️ Motor de execução (Orchestrator + Celery)
│   ├── autonomous_meta_orchestrator.py
│   ├── tasks.py
│   ├── celery_app.py
│   ├── state/                 # Estado do orquestrador
│   └── logs/                  # Logs de execução
│
├── app-artefacts/             # 📦 Artefatos GERADOS pelas squads
│   ├── produto/               # Cards, user stories, backlog
│   ├── arquitetura/           # Designs, ADRs, diagramas
│   ├── engenharia/
│   │   ├── frontend/          # Especificações frontend
│   │   └── backend/           # Especificações backend
│   ├── qa/                    # Planos de teste, reports
│   └── deploy/                # Terraform, CI/CD configs
│
└── execution-portal/          # 🎛️ Portal de monitoramento
    ├── frontend/              # React/Vite UI
    └── backend/               # FastAPI + SQLite
        └── data/monitoring.db
```

## 🔄 Fluxo de Geração

1. **Input**: `documentation-base/` (requisitos, arquitetura, stack)
2. **Processamento**: `app-execution/` (orchestrator executa squads)
3. **Outputs Intermediários**: `app-artefacts/` (cards, specs, designs)
4. **Output Final**: `../app-solution/` (código implementado)
5. **Monitoramento**: `execution-portal/` (acompanhar progresso)

## 🧹 Cleanup

Ao clicar "Iniciar Projeto":
- ✅ `app-artefacts/` → **DELETADO** (artefatos antigos)
- ✅ `app-solution/` → **DELETADO** (código gerado antigo)
- ✅ `execution-portal/backend/data/monitoring.db` → **LIMPO** (eventos, cards, sessions)
- ✅ `app-execution/state/` → **RESETADO** (backlog, status)

**NÃO são deletados**:
- ❌ `documentation-base/` (READ-ONLY)
- ❌ `app-execution/` (código do orquestrador)
- ❌ `execution-portal/` (código do portal)
