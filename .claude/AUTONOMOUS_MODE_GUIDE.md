# intelliCore - Autonomous Agent Mode Guide

**Status**: 🟢 ATIVO
**Aprovado por**: CTO (2025-11-06)
**Versão**: 1.0

---

## 🤖 Overview

O **Modo Autônomo** permite que os agentes Claude Code trabalhem de forma **independente** dentro do escopo do projeto intelliCore, **sem necessidade de aprovações manuais** para cada ação.

### Objetivo

Maximizar a **velocidade de execução** eliminando overhead de aprovações, mantendo **guardrails de segurança** para operações críticas.

---

## ✅ Operações Aprovadas (Auto-Aprovadas)

Os agentes estão **autorizados** a executar as seguintes operações **sem pedir aprovação**:

### 1. Operações de Código

- ✅ **Ler arquivos** (qualquer arquivo do projeto)
- ✅ **Escrever novos arquivos** (código, testes, documentação)
- ✅ **Editar arquivos existentes** (refatoração, correções, melhorias)
- ✅ **Criar diretórios** (estrutura de pastas)
- ✅ **Gerar código** (templates, boilerplate, scaffolding)
- ✅ **Refatorar código** (melhorar estrutura, performance, legibilidade)
- ✅ **Implementar user stories** (conforme acceptance criteria no backlog)

### 2. Operações de Testes

- ✅ **Escrever testes** (unit, integration, e2e)
- ✅ **Executar testes** (pytest, vitest, bats)
- ✅ **Executar linters** (Ruff, ESLint, yamllint)
- ✅ **Executar security scans** (Trivy, Bandit)
- ✅ **Analisar code coverage** (pytest-cov)

### 3. Operações de Git

- ✅ **Criar branches** (feature, fix, chore)
- ✅ **Fazer commits** (seguindo Semantic Commits)
- ✅ **Abrir Pull Requests** (com descrição detalhada)
- ✅ **Atualizar backlog via commit message** (US-XXX: STATUS)

### 4. Operações de Infraestrutura (Dev/Staging)

- ✅ **Executar Terraform** (ambientes dev e staging)
- ✅ **Provisionar recursos AWS** (dev/staging apenas)
- ✅ **Configurar serviços** (docker-compose, Kubernetes dev)
- ✅ **Executar scripts de inicialização** (init-nebula-schema.sh, etc.)
- ✅ **Instalar dependências** (pip, npm, apt)

### 5. Operações de Dados

- ✅ **Criar schemas Iceberg** (tabelas Silver/Gold-A)
- ✅ **Criar schemas Nebula Graph** (tags, edges, indices)
- ✅ **Executar queries SQL** (Trino - leitura e escrita em dev)
- ✅ **Executar queries nGQL** (Nebula Graph - leitura e escrita em dev)
- ✅ **Rodar Dagster assets** (pipelines Bronze → Silver → Gold)
- ✅ **Inserir dados mock** (para testes e desenvolvimento)

### 6. Operações de CI/CD

- ✅ **Executar GitHub Actions workflows**
- ✅ **Rodar pipelines de CI** (lint, test, build)
- ✅ **Deploy em ambiente dev** (docker-compose, K8s dev)
- ✅ **Atualizar imagens Docker**

### 7. Operações de Documentação

- ✅ **Criar/atualizar ADRs** (Architectural Decision Records)
- ✅ **Atualizar backlog** (BACKLOG_MASTER.md via script)
- ✅ **Atualizar dashboard** (PROJECT_DASHBOARD.md)
- ✅ **Gerar documentação técnica** (API docs, schemas, guides)
- ✅ **Criar retrospectivas de sprint**

### 8. Operações de Project Management

- ✅ **Pegar próxima story do backlog** (auto-assignment)
- ✅ **Atualizar status de stories** (TODO → IN_PROGRESS → DONE)
- ✅ **Criar issues no GitHub** (bugs, melhorias)
- ✅ **Reportar bloqueadores** (via dashboard)
- ✅ **Calcular métricas** (velocity, code coverage, bugs)

---

## 🚫 Operações Restritas (Requerem Aprovação)

As seguintes operações **requerem aprovação explícita do usuário**:

### 1. Produção (CRÍTICO)

- ❌ **Deploy em produção** (requer aprovação CTO)
- ❌ **Modificar dados de produção** (delete, update críticos)
- ❌ **Alterar configurações de segurança** (IAM policies, security groups em prod)
- ❌ **Acessar secrets de produção** (senhas, API keys)

