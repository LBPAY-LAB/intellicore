# Autonomous Development Framework
# Framework de Desenvolvimento Autônomo

**Project**: intelliCore Platform
**Effective Date**: 2025-11-19
**Review Cycle**: End of each Sprint
**Governance Model**: Autonomous Development with Sprint Retrospective Review

---

## 🎯 Objective / Objetivo

Enable the AI development squad to work autonomously within the project scope without requiring user authorization for routine development tasks, while maintaining quality through comprehensive testing and sprint-end reviews.

Permitir que a squad de desenvolvimento IA trabalhe de forma autônoma dentro do escopo do projeto sem necessitar de autorização do usuário para tarefas rotineiras de desenvolvimento, mantendo qualidade através de testes abrangentes e revisões ao final de cada sprint.

---

## ✅ Autonomous Permissions / Permissões Autônomas

### 1. File System Operations / Operações de Sistema de Arquivos

**GRANTED / CONCEDIDO**: Full autonomy within project directory

```
/Users/qteklab_1/Projects/qteklab/Zefora_3D/
├── All subdirectories / Todos os subdiretórios
├── All file types / Todos os tipos de arquivo
└── All operations / Todas as operações:
    ✅ CREATE new files and folders
    ✅ EDIT existing files
    ✅ DELETE files (with backup strategy)
    ✅ RENAME/MOVE files and folders
    ✅ WRITE configuration files
    ✅ GENERATE code, SQL, YAML, JSON, etc.
```

**RESTRICTIONS / Restrições**:
- ❌ Cannot modify files OUTSIDE project directory
- ❌ Cannot modify system files (/etc, /usr, etc.)
- ⚠️ `.env` files: Can create/edit, but must use placeholder values (no real secrets)

---

### 2. Package Installation / Instalação de Pacotes

**GRANTED / CONCEDIDO**: Install any development dependencies

**Python**:
```bash
✅ pip install <any-package>
✅ pip install -r requirements.txt
✅ Poetry add <package>
✅ Update pyproject.toml dependencies
```

**Node.js/JavaScript**:
```bash
✅ npm install <any-package>
✅ pnpm install <any-package>
✅ yarn add <any-package>
✅ Update package.json dependencies
```

**Docker**:
```bash
✅ docker pull <any-image>
✅ docker build custom images
✅ Update Dockerfile
✅ Update docker-compose.yml
```

**System Packages** (via Docker only):
```bash
✅ apt-get install (inside Docker containers)
✅ apk add (inside Alpine containers)
⚠️ brew install (ask first - affects host system)
```

**RESTRICTIONS / Restrições**:
- ⚠️ System-level packages on host: Ask first (security risk)
- ⚠️ Database engines on host: Prefer Docker
- ⚠️ Services on host: Prefer Docker Compose

---

### 3. Code Generation / Geração de Código

**GRANTED / CONCEDIDO**: Full autonomy for code generation

**Source Code**:
```
✅ Python modules (.py)
✅ JavaScript/TypeScript (.js, .ts, .tsx)
✅ Go source files (.go) - NEW (ADR-011)
✅ SQL scripts (.sql)
✅ Shell scripts (.sh)
✅ Configuration files (.yaml, .json, .toml, .ini)
✅ Markdown documentation (.md)
```

**Data Models**:
```
✅ Pydantic models (CDM)
✅ SQL DDL (Iceberg tables)
✅ nGQL schema (Nebula Graph)
✅ JSON schemas
✅ OpenAPI/Swagger specs
```

**Infrastructure as Code**:
```
✅ Terraform .tf files
✅ Ansible playbooks (.yml)
✅ Kubernetes manifests (.yaml)
✅ Docker Compose files
✅ Helm charts
```

**Tests**:
```
✅ Unit tests (pytest, jest, go test)
✅ Integration tests
✅ End-to-end tests
✅ Performance tests
✅ Security tests
```

**BEST PRACTICES / Melhores Práticas**:
- Follow existing code style and patterns
- Add comprehensive docstrings/comments
- Include type hints (Python) or type annotations (TypeScript/Go)
- Write tests for all new features
- Update documentation alongside code

