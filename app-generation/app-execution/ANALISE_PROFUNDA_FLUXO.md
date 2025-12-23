# 🔍 Análise Profunda do Fluxo de Execução - SuperCore v2.0

**Data**: 2025-12-22
**Status**: DIAGNÓSTICO COMPLETO

---

## 🚨 PROBLEMAS IDENTIFICADOS

### 1. **Schema Mismatch entre Orchestrators**

Temos **DOIS** orchestrators com schemas diferentes:

#### `autonomous_meta_orchestrator.py` (usado atualmente):
```json
{
  "version": "1.0",
  "project_name": "SuperCore v2.0",
  "phase": 1,
  "cards": [],
  "metadata": {}
}
```

#### `claude-squad-orchestrator.py` (wrapper que inicia o autonomous):
```json
{
  "version": "2.0.0",
  "project": "SuperCore v2.0",
  "last_updated": "",
  "current_sprint": 1,
  "cards": [],
  "metadata": {}
}
```

**❌ CONFLITO**: Campos diferentes (`project_name` vs `project`, `phase` vs `current_sprint`)

---

## 📂 ESTRUTURA ATUAL DOS ARQUIVOS

### Scripts de Orquestração:
```
scripts/squad-orchestrator/
├── claude-squad-orchestrator.py        ← WRAPPER (inicia autonomous)
├── autonomous_meta_orchestrator.py     ← MOTOR (cria cards)
├── agent_executor.py                   ← EXECUTOR (roda agents via `claude agent run`)
│
├── state/
│   ├── backlog_master.json            ← ESTADO (cards em JSON)
│   └── project_journal.json           ← LOG (eventos)
│
└── monitoring/
    ├── backend/server.py              ← API (FastAPI)
    ├── frontend/                      ← UI (React)
    └── data/
        ├── monitoring.db              ← PORTAL DB (SQLite)
        └── bootstrap_status.json      ← STATUS
```

### Artefatos de Output:
```
artefactos_implementacao/
└── produto/
    ├── backlog/     ← Cards em JSON (VAZIO)
    ├── cards/       ← Cards em Markdown (VAZIO)
    ├── user-stories/ ← User stories (VAZIO)
    └── ux-designs/  ← Wireframes (VAZIO)
```

---

## 🔄 FLUXO ESPERADO (Como DEVERIA Funcionar)

### Passo 1: User clica "Iniciar Projeto" no Portal

**Portal Frontend** (`/api/bootstrap/start`):
```javascript
POST /api/bootstrap/start
Body: { project_name: "SuperCore v2.0", config_file: "meta-squad-config.json" }
```

### Passo 2: Backend inicia processo

**Backend** (`server.py:start_bootstrap()`):
```python
cmd = [
    "python3",
    "claude-squad-orchestrator.py",
    "--config", "meta-squad-config.json",
    "--phase", "1"
]
subprocess.Popen(cmd, ...)  # Roda em background
```

### Passo 3: Wrapper inicia Autonomous Orchestrator

**claude-squad-orchestrator.py**:
```python
# 1. Cria/carrega backlog_master.json
# 2. Spawn autonomous_meta_orchestrator.py
subprocess.run([
    "python3",
    "autonomous_meta_orchestrator.py",
    session_id
])
```

### Passo 4: Autonomous Orchestrator CRIA CARDS

**autonomous_meta_orchestrator.py**:
```python
async def run():
    # 1. Ler documentação
    docs = await self._read_documentation()

    # 2. Criar cards (Squad Produto)
    cards = await self._create_product_cards(docs)

    # 3. Salvar cards
    self._save_backlog()  # → backlog_master.json
    self._sync_to_portal_db()  # → monitoring.db
    self._save_artifacts()  # → artefactos_implementacao/produto/

    # 4. Executar cards
    await self._execute_cards()
```

### Passo 5: Agent Executor RODA AGENTS

**agent_executor.py**:
```python
# Para cada card TODO:
cmd = ["claude", "agent", "run", "product-owner.md"]
process.communicate(input=card_prompt)
# Agent lê docs, cria artefatos, atualiza card status
```

### Passo 6: Portal VISUALIZA em Tempo Real

**Portal API** (`/api/cards`, `/api/status`):
```python
# Lê do SQLite (atualizado por sync)
SELECT * FROM cards WHERE session_id = ?
```

---

## ❌ O QUE ESTÁ QUEBRANDO

### Erro 1: Schema incompatível
- `claude-squad-orchestrator.py` espera campos que `autonomous` não gera
- **Solução**: Usar um schema único

### Erro 2: Autonomous não está rodando
- Wrapper crashava antes de chamar `autonomous`
- **Solução**: Corrigir schema do `backlog_master.json`

