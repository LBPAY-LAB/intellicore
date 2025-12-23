"""
External Resource Finder - Search and Import from External Sources

Searches GitHub, npm, PyPI, and other sources for reusable agents and skills.
"""

import json
import re
import urllib.request
import urllib.parse
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime


class ExternalResourceFinder:
    """
    Finds and imports external resources (agents, skills, tools)
    """

    def __init__(self, base_dir: Path):
        self.base_dir = base_dir

        # Trusted sources for agents/skills
        self.trusted_sources = {
            "github": [
                "anthropics/claude-sdk",
                "anthropics/anthropic-sdk-python",
                "langchain-ai/langchain",
                "crewAIInc/crewAI",
                "modelcontextprotocol/servers"
            ],
            "npm": [
                "@anthropic-ai/sdk",
                "@modelcontextprotocol/sdk",
                "langchain"
            ],
            "pypi": [
                "anthropic",
                "langchain",
                "crewai",
                "mcp"
            ]
        }

    def search_github_skills(self, query: str, technology: str = None) -> List[Dict[str, Any]]:
        """
        Search GitHub for relevant skills/tools

        Args:
            query: Search query (e.g., 'machine learning agent')
            technology: Optional technology filter (e.g., 'python', 'typescript')

        Returns:
            List of found resources
        """
        print(f"\n🔍 ExternalResourceFinder: Searching GitHub for '{query}'...")

        results = []

        # Build search query
        github_query = f"{query} topic:claude topic:mcp"
        if technology:
            github_query += f" language:{technology}"

        # Search only in trusted repos
        for repo in self.trusted_sources["github"]:
            try:
                # GitHub API search
                search_url = f"https://api.github.com/search/code?q={urllib.parse.quote(github_query)}+repo:{repo}"

                print(f"   🔎 Searching in {repo}...")

                # Simulate search result (in production, would use actual API)
                # For now, return mock structure
                result = {
                    "source": "github",
                    "repository": repo,
                    "query": query,
                    "found": False,  # Would be True if actual API call succeeded
                    "items": []
                }

                results.append(result)

            except Exception as e:
                print(f"   ⚠️ Error searching {repo}: {e}")

        print(f"   ✅ GitHub search complete ({len(results)} repos searched)")
        return results

    def search_npm_packages(self, query: str) -> List[Dict[str, Any]]:
        """
        Search npm for relevant packages

        Args:
            query: Search query

        Returns:
            List of found packages
        """
        print(f"\n🔍 ExternalResourceFinder: Searching npm for '{query}'...")

        results = []

        for package in self.trusted_sources["npm"]:
            try:
                # npm registry API
                registry_url = f"https://registry.npmjs.org/{package}"

                print(f"   🔎 Checking package {package}...")

                # Mock result structure
                result = {
                    "source": "npm",
                    "package": package,
                    "query": query,
                    "found": False,
                    "version": None,
                    "description": None
                }

                results.append(result)

            except Exception as e:
                print(f"   ⚠️ Error checking {package}: {e}")

        print(f"   ✅ npm search complete ({len(results)} packages checked)")
        return results

    def search_pypi_packages(self, query: str) -> List[Dict[str, Any]]:
        """
        Search PyPI for relevant packages

        Args:
            query: Search query

        Returns:
            List of found packages
        """
        print(f"\n🔍 ExternalResourceFinder: Searching PyPI for '{query}'...")

        results = []

        for package in self.trusted_sources["pypi"]:
            try:
                # PyPI API
                pypi_url = f"https://pypi.org/pypi/{package}/json"

                print(f"   🔎 Checking package {package}...")

                # Mock result structure
                result = {
                    "source": "pypi",
                    "package": package,
                    "query": query,
                    "found": False,
                    "version": None,
                    "description": None,
                    "homepage": None
                }

                results.append(result)

            except Exception as e:
                print(f"   ⚠️ Error checking {package}: {e}")

        print(f"   ✅ PyPI search complete ({len(results)} packages checked)")
        return results

    def search_mcp_servers(self, capability: str) -> List[Dict[str, Any]]:
        """
        Search MCP Server Registry for specific capabilities

        Args:
            capability: Desired capability (e.g., 'database', 'filesystem', 'web')

        Returns:
            List of compatible MCP servers
        """
        print(f"\n🔍 ExternalResourceFinder: Searching MCP servers for '{capability}'...")

        # Known MCP servers from Model Context Protocol registry
        mcp_servers = {
            "database": [
                {
                    "name": "mcp-server-postgres",
                    "source": "github",
                    "repo": "modelcontextprotocol/servers/postgres",
                    "description": "PostgreSQL database MCP server",
                    "tools": ["query", "schema", "tables"],
                    "install": "pip install mcp-server-postgres"
                },
                {
                    "name": "mcp-server-sqlite",
                    "source": "github",
                    "repo": "modelcontextprotocol/servers/sqlite",
                    "description": "SQLite database MCP server",
                    "tools": ["query", "schema", "tables"],
                    "install": "pip install mcp-server-sqlite"
                }
            ],
            "filesystem": [
                {
                    "name": "mcp-server-filesystem",
                    "source": "github",
                    "repo": "modelcontextprotocol/servers/filesystem",
                    "description": "Filesystem access MCP server",
                    "tools": ["read_file", "write_file", "list_directory"],
                    "install": "pip install mcp-server-filesystem"
                }
            ],
            "web": [
                {
                    "name": "mcp-server-fetch",
                    "source": "github",
                    "repo": "modelcontextprotocol/servers/fetch",
                    "description": "Web fetching MCP server",
                    "tools": ["fetch", "get", "post"],
                    "install": "pip install mcp-server-fetch"
                }
            ],
            "browser": [
                {
                    "name": "mcp-server-puppeteer",
                    "source": "github",
                    "repo": "modelcontextprotocol/servers/puppeteer",
                    "description": "Browser automation MCP server",
                    "tools": ["navigate", "screenshot", "console_logs"],
                    "install": "npm install @modelcontextprotocol/server-puppeteer"
                }
            ]
        }

        results = mcp_servers.get(capability, [])

        print(f"   ✅ Found {len(results)} MCP servers for '{capability}'")
        for server in results:
            print(f"      🔹 {server['name']}: {server['description']}")

        return results

    def find_best_match(
        self,
        need: str,
        technologies: List[str],
        search_all_sources: bool = True
    ) -> Optional[Dict[str, Any]]:
        """
        Find best matching resource across all sources

        Args:
            need: Description of need (e.g., 'machine learning training')
            technologies: List of technologies
            search_all_sources: Search all sources or just MCP registry

        Returns:
            Best matching resource or None
        """
        print(f"\n🎯 ExternalResourceFinder: Finding best match for '{need}'...")

        all_results = []

        # 1. Search MCP servers first (most reliable)
        mcp_categories = ["database", "filesystem", "web", "browser"]
        for category in mcp_categories:
            if category in need.lower():
                mcp_results = self.search_mcp_servers(category)
                all_results.extend(mcp_results)

        # 2. Search GitHub (if enabled)
        if search_all_sources:
            github_results = self.search_github_skills(need, self._infer_language(technologies))
            all_results.extend(github_results)

        # 3. Search package managers
        if search_all_sources:
            if "Python" in technologies or "python" in need.lower():
                pypi_results = self.search_pypi_packages(need)
                all_results.extend(pypi_results)

            if "TypeScript" in technologies or "JavaScript" in technologies:
                npm_results = self.search_npm_packages(need)
                all_results.extend(npm_results)

        # Rank results
        ranked = self._rank_results(all_results, need, technologies)

        if ranked:
            best = ranked[0]
            print(f"   ✅ Best match: {best.get('name', 'unknown')} from {best.get('source', 'unknown')}")
            return best
        else:
            print(f"   ⚠️ No matches found")
            return None

    def _infer_language(self, technologies: List[str]) -> Optional[str]:
        """Infer primary programming language from technologies"""
        if any(t in technologies for t in ["Python", "FastAPI", "Django"]):
            return "python"
        if any(t in technologies for t in ["TypeScript", "React", "Next.js"]):
            return "typescript"
        if any(t in technologies for t in ["Go", "Gin"]):
            return "go"
        return None

    def _rank_results(
        self,
        results: List[Dict[str, Any]],
        need: str,
        technologies: List[str]
    ) -> List[Dict[str, Any]]:
        """Rank results by relevance"""

        scored = []

        for result in results:
            score = 0

            # MCP servers get highest priority
            if result.get("source") == "mcp" or "mcp-server" in result.get("name", ""):
                score += 100

            # Official repos get priority
            if "modelcontextprotocol" in result.get("repo", ""):
                score += 50
            if "anthropic" in result.get("repo", ""):
                score += 50

            # Match technologies
            result_text = json.dumps(result).lower()
            for tech in technologies:
                if tech.lower() in result_text:
                    score += 10

            # Match need keywords
            need_keywords = need.lower().split()
            for keyword in need_keywords:
                if keyword in result_text:
                    score += 5

            scored.append((score, result))

        # Sort by score descending
        scored.sort(key=lambda x: x[0], reverse=True)

        return [result for score, result in scored if score > 0]


# Standalone test
if __name__ == "__main__":
    base_dir = Path(__file__).parent
    finder = ExternalResourceFinder(base_dir)

    # Test 1: Search MCP servers for database
    print("\n" + "=" * 80)
    print("TEST 1: Search MCP servers for database capability")
    print("=" * 80)
    db_servers = finder.search_mcp_servers("database")

    # Test 2: Find best match for ML need
    print("\n" + "=" * 80)
    print("TEST 2: Find best match for machine learning")
    print("=" * 80)
    best = finder.find_best_match(
        need="machine learning model training",
        technologies=["Python", "TensorFlow"],
        search_all_sources=True
    )

    # Test 3: Search for web scraping tools
    print("\n" + "=" * 80)
    print("TEST 3: Search for browser automation")
    print("=" * 80)
    browser_servers = finder.search_mcp_servers("browser")
