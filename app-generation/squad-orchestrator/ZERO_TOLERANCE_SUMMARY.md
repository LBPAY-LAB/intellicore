# Zero-Tolerance Policy - Summary

## 🎯 Objetivo

Garantir que **TODAS as implementações sejam production-ready, completas e robustas** desde o primeiro commit.

**ZERO tolerância** para mocks, placeholders ou implementações simplificadas.

## 🚫 Política de ZERO Tolerância

### O Que Está PROIBIDO

| Prática | Exemplo | Consequência |
|---------|---------|--------------|
| **Mock Implementations** | `return { id: 1, name: "Mock" }` | ❌ AUTO-REJECT |
| **TODO Comments** | `// TODO: implement this` | ❌ AUTO-REJECT |
| **Hardcoded Config** | `const API_KEY = "test-123"` | ❌ AUTO-REJECT |
| **Simplified Logic** | `return username == "admin"` | ❌ AUTO-REJECT |
| **Missing Errors** | No try-catch blocks | ❌ AUTO-REJECT |
| **Incomplete Tests** | Coverage <80% | ❌ AUTO-REJECT |

### O Que É OBRIGATÓRIO

| Requisito | Como Validar | Critério |
|-----------|--------------|----------|
| **Real DB Integration** | Connection working | ✅ PASS |
| **Error Handling** | All functions have try-catch | ✅ PASS |
| **Input Validation** | All user inputs validated | ✅ PASS |
| **Test Coverage** | `pytest --cov` or `jest --coverage` | ✅ ≥80% |
| **Security Scan** | `npm audit` / `pip-audit` / `trivy` | ✅ 0 HIGH/CRITICAL |
| **Documentation** | API docs + docstrings | ✅ COMPLETE |

## 📋 Definition of Done (DoD)

Um card **SÓ** está DONE quando **TODOS** estes critérios são atendidos:

### ✅ Checklist Completo

```yaml
Functional:
  - [ ] ALL acceptance criteria met (no exceptions)
  - [ ] NO mocks or placeholder implementations
  - [ ] Real database integration working
  - [ ] Real API integrations working
  - [ ] ALL edge cases handled
  - [ ] NO hardcoded values

Quality:
  - [ ] Test coverage ≥80%
  - [ ] All tests passing (unit + integration + e2e)
  - [ ] No skipped tests
  - [ ] Security scan clean (0 HIGH/CRITICAL)
  - [ ] No linter warnings
  - [ ] Code review approved

Security:
  - [ ] Input validation on all user inputs
  - [ ] Output sanitization implemented
  - [ ] Authentication working
  - [ ] Authorization enforced
  - [ ] No SQL injection vulnerabilities
  - [ ] No XSS vulnerabilities
  - [ ] Rate limiting configured
  - [ ] Audit logging implemented

Documentation:
  - [ ] API documentation complete (OpenAPI/Swagger)
  - [ ] Function docstrings present
  - [ ] README updated (if needed)
  - [ ] Environment variables documented
  - [ ] Deployment instructions clear

Observability:
  - [ ] Structured logging implemented
  - [ ] Metrics exported (Prometheus format)
  - [ ] Distributed tracing configured
  - [ ] Health check endpoint working
  - [ ] Readiness/liveness probes working

Deployment:
  - [ ] Database migrations created (if schema changes)
  - [ ] Deployment tested in dev
  - [ ] Deployment tested in QA
  - [ ] Rollback plan documented
```

## 🚨 Enforcement - Como Funciona

### 1. Development Agents (Tech Lead, Frontend/Backend Leads)

**Constraints no System Prompt:**
```
CRITICAL CONSTRAINTS - ZERO TOLERANCE:

1. NEVER use mock data or placeholder implementations
2. NEVER leave TODO/FIXME comments
3. NEVER use hardcoded credentials
4. NEVER skip error handling
5. NEVER skip tests

If you cannot implement something completely:
- ❌ DO NOT submit incomplete work
- ✅ ESCALATE to Tech Lead immediately
```

### 2. QA Lead