### 2. Custos (ALTO RISCO)

- ❌ **Provisionar recursos acima de $100/dia** (requer aprovação CFO)
- ❌ **Modificar budget limits** (limites de custo)
- ❌ **Criar instâncias GPU em produção** (alto custo - g5.xlarge $350/mês)

### 3. Segurança (ALTO RISCO)

- ❌ **Modificar políticas de autenticação** (Keycloak realms, Cerbos policies)
- ❌ **Alterar regras de RBAC** (requer aprovação Security Auditor)
- ❌ **Desabilitar security scans** (SAST, DAST)

### 4. Git (DESTRUTIVO)

- ❌ **Force push para main** (protegido)
- ❌ **Deletar branches principais** (main, develop, staging)
- ❌ **Reescrever histórico de commits** (git rebase -i, amend em commits de outros)

### 5. Dados (DESTRUTIVO)

- ❌ **Deletar schemas Iceberg em produção**
- ❌ **Deletar spaces Nebula Graph em produção**
- ❌ **Executar DROP DATABASE em produção**

---

## 🛡️ Guardrails de Segurança

Mesmo em modo autônomo, os agentes seguem **guardrails automáticos**:

### 1. Testes Obrigatórios

**Regra**: Todo commit **deve** passar por testes antes de ser mergeado.

```bash
# CI/CD executa automaticamente:
1. Linting (Ruff, ESLint, yamllint)
2. Unit tests (pytest, vitest)
3. Integration tests (docker-compose up + test scripts)
4. Security scan (Trivy, Bandit)

# Se qualquer passo falhar, PR é bloqueado
```

