"""
Agent Creator - Dynamic Agent and Skill Generation

Creates new agents and skills dynamically based on project needs.
Can generate from scratch or import from external sources.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime


class AgentCreator:
    """
    Creates agents dynamically based on project requirements
    """

    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        app_generation_dir = base_dir.parent.parent
        self.agents_dir = app_generation_dir.parent / ".claude" / "agents"
        self.agents_dir.mkdir(parents=True, exist_ok=True)

    def create_agent(
        self,
        name: str,
        role: str,
        squad: str,
        skills: List[str],
        description: str,
        justification: str,
        technologies: List[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new agent dynamically

        Args:
            name: Agent name (e.g., 'ml-engineer')
            role: Agent role (e.g., 'Machine Learning Engineer')
            squad: Parent squad (e.g., 'engenharia')
            skills: List of skills (e.g., ['TensorFlow', 'Model Training'])
            description: Agent description
            justification: Why this agent was created
            technologies: Technologies this agent works with

        Returns:
            Agent configuration dictionary
        """
        print(f"\n🤖 AgentCreator: Creating agent '{name}'...")

        agent_config = {
            "name": name,
            "role": role,
            "squad": squad,
            "skills": skills,
            "description": description,
            "technologies": technologies or [],
            "auto_generated": True,
            "created_by": "agent-creator",
            "creation_justification": justification,
            "created_at": datetime.utcnow().isoformat(),
            "permissions": self._get_default_permissions(squad)
        }

        # Save agent configuration
        self._save_agent_config(name, agent_config)

        print(f"   ✅ Agent '{name}' created successfully")
        print(f"      Role: {role}")
        print(f"      Squad: {squad}")
        print(f"      Skills: {', '.join(skills[:3])}{'...' if len(skills) > 3 else ''}")

        return agent_config

    def _save_agent_config(self, name: str, config: Dict[str, Any]):
        """Save agent configuration to file"""
        agent_file = self.agents_dir / f"{name}.json"
        with open(agent_file, 'w') as f:
            json.dump(config, f, indent=2)

    def _get_default_permissions(self, squad: str) -> Dict[str, Any]:
        """Get default permissions based on squad"""
        base_permissions = {
            "can_read_files": True,
            "can_write_files": True,
            "can_run_commands": True,
            "can_create_cards": False,
            "can_update_tasks": True
        }

        squad_permissions = {
            "produto": {
                "can_create_cards": True,
                "allowed_paths": ["/app-artefacts/produto/"]
            },
            "arquitetura": {
                "can_create_cards": True,
                "allowed_paths": ["/app-artefacts/arquitetura/"]
            },
            "engenharia": {
                "can_create_cards": True,
                "can_commit_changes": True,
                "allowed_paths": [
                    "/app-artefacts/engenharia/",
                    "/app-solution/backend/",
                    "/app-solution/frontend/"
                ]
            },
            "qa": {
                "can_approve_cards": True,
                "can_reject_cards": True,
                "allowed_paths": ["/app-artefacts/qa/", "/tests/"]
            },
            "deploy": {
                "can_deploy": True,
                "allowed_paths": ["/app-artefacts/deploy/", "/infrastructure/"]
            }
        }

        return {**base_permissions, **squad_permissions.get(squad, {})}

    def needs_specialist(self, scope: Dict[str, Any], specialty: str) -> bool:
        """
        Determine if a specialist is needed based on project scope

        Args:
            scope: Project scope (technologies, components, complexity)
            specialty: Type of specialist (e.g., 'ml-engineer', 'blockchain-dev')

        Returns:
            True if specialist is needed
        """
        specialty_indicators = {
            "ml-engineer": [
                "Machine Learning", "TensorFlow", "PyTorch", "Keras",
                "Neural Network", "Deep Learning", "Model Training"
            ],
            "blockchain-developer": [
                "Blockchain", "Solidity", "Smart Contract", "Web3",
                "Ethereum", "DeFi", "NFT"
            ],
            "iot-specialist": [
                "IoT", "MQTT", "CoAP", "Edge Computing",
                "Embedded Systems", "Sensors"
            ],
            "data-scientist": [
                "Data Science", "Pandas", "NumPy", "Jupyter",
                "Statistical Analysis", "Data Visualization"
            ],
            "mobile-developer": [
                "React Native", "Flutter", "Swift", "Kotlin",
                "Mobile App", "iOS", "Android"
            ],
            "devops-engineer": [
                "Kubernetes", "Docker", "Terraform", "CI/CD",
                "AWS", "Azure", "GCP", "Infrastructure"
            ],
            "security-specialist": [
                "Security", "Penetration Testing", "OWASP",
                "Vulnerability", "Encryption", "Auth"
            ]
        }

        indicators = specialty_indicators.get(specialty, [])

        # Check technologies
        for tech in scope.get("technologies", []):
            if any(indicator.lower() in tech.lower() for indicator in indicators):
                return True

        # Check components
        for component in scope.get("components", []):
            if any(indicator.lower() in component.lower() for indicator in indicators):
                return True

        return False

    def suggest_agent_for_need(self, specialty: str, scope: Dict[str, Any]) -> Dict[str, Any]:
        """
        Suggest agent configuration based on specialty and scope

        Returns:
            Suggested agent configuration
        """
        agent_templates = {
            "ml-engineer": {
                "role": "Machine Learning Engineer",
                "squad": "engenharia",
                "skills": [
                    "TensorFlow", "PyTorch", "Model Training",
                    "Feature Engineering", "Hyperparameter Tuning",
                    "Model Evaluation", "MLOps"
                ],
                "description": "Specialist in ML model development, training, and deployment"
            },
            "blockchain-developer": {
                "role": "Blockchain Developer",
                "squad": "engenharia",
                "skills": [
                    "Solidity", "Smart Contracts", "Web3.js",
                    "Hardhat", "Truffle", "DeFi Protocols"
                ],
                "description": "Specialist in blockchain and smart contract development"
            },
            "iot-specialist": {
                "role": "IoT Specialist",
                "squad": "engenharia",
                "skills": [
                    "MQTT", "CoAP", "Edge Computing",
                    "Embedded Systems", "Sensor Integration"
                ],
                "description": "Specialist in IoT architecture and embedded systems"
            },
            "data-scientist": {
                "role": "Data Scientist",
                "squad": "engenharia",
                "skills": [
                    "Pandas", "NumPy", "Scikit-learn",
                    "Statistical Analysis", "Data Visualization",
                    "Jupyter Notebooks"
                ],
                "description": "Specialist in data analysis and statistical modeling"
            },
            "mobile-developer": {
                "role": "Mobile Developer",
                "squad": "engenharia",
                "skills": [
                    "React Native", "Flutter", "Mobile UI/UX",
                    "App Store Deployment", "Native Modules"
                ],
                "description": "Specialist in cross-platform mobile development"
            },
            "devops-engineer": {
                "role": "DevOps Engineer",
                "squad": "deploy",
                "skills": [
                    "Kubernetes", "Docker", "Terraform",
                    "CI/CD Pipelines", "Monitoring", "GitOps"
                ],
                "description": "Specialist in infrastructure automation and deployment"
            },
            "security-specialist": {
                "role": "Security Specialist",
                "squad": "qa",
                "skills": [
                    "OWASP Top 10", "Penetration Testing",
                    "Vulnerability Assessment", "Security Audits"
                ],
                "description": "Specialist in application security and auditing"
            }
        }

        template = agent_templates.get(specialty, {
            "role": specialty.replace("-", " ").title(),
            "squad": "engenharia",
            "skills": [],
            "description": f"Specialist in {specialty}"
        })

        # Enrich with technologies from scope
        template["technologies"] = [
            tech for tech in scope.get("technologies", [])
            if any(skill.lower() in tech.lower() for skill in template["skills"])
        ]

        return template


# Standalone test
if __name__ == "__main__":
    base_dir = Path(__file__).parent
    creator = AgentCreator(base_dir)

    # Test: Create ML Engineer
    scope = {
        "technologies": ["TensorFlow", "Keras", "PostgreSQL"],
        "components": ["Neural Network", "Prediction Model"],
        "complexity": "HIGH"
    }

    if creator.needs_specialist(scope, "ml-engineer"):
        print("\n✅ ML Engineer needed!")
        suggestion = creator.suggest_agent_for_need("ml-engineer", scope)
        print(f"   Suggestion: {json.dumps(suggestion, indent=2)}")

        agent = creator.create_agent(
            name="ml-engineer",
            role=suggestion["role"],
            squad=suggestion["squad"],
            skills=suggestion["skills"],
            description=suggestion["description"],
            justification="Project requires ML model development",
            technologies=suggestion["technologies"]
        )
