"""
Skill Generator - Dynamic Skill Creation and Import

Generates custom skills based on project needs or imports from external sources.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime


class SkillGenerator:
    """
    Generates skills dynamically based on project requirements
    """

    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        app_generation_dir = base_dir.parent.parent
        self.skills_dir = app_generation_dir.parent / ".claude" / "skills"
        self.auto_generated_dir = self.skills_dir / "auto-generated"
        self.auto_generated_dir.mkdir(parents=True, exist_ok=True)

    def generate_skill(
        self,
        skill_name: str,
        context: Dict[str, Any],
        technologies: List[str],
        skill_type: str = "command"
    ) -> Path:
        """
        Generate a custom skill file

        Args:
            skill_name: Name of the skill (e.g., 'train-lstm-model')
            context: Project context (requirements, architecture)
            technologies: Technologies to use
            skill_type: Type of skill ('command', 'mcp', 'workflow')

        Returns:
            Path to generated skill file
        """
        print(f"\n💡 SkillGenerator: Creating skill '{skill_name}'...")

        skill_content = self._generate_skill_content(
            skill_name=skill_name,
            context=context,
            technologies=technologies,
            skill_type=skill_type
        )

        skill_file = self.auto_generated_dir / f"{skill_name}.json"
        with open(skill_file, 'w') as f:
            json.dump(skill_content, f, indent=2)

        print(f"   ✅ Skill '{skill_name}' created at {skill_file}")
        return skill_file

    def _generate_skill_content(
        self,
        skill_name: str,
        context: Dict[str, Any],
        technologies: List[str],
        skill_type: str
    ) -> Dict[str, Any]:
        """Generate skill content based on type"""

        base_skill = {
            "name": skill_name,
            "version": "1.0.0",
            "description": f"Auto-generated skill for {skill_name.replace('-', ' ')}",
            "auto_generated": True,
            "created_by": "skill-generator",
            "created_at": datetime.utcnow().isoformat(),
            "technologies": technologies,
            "context": {
                "project_phase": context.get("current_phase", 1),
                "complexity": context.get("complexity", "MEDIUM")
            }
        }

        if skill_type == "command":
            return {
                **base_skill,
                "type": "command",
                "command": self._generate_command(skill_name, technologies),
                "parameters": self._generate_parameters(skill_name),
                "examples": [
                    f"/{skill_name} --param1 value1",
                    f"/{skill_name} --help"
                ]
            }
        elif skill_type == "mcp":
            return {
                **base_skill,
                "type": "mcp",
                "mcp_config": {
                    "server_name": skill_name,
                    "tools": self._generate_mcp_tools(skill_name, technologies)
                }
            }
        elif skill_type == "workflow":
            return {
                **base_skill,
                "type": "workflow",
                "steps": self._generate_workflow_steps(skill_name, technologies)
            }

        return base_skill

    def _generate_command(self, skill_name: str, technologies: List[str]) -> str:
        """Generate command based on skill name and technologies"""

        # Map skill patterns to commands
        if "train" in skill_name or "model" in skill_name:
            return f"python3 scripts/ml/{skill_name}.py"
        elif "deploy" in skill_name:
            return f"terraform -chdir=infrastructure/ apply -var-file={skill_name}.tfvars"
        elif "test" in skill_name:
            return f"pytest tests/{skill_name}/ -v"
        elif "build" in skill_name:
            if "Go" in technologies:
                return f"go build -o bin/{skill_name} ./cmd/{skill_name}"
            elif "TypeScript" in technologies or "React" in technologies:
                return f"npm run build:{skill_name}"
        elif "analyze" in skill_name or "scan" in skill_name:
            return f"python3 scripts/analysis/{skill_name}.py"

        return f"./{skill_name}.sh"

    def _generate_parameters(self, skill_name: str) -> List[Dict[str, Any]]:
        """Generate parameters for the skill"""

        common_params = []

        if "train" in skill_name:
            common_params = [
                {"name": "dataset", "type": "string", "required": True},
                {"name": "epochs", "type": "integer", "default": 100},
                {"name": "batch-size", "type": "integer", "default": 32},
                {"name": "learning-rate", "type": "float", "default": 0.001}
            ]
        elif "deploy" in skill_name:
            common_params = [
                {"name": "environment", "type": "string", "required": True, "choices": ["dev", "staging", "prod"]},
                {"name": "dry-run", "type": "boolean", "default": False},
                {"name": "auto-approve", "type": "boolean", "default": False}
            ]
        elif "test" in skill_name:
            common_params = [
                {"name": "coverage", "type": "boolean", "default": True},
                {"name": "verbose", "type": "boolean", "default": False},
                {"name": "parallel", "type": "integer", "default": 4}
            ]

        return common_params

    def _generate_mcp_tools(self, skill_name: str, technologies: List[str]) -> List[Dict[str, Any]]:
        """Generate MCP tools for the skill"""

        tools = []

        if "database" in skill_name or "sql" in skill_name:
            tools.append({
                "name": f"{skill_name}_query",
                "description": f"Execute SQL queries for {skill_name}",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string"},
                        "database": {"type": "string", "default": "main"}
                    }
                }
            })

        if "api" in skill_name or "http" in skill_name:
            tools.append({
                "name": f"{skill_name}_request",
                "description": f"Make HTTP requests for {skill_name}",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "url": {"type": "string"},
                        "method": {"type": "string", "enum": ["GET", "POST", "PUT", "DELETE"]},
                        "headers": {"type": "object"},
                        "body": {"type": "object"}
                    }
                }
            })

        return tools

    def _generate_workflow_steps(self, skill_name: str, technologies: List[str]) -> List[Dict[str, str]]:
        """Generate workflow steps for the skill"""

        steps = []

        if "deploy" in skill_name:
            steps = [
                {"step": "validate", "description": "Validate deployment configuration"},
                {"step": "plan", "description": "Generate deployment plan"},
                {"step": "approve", "description": "Wait for approval"},
                {"step": "apply", "description": "Apply deployment"},
                {"step": "verify", "description": "Verify deployment health"}
            ]
        elif "test" in skill_name:
            steps = [
                {"step": "setup", "description": "Setup test environment"},
                {"step": "run-unit", "description": "Run unit tests"},
                {"step": "run-integration", "description": "Run integration tests"},
                {"step": "coverage", "description": "Generate coverage report"},
                {"step": "cleanup", "description": "Cleanup test environment"}
            ]

        return steps

    def needs_skill(self, scope: Dict[str, Any], skill_category: str) -> bool:
        """
        Determine if a custom skill is needed

        Args:
            scope: Project scope
            skill_category: Category (e.g., 'ml-training', 'blockchain-deploy')

        Returns:
            True if skill is needed
        """
        skill_indicators = {
            "ml-training": ["Machine Learning", "Model Training", "TensorFlow", "PyTorch"],
            "blockchain-deploy": ["Smart Contract", "Solidity", "Hardhat"],
            "iot-monitoring": ["IoT", "MQTT", "Sensors"],
            "data-pipeline": ["ETL", "Data Pipeline", "Airflow"],
            "security-scan": ["Security", "OWASP", "Vulnerability"]
        }

        indicators = skill_indicators.get(skill_category, [])

        for tech in scope.get("technologies", []):
            if any(indicator.lower() in tech.lower() for indicator in indicators):
                return True

        for component in scope.get("components", []):
            if any(indicator.lower() in component.lower() for indicator in indicators):
                return True

        return False

    def get_skill_suggestions(self, scope: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Get skill suggestions based on project scope

        Returns:
            List of suggested skills
        """
        suggestions = []

        skill_patterns = {
            "ml-training": {
                "name": "train-ml-model",
                "type": "command",
                "technologies": ["Python", "TensorFlow", "Keras"],
                "description": "Train machine learning models"
            },
            "blockchain-deploy": {
                "name": "deploy-smart-contract",
                "type": "workflow",
                "technologies": ["Solidity", "Hardhat", "Ethereum"],
                "description": "Deploy smart contracts to blockchain"
            },
            "data-pipeline": {
                "name": "run-etl-pipeline",
                "type": "workflow",
                "technologies": ["Python", "Airflow", "PostgreSQL"],
                "description": "Execute ETL data pipelines"
            },
            "security-scan": {
                "name": "security-audit",
                "type": "command",
                "technologies": ["OWASP ZAP", "Trivy", "Snyk"],
                "description": "Run security vulnerability scans"
            }
        }

        for category, config in skill_patterns.items():
            if self.needs_skill(scope, category):
                suggestions.append(config)

        return suggestions


# Standalone test
if __name__ == "__main__":
    base_dir = Path(__file__).parent
    generator = SkillGenerator(base_dir)

    # Test: Generate ML training skill
    scope = {
        "technologies": ["TensorFlow", "Keras", "PostgreSQL"],
        "components": ["Neural Network", "Prediction Model"],
        "complexity": "HIGH",
        "current_phase": 3
    }

    suggestions = generator.get_skill_suggestions(scope)
    print(f"\n📋 Skill Suggestions: {len(suggestions)} found")

    for suggestion in suggestions:
        print(f"\n   🔹 {suggestion['name']}")
        print(f"      Type: {suggestion['type']}")
        print(f"      Technologies: {', '.join(suggestion['technologies'])}")

        # Generate the skill
        skill_file = generator.generate_skill(
            skill_name=suggestion['name'],
            context=scope,
            technologies=suggestion['technologies'],
            skill_type=suggestion['type']
        )
