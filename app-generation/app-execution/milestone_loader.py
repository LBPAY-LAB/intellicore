"""
Milestone Configuration Loader

Loads milestone configurations from meta-squad-config.json and creates
ProgressContext instances with proper milestone and deliverable setup.
"""

import json
from pathlib import Path
from typing import Dict, Any, Optional
from progress_context import (
    ProgressContext, MilestoneContext, Deliverable, SubTask,
    create_progress_context_for_card
)

SCRIPT_DIR = Path(__file__).parent
CONFIG_FILE = SCRIPT_DIR / "meta-squad-config.json"


def load_meta_squad_config() -> Dict[str, Any]:
    """Load meta-squad-config.json"""
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_milestone_for_squad(squad: str) -> Optional[Dict[str, Any]]:
    """
    Get milestone configuration for a given squad

    Args:
        squad: Squad name (produto, arquitetura, engenharia, qa, deploy)

    Returns:
        Milestone config dict, or None if not found
    """
    config = load_meta_squad_config()
    milestones = config.get("workflow", {}).get("milestones", [])

    # Find milestone where this squad is primary
    for milestone in milestones:
        if squad in milestone.get("squads", []):
            return milestone

    return None


def create_milestone_context_from_config(milestone_config: Dict[str, Any], squad: str) -> MilestoneContext:
    """
    Create MilestoneContext from config dictionary

    Args:
        milestone_config: Milestone configuration from meta-squad-config.json
        squad: Squad name (for output paths)

    Returns:
        MilestoneContext with deliverables and sub-tasks
    """
    milestone = MilestoneContext(
        phase=milestone_config["phase"],
        name=milestone_config["name"],
        progress_range=(milestone_config["progress_range"][0], milestone_config["progress_range"][1]),
        squads=milestone_config["squads"]
    )

    # Create deliverables from config
    for deliv_name in milestone_config.get("deliverables", []):
        deliverable = Deliverable(
            name=deliv_name,
            description=milestone_config.get("description", ""),
            output_path=f"artefactos_implementacao/{squad}/"
        )

        # Infer sub-tasks based on deliverable type
        sub_tasks = infer_sub_tasks_for_deliverable(deliv_name, squad)
        deliverable.sub_tasks = sub_tasks

        milestone.deliverables.append(deliverable)

    return milestone