### Erro 3: Portal não sincroniza
- `_sync_to_portal_db()` só roda quando backlog é salvo
- Se autonomous crashar, nada é sincronizado
- **Solução**: Garantir que autonomous roda até criar cards

### Erro 4: Artefatos não são criados
- `autonomous_meta_orchestrator.py` não tem método `_save_artifacts()`
- **Problema**: Cards só vão para SQLite, não para pastas de artefatos
- **Solução**: Implementar salvamento de arquivos físicos

---

## 🔧 CORREÇÕES NECESSÁRIAS

### Correção 1: Unificar Schema

**Opção A**: Fazer `claude-squad-orchestrator.py` aceitar schema do `autonomous`
**Opção B**: Fazer `autonomous` gerar schema do `claude-squad`

**Decisão**: Opção A (menos mudanças)

### Correção 2: Implementar `_save_artifacts()` no Autonomous

```python
def _save_artifacts(self):
    """Save cards as JSON and Markdown files"""
    artifacts_dir = PROJECT_ROOT / "artefactos_implementacao" / "produto"

    # Save backlog JSON
    backlog_dir = artifacts_dir / "backlog"
    backlog_dir.mkdir(exist_ok=True, parents=True)
    with open(backlog_dir / "backlog.json", 'w') as f:
        json.dump(self.backlog, f, indent=2)

    # Save individual card files
    cards_dir = artifacts_dir / "cards"
    cards_dir.mkdir(exist_ok=True, parents=True)
    for card in self.backlog["cards"]:
        card_file = cards_dir / f"{card['card_id']}.md"
        with open(card_file, 'w') as f:
            f.write(f"# {card['title']}\n\n")
            f.write(f"**ID**: {card['card_id']}\n")
            f.write(f"**Squad**: {card['squad']}\n")
            f.write(f"**Status**: {card['status']}\n\n")
            f.write(f"## Description\n{card['description']}\n\n")
            f.write(f"## Acceptance Criteria\n")
            for criteria in card.get('acceptance_criteria', []):
                f.write(f"- {criteria}\n")
```

### Correção 3: Adicionar Logging Detalhado

```python
logger.info(f"✅ Card {card_id} created")
logger.info(f"✅ Synced to portal DB: {len(cards)} cards")
logger.info(f"✅ Saved artifacts to {artifacts_dir}")
```

### Correção 4: Verificar Documentação Base Existe

```python
def _validate_environment(self):
    """Validate all required files exist before starting"""
    required_docs = [
        DOCS_DIR / "requisitos_funcionais_v2.0.md",
        DOCS_DIR / "arquitetura_supercore_v2.0.md",
        DOCS_DIR / "stack_supercore_v2.0.md"
    ]

    for doc in required_docs:
        if not doc.exists():
            raise FileNotFoundError(f"Missing required doc: {doc}")

    logger.info(f"✅ Environment validated: {len(required_docs)} docs found")
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Corrigir schema** `backlog_master.json` → FEITO
2. ⏳ **Testar startup** do orchestrator
3. ⏳ **Implementar** `_save_artifacts()`
4. ⏳ **Adicionar** logging detalhado
5. ⏳ **Validar** que portal recebe updates

---

## 🧪 TESTE MANUAL

```bash
# 1. Reset completo
rm -f scripts/squad-orchestrator/state/*
rm -f scripts/squad-orchestrator/monitoring/data/monitoring.db

# 2. Criar backlog correto
cat > scripts/squad-orchestrator/state/backlog_master.json <<EOF
{
  "version": "2.0.0",
  "project": "SuperCore v2.0",
  "last_updated": "",
  "current_sprint": 1,
  "cards": [],
  "metadata": {...}
}
EOF

# 3. Rodar manualmente
cd scripts/squad-orchestrator
python3 autonomous_meta_orchestrator.py session_test_123

# 4. Verificar outputs
ls -la artefactos_implementacao/produto/cards/
sqlite3 monitoring/data/monitoring.db "SELECT COUNT(*) FROM cards;"
```

---

## 📊 MÉTRICAS DE SUCESSO

- [ ] Orchestrator inicia sem crash
- [ ] Cards são criados em `backlog_master.json`
- [ ] Cards são sincronizados para SQLite
- [ ] Cards aparecem em `/api/cards`
- [ ] Portal mostra progresso >0%
- [ ] Arquivos .md criados em `artefactos_implementacao/`

---

**Conclusão**: O problema NÃO é o portal. O problema é que o orchestrator nunca chegou a criar cards porque sempre crashou no startup por schema incompatível.
