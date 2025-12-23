#!/bin/bash
# Script de Migração para Nova Estrutura app-generation/
# Data: 2024-12-22
# Objetivo: Reorganizar projeto com separação clara entre geração e solução

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  SuperCore v2.0 - Migração para Nova Estrutura                ║"
echo "║  app-generation/ + app-solution/                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 1. CRIAR ESTRUTURA BASE
echo "📁 Step 1: Criando estrutura base app-generation/..."

mkdir -p app-generation/documentation-base
mkdir -p app-generation/app-execution
mkdir -p app-generation/app-artefacts/{produto,arquitetura,engenharia/{frontend,backend},qa,deploy}
mkdir -p app-generation/execution-portal/{frontend,backend}
mkdir -p app-solution/{frontend,backend,database,infrastructure}

echo "   ✅ Estrutura base criada"

# 2. MOVER DOCUMENTAÇÃO BASE
echo ""
echo "📚 Step 2: Movendo documentação base..."

if [ -d "Supercore_v2.0/DOCUMENTACAO_BASE" ]; then
    cp -r Supercore_v2.0/DOCUMENTACAO_BASE/* app-generation/documentation-base/
    echo "   ✅ Documentação copiada para app-generation/documentation-base/"
else
    echo "   ⚠️  DOCUMENTACAO_BASE não encontrada"
fi

# 3. MOVER SQUAD ORCHESTRATOR
echo ""
echo "⚙️  Step 3: Movendo squad-orchestrator..."

if [ -d "scripts/squad-orchestrator" ]; then
    # Parar processos antes de mover
    pkill -9 -f "autonomous_meta_orchestrator" 2>/dev/null || true
    pkill -9 -f "celery.*worker" 2>/dev/null || true
    sleep 2

    cp -r scripts/squad-orchestrator/* app-generation/app-execution/
    echo "   ✅ Orchestrator copiado para app-generation/app-execution/"
else
    echo "   ⚠️  squad-orchestrator não encontrado"
fi

# 4. MOVER EXECUTION PORTAL
echo ""
echo "🎛️  Step 4: Movendo execution-portal..."

if [ -d "scripts/squad-orchestrator/monitoring" ]; then
    # Frontend
    if [ -d "scripts/squad-orchestrator/monitoring/frontend" ]; then
        cp -r scripts/squad-orchestrator/monitoring/frontend/* app-generation/execution-portal/frontend/
        echo "   ✅ Portal frontend copiado"
    fi

    # Backend
    if [ -d "scripts/squad-orchestrator/monitoring/backend" ]; then
        cp -r scripts/squad-orchestrator/monitoring/backend/* app-generation/execution-portal/backend/
        echo "   ✅ Portal backend copiado"
    fi

    # Data (SQLite)
    if [ -d "scripts/squad-orchestrator/monitoring/data" ]; then
        mkdir -p app-generation/execution-portal/backend/data
        cp scripts/squad-orchestrator/monitoring/data/monitoring.db app-generation/execution-portal/backend/data/ 2>/dev/null || true
        echo "   ✅ Database copiado"
    fi
fi

# 5. MOVER ARTEFATOS EXISTENTES
echo ""
echo "📦 Step 5: Movendo artefatos existentes..."

if [ -d "artefactos_implementacao" ]; then
    # Copiar conteúdo preservando estrutura
    if [ "$(ls -A artefactos_implementacao 2>/dev/null)" ]; then
        cp -r artefactos_implementacao/* app-generation/app-artefacts/ 2>/dev/null || true
        echo "   ✅ Artefatos copiados para app-generation/app-artefacts/"
    else
        echo "   ℹ️  Nenhum artefato existente para mover"
    fi
fi

# 6. CRIAR .gitkeep em pastas vazias
echo ""
echo "📌 Step 6: Criando .gitkeep em pastas vazias..."

find app-generation -type d -empty -exec touch {}/.gitkeep \;
find app-solution -type d -empty -exec touch {}/.gitkeep \;

echo "   ✅ .gitkeep criados"

# 7. CRIAR README.md explicativo
echo ""
echo "📝 Step 7: Criando documentação da nova estrutura..."

cat > app-generation/README.md <<'EOF'
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
EOF

cat > app-solution/README.md <<'EOF'
# 💡 app-solution/

**Código GERADO** pela fábrica (app-generation/)

## Estrutura

```
app-solution/
├── frontend/                  # App React GERADO
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                   # APIs Go/Python GERADAS
│   ├── api/
│   ├── services/
│   └── main.go
│
├── database/                  # Migrations e schemas GERADOS
│   └── migrations/
│
└── infrastructure/            # Terraform GERADO
    └── terraform/
```

## ⚠️ IMPORTANTE

**Esta pasta é COMPLETAMENTE DELETADA ao clicar "Iniciar Projeto"**

- Não edite código aqui manualmente
- Todo código é gerado automaticamente pelas squads
- Use Git para versionar se necessário
- Backup manual antes de "Iniciar Projeto"

## 🔄 Ciclo de Vida

1. **Geração**: Squads criam código baseado em `app-artefacts/`
2. **Desenvolvimento**: Código aqui pode ser testado/executado
3. **Reset**: "Iniciar Projeto" → **TUDO DELETADO**
4. **Re-geração**: Nova versão gerada do zero
EOF

echo "   ✅ READMEs criados"

# 8. SUMÁRIO
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ MIGRAÇÃO COMPLETA!                                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Nova estrutura criada:"
echo "   ✅ app-generation/documentation-base/"
echo "   ✅ app-generation/app-execution/"
echo "   ✅ app-generation/app-artefacts/"
echo "   ✅ app-generation/execution-portal/"
echo "   ✅ app-solution/"
echo ""
echo "📝 Próximos passos MANUAIS necessários:"
echo "   1. Atualizar paths em app-generation/app-execution/*.py"
echo "   2. Atualizar paths em app-generation/execution-portal/backend/server.py"
echo "   3. Atualizar API_BASE_URL em execution-portal/frontend/src/"
echo "   4. Atualizar CLAUDE.md com nova estrutura"
echo "   5. Testar reset-completo.sh"
echo "   6. Testar início de projeto"
echo ""
echo "⚠️  IMPORTANTE: Estrutura antiga preservada (não deletada automaticamente)"
echo "   Após validar nova estrutura, você pode deletar manualmente:"
echo "   - scripts/squad-orchestrator/ (antigo)"
echo "   - artefactos_implementacao/ (antigo)"
echo "   - Supercore_v2.0/DOCUMENTACAO_BASE/ (manter como backup)"
echo ""
