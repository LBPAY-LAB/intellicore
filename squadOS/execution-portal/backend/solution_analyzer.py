"""
Solution Analyzer - Analyzes the generated solution in app-solution/

Provides statistics about:
- File count, LOC, languages
- Directory structure
- Build status (backend, frontend, infrastructure)
- Whether solution is executable (ready to run)
"""

import os
import json
import subprocess
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict


class SolutionAnalyzer:
    """
    Analyzes the generated solution in app-solution/
    """

    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        # Navigate to app-solution/ directory
        # From backend/ -> execution-portal/ -> app-generation/ -> ../app-solution/
        app_generation_dir = base_dir.parent.parent
        self.solution_dir = app_generation_dir.parent / "app-solution"

        print(f"📊 SolutionAnalyzer: Monitoring {self.solution_dir}")

    def get_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive statistics about the generated solution

        Returns:
            Statistics dictionary with file counts, LOC, languages, build status, etc.
        """
        if not self.solution_dir.exists():
            return {
                "exists": False,
                "total_files": 0,
                "total_lines": 0,
                "total_directories": 0,
                "is_executable": False,
                "message": f"Solution directory not found: {self.solution_dir}"
            }

        stats = {
            "exists": True,
            "solution_path": str(self.solution_dir),
            "analyzed_at": datetime.utcnow().isoformat(),
            "total_files": 0,
            "total_lines": 0,
            "total_directories": 0,
            "files_modified_today": 0,
            "languages": {},  # {language: {files: N, lines: N}}
            "recent_files": [],  # Last 20 modified files
            "directory_tree": {},
            "backend_build": self._check_backend_status(),
            "frontend_build": self._check_frontend_status(),
            "infrastructure_status": self._check_infrastructure_status(),
            "is_executable": False  # Will be computed at the end
        }

        # Walk through solution directory
        files_info = []

        for root, dirs, files in os.walk(self.solution_dir):
            # Skip hidden dirs and node_modules
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'venv', 'dist', 'build']]

            stats["total_directories"] += len(dirs)

            for file in files:
                if file.startswith('.'):
                    continue

                file_path = Path(root) / file
                relative_path = file_path.relative_to(self.solution_dir)

                # Get file stats
                try:
                    stat = file_path.stat()
                    modified_at = datetime.fromtimestamp(stat.st_mtime)

                    # Count lines
                    lines = 0
                    if self._is_text_file(file):
                        try:
                            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                                lines = sum(1 for _ in f)
                        except:
                            pass

                    # Detect language
                    language = self._detect_language(file)

                    # Update stats
                    stats["total_files"] += 1
                    stats["total_lines"] += lines

                    # Update language stats
                    if language:
                        if language not in stats["languages"]:
                            stats["languages"][language] = {"files": 0, "lines": 0}
                        stats["languages"][language]["files"] += 1
                        stats["languages"][language]["lines"] += lines

                    # Check if modified today
                    if modified_at.date() == datetime.now().date():
                        stats["files_modified_today"] += 1

                    # Store file info for recent files
                    files_info.append({
                        "path": str(relative_path),
                        "lines": lines,
                        "language": language,
                        "modified_at": modified_at.isoformat(),
                        "status": "created" if (datetime.now() - modified_at) < timedelta(hours=1) else "modified"
                    })

                except Exception as e:
                    print(f"⚠️ Error analyzing {file_path}: {e}")
                    continue

        # Sort files by modification time (most recent first)
        files_info.sort(key=lambda x: x["modified_at"], reverse=True)
        stats["recent_files"] = files_info[:20]

        # Build directory tree (simplified, top 2 levels)
        stats["directory_tree"] = self._build_directory_tree()

        # Determine if solution is executable
        stats["is_executable"] = self._is_solution_executable(stats)

        return stats

    def _is_text_file(self, filename: str) -> bool:
        """Check if file is a text file (for line counting)"""
        text_extensions = {
            '.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.java', '.c', '.cpp', '.h',
            '.css', '.scss', '.html', '.json', '.yaml', '.yml', '.md', '.txt',
            '.sh', '.bash', '.sql', '.tf', '.toml', '.ini', '.env', '.xml'
        }
        ext = Path(filename).suffix.lower()
        return ext in text_extensions

    def _detect_language(self, filename: str) -> Optional[str]:
        """Detect programming language from file extension"""
        ext = Path(filename).suffix.lower()

        language_map = {
            '.js': 'JavaScript',
            '.jsx': 'React (JSX)',
            '.ts': 'TypeScript',
            '.tsx': 'React (TSX)',
            '.py': 'Python',
            '.go': 'Go',
            '.java': 'Java',
            '.c': 'C',
            '.cpp': 'C++',
            '.h': 'C/C++ Header',
            '.css': 'CSS',
            '.scss': 'SCSS',
            '.html': 'HTML',
            '.json': 'JSON',
            '.yaml': 'YAML',
            '.yml': 'YAML',
            '.md': 'Markdown',
            '.sql': 'SQL',
            '.sh': 'Shell Script',
            '.bash': 'Bash',
            '.tf': 'Terraform',
            '.dockerfile': 'Dockerfile'
        }

        if filename.lower() == 'dockerfile':
            return 'Dockerfile'

        return language_map.get(ext)

    def _build_directory_tree(self) -> Dict[str, Any]:
        """Build a simplified directory tree (top 2 levels only)"""
        tree = {}

        try:
            # Only go 2 levels deep
            for item in self.solution_dir.iterdir():
                if item.name.startswith('.') or item.name in ['node_modules', '__pycache__', 'venv']:
                    continue

                if item.is_dir():
                    # Level 1: directories
                    tree[item.name] = {}
                    try:
                        for subitem in item.iterdir():
                            if subitem.name.startswith('.'):
                                continue
                            if subitem.is_dir():
                                tree[item.name][subitem.name] = "..."
                            else:
                                tree[item.name][subitem.name] = "file"
                    except PermissionError:
                        tree[item.name] = "..."
                else:
                    # Level 0: files
                    tree[item.name] = "file"
        except Exception as e:
            print(f"⚠️ Error building directory tree: {e}")

        return tree

    def _check_backend_status(self) -> Dict[str, Any]:
        """Check backend build and running status"""
        backend_dir = self.solution_dir / "backend"

        if not backend_dir.exists():
            return {
                "status": "not_started",
                "message": "Backend directory not found"
            }

        status = {
            "status": "pending",
            "last_build_at": None,
            "errors": [],
            "is_running": False,
            "url": None
        }

        # Check if Go or Python backend
        go_main = backend_dir / "main.go"
        py_main = backend_dir / "main.py"

        if go_main.exists():
            # Try to check if Go build is possible
            try:
                result = subprocess.run(
                    ["go", "build", "-o", "/dev/null", "."],
                    cwd=backend_dir,
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                if result.returncode == 0:
                    status["status"] = "success"
                else:
                    status["status"] = "failed"
                    status["errors"] = result.stderr.split('\n')[:5]
            except subprocess.TimeoutExpired:
                status["status"] = "building"
            except FileNotFoundError:
                status["status"] = "pending"
                status["errors"] = ["Go compiler not found"]
            except Exception as e:
                status["status"] = "failed"
                status["errors"] = [str(e)]

        elif py_main.exists():
            # Check if Python dependencies are installed
            requirements_file = backend_dir / "requirements.txt"
            if requirements_file.exists():
                status["status"] = "success"  # Assume OK if requirements file exists
            else:
                status["status"] = "pending"

        # Check if backend is running (port 8000 or 3000)
        if self._check_port_open(8000):
            status["is_running"] = True
            status["url"] = "http://localhost:8000"
        elif self._check_port_open(3000):
            status["is_running"] = True
            status["url"] = "http://localhost:3000"

        return status

    def _check_frontend_status(self) -> Dict[str, Any]:
        """Check frontend build and running status"""
        frontend_dir = self.solution_dir / "frontend"

        if not frontend_dir.exists():
            return {
                "status": "not_started",
                "message": "Frontend directory not found"
            }

        status = {
            "status": "pending",
            "last_build_at": None,
            "errors": [],
            "is_running": False,
            "url": None
        }

        # Check if package.json exists
        package_json = frontend_dir / "package.json"
        if package_json.exists():
            # Check if node_modules exists (dependencies installed)
            node_modules = frontend_dir / "node_modules"
            if node_modules.exists():
                status["status"] = "success"
            else:
                status["status"] = "pending"
                status["errors"] = ["Dependencies not installed (run npm install)"]

        # Check if frontend is running (port 5173 for Vite, 3000 for Next.js)
        if self._check_port_open(5173):
            status["is_running"] = True
            status["url"] = "http://localhost:5173"
        elif self._check_port_open(3001):
            status["is_running"] = True
            status["url"] = "http://localhost:3001"

        return status

    def _check_infrastructure_status(self) -> Dict[str, Any]:
        """Check infrastructure (Terraform) status"""
        infra_dir = self.solution_dir / "infrastructure"

        if not infra_dir.exists():
            return {
                "status": "not_started",
                "message": "Infrastructure directory not found"
            }

        status = {
            "status": "pending",
            "message": "Infrastructure code exists"
        }

        # Check if Terraform files exist
        tf_files = list(infra_dir.glob("**/*.tf"))
        if tf_files:
            status["status"] = "success"
            status["message"] = f"Found {len(tf_files)} Terraform files"

        return status

    def _check_port_open(self, port: int) -> bool:
        """Check if a port is open (service running)"""
        import socket
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            return result == 0
        except:
            return False

    def _is_solution_executable(self, stats: Dict[str, Any]) -> bool:
        """
        Determine if the solution is ready to execute

        Criteria:
        - Backend exists and builds successfully
        - Frontend exists and dependencies installed
        - At least some code files exist
        """
        backend_ok = stats["backend_build"]["status"] == "success"
        frontend_ok = stats["frontend_build"]["status"] == "success"
        has_code = stats["total_files"] > 10  # At least 10 files

        return backend_ok and frontend_ok and has_code


# Standalone test
if __name__ == "__main__":
    base_dir = Path(__file__).parent
    analyzer = SolutionAnalyzer(base_dir)

    stats = analyzer.get_stats()

    print("\n" + "=" * 80)
    print("SOLUTION ANALYSIS")
    print("=" * 80)
    print(json.dumps(stats, indent=2))