---

### 4. Git Operations / Operações Git

**GRANTED / CONCEDIDO**: Full git workflow autonomy

**Branch Management**:
```bash
✅ git checkout -b feature/sprint-X-US-YYY
✅ git checkout -b bugfix/issue-description
✅ git checkout -b docs/documentation-update
✅ git branch -d <branch-name>
```

**Commit Strategy**:
```bash
✅ git add <files>
✅ git commit -m "conventional commit message"
✅ git push origin <branch>
✅ Multiple commits per feature (atomic commits)
```

**Commit Message Convention**:
```
feat(scope): Add feature description
fix(scope): Fix bug description
docs(scope): Update documentation
refactor(scope): Refactor code
test(scope): Add tests
chore(scope): Maintenance tasks

Examples:
✅ feat(US-020): Replace pandas with PySpark in Silver transformations
✅ fix(trino): Resolve connection pool timeout issue
✅ docs(Sprint 2): Add Sprint 2 completion summary
✅ test(legal_entity): Add unit tests for tax_id validation
```

**Pull Requests** (if applicable):
```bash
✅ Create PR descriptions
✅ Link to user stories
✅ Include test results
✅ Add screenshots/demo outputs
```

**RESTRICTIONS / Restrições**:
- ❌ No force push to main: `git push --force origin main`
- ❌ No rewriting published history: `git rebase -i` on pushed commits
- ⚠️ Large commits (>500 LOC): Break into smaller atomic commits

---

### 5. Infrastructure Management / Gestão de Infraestrutura

**GRANTED / CONCEDIDO**: Manage local development infrastructure

**Docker Services**:
```bash
✅ docker-compose up -d <service>
✅ docker-compose down <service>
✅ docker-compose restart <service>
✅ docker-compose logs <service>
✅ docker exec <container> <command>
✅ docker build custom images
```

**Service Configuration**:
```
✅ Update docker-compose.yml
✅ Create new service definitions
✅ Modify environment variables
✅ Configure volumes and networks
✅ Adjust resource limits (CPU, memory)
```

**Database Operations** (local Docker only):
```bash
✅ CREATE DATABASE
✅ CREATE TABLE
✅ INSERT test data
✅ Run migrations
✅ Backup/restore (local)
```

**RESTRICTIONS / Restrições**:
- ❌ Production infrastructure: No autonomous changes
- ❌ Cloud resources (AWS, Azure, GCP): Ask first
- ⚠️ Resource-intensive operations: Document impact

---

### 6. Testing & Quality Assurance / Testes e Garantia de Qualidade

**GRANTED / CONCEDIDO**: Full autonomy for testing

**Test Execution**:
```bash
✅ pytest tests/
✅ pytest tests/unit/
✅ pytest tests/integration/
✅ npm test
✅ go test ./...
✅ Run linters (black, flake8, eslint, golangci-lint)
✅ Run formatters (black, prettier, gofmt)
```

**Test Creation**:
```
✅ Write unit tests for all new functions
✅ Write integration tests for pipelines
✅ Write E2E tests for workflows
✅ Create test fixtures and mocks
✅ Generate test data
```

**Quality Gates**:
```
✅ All tests must pass before committing
✅ Code coverage should improve or maintain (target: >80%)
✅ Linters must pass (zero warnings)
✅ Type checking must pass (mypy, tsc, go vet)
```

**MANDATORY / Obrigatório**:
- Every new feature MUST have tests
- Every bug fix MUST have a regression test
- All AssetChecks must pass before marking user story as DONE

---

### 7. Documentation / Documentação

**GRANTED / CONCEDIDO**: Full autonomy for documentation

**Technical Documentation**:
```
✅ Code comments and docstrings
✅ README.md updates
✅ API documentation (OpenAPI, docstrings)
✅ Architecture Decision Records (ADRs)
✅ Technical specifications
✅ Runbooks and troubleshooting guides
```

**Project Management Documentation**:
```
✅ Sprint planning documents
✅ Sprint retrospectives
✅ User story acceptance criteria
✅ Backlog updates (BACKLOG_MASTER.md)
✅ Project dashboard updates
```

