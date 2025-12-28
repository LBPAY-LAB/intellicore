# Squad Orchestrator v2.0 - Hierarchical Multi-Squad System

## Overview

Squad Orchestrator v2.0 introduces **hierarchical squad architecture** with automated card management and QA feedback loops. This evolution enables complex, multi-team projects with clear workflows and autonomous coordination.

### What's New in v2.0

- **Meta-Squad Bootstrap**: Dynamic squad creation from configuration
- **Hierarchical Organization**: Multi-level squad structure (Meta → Product → Architecture → Engineering → QA)
- **Digital Card System**: Kanban-style cards flowing between squads
- **Sub-Squad Support**: Nested squads (Frontend + Backend under Engineering)
- **QA Feedback Loop**: Automated validation with correction cycles (max 3)
- **Advanced Communication**: Parent-child, sibling, escalation, and broadcast channels
- **Management Agents**: 7 specialized agents (Meta-Orchestrator, Product Owner, Tech Lead, Scrum Master, Frontend Lead, Backend Lead, QA Lead)

### Architecture

```
Meta-Squad (Bootstrap & Coordinate)
    ├── Product Squad (Features & Requirements)
    │   └── Creates Feature Cards → Architecture
    │
    ├── Architecture Squad (Technical Design)
    │   └── Creates Implementation Cards → Engineering
    │
    ├── Engineering Squad (Development Coordination)
    │   ├── Frontend Sub-Squad (UI Development)
    │   └── Backend Sub-Squad (API Development)
    │   └── Both deliver → QA
    │
    └── QA Squad (Quality Validation)
        ├── Approves → DONE
        └── Rejects → Creates Correction Cards → Engineering
```

## Quick Start

### 1. Bootstrap System

```bash
# Create configuration (or use example)
cp scripts/squad-orchestrator/meta-squad-config.json my-project-config.json

# Edit configuration for your project
vi my-project-config.json

# Dry run to validate
./scripts/squad-orchestrator/meta-squad-bootstrap.sh my-project-config.json --dry-run

# Bootstrap the system
./scripts/squad-orchestrator/meta-squad-bootstrap.sh my-project-config.json
```

**Output:**
- Session ID (e.g., `session-20250120-143022`)
- Bootstrap report
- Squad hierarchy created
- Initial cards generated

### 2. Manage Cards

```bash
# List all cards
./scripts/squad-orchestrator/card-manager.sh list

# Show card details
./scripts/squad-orchestrator/card-manager.sh show CARD-0042

# Create new card (interactive)
./scripts/squad-orchestrator/card-manager.sh create

# Move card to IN_PROGRESS
./scripts/squad-orchestrator/card-manager.sh move CARD-0042 --to IN_PROGRESS

# Assign card to squad
./scripts/squad-orchestrator/card-manager.sh assign CARD-0042 --squad squad-backend

# View card statistics
./scripts/squad-orchestrator/card-manager.sh stats
```

### 3. Monitor System (Future)

```bash
# Real-time hierarchical dashboard
./scripts/squad-orchestrator/monitor-hierarchical.sh --session session-ID --watch

# Squad status
./scripts/squad-orchestrator/squad-cli.sh show squad-backend

# Communication stats
./scripts/squad-orchestrator/squad-cli.sh metrics
```

## Components

### Core Utilities

| File | Description |
|------|-------------|
| `utils/card-system.sh` | Digital card management (CRUD, status, dependencies) |
| `utils/squad-communication.sh` | Hierarchical event bus (events, messages, escalations) |
| `utils/qa-feedback-loop.sh` | Automated QA validation and correction workflow |

### Management Agents

| Agent | Role | Responsibilities |
|-------|------|------------------|
| `meta-orchestrator.md` | Supreme Coordinator | Bootstraps system, monitors all squads, handles escalations |
| `product-owner.md` | Business Value Guardian | Defines features, creates product cards |
| `tech-lead.md` | Technical Authority | Designs architecture, creates implementation cards |
| `scrum-master.md` | Process Facilitator | Coordinates engineering, removes blockers |
| `frontend-lead.md` | Frontend Leader | Leads UI development, API contract collaboration |
| `backend-lead.md` | Backend Leader | Leads API development, data layer implementation |
| `qa-lead.md` | Quality Guardian | Validates deliverables, approves/rejects cards |

### Bootstrap & CLI

| Tool | Purpose |
|------|---------|
| `meta-squad-bootstrap.sh` | Initialize hierarchical system from config |
| `card-manager.sh` | CLI for card management |
| `meta-squad-config.json` | Configuration example |

## Card System

### Card Structure

Cards are the fundamental unit of work, flowing through squads:

```json
{
  "id": "CARD-0042",
  "title": "Implement JWT Authentication",
  "type": "feature",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "created_by_squad": "squad-arquitetura",
  "assigned_to_squad": "squad-backend",
  "parent_card": "CARD-0040",
  "children_cards": ["CARD-0043"],
  "dependencies": ["CARD-0041"],
  "acceptance_criteria": [
    "JWT tokens generated on login",
    "Tokens validated on protected endpoints"
  ],
  "metrics": {
    "qa_cycles": 0,
    "cycle_time": 0
  }
}
```

### Card Flow

1. **Product Squad** creates feature card
2. **Architecture Squad** receives card, designs solution, creates implementation cards
3. **Engineering Squad** receives implementation cards, splits into Frontend/Backend cards
4. **Frontend/Backend Sub-Squads** develop in parallel, coordinate on APIs
5. **QA Squad** validates:
   - **PASS**: Card marked DONE
   - **FAIL**: Correction card created → Back to Engineering (cycle count++)
   - **Max cycles exceeded**: Escalate to Tech Lead

### Card States

- `TODO`: Ready for work
- `IN_PROGRESS`: Actively being worked on
- `IN_REVIEW`: Submitted for QA
- `DONE`: Completed and approved
- `BLOCKED`: Cannot proceed (dependency, clarity, resource)

## QA Feedback Loop

Automatic quality validation with correction cycles:

```
Engineering → Submit to QA
                 ↓
            QA Validates
                 ↓
         ┌───────┴───────┐
         ↓               ↓
    PASS (DONE)      FAIL
                         ↓
                 Create Correction Card
                         ↓
                 Route to Engineering
                         ↓
                 Increment QA Cycle
                         ↓
             ┌───────────┴──────────┐
             ↓                      ↓
        Cycle ≤ 3              Cycle > 3
             ↓                      ↓
    Re-submit to QA      Escalate to Tech Lead
```

**Key Features:**
- Max 3 QA cycles per card
- Automatic correction card creation
- Original developer auto-assigned
- Escalation on repeated failures
- QA metrics tracked

## Communication System

### Communication Channels

1. **Parent → Child**: Meta-squad assigns work to Product squad
2. **Child → Parent**: Engineering escalates blocker to Meta-squad
3. **Sibling**: Frontend requests API from Backend
4. **Escalation**: Any squad → Meta-squad or parent squad
5. **Broadcast**: Meta-squad announces to all squads

### Example: Frontend ↔ Backend Collaboration

```bash
# Backend: API ready event
comm_publish_event "api_ready" "squad-backend" "squad-frontend" "high" \
  '{"endpoint": "/api/auth/login", "spec_url": "docs/api-specs/auth.yaml"}'

# Frontend: Request API change
comm_send_message "squad-frontend" "squad-backend" "api_change_request" \
  "Please add user avatar URL to login response"
```

## Configuration

### meta-squad-config.json

Complete project configuration:

```json
{
  "project": {
    "name": "SuperCore v2.0",
    "type": "fintech-platform",
    "stack": {
      "backend": ["Go", "Python"],
      "frontend": ["React", "TypeScript"]
    }
  },
  "specifications": {
    "architecture_doc": "docs/ARCHITECTURE.md",
    "functional_spec": "docs/FUNCTIONAL_SPEC.md"
  },
  "squads": {
    "meta": { "agent": "meta-orchestrator" },
    "produto": { "agents": ["product-owner"] },
    "arquitetura": { "agents": ["tech-lead"] },
    "engenharia": {
      "manager": "scrum-master",
      "sub_squads": {
        "frontend": { "lead": "frontend-lead" },
        "backend": { "lead": "backend-lead" }
      }
    },
    "qa": { "agents": ["qa-lead"] }
  },
  "workflow": {
    "sprint_duration_days": 10,
    "max_qa_retry_cycles": 3
  }
}
```

See `meta-squad-config.json` for complete example.

## Usage Examples

### Example 1: Bootstrap New Project

```bash
# 1. Create configuration
cat > my-project.json <<EOF
{
  "project": {
    "name": "My SaaS Platform",
    "type": "saas",
    "stack": {"backend": ["Go"], "frontend": ["React"]}
  },
  "specifications": {
    "backlog": "docs/backlog.md"
  },
  "squads": {
    "meta": {"agent": "meta-orchestrator"},
    "produto": {"agents": ["product-owner"]},
    "arquitetura": {"agents": ["tech-lead"]},
    "engenharia": {
      "manager": "scrum-master",
      "sub_squads": {
        "frontend": {"lead": "frontend-lead"},
        "backend": {"lead": "backend-lead"}
      }
    },
    "qa": {"agents": ["qa-lead"]}
  },
  "workflow": {
    "sprint_duration_days": 14,
    "max_qa_retry_cycles": 3
  }
}
EOF

# 2. Bootstrap
./scripts/squad-orchestrator/meta-squad-bootstrap.sh my-project.json

# 3. Verify
./scripts/squad-orchestrator/card-manager.sh stats
```