**Exceção**: Commits de documentação (docs/*) pulam testes de código.

---

### 2. Code Review para Arquivos Críticos

**Regra**: Mudanças em arquivos críticos **requerem code review** (mesmo em modo autônomo).

**Arquivos Críticos**:
- `*.tf` (Terraform - infraestrutura)
- `**/security/**` (código de autenticação/autorização)
- `**/auth/**` (Keycloak, JWT, RBAC)
- `**/*secret*` (qualquer arquivo com "secret" no nome)
- `**/*credential*` (qualquer arquivo com "credential" no nome)

**Workflow**:
1. Agente cria PR com mudanças
2. PR requer aprovação de **Security Auditor** ou **Tech Lead**
3. Após aprovação, merge é automático

---

### 3. Budget Controls (Custos)

**Regra**: Custos são monitorados em tempo real.

**Limites**:
- **Diário**: $50/dia (alert aos $40, pause aos $47.50)
- **Mensal**: $1,500/mês (alert aos $1,200, pause aos $1,425)

**Ações Automáticas**:
- **80% do limite**: Notificação no Slack + Email para CTO
- **95% do limite**: Pausar provisionamento de novos recursos (agentes param de executar Terraform)
- **100% do limite**: Bloquear toda operação que gere custo

**Exceção**: CTO pode aumentar limites temporariamente via approval manual.

---

### 4. Ambientes Separados

**Regra**: Agentes trabalham **apenas em dev/staging** sem aprovação. Produção requer sign-off.

| Ambiente | Auto-Deploy? | Requer Aprovação? | Owner |
|----------|-------------|-------------------|-------|
| **Development** (local docker-compose) | ✅ Sim | ❌ Não | Agentes |
| **Staging** (EKS staging cluster) | ✅ Sim | ❌ Não | Agentes |
| **Production** (EKS production cluster) | ❌ Não | ✅ Sim (CTO) | DevOps Lead |

**Workflow de Deploy**:
```bash
# Dev: Automático a cada commit em feature branch
git push origin feat/US-XXX
# → CI/CD deploys to dev automatically

# Staging: Automático a cada merge em develop
git checkout develop
git merge feat/US-XXX
git push origin develop
# → CI/CD deploys to staging automatically

# Production: Manual após aprovação
git checkout main
git merge develop
# → Agente cria PR com tag [PRODUCTION_DEPLOY]
# → CTO/DevOps Lead aprova PR
# → CI/CD deploys to production
```

---

## 🚀 Workflow Autônomo (Sprint Execution)

### Fase 1: Sprint Planning (Manual - Primeira vez)

**Ação do Usuário**: Aprovação inicial do sprint.

```bash
# Usuário (você) dá o comando:
"Agentes, podem iniciar Sprint 0 conforme o BACKLOG_MASTER.md"
```

**Agentes fazem automaticamente**:
1. Leem `BACKLOG_MASTER.md` → identificam Sprint 0 (12 stories, 40 pontos)
2. Atribuem stories aos squad members (auto-assignment)
3. Marcam Sprint 0 como 🔵 ATIVO no dashboard
4. Iniciam primeira story (US-001: Provisionar EKS Cluster)

---

### Fase 2: Desenvolvimento (100% Autônomo)

**Nenhuma aprovação necessária**. Agentes trabalham em loop até completar todas as stories do sprint.

#### Loop de Execução (por story):

```
1. PICK STORY
   ├─ Agente lê BACKLOG_MASTER.md
   ├─ Identifica próxima story ⚪ TODO com prioridade 🔴 CRÍTICA
   ├─ Atualiza status: ⚪ TODO → 🔵 IN_PROGRESS
   └─ Auto-assign: DevOps Engineer (Operations Squad)

2. IMPLEMENT STORY
   ├─ Criar feature branch: feat/US-001-eks-cluster
   ├─ Executar tarefas técnicas (conforme backlog):
   │  ├─ terraform init
   │  ├─ terraform plan -out=tfplan
   │  ├─ terraform apply tfplan
   │  └─ kubectl get nodes -o wide
   ├─ Validar acceptance criteria (7/7 ✅)
   └─ Executar Definition of Done checklist (8/8 ✅)

3. TEST & VALIDATE
   ├─ Rodar testes automatizados
   ├─ Rodar linters (Ruff, ESLint)
   ├─ Rodar security scans (Trivy, Bandit)
   └─ Validar que todos passaram ✅

4. COMMIT & PR
   ├─ Fazer commit com Semantic Commit:
   │  "feat(infra): provision EKS cluster with 4 node pools
   │
   │   - EKS cluster created in sa-east-1
   │   - 4 node pools configured
   │   - Cluster Autoscaler installed
   │
   │   US-001: DONE"
   ├─ Push para origin
   └─ Abrir PR automaticamente

5. CODE REVIEW (se necessário)
   ├─ Se arquivo crítico (*.tf): Aguarda approval de Tech Lead
   └─ Se arquivo normal: Auto-merge após CI pass

6. UPDATE BACKLOG
   ├─ CI/CD executa update-backlog.py
   ├─ BACKLOG_MASTER.md: US-001 status 🔵 IN_PROGRESS → 🟢 DONE
   ├─ PROJECT_DASHBOARD.md: Sprint 0 progress 0/40 → 8/40 (20%)
   └─ Velocity atualizado

7. NEXT STORY
   └─ Volta ao passo 1 (PICK STORY) até completar todas as 12 stories
```

**Duração estimada**: 10 dias úteis (Sprint 0 = 2 semanas com buffer)

---

### Fase 3: Sprint Review (Semi-Autônomo)

**Ação Automática dos Agentes**:
1. Detectam que Sprint 0 está 100% completo (12/12 stories DONE)
2. Geram relatório de Sprint Review:
   - Stories completas: 12/12 (100%)
   - Pontos entregues: 40/40 (100%)
   - Velocity: 40 pts/sprint
   - Bugs: 0
   - Bloqueadores: 0
3. Enviam notificação:
   - Slack: "#zefora-gold-3d" → "🎉 Sprint 0 completo! Review meeting agendado para 2025-11-20, 2:00 PM"
   - Email: cto@zefora.com

**Ação Manual (Você)**:
- Participar de Sprint Review meeting (2 horas)
- Validar entregas (demo ao vivo)
- Aprovar sprint como concluído

---

### Fase 4: Sprint Retrospective (Autônomo)

**Ação Automática dos Agentes**:
1. Copiam `SPRINT_RETROSPECTIVE_TEMPLATE.md` → `SPRINT_0_RETROSPECTIVE.md`
2. Preenchem métricas automaticamente:
   - Stories completas: 12/12
   - Velocity: 40 pts
   - Bugs: 0
   - Code coverage: 85% (exemplo)
3. Analisam commits e PRs para identificar:
   - ✅ What went well (ex: "Terraform execution sem erros")
   - 🟡 What can improve (ex: "Code review time foi 6h, target é 4h")
   - ❌ What didn't work (nenhum identificado)
4. Geram action items com owners
5. Salvam retrospectiva em `docs/project-management/retrospectives/SPRINT_0_RETROSPECTIVE.md`

**Ação Manual (Você)**:
- Revisar retrospectiva gerada
- Aprovar action items (ou ajustar)

---

### Fase 5: Rollover para Sprint 1 (Autônomo)

**Ação Automática dos Agentes**:
1. Detectam que Sprint 0 está concluído + retrospectiva aprovada
2. Perguntam: "Posso iniciar Sprint 1 automaticamente?" (se `auto_start_next_sprint: true` no config, nem perguntam)
3. Atualizam `BACKLOG_MASTER.md`:
   - Sprint Atual: Sprint 0 → Sprint 1
   - Sprint 1 status: ⚪ PENDING → 🔵 ATIVO
4. Iniciam primeira story de Sprint 1 (US-010: Criar Tabelas Iceberg)

**Loop continua indefinidamente até Sprint 10 completo ou você pausar manualmente.**

---

## 📋 Comandos de Controle Manual

Mesmo em modo autônomo, você pode **intervir a qualquer momento**:

### Pausar Execução

```
"Agentes, pausem o trabalho até eu autorizar."
```

**Resultado**: Agentes param imediatamente. Commit atual é finalizado, mas não iniciam próxima story.

---

### Retomar Execução

```
"Agentes, podem retomar o trabalho."
```

**Resultado**: Agentes continuam de onde pararam.

---

### Pular Story

```
"Agentes, pulem US-005 por enquanto e sigam para US-006."
```

**Resultado**: US-005 é marcada como ⚪ TODO (deprioritizada), agentes começam US-006.

---

### Mudar Prioridade

```
"Agentes, US-007 é agora prioridade crítica. Implementem antes das outras."
```

**Resultado**: Agentes param story atual (se não crítica), salvam progresso, começam US-007.

---

### Forçar Code Review

```
"Agentes, US-014 requer minha aprovação antes de merge."
```

**Resultado**: Agentes criam PR para US-014, mas não fazem auto-merge. Aguardam sua aprovação.

---

### Aprovar Deploy em Produção

```
"Agentes, podem fazer deploy da versão v1.0.0 em produção."
```

**Resultado**: Agentes executam deployment pipeline para produção (normalmente bloqueado).

---

## 🔔 Notificações Automáticas

Você receberá notificações **apenas** quando necessário:

### Notificações Críticas (Imediatas)

- 🔴 **Bloqueador encontrado** (ex: AWS quota limit atingido)
- 🔴 **Bug crítico** (ex: production outage)
- 🔴 **Security issue** (ex: vulnerabilidade CVE detectada)
- 🔴 **Cost threshold** (80% do budget mensal)

**Canal**: Slack + Email + SMS (opcional)

---

### Notificações Importantes (Diárias)

- 🟡 **Sprint completo** (ex: "Sprint 0 finalizado, 12/12 stories done")
- 🟡 **Milestone atingido** (ex: "Infrastructure Ready")
- 🟡 **Velocity drop** (ex: "Velocity caiu 30% no último sprint")

**Canal**: Slack + Email

---

### Notificações Informativas (Semanais)

- 🟢 **Weekly summary** (ex: "Semana 1: 6 stories, 24 pontos, 0 bugs")
- 🟢 **Dashboard snapshot** (progresso geral, métricas-chave)

**Canal**: Email apenas

---

## 📊 Dashboard de Monitoramento

Você pode acompanhar o progresso **em tempo real** sem interromper os agentes:

### 1. PROJECT_DASHBOARD.md (Atualizado automaticamente)

```bash
# Abrir no navegador (auto-refresh a cada commit)
open docs/project-management/PROJECT_DASHBOARD.md
```

**Métricas visíveis**:
- Progresso geral (X/11 sprints, Y/520 pontos)
- Sprint atual (burndown chart, stories por status)
- Velocity trend
- Bloqueadores ativos
- Bugs abertos
- Recent commits (últimos 5)

---

### 2. Slack Channel (#zefora-gold-3d)

**Updates Automáticos**:
- "✅ US-001: Provisionar EKS Cluster - DONE (8 pontos)"
- "🔵 US-002: Configurar S3 Buckets - IN_PROGRESS"
- "🐛 BUG-001: Nebula Graph cluster não formando - BLOCKED"

---

### 3. GitHub Projects Board

**Kanban Board Auto-Atualizado**:
- TODO: 110 stories
- IN_PROGRESS: 1 story (US-002)
- IN_REVIEW: 0 stories
- DONE: 1 story (US-001)

---

## 🎯 Exemplo de Execução Completa (Sprint 0)

### Comando Inicial (Você)

```
"Agentes, podem iniciar Sprint 0 conforme o BACKLOG_MASTER.md.
Trabalhem de forma autônoma e me notifiquem apenas em caso de bloqueadores críticos."
```

---

### Execução Autônoma (Agentes)

**Dia 1 (2025-11-07)**:
```
09:00 - [DevOps Agent] Iniciando Sprint 0 (12 stories, 40 pontos)
09:01 - [DevOps Agent] US-001 (Provisionar EKS Cluster) → IN_PROGRESS
09:15 - [DevOps Agent] terraform init completo
09:30 - [DevOps Agent] terraform plan completo (0 erros)
10:00 - [DevOps Agent] terraform apply completo (cluster criado)
10:30 - [DevOps Agent] kubectl get nodes → 8 nodes Ready ✅
11:00 - [DevOps Agent] US-001 → DONE (8 pontos)
11:01 - [Backlog Updater] PROJECT_DASHBOARD.md atualizado: 8/40 pts (20%)
11:02 - [Slack Bot] "✅ US-001 completo! Velocity: 8 pts/dia"
11:05 - [DevOps Agent] US-002 (Configurar S3 Buckets) → IN_PROGRESS
12:00 - [DevOps Agent] Buckets MinIO criados (bronze, silver, gold)
14:00 - [DevOps Agent] Buckets AWS S3 criados com lifecycle policies
15:00 - [DevOps Agent] US-002 → DONE (3 pontos)
15:01 - [Backlog Updater] PROJECT_DASHBOARD.md atualizado: 11/40 pts (28%)
```

**Dia 2-10 (2025-11-08 a 2025-11-20)**:
```
[Agentes continuam trabalhando autonomamente...]

US-003 → DONE (5 pontos)
US-004 → DONE (5 pontos)
US-005 → DONE (5 pontos)
US-006 → DONE (2 pontos)
US-007 → DONE (3 pontos)
US-008 → DONE (3 pontos)
US-009 → DONE (2 pontos)
[... mais 3 stories...]

Total: 12/12 stories DONE, 40/40 pontos (100%)
```

**Dia 10 (2025-11-20)**:
```
14:00 - [PM Agent] Sprint 0 completo! Gerando retrospectiva...
14:05 - [PM Agent] SPRINT_0_RETROSPECTIVE.md criado
14:06 - [Slack Bot] "🎉 Sprint 0 finalizado! 12/12 stories, 40 pts, 0 bugs"
14:07 - [Email] Enviado para cto@zefora.com: "Sprint 0 Review Report"
```

---

### Notificação para Você (Única)

**Slack (#zefora-gold-3d)**:
```
🎉 Sprint 0 Completo!

Stories: 12/12 (100%)
Pontos: 40/40 (100%)
Velocity: 40 pts/sprint
Bugs: 0
Bloqueadores: 0

📊 Dashboard: [link]
📝 Retrospectiva: [link]

✅ Próxima Ação: Aprovar início de Sprint 1
```

**Você responde**:
```
"Aprovado! Agentes, podem iniciar Sprint 1."
```

---

## ✅ Configuração Aplicada

A configuração de **modo autônomo** está salva em:
- `.claude/project-config.json` (definições de escopo e guardrails)
- `.claude/AUTONOMOUS_MODE_GUIDE.md` (este documento - guia de referência)

**Status**: 🟢 **ATIVO**

Os agentes agora estão autorizados a:
- ✅ Implementar todas as 127 user stories
- ✅ Fazer commits e PRs automaticamente
- ✅ Atualizar backlog via CI/CD
- ✅ Provisionar infraestrutura dev/staging
- ✅ Executar testes e deployments
- ✅ Trabalhar 24/7 sem interrupção

**Você só precisa**:
- ✅ Dar comando inicial: "Iniciar Sprint N"
- ✅ Monitorar dashboard (opcional)
- ✅ Participar de Sprint Reviews (quinzenais)
- ✅ Aprovar deploys em produção (quando chegar)

---

**Projeto configurado para execução autônoma. Os agentes podem trabalhar sem aprovações dentro do escopo definido.** 🚀