**Auto-Reject Rules:**
```bash
# Automatic checks run on every card submission:

1. Check for mocks:
   grep -r "mock|fake|stub" src/ --exclude-dir=tests
   → If found: AUTO-REJECT

2. Check for TODOs:
   grep -r "TODO|FIXME|HACK" src/ --exclude-dir=tests
   → If found: AUTO-REJECT

3. Check for secrets:
   trufflehog filesystem src/
   → If found: AUTO-REJECT

4. Check test coverage:
   pytest --cov=src --cov-report=term-missing
   → If <80%: AUTO-REJECT

5. Security scan:
   npm audit / pip-audit / gosec
   → If HIGH/CRITICAL found: AUTO-REJECT
```

### 3. Feedback Loop

```
Developer → Submit Card
    ↓
QA Automated Checks
    ↓
┌───────────────┐
│   PASS?       │
└───────────────┘
    ↙         ↘
  YES         NO
    ↓           ↓
Manual QA   Create Correction Card
    ↓           ↓
  DONE      Back to Developer
                ↓
            Fix Issues
                ↓
         Re-submit Card
```

**Max 3 QA Cycles**: Se card falhar 3x, escala para Tech Lead.

## 💰 ROI da Política

### Custo vs Benefício

| Métrica | Sem Política | Com Política | Impacto |
|---------|--------------|--------------|---------|
| **Bugs em Produção** | 50-100/sprint | <5/sprint | ⬇️ 95% |
| **Hotfixes Urgentes** | 10-20/mês | <2/mês | ⬇️ 90% |
| **Tempo Debug Prod** | 40h/sprint | <5h/sprint | ⬇️ 87% |
| **Incidentes Críticos** | 3-5/mês | <1/mês | ⬇️ 80% |
| **Custo de Retrabalho** | $50k/sprint | $5k/sprint | ⬇️ 90% |

### Tempo de Desenvolvimento

| Fase | Sem Política | Com Política | Diferença |
|------|--------------|--------------|-----------|
| **Implementação Inicial** | 5 dias | 8 dias | +60% |
| **Bug Fixes** | 10 dias | 1 dia | -90% |
| **Refactoring** | 5 dias | 0 dias | -100% |
| **TOTAL** | **20 dias** | **9 dias** | **⬇️ 55%** |

**Conclusão**: Investir 60% mais tempo inicial economiza 55% do tempo total! 🎯

## 📊 Métricas de Qualidade

### Tracking Contínuo

```yaml
Daily Metrics:
  - cards_submitted: count
  - cards_auto_rejected: count (target: <20%)
  - cards_approved_first_qa: count (target: >80%)
  - average_qa_cycles: number (target: <1.5)
  - test_coverage: percentage (target: >85%)

Weekly Metrics:
  - security_vulnerabilities: count (target: 0 HIGH/CRITICAL)
  - production_bugs: count (target: <5/sprint)
  - hotfixes_deployed: count (target: <2/month)

Sprint Metrics:
  - velocity: story points (track consistency)
  - technical_debt: hours (target: decreasing)
  - code_quality_score: 0-100 (target: >85)
```

### Dashboards

```
╔════════════════════════════════════════════════════════════════╗
║              QUALITY DASHBOARD - SPRINT 3                      ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Cards Submitted:        45                                    ║
║  Auto-Rejected:          8 (18%) ✅ Target: <20%              ║
║  First-Time Approved:    37 (82%) ✅ Target: >80%             ║
║  Avg QA Cycles:          1.2 ✅ Target: <1.5                  ║
║                                                                ║
║  Test Coverage:          87% ✅ Target: >85%                   ║
║  Security Vulns (H/C):   0 ✅ Target: 0                        ║
║  Production Bugs:        2 ✅ Target: <5                       ║
║                                                                ║
║  Sprint Status:          🟢 EXCELLENT                          ║
╚════════════════════════════════════════════════════════════════╝
```

## 🎓 Treinamento de Agentes

### Tech Lead, Frontend Lead, Backend Lead