### Example 2: Create Feature Card

```bash
# Interactive creation
./scripts/squad-orchestrator/card-manager.sh create

# Follow prompts:
# Title: User Authentication System
# Type: feature
# Priority: CRITICAL
# Created by: squad-produto
# Assigned to: squad-arquitetura
# Description: Implement secure login with JWT
```

### Example 3: Track Card Progress

```bash
# List cards in progress
./scripts/squad-orchestrator/card-manager.sh list --status IN_PROGRESS

# Show specific card
./scripts/squad-orchestrator/card-manager.sh show CARD-0042

# View card history
./scripts/squad-orchestrator/card-manager.sh history CARD-0042

# Check dependencies
./scripts/squad-orchestrator/card-manager.sh deps CARD-0042
```

## Migration from v1.0

### Compatibility

- **v2.0 is opt-in**: v1.0 scripts still work
- **Gradual migration**: Run both versions in parallel
- **No breaking changes** for v1.0 users

### Migration Steps

1. **Review v1.0 configuration**: `squad-definitions.json`
2. **Create v2.0 config**: Map to `meta-squad-config.json`
3. **Test with dry-run**: Validate configuration
4. **Bootstrap small project**: Test hierarchical system
5. **Compare results**: Verify behavior
6. **Migrate fully**: Switch when confident

## Architecture Documentation

For detailed architecture, see:
- **[HIERARCHICAL_ARCHITECTURE.md](./HIERARCHICAL_ARCHITECTURE.md)**: Complete v2.0 architecture guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Original v1.0 architecture
- **[QUICKSTART.md](./QUICKSTART.md)**: Quick start guide

## Best Practices

### Squad Organization
- Keep squads focused (single responsibility)
- Clear input/output contracts
- Minimize cross-squad dependencies
- Prefer async communication

### Card Management
- Write clear acceptance criteria (testable)
- Break down large cards (< 5 days work)
- Link related cards (parent/child)
- Track dependencies explicitly

### Quality Assurance
- Automate QA where possible
- Document test cases in cards
- Track quality metrics
- Learn from QA failures

## Troubleshooting

### Cards Not Flowing

**Problem:** Cards stuck in one squad

**Solution:**
```bash
# Check card details
./scripts/squad-orchestrator/card-manager.sh show CARD-ID

# Check dependencies
./scripts/squad-orchestrator/card-manager.sh deps CARD-ID

# Unblock if necessary
./scripts/squad-orchestrator/card-manager.sh move CARD-ID --to TODO
```

### QA Loop Issues

**Problem:** Card keeps failing QA

**Solution:**
```bash
# View QA history
./scripts/squad-orchestrator/card-manager.sh history CARD-ID

# If > 3 cycles, escalate manually
# Review QA reports in state/qa/reports/
```

## Metrics and Reporting

### Card Metrics
```bash
./scripts/squad-orchestrator/card-manager.sh stats
```

Shows:
- Total cards by status
- Cards by type (feature, bugfix, etc.)
- Cards by squad
- Overall progress

### QA Metrics (Future)
- First-time pass rate
- Average QA cycles per card
- Defect density
- Escaped defects

## Roadmap

### Implemented ✅
- Hierarchical squad structure
- Digital card system
- QA feedback loop
- Communication system
- 7 management agents
- Bootstrap tooling
- Card manager CLI

### In Progress 🔄
- Launch hierarchical squads
- Monitoring dashboard
- Squad CLI
- Integration with Claude Code

### Planned 📋
- Visual dashboard (web UI)
- Metrics and analytics
- Slack/Discord notifications
- GitHub integration
- Custom workflow rules
- Performance optimizations

## Support

- **Documentation**: `HIERARCHICAL_ARCHITECTURE.md`
- **Issues**: GitHub Issues
- **Examples**: `meta-squad-config.json`

## License

MIT License - see LICENSE file for details

## Changelog

### v2.0.0 (2025-01-20)
- Hierarchical squad architecture
- Digital card system with Kanban workflow
- QA feedback loop with auto-correction
- Multi-level communication system
- 7 specialized management agents
- Meta-squad bootstrap system
- Card manager CLI

### v1.0.0 (2025-01-20)
- Initial release
- Parallel squad execution
- Event-driven communication
- Real-time monitoring

---

**Built with care for complex software development projects**
