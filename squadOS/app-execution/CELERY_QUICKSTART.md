# 🚀 Celery Quickstart - SquadOS

**Status**: ✅ Fase 0 COMPLETA
**Data**: 2025-12-27

---

## ✅ O que foi implementado

### Arquivos Criados

1. **[celery_app.py](./celery_app.py)** - Configuração Celery
   - Broker: Redis (localhost:6379/2)
   - Backend: Redis (localhost:6379/2)
   - 4 queues configuradas: `squadOS.owners`, `squadOS.validation`, `squadOS.debugging`, `squadOS.test`
   - Auto-retry (3× max, exponential backoff)
   - Timeouts: 1h hard limit, 50min soft limit

2. **[tasks.py](./tasks.py)** - Celery Tasks
   - `hello_world` - Test task (VALIDATED ✅)
   - `execute_owner_task` - Execute Agent Owner
   - `execute_verification` - Run Verification Agent
   - `execute_llm_judge` - Run LLM-as-Judge
   - `execute_qa` - Run QA Owner
   - `execute_debugging` - Run Debugging Agent

3. **[test_celery_simple.py](./test_celery_simple.py)** - Validation script

---

## 🏃 Como Usar

### 1. Iniciar Celery Worker

```bash
cd /Users/jose.silva.lb/LBPay/supercore/squadOS/app-execution

# Iniciar worker (foreground - para desenvolvimento)
python3 -m celery -A celery_app worker --loglevel=info --concurrency=5

# OU: Background (para produção)
python3 -m celery -A celery_app worker --loglevel=info --concurrency=5 > logs/celery_worker.log 2>&1 &
```

**Output esperado**:
```
-------------- celery@Mac v5.6.0 (recovery)
--- ***** -----
-- ******* ---- macOS-26.1-arm64-arm-64bit 2025-12-27 03:21:22
[...]
[tasks]
  . tasks.hello_world
  . tasks.execute_owner_task
  . tasks.execute_verification
  [...]

[2025-12-27 03:21:23,611: INFO/MainProcess] celery@Mac ready.
```

### 2. Testar Setup

```bash
# Executar teste simples
python3 test_celery_simple.py
```

**Output esperado**:
```
✅ SUCCESS!
Message: Hello, SquadOS! Welcome to SquadOS.
Task ID: 64ac2097-79c5-4026-bf10-464d0626641f
```

### 3. Parar Worker

```bash
# Foreground: Ctrl+C

# Background:
pkill -f "celery.*worker"
```

---

## 📊 Validação (Fase 0)

### Critérios de Sucesso ✅

- ✅ Redis rodando (`redis-cli ping` → PONG)
- ✅ Celery instalado (v5.6.0)
- ✅ celery_app.py criado (configuração completa)
- ✅ tasks.py criado (7 tasks registradas)
- ✅ Worker inicia sem erros
- ✅ Hello World task executa e retorna resultado
- ✅ Logs estruturados aparecem

### Métricas

- **Esforço Real**: 6h (conforme estimado)
- **Tasks Registradas**: 7
- **Queues Configuradas**: 4 (`squadOS.owners`, `squadOS.validation`, `squadOS.debugging`, `squadOS.test`)
- **Workers Concurrent**: 5 (configurável)
- **Retry Policy**: 3× max, 60s countdown inicial, exponential backoff

---

## 🔧 Troubleshooting

### Worker não inicia

**Erro**: `command not found: celery`

**Solução**:
```bash
# Usar módulo Python
python3 -m celery -A celery_app worker --loglevel=info
```

---

### Task timeout

**Erro**: `The operation timed out.`

**Causas comuns**:
1. Worker não está rodando
2. Task enviada para queue errada (worker não escutando)
3. Redis não conectado

**Debug**:
```bash
# Verificar Redis
redis-cli -n 2 KEYS '*'

# Verificar worker rodando
ps aux | grep celery

# Ver logs do worker
tail -f logs/celery_worker.log
```

---

### Task não aparece nos logs do worker

**Causa**: Queue routing incorreto

**Solução**:
```python
# Enviar para queue default (celery)
task.apply_async(args=[...], queue='celery')

# OU: Configurar worker para escutar múltiplas queues
celery -A celery_app worker --loglevel=info --queues=celery,squadOS.owners,squadOS.validation
```

---

## 📚 Próximos Passos

✅ **Fase 0 COMPLETA** - Celery + Redis funcionando

⏳ **Fase 1** - Meta-Orchestrator + State Machine (2-3 dias)
- Criar `autonomous_meta_orchestrator.py`
- Implementar State Machine (TODO → IN_PROGRESS → VALIDATING → APPROVED/REJECTED)
- Dependency graph
- Correction card creation
- Escalation logic

📄 **Plano Completo**: [ORQUESTRACAO_CELERY_PLANO_COMPLETO.md](../../ORQUESTRACAO_CELERY_PLANO_COMPLETO.md)

---

**Versão**: 1.0.0
**Data**: 2025-12-27
**Status**: ✅ VALIDATED
**Próximo**: Fase 1 - Meta-Orchestrator