**Incluído em system prompt:**
```markdown
## CRITICAL CONSTRAINTS - ZERO TOLERANCE

You are building production systems that will handle:
- Real users
- Real data
- Real money

Every implementation MUST be production-ready.

FORBIDDEN:
- ❌ Mock implementations
- ❌ TODO comments in production code
- ❌ Hardcoded credentials
- ❌ Simplified logic
- ❌ Missing error handling
- ❌ Incomplete tests

REQUIRED:
- ✅ Real database integration
- ✅ Comprehensive error handling
- ✅ Production-grade security
- ✅ Test coverage ≥80%
- ✅ Complete documentation
- ✅ Observability (logs, metrics, traces)

If you cannot implement something completely:
1. DO NOT use temporary workarounds
2. ESCALATE to Tech Lead immediately
3. Document the blocker clearly
```

### QA Lead

**Incluído em system prompt:**
```markdown
## QA VALIDATION - ZERO TOLERANCE POLICY

You are the LAST LINE OF DEFENSE.

AUTO-REJECT any card with:
- Mock implementations in production code
- TODO/FIXME/HACK comments
- Hardcoded credentials or config
- Missing error handling
- Test coverage <80%
- Security vulnerabilities (HIGH/CRITICAL)

Run automated checks:
1. grep -r "mock|fake|stub" src/
2. grep -r "TODO|FIXME|HACK" src/
3. trufflehog filesystem src/
4. pytest --cov=src (must be ≥80%)
5. npm audit / pip-audit (0 HIGH/CRITICAL)

Create detailed correction cards on rejection.
Escalate to Tech Lead if card fails 2+ times.
```

## 📂 Arquivos de Referência

1. **[IMPLEMENTATION_STANDARDS.md](IMPLEMENTATION_STANDARDS.md)** - Padrões detalhados com exemplos
2. **[meta-squad-config.json](meta-squad-config.json)** - Configuração com constraints
3. **System prompts de agentes** - Constraints inline

## ✅ Checklist de Validação

### Para Desenvolvedores (antes de submeter card)

```
Antes de marcar card como IN_REVIEW:

[ ] Rodei todos os testes localmente - PASS
[ ] Rodei linter - 0 warnings
[ ] Rodei security scan - 0 HIGH/CRITICAL
[ ] Coverage ≥80% - VERIFIED
[ ] Sem mocks ou TODOs - VERIFIED
[ ] Documentação atualizada - DONE
[ ] Testei em ambiente local - WORKING
[ ] Li IMPLEMENTATION_STANDARDS.md - UNDERSTOOD

Se TODOS checkboxes = checked → Submit para QA
Senão → Continue trabalhando
```

### Para QA (ao receber card)

```
Automated Checks (scripts):
[ ] No mocks in production code
[ ] No TODO/FIXME comments
[ ] No hardcoded secrets
[ ] Test coverage ≥80%
[ ] Security scan clean

Manual Validation:
[ ] All acceptance criteria met
[ ] Edge cases handled
[ ] Error messages clear
[ ] Real DB/API integration working
[ ] Documentation complete

Se TODOS checkboxes = checked → APPROVE
Senão → REJECT + Create correction card
```

## 🚀 Resultado Esperado

Com esta política, após a execução das squads você terá:

✅ **Sistema 100% funcional** em produção
✅ **Zero bugs críticos** descobertos pós-deploy
✅ **Documentação completa** e atualizada
✅ **Testes robustos** com >85% coverage
✅ **Segurança validada** com 0 vulnerabilidades HIGH/CRITICAL
✅ **Observabilidade completa** (logs, metrics, traces)
✅ **Confiança total** para deploy em produção

## 📞 Escalação

Se bloqueado:
1. **Developer** → Escala para **Tech Lead**
2. **Tech Lead** → Escala para **Meta-Orchestrator**
3. **Meta-Orchestrator** → Escala para **Humano (Você)**

**Nunca** submeta trabalho incompleto. Melhor escalar do que entregar mal.

---

**Status**: ✅ ATIVO
**Enforcement**: AUTOMÁTICO via QA checks
**Última Atualização**: 2024-12-21
**Versão**: 1.0.0

**Mantra**: "Production-ready from day one, or escalate immediately." 🎯
