"""
Squad Planner Agent - Dynamic Squad Allocation

Analyzes project documentation (requisitos, arquitetura, stack) and dynamically
allocates agents, skills, and technologies to each squad based on actual project needs.

NEW: Can create custom agents and skills on-demand, and import from external sources.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

# Import resource creation modules
try:
    from agent_creator import AgentCreator
    from skill_generator import SkillGenerator
    from external_resource_finder import ExternalResourceFinder
    RESOURCE_CREATION_ENABLED = True
except ImportError:
    print("⚠️ Resource creation modules not available - using static config only")
    RESOURCE_CREATION_ENABLED = False


class SquadPlanner:
    """
    Intelligent squad planner that analyzes documentation and allocates resources
    """

    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        # Navigate to app-generation/ and find documentation-base/
        app_generation_dir = base_dir.parent.parent  # From backend/ -> execution-portal/ -> app-generation/
        self.doc_base_dir = app_generation_dir / "documentation-base"
        self.config_path = app_generation_dir / "app-execution" / "meta-squad-config.json"

        # Initialize resource creation modules (if available)
        if RESOURCE_CREATION_ENABLED:
            self.agent_creator = AgentCreator(base_dir)
            self.skill_generator = SkillGenerator(base_dir)
            self.resource_finder = ExternalResourceFinder(base_dir)
            print("✅ SquadPlanner: Resource creation enabled (agents, skills, external search)")
        else:
            self.agent_creator = None
            self.skill_generator = None
            self.resource_finder = None
            print("ℹ️ SquadPlanner: Static configuration mode")

    def analyze_and_allocate(self, session_id: str = None) -> List[Dict[str, Any]]:
        """
        Main entry point: analyze docs and create dynamic squad allocations
        """
        print("\n🔍 Squad Planner: Iniciando análise de documentação...")
        print(f"   📂 Doc base dir: {self.doc_base_dir}")
        print(f"   📄 Config path: {self.config_path}")

        # 1. Read documentation
        requirements = self._read_requirements()
        architecture = self._read_architecture()
        stack = self._read_stack()

        print(f"   📖 Requirements loaded: {len(requirements)} chars")
        print(f"   📖 Architecture loaded: {len(architecture)} chars")
        print(f"   📖 Stack loaded: {len(stack)} chars")

        # 2. Analyze scope
        scope = self._analyze_scope(requirements, architecture, stack)
        print(f"   ✅ Escopo identificado:")
        print(f"      - Fase: {scope['current_phase']}")
        print(f"      - Tecnologias: {', '.join(scope['technologies'][:5])}...")
        print(f"      - Complexidade: {scope['complexity']}")

        # 3. Load base config (fallback structure)
        base_config = self._load_base_config()

        # 4. Check for specialized needs and create agents/skills if necessary
        if RESOURCE_CREATION_ENABLED and self.agent_creator:
            self._create_specialized_resources(scope)

        # 5. Allocate squads dynamically
        squad_structures = []

        for squad_id in ["management", "produto", "arquitetura", "engenharia", "qa", "deploy"]:
            structure = self._allocate_squad(
                squad_id=squad_id,
                scope=scope,
                base_config=base_config.get("squads", {}).get(squad_id, {}),
                session_id=session_id
            )
            squad_structures.append(structure)
            print(f"   ✅ {squad_id}: {len(structure['agents'])} agentes alocados")

        print(f"\n✅ Squad Planner: {len(squad_structures)} squads configuradas dinamicamente\n")

        return squad_structures

    def _read_requirements(self) -> str:
        """Read requisitos_funcionais_v2.0.md"""
        req_file = self.doc_base_dir / "requisitos_funcionais_v2.0.md"
        if req_file.exists():
            return req_file.read_text(encoding='utf-8')
        return ""

    def _read_architecture(self) -> str:
        """Read arquitetura_supercore_v2.0.md"""
        arch_file = self.doc_base_dir / "arquitetura_supercore_v2.0.md"
        if arch_file.exists():
            return arch_file.read_text(encoding='utf-8')
        return ""

    def _read_stack(self) -> str:
        """Read stack_supercore_v2.0.md"""
        stack_file = self.doc_base_dir / "stack_supercore_v2.0.md"
        if stack_file.exists():
            return stack_file.read_text(encoding='utf-8')
        return ""

    def _load_base_config(self) -> Dict:
        """Load meta-squad-config.json as fallback"""
        if self.config_path.exists():
            with open(self.config_path, 'r') as f:
                return json.load(f)
        return {}

    def _analyze_scope(self, requirements: str, architecture: str, stack: str) -> Dict[str, Any]:
        """
        Analyze documentation and extract project scope
        """
        # Identify current phase
        phase = 1
        if "Fase 1" in requirements or "RF001" in requirements:
            phase = 1
        elif "Fase 2" in requirements:
            phase = 2
        elif "Fase 3" in requirements:
            phase = 3
        elif "Fase 4" in requirements:
            phase = 4

        # Extract technologies
        technologies = []
        tech_patterns = [
            r'\b(PostgreSQL|Redis|Go|Python|React|TypeScript|Next\.js|FastAPI|Gin)\b',
            r'\b(Qdrant|NebulaGraph|Kafka|RabbitMQ|MongoDB|Docker|Kubernetes)\b',
            r'\b(OpenTelemetry|Grafana|Prometheus|AWS|Azure|GCP|Terraform)\b'
        ]

        for pattern in tech_patterns:
            matches = re.findall(pattern, stack, re.IGNORECASE)
            technologies.extend([m for m in matches if m not in technologies])

        # Count requirements (RF001-RF062)
        rf_matches = re.findall(r'\bRF\d{3}\b', requirements)
        total_requirements = len(set(rf_matches))

        # Estimate complexity
        complexity = "LOW"
        if total_requirements > 30:
            complexity = "HIGH"
        elif total_requirements > 15:
            complexity = "MEDIUM"

        # Identify components
        components = []
        if "Oráculo" in architecture or "Oracle" in architecture:
            components.append("Oracle")
        if "Objetos Dinâmicos" in architecture or "Object Definitions" in architecture:
            components.append("Objects")
        if "Agentes IA" in architecture or "AI Agents" in architecture:
            components.append("AI Agents")
        if "MCP" in architecture:
            components.append("MCPs")
        if "RAG" in architecture or "Vector DB" in architecture:
            components.append("RAG")
        if "Graph DB" in architecture or "NebulaGraph" in architecture:
            components.append("Graph DB")

        return {
            "current_phase": phase,
            "technologies": technologies,
            "complexity": complexity,
            "total_requirements": total_requirements,
            "components": components
        }

    def _allocate_squad(
        self,
        squad_id: str,
        scope: Dict[str, Any],
        base_config: Dict[str, Any],
        session_id: str = None
    ) -> Dict[str, Any]:
        """
        Allocate agents and skills to a specific squad based on project scope
        """
        # Extract agents from base config
        agents_list = []
        if "agents" in base_config:
            agents_list = base_config["agents"]
        elif "responsibilities" in base_config and isinstance(base_config["responsibilities"], dict):
            agents_list = list(base_config["responsibilities"].keys())

        # Dynamic agent allocation based on scope
        allocated_agents = []
        skills = []
        justification_parts = []

        if squad_id == "management":
            # Management squad: always same structure
            allocated_agents = agents_list
            skills = ["Backlog Management", "Dependency Tracking", "Sprint Coordination"]
            justification_parts.append("Cross-squad management requires full coordination team")

        elif squad_id == "produto":
            # Produto squad: allocate based on complexity
            allocated_agents = agents_list  # Always: product-owner, business-analyst, ux-designer
            skills = ["Requirements Analysis", "User Stories", "UX Design", "Backlog Prioritization"]
            if scope["complexity"] == "HIGH":
                justification_parts.append(f"High complexity ({scope['total_requirements']} requirements) requires full product team")
            else:
                justification_parts.append(f"Standard product team for {scope['total_requirements']} requirements")

        elif squad_id == "arquitetura":
            # Arquitetura squad: allocate based on components
            allocated_agents = agents_list  # tech-lead, solution-architect, security-architect
            skills = ["Solution Architecture", "Security Architecture", "ADRs", "API Design"]

            if "RAG" in scope["components"] or "Graph DB" in scope["components"]:
                justification_parts.append("Complex data architecture (RAG + Graph DB) requires full architecture team")
            elif "MCPs" in scope["components"]:
                justification_parts.append("MCP-based architecture requires solution architect guidance")
            else:
                justification_parts.append("Standard architecture team for project scope")

        elif squad_id == "engenharia":
            # Engenharia squad: allocate based on technologies and phase
            allocated_agents = []
            skills = []

            # Analyze technologies
            has_backend = any(t in scope["technologies"] for t in ["Go", "Python", "FastAPI", "PostgreSQL"])
            has_frontend = any(t in scope["technologies"] for t in ["React", "TypeScript", "Next.js"])
            has_data = any(t in scope["technologies"] for t in ["PostgreSQL", "Qdrant", "NebulaGraph"])

            if has_backend:
                allocated_agents.extend(["backend-lead", "golang-developer", "python-developer"])
                skills.extend(["Go", "Python", "FastAPI", "REST APIs", "GraphQL"])

            if has_frontend:
                allocated_agents.extend(["frontend-lead", "react-developer"])
                skills.extend(["React", "TypeScript", "Next.js", "Tailwind CSS"])

            if has_data:
                allocated_agents.extend(["data-lead", "data-engineer", "rag-specialist", "vector-db-specialist"])
                skills.extend(["PostgreSQL", "RAG Pipelines", "Qdrant", "Data Modeling"])

                if "NebulaGraph" in scope["technologies"]:
                    allocated_agents.append("graph-db-specialist")
                    skills.append("NebulaGraph")

            # Fullstack integrator for complex projects
            if scope["complexity"] in ["MEDIUM", "HIGH"]:
                allocated_agents.append("fullstack-integrator")
                skills.append("End-to-End Integration")

            justification_parts.append(f"Allocated {len(allocated_agents)} engineers based on stack: {', '.join(scope['technologies'][:5])}")

        elif squad_id == "qa":
            # QA squad: allocate based on complexity
            allocated_agents = agents_list  # qa-lead, test-engineer, security-auditor
            skills = ["Unit Testing", "Integration Testing", "E2E Testing", "Security Audits", "Performance Testing"]

            if scope["complexity"] == "HIGH":
                justification_parts.append("High complexity requires full QA team with security auditor")
            else:
                justification_parts.append("Standard QA team for comprehensive testing")

        elif squad_id == "deploy":
            # Deploy squad: allocate based on phase and infrastructure
            allocated_agents = agents_list  # deploy-lead
            skills = ["Terraform", "Kubernetes", "CI/CD", "Infrastructure as Code"]

            if scope["current_phase"] >= 3:
                skills.extend(["AWS", "Docker", "GitHub Actions"])
                justification_parts.append(f"Phase {scope['current_phase']} requires full deployment automation")
            else:
                justification_parts.append(f"Phase {scope['current_phase']}: basic deployment setup")

        # Build final structure
        return {
            "squad_id": squad_id,
            "squad_name": squad_id.replace("_", " ").title(),
            "agents": json.dumps([{"name": agent, "role": agent} for agent in allocated_agents]),
            "skills": json.dumps(skills),
            "justification": " | ".join(justification_parts) if justification_parts else f"Standard {squad_id} squad configuration",
            "scope_summary": f"Phase {scope['current_phase']}: {', '.join(scope['components'][:3])}",
            "technologies": json.dumps(scope["technologies"][:10]),  # Top 10
            "allocated_by": "squad-planner",
            "session_id": session_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

    def _create_specialized_resources(self, scope: Dict[str, Any]):
        """
        Analyze scope and create specialized agents/skills if needed

        This method:
        1. Detects needs for specialized agents (ML, Blockchain, IoT, etc.)
        2. Creates custom agents dynamically
        3. Generates custom skills
        4. Searches external sources for reusable resources
        """
        print("\n🔍 Analyzing project needs for specialized resources...")

        created_agents = []
        created_skills = []
        imported_resources = []

        # 1. Check for specialized agent needs
        specialties = [
            "ml-engineer",
            "blockchain-developer",
            "iot-specialist",
            "data-scientist",
            "mobile-developer",
            "devops-engineer",
            "security-specialist"
        ]

        for specialty in specialties:
            if self.agent_creator.needs_specialist(scope, specialty):
                print(f"\n   🎯 Detected need for: {specialty}")

                # Get agent suggestion
                suggestion = self.agent_creator.suggest_agent_for_need(specialty, scope)

                # Create agent
                agent = self.agent_creator.create_agent(
                    name=specialty,
                    role=suggestion["role"],
                    squad=suggestion["squad"],
                    skills=suggestion["skills"],
                    description=suggestion["description"],
                    justification=f"Project scope requires {specialty.replace('-', ' ')} expertise",
                    technologies=suggestion.get("technologies", [])
                )

                created_agents.append(agent)

        # 2. Check for custom skill needs
        skill_suggestions = self.skill_generator.get_skill_suggestions(scope)

        for suggestion in skill_suggestions:
            print(f"\n   💡 Creating skill: {suggestion['name']}")

            skill_file = self.skill_generator.generate_skill(
                skill_name=suggestion["name"],
                context=scope,
                technologies=suggestion["technologies"],
                skill_type=suggestion["type"]
            )

            created_skills.append({
                "name": suggestion["name"],
                "type": suggestion["type"],
                "file": str(skill_file)
            })

        # 3. Search external sources for reusable resources
        if self.resource_finder:
            # Check for MCP server needs
            mcp_needs = self._detect_mcp_needs(scope)

            for need in mcp_needs:
                print(f"\n   🌐 Searching external sources for: {need}")

                best_match = self.resource_finder.find_best_match(
                    need=need,
                    technologies=scope.get("technologies", []),
                    search_all_sources=True
                )

                if best_match:
                    imported_resources.append(best_match)
                    print(f"      ✅ Found: {best_match.get('name', 'unknown')}")

        # Summary
        print(f"\n📊 Resource Creation Summary:")
        print(f"   🤖 Agents created: {len(created_agents)}")
        print(f"   💡 Skills created: {len(created_skills)}")
        print(f"   🌐 External resources found: {len(imported_resources)}")

        if created_agents:
            print(f"\n   Created Agents:")
            for agent in created_agents:
                print(f"      • {agent['name']} ({agent['role']})")

        if created_skills:
            print(f"\n   Created Skills:")
            for skill in created_skills:
                print(f"      • {skill['name']} ({skill['type']})")

        if imported_resources:
            print(f"\n   External Resources:")
            for resource in imported_resources:
                print(f"      • {resource.get('name', 'unknown')} from {resource.get('source', 'unknown')}")

    def _detect_mcp_needs(self, scope: Dict[str, Any]) -> List[str]:
        """
        Detect what MCP servers might be needed based on project scope

        Returns:
            List of MCP capability needs
        """
        needs = []

        # Check for database needs
        db_techs = ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite"]
        if any(tech in scope.get("technologies", []) for tech in db_techs):
            needs.append("database access and querying")

        # Check for web/API needs
        if "API" in scope.get("components", []) or "REST" in scope.get("technologies", []):
            needs.append("web fetching and API calls")

        # Check for browser automation needs
        if any(keyword in str(scope).lower() for keyword in ["scraping", "automation", "selenium", "puppeteer"]):
            needs.append("browser automation")

        # Check for file operations
        if any(keyword in str(scope).lower() for keyword in ["file processing", "document", "upload", "storage"]):
            needs.append("filesystem operations")

        return needs


# Standalone test
if __name__ == "__main__":
    base_dir = Path(__file__).parent  # backend/
    planner = SquadPlanner(base_dir)
    structures = planner.analyze_and_allocate()

    print("\n" + "=" * 80)
    print("SQUAD ALLOCATION SUMMARY")
    print("=" * 80)

    for struct in structures:
        print(f"\n{struct['squad_name']}:")
        print(f"  Agents: {len(json.loads(struct['agents']))}")
        print(f"  Skills: {', '.join(json.loads(struct['skills'])[:5])}...")
        print(f"  Justification: {struct['justification']}")