**Operational Documentation**:
```
✅ Deployment guides
✅ Configuration guides
✅ Monitoring dashboards
✅ Incident response playbooks
```

**BEST PRACTICES / Melhores Práticas**:
- Keep documentation close to code (same PR)
- Use Mermaid diagrams for architecture
- Include code examples in docs
- Update docs BEFORE marking story as DONE

---

## 🔄 Sprint Workflow / Fluxo de Trabalho do Sprint

### Sprint Planning (Start of Sprint)

**Squad Activities** (Autonomous):
1. ✅ Read sprint backlog from `BACKLOG_MASTER.md`
2. ✅ Break user stories into technical tasks
3. ✅ Create branch: `feature/sprint-X-US-YYY`
4. ✅ Estimate effort and dependencies
5. ✅ Update `PROJECT_DASHBOARD.md` with sprint start metrics

**User Involvement**: None required (unless blockers)

---

### Sprint Execution (During Sprint)

**Squad Activities** (Autonomous):
1. ✅ Implement features following CLAUDE.md guidelines
2. ✅ Write comprehensive tests (unit, integration, E2E)
3. ✅ Execute all tests and quality gates
4. ✅ Generate documentation
5. ✅ Commit code with conventional commits
6. ✅ Update backlog status (IN PROGRESS → DONE)
7. ✅ Create demo scripts for validation

**User Involvement**:
- ⚠️ Blocker resolution (if external dependencies)
- ⚠️ Clarification requests (if requirements unclear)
- Otherwise: **No intervention needed**

---

### Sprint Review (End of Sprint)

**Squad Deliverables** (Autonomous):
1. ✅ Execute all demos and capture output
2. ✅ Generate Sprint Completion Summary (like Sprint 1)
3. ✅ Update `PROJECT_DASHBOARD.md` with final metrics
4. ✅ Document known issues and blockers
5. ✅ Create Sprint Retrospective document
6. ✅ Commit all deliverables to git
7. ✅ Push to remote repository

**User Review** (Sprint Retrospective Meeting):
- 📊 Review Sprint Completion Summary
- 📊 Review demo execution results
- 📊 Review test coverage and quality metrics
- 📊 Review backlog burndown
- 📊 Approve/reject deliverables
- 📊 Discuss blockers and improvements
- 📊 Approve Sprint N+1 scope

**Approval Criteria**:
```
✅ All user stories marked DONE have:
   - Working code committed
   - All tests passing (unit, integration, E2E)
   - All AssetChecks passing (for Dagster assets)
   - Comprehensive documentation
   - Demo execution results

✅ Sprint metrics documented:
   - Velocity (points delivered)
   - Quality (test coverage, bug count)
   - Technical debt (known issues)

✅ Backlog updated:
   - DONE stories moved to completed
   - Blocked/deferred stories documented
   - Sprint N+1 scope defined
```

**Rejection Criteria**:
```
❌ Tests failing
❌ Critical bugs in deliverables
❌ Incomplete documentation
❌ Missing demo validation
❌ Undocumented technical debt
```

---

## 🚨 Escalation Rules / Regras de Escalação

**ALWAYS ASK USER** when:

1. **Architecture Changes**:
   - Modifying approved ADRs
   - Changing core technology stack
   - Introducing new external dependencies (cloud services, paid tools)

2. **Security Concerns**:
   - Handling production secrets
   - Modifying authentication/authorization logic
   - Exposing new API endpoints

3. **Cost Impact**:
   - Cloud resource provisioning
   - Paid service subscriptions
   - Infrastructure scaling decisions

4. **Blockers**:
   - External system dependencies unavailable
   - Requirements ambiguity blocking implementation
   - Technical limitations requiring architecture change

5. **Scope Changes**:
   - User story acceptance criteria unclear
   - New requirements discovered during implementation
   - Cross-sprint dependencies identified