def infer_sub_tasks_for_deliverable(deliverable_name: str, squad: str) -> list[SubTask]:
    """
    Infer sub-tasks for a deliverable based on its name and squad

    This provides a default set of sub-tasks that can be tracked automatically.

    Args:
        deliverable_name: Name of the deliverable
        squad: Squad name

    Returns:
        List of SubTask instances
    """
    deliverable_lower = deliverable_name.lower()

    # Squad-specific sub-task patterns
    if squad == "produto":
        if "card" in deliverable_lower or "backlog" in deliverable_lower:
            return [
                SubTask(name="Analisar requisitos funcionais"),
                SubTask(name="Criar cards com critérios de aceitação"),
                SubTask(name="Priorizar backlog"),
                SubTask(name="Validar com PO")
            ]
        elif "wireframe" in deliverable_lower or "ux" in deliverable_lower:
            return [
                SubTask(name="Mapear user flows"),
                SubTask(name="Criar wireframes"),
                SubTask(name="Definir design system"),
                SubTask(name="Validar acessibilidade")
            ]

    elif squad == "arquitetura":
        if "adr" in deliverable_lower:
            return [
                SubTask(name="Analisar card de produto"),
                SubTask(name="Avaliar opções técnicas"),
                SubTask(name="Escrever ADR"),
                SubTask(name="Revisar com Tech Lead")
            ]
        elif "schema" in deliverable_lower or "database" in deliverable_lower:
            return [
                SubTask(name="Analisar entidades"),
                SubTask(name="Criar ERD diagram"),
                SubTask(name="Escrever migrations"),
                SubTask(name="Validar indexes e performance")
            ]
        elif "api" in deliverable_lower:
            return [
                SubTask(name="Definir endpoints"),
                SubTask(name="Escrever OpenAPI spec"),
                SubTask(name="Definir modelos de request/response"),
                SubTask(name="Revisar contratos")
            ]

    elif squad == "engenharia":
        if "postgresql" in deliverable_lower or "migration" in deliverable_lower:
            return [
                SubTask(name="Configurar PostgreSQL"),
                SubTask(name="Executar migrations"),
                SubTask(name="Validar schemas"),
                SubTask(name="Testar queries")
            ]
        elif "rag" in deliverable_lower:
            return [
                SubTask(name="Configurar document processing"),
                SubTask(name="Implementar chunking strategy"),
                SubTask(name="Setup embedding generation"),
                SubTask(name="Testar retrieval")
            ]
        elif "api" in deliverable_lower or "backend" in deliverable_lower:
            return [
                SubTask(name="Implementar endpoints"),
                SubTask(name="Adicionar validação de entrada"),
                SubTask(name="Implementar lógica de negócio"),
                SubTask(name="Escrever testes (unit + integration)"),
                SubTask(name="Documentar API")
            ]
        elif "frontend" in deliverable_lower or "componente" in deliverable_lower:
            return [
                SubTask(name="Criar componentes React"),
                SubTask(name="Implementar integração com API"),
                SubTask(name="Adicionar testes (unit + E2E)"),
                SubTask(name="Validar responsividade")
            ]

    elif squad == "qa":
        if "test" in deliverable_lower:
            return [
                SubTask(name="Executar testes unit"),
                SubTask(name="Executar testes integration"),
                SubTask(name="Executar testes E2E"),
                SubTask(name="Validar cobertura ≥80%")
            ]
        elif "security" in deliverable_lower:
            return [
                SubTask(name="Executar security scans (Trivy, TruffleHog)"),
                SubTask(name="Validar autenticação/autorização"),
                SubTask(name="Verificar vulnerabilidades conhecidas"),
                SubTask(name="Aprovar ou rejeitar card")
            ]

    elif squad == "deploy":
        if "terraform" in deliverable_lower or "iac" in deliverable_lower:
            return [
                SubTask(name="Criar módulos Terraform"),
                SubTask(name="Configurar ambientes (QA/Staging/Prod)"),
                SubTask(name="Executar terraform plan"),
                SubTask(name="Validar com Tech Lead")
            ]
        elif "ci/cd" in deliverable_lower or "pipeline" in deliverable_lower:
            return [
                SubTask(name="Criar GitHub Actions workflow"),
                SubTask(name="Configurar security scans"),
                SubTask(name="Configurar deploy automático (QA)"),
                SubTask(name="Testar pipeline")
            ]

    # Default generic sub-tasks
    return [
        SubTask(name="Analisar requisitos"),
        SubTask(name="Implementar deliverable"),
        SubTask(name="Testar implementação"),
        SubTask(name="Documentar e validar")
    ]


def create_progress_context_for_card_with_config(card: Dict[str, Any]) -> ProgressContext:
    """
    Create ProgressContext for a card, loading milestone config from meta-squad-config.json

    Args:
        card: Card dictionary from backlog

    Returns:
        ProgressContext with milestone, deliverables, and sub-tasks configured
    """
    squad = card.get("squad", "unknown")

    # Load milestone config for this squad
    milestone_config = get_milestone_for_squad(squad)

    if not milestone_config:
        # Fallback: create generic milestone
        milestone = MilestoneContext(
            phase=1,
            name="Generic Implementation",
            progress_range=(0, 100),
            squads=[squad]
        )
    else:
        milestone = create_milestone_context_from_config(milestone_config, squad)

    # Create progress context
    context = ProgressContext(
        card_id=card["card_id"],
        squad=squad,
        agent=card.get("agent", "unknown"),
        milestone=milestone,
        current_step="Initializing..."
    )

    return context


# Example usage
if __name__ == "__main__":
    # Test loading milestone for arquitetura squad
    mock_card = {
        "card_id": "ARQ-001",
        "squad": "arquitetura",
        "agent": "tech-lead",
        "title": "Design PostgreSQL schema for Oráculo"
    }

    context = create_progress_context_for_card_with_config(mock_card)

    print("Created ProgressContext:")
    print(f"  Milestone: {context.milestone.name} (Phase {context.milestone.phase})")
    print(f"  Progress Range: {context.milestone.min_progress}%-{context.milestone.max_progress}%")
    print(f"  Deliverables: {context.milestone.total_deliverables}")

    for i, deliv in enumerate(context.milestone.deliverables):
        print(f"\n  Deliverable {i+1}: {deliv.name}")
        print(f"    Sub-tasks: {deliv.total_sub_tasks}")
        for st in deliv.sub_tasks:
            print(f"      - {st.name}")

    print("\n" + "="*60)
    print(context.get_detailed_status_message())