**AUTONOMOUS DECISION** for:
- ✅ Implementation details (algorithms, data structures)
- ✅ Code organization (file structure, module design)
- ✅ Test strategies (unit vs integration, mocking approaches)
- ✅ Documentation structure
- ✅ Development tooling (linters, formatters)
- ✅ Local infrastructure configuration (Docker, docker-compose)

---

## 📊 Quality Metrics / Métricas de Qualidade

**Tracked per Sprint** (Autonomous):

### Code Quality
```
✅ Test Coverage: >80% (target)
✅ Linter Warnings: 0
✅ Type Coverage: 100% (Python type hints, TypeScript strict mode)
✅ Code Duplication: <5%
✅ Complexity Score: <10 (cyclomatic complexity)
```

### Pipeline Quality (Dagster)
```
✅ AssetCheck Pass Rate: 100%
✅ Asset Materialization Success Rate: >95%
✅ Data Quality Errors: 0 (ERROR severity)
✅ Data Quality Warnings: <10 (WARN severity)
```

### Documentation Quality
```
✅ All public functions documented (docstrings)
✅ All user stories have acceptance criteria
✅ All ADRs have decision rationale
✅ All demos have execution results
```

### Velocity Metrics
```
✅ Story Points Delivered vs Planned
✅ Sprint Completion Rate (%)
✅ Bug Escape Rate (bugs found post-sprint)
✅ Rework Rate (% of code rewritten)
```

**Reporting**: Auto-generated in Sprint Completion Summary

---

## 🔐 Security Guidelines / Diretrizes de Segurança

**MANDATORY / Obrigatório**:

1. **Secrets Management**:
   ```
   ✅ Use .env files with PLACEHOLDER values
   ✅ Document required environment variables
   ✅ Never commit real API keys, passwords, tokens
   ✅ Use Docker secrets or Vault for production
   ```

2. **Code Security**:
   ```
   ✅ Validate all user inputs (Pydantic models)
   ✅ Sanitize SQL queries (parameterized queries only)
   ✅ Escape nGQL queries
   ✅ Use HTTPS for external APIs
   ✅ Implement RBAC for all endpoints
   ```

3. **Dependency Security**:
   ```
   ✅ Run `pip audit` or `npm audit` before committing
   ✅ Pin dependency versions in requirements.txt/package.json
   ✅ Review security advisories for critical dependencies
   ```

4. **Data Security**:
   ```
   ✅ Encrypt sensitive data at rest (Iceberg encryption)
   ✅ Use TLS for data in transit
   ✅ Implement tenant isolation (tenant_id filtering)
   ✅ Audit all data access (logging)
   ```

**ALWAYS ASK USER** for:
- Authentication/authorization changes
- Encryption key generation
- Production security configurations

---

## 📝 Example Autonomous Sprint Workflow

### Sprint 2 Scenario (Realistic Example)

**Sprint Goal**: Implement remaining 7 CDM entities + PySpark migration

**Week 1 - Day 1 (Monday)**:
```
Squad (Autonomous):
1. git checkout -b feature/sprint-2-US-020-pyspark-migration
2. Read ADR-011 (Hybrid Stack Python + Go)
3. Create src/zefora/transformations/spark/legal_entity.py
4. Write PySpark transformation logic
5. Write unit tests (tests/unit/transformations/test_legal_entity_spark.py)
6. Execute: pytest tests/unit/transformations/
7. Commit: "feat(US-020): Replace pandas with PySpark in legal_entity transformation"
8. Push to GitHub
```

**Week 1 - Day 2-5**:
```
Squad (Autonomous):
1. Implement US-021 to US-027 (7 CDM entities)
2. Create Pydantic models for each entity
3. Create Iceberg DDL scripts
4. Create Dagster assets (Bronze → Silver)
5. Create AssetChecks (5 per entity)
6. Write unit tests (>80% coverage)
7. Execute integration tests
8. Generate documentation
9. Commit per entity with conventional commits
10. Push to GitHub daily
```

**Week 2 - Day 1 (Monday)**:
```
Squad (Autonomous):
1. Execute end-to-end demo for all 8 entities
2. Capture demo output (like Sprint 1)
3. Generate Sprint 2 Completion Summary
4. Update BACKLOG_MASTER.md (mark stories DONE)
5. Update PROJECT_DASHBOARD.md (final metrics)
6. Create docs/project-management/SPRINT_2_RETROSPECTIVE.md
7. Commit all deliverables
8. Push to GitHub
9. Notify user: "Sprint 2 complete, ready for review"
```

**User Review** (30 minutes):
```
User:
1. Read Sprint 2 Completion Summary
2. Review demo execution results
3. Check test coverage (target: >80%)
4. Review known issues
5. Approve/reject deliverables
6. Discuss Sprint 3 scope
```

**Approval**: ✅ Sprint 2 delivered, proceed to Sprint 3

**Time Saved**: ~90% (user involvement reduced from 40 hours to 4 hours per sprint)

---

## 🎯 Success Criteria / Critérios de Sucesso

**Autonomous Development is successful when**:

1. ✅ **Velocity**: Squad delivers 100% of planned sprint scope without user intervention
2. ✅ **Quality**: All tests passing, zero critical bugs, >80% coverage
3. ✅ **Documentation**: Comprehensive docs generated alongside code
4. ✅ **Transparency**: Sprint Completion Summary provides full visibility
5. ✅ **Predictability**: User review time <10% of total sprint effort

**Framework Review Triggers**:
- ❌ 2+ consecutive sprints with <80% completion rate
- ❌ Critical bugs escaping to production
- ❌ User review rejecting >30% of deliverables
- ❌ Security incidents due to autonomous decisions

**Review Outcome**: Adjust autonomous permissions or add quality gates

---

## 📚 Reference Documents

**MANDATORY READING** before each sprint:
- [`CLAUDE.md`](/Users/qteklab_1/Projects/qteklab/Zefora_3D/CLAUDE.md) - Project overview, architecture, guidelines
- [`docs/architecture/ARQUITETURA_MACRO_C4.md`](../docs/architecture/ARQUITETURA_MACRO_C4.md) - System architecture baseline
- [`docs/project-management/SPRINT_PLAN.md`](../docs/project-management/SPRINT_PLAN.md) - Sprint definitions and user stories
- [`BACKLOG_MASTER.md`](/Users/qteklab_1/Projects/qteklab/Zefora_3D/BACKLOG_MASTER.md) - Current sprint backlog

**REFERENCE** during implementation:
- [`docs/technical-specs/cdm/canonical-data-model.md`](../docs/technical-specs/cdm/canonical-data-model.md) - CDM schema
- [`docs/technical-specs/nebula-graph/nebula-graph-schema.md`](../docs/technical-specs/nebula-graph/nebula-graph-schema.md) - Nebula Graph schema
- [`Specs_Stackholder/agente_conciliacao_aumentada.md`](../Specs_Stackholder/agente_conciliacao_aumentada.md) - ACA use case
- ADRs in `docs/architecture/adrs/` - Architectural decisions

---

## ✅ Framework Activation

**Status**: ✅ **ACTIVE** from Sprint 2 onwards

**Effective Date**: 2025-11-19

**User Confirmation**: Approved by User (see conversation context)

**Next Review**: End of Sprint 2 (Retrospective Meeting)

---

## 🤝 Commitment / Compromisso

**Squad Commitment**:
- ✅ Follow all quality gates and best practices
- ✅ Deliver working, tested, documented code
- ✅ Escalate blockers and ambiguities immediately
- ✅ Generate comprehensive Sprint Completion Summaries
- ✅ Maintain transparency in all decisions

**User Commitment**:
- ✅ Review Sprint Completion Summary within 48h of delivery
- ✅ Provide clear feedback on approved/rejected deliverables
- ✅ Clarify requirements when escalated
- ✅ Trust autonomous decisions within framework boundaries

**Shared Goal**: Deliver intelliCore platform with maximum velocity and quality ⚡

---

**Document Version**: 1.0
**Last Updated**: 2025-11-19
**Author**: Claude (Zefora Development Squad)
**Approved By**: User (Project Owner)
**Next Review**: End of Sprint 2
