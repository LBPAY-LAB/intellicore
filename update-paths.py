#!/usr/bin/env python3
"""
Script de Atualização de Paths - SuperCore v2.0
Atualiza todos os paths após reorganização para app-generation/ + app-solution/
"""

import re
import shutil
from pathlib import Path
from datetime import datetime

# Cores para output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_info(msg):
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.END}")

def log_success(msg):
    print(f"{Colors.GREEN}✅ {msg}{Colors.END}")

def log_warning(msg):
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.END}")

def log_error(msg):
    print(f"{Colors.RED}❌ {msg}{Colors.END}")

def backup_file(file_path: Path) -> Path:
    """Create backup of file before modifying"""
    backup_path = file_path.with_suffix(file_path.suffix + '.backup')
    shutil.copy2(file_path, backup_path)
    return backup_path

def update_server_py():
    """Update paths in execution-portal/backend/server.py"""
    log_info("Atualizando app-generation/execution-portal/backend/server.py...")

    file_path = Path("app-generation/execution-portal/backend/server.py")
    if not file_path.exists():
        log_error(f"Arquivo não encontrado: {file_path}")
        return False

    # Backup
    backup_path = backup_file(file_path)
    log_success(f"Backup criado: {backup_path}")

    content = file_path.read_text()
    original_content = content

    # 1. Update base_dir calculation
    content = re.sub(
        r'self\.base_dir\s*=\s*Path\(__file__\)\.parent\.parent\.parent',
        'self.base_dir = Path(__file__).parent.parent.parent / "app-execution"',
        content
    )

    # 2. Update artefactos paths
    content = content.replace(
        'artefactos_implementacao',
        'app-artefacts'
    )

    # 3. Update documentation paths
    content = content.replace(
        'Supercore_v2.0/DOCUMENTACAO_BASE',
        'app-generation/documentation-base'
    )
    content = content.replace(
        'Supercore_v2.0" / "DOCUMENTACAO_BASE',
        'app-generation" / "documentation-base'
    )

    # 4. Update monitoring.db path
    content = re.sub(
        r'monitoring_db\s*=\s*self\.base_dir\s*/\s*"monitoring"\s*/\s*"data"\s*/\s*"monitoring\.db"',
        'monitoring_db = self.base_dir.parent / "execution-portal" / "backend" / "data" / "monitoring.db"',
        content
    )

    # 5. Add app-solution paths for cleanup
    # Find cleanup section and ensure it deletes app-solution/
    if 'app-solution' not in content:
        # Add app-solution cleanup after app-artefacts
        content = re.sub(
            r'(# .*Limpar artefactos.*\n.*app-artefacts)',
            r'\1\n\n        # 6. Limpar código gerado (app-solution/)\n        app_solution_dir = self.base_dir.parent.parent / "app-solution"\n        if app_solution_dir.exists():\n            for item in app_solution_dir.iterdir():\n                if item.is_dir():\n                    shutil.rmtree(item)\n                else:\n                    item.unlink()',
            content,
            flags=re.MULTILINE
        )

    if content != original_content:
        file_path.write_text(content)
        log_success(f"server.py atualizado com sucesso")
        return True
    else:
        log_warning("Nenhuma alteração necessária em server.py")
        return True

def update_orchestrator_py():
    """Update paths in app-execution/autonomous_meta_orchestrator.py"""
    log_info("Atualizando app-generation/app-execution/autonomous_meta_orchestrator.py...")

    file_path = Path("app-generation/app-execution/autonomous_meta_orchestrator.py")
    if not file_path.exists():
        log_error(f"Arquivo não encontrado: {file_path}")
        return False

    # Backup
    backup_path = backup_file(file_path)
    log_success(f"Backup criado: {backup_path}")

    content = file_path.read_text()
    original_content = content

    # 1. Update ARTEFACTOS_DIR
    content = re.sub(
        r'ARTEFACTOS_DIR\s*=\s*SCRIPT_DIR\.parent\.parent\s*/\s*"artefactos_implementacao"',
        'ARTEFACTOS_DIR = SCRIPT_DIR.parent / "app-artefacts"',
        content
    )

    # 2. Update any other artefactos_implementacao references
    content = content.replace(
        'artefactos_implementacao',
        'app-artefacts'
    )

    # 3. Update documentation paths
    content = content.replace(
        'Supercore_v2.0/DOCUMENTACAO_BASE',
        'documentation-base'
    )
    content = re.sub(
        r'SCRIPT_DIR\.parent\.parent\s*/\s*"Supercore_v2\.0"\s*/\s*"DOCUMENTACAO_BASE"',
        'SCRIPT_DIR.parent / "documentation-base"',
        content
    )

    # 4. Add APP_SOLUTION_DIR if not exists
    if 'APP_SOLUTION_DIR' not in content:
        # Add after ARTEFACTOS_DIR
        content = re.sub(
            r'(ARTEFACTOS_DIR\s*=\s*SCRIPT_DIR\.parent\s*/\s*"app-artefacts")',
            r'\1\nAPP_SOLUTION_DIR = SCRIPT_DIR.parent.parent / "app-solution"',
            content
        )

    if content != original_content:
        file_path.write_text(content)
        log_success("autonomous_meta_orchestrator.py atualizado com sucesso")
        return True
    else:
        log_warning("Nenhuma alteração necessária em orchestrator")
        return True

def update_tasks_py():
    """Update paths in app-execution/tasks.py"""
    log_info("Atualizando app-generation/app-execution/tasks.py...")

    file_path = Path("app-generation/app-execution/tasks.py")
    if not file_path.exists():
        log_error(f"Arquivo não encontrado: {file_path}")
        return False

    # Backup
    backup_path = backup_file(file_path)
    log_success(f"Backup criado: {backup_path}")

    content = file_path.read_text()
    original_content = content

    # 1. Update BASE_DIR references to artefactos
    content = re.sub(
        r'BASE_DIR\.parent\.parent\s*/\s*"artefactos_implementacao"',
        'BASE_DIR.parent / "app-artefacts"',
        content
    )

    # 2. Update documentation paths
    content = re.sub(
        r'BASE_DIR\.parent\.parent\s*/\s*"Supercore_v2\.0"\s*/\s*"DOCUMENTACAO_BASE"',
        'BASE_DIR.parent / "documentation-base"',
        content
    )

    # 3. Update any standalone path references
    content = content.replace('artefactos_implementacao', 'app-artefacts')
    content = content.replace('Supercore_v2.0/DOCUMENTACAO_BASE', 'documentation-base')

    if content != original_content:
        file_path.write_text(content)
        log_success("tasks.py atualizado com sucesso")
        return True
    else:
        log_warning("Nenhuma alteração necessária em tasks.py")
        return True

def create_new_reset_script():
    """Create new reset-completo.sh with updated paths"""
    log_info("Criando novo app-generation/app-execution/reset-completo.sh...")

    file_path = Path("app-generation/app-execution/reset-completo.sh")

    content = '''#!/bin/bash
# Reset Completo do Squad Orchestrator - NOVA ESTRUTURA
# app-generation/ + app-solution/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🛑 RESET COMPLETO - Parando TUDO..."

# 1. Parar todos os processos
pkill -9 -f "autonomous_meta_orchestrator" 2>/dev/null || true
pkill -9 -f "celery.*worker" 2>/dev/null || true
echo "   ✅ Processos parados"

# 2. Limpar arquivos de estado
rm -f state/.bootstrap_status state/pause.json
rm -f ../execution-portal/backend/data/bootstrap_status.json
echo "   ✅ Arquivos de estado removidos"

# 3. Reset backlog_master.json
cat > state/backlog_master.json <<'EOF'
{
  "project": "SuperCore v2.0",
  "cards": [],
  "journal": [],
  "metadata": {"total_cards": 0}
}
EOF
echo "   ✅ backlog_master.json resetado"

# 4. Limpar database do portal
sqlite3 ../execution-portal/backend/data/monitoring.db <<'SQL'
DELETE FROM events;
DELETE FROM cards;
DELETE FROM sessions;
SQL
echo "   ✅ Database limpo"

# 5. Limpar artefactos gerados (app-artefacts/)
echo "   🗑️  Limpando artefactos..."
find ../app-artefacts -type f ! -name '.gitkeep' -delete 2>/dev/null || true
find ../app-artefacts -type d -empty ! -name 'app-artefacts' -delete 2>/dev/null || true
echo "   ✅ app-artefacts/ limpo"

# 6. Limpar código gerado (app-solution/)
echo "   🗑️  Limpando código gerado..."
find ../../app-solution -type f ! -name '.gitkeep' ! -name 'README.md' -delete 2>/dev/null || true
find ../../app-solution -type d -empty ! -name 'app-solution' -delete 2>/dev/null || true
echo "   ✅ app-solution/ limpo"

# 7. Limpar logs antigos (manter apenas últimos 3 dias)
find logs -name "*.log" -type f -mtime +3 -delete 2>/dev/null || true
echo "   ✅ Logs antigos removidos"

# 8. Limpar Redis queues
redis-cli -n 0 FLUSHDB > /dev/null 2>&1 || echo "   ⚠️  Redis não disponível"
redis-cli -n 1 FLUSHDB > /dev/null 2>&1 || true
redis-cli -n 2 FLUSHDB > /dev/null 2>&1 || true
echo "   ✅ Redis queues limpas"

# 9. Restart Celery worker
echo "🚀 Iniciando Celery worker..."
bash start-celery-worker.sh
sleep 2

echo ""
echo "✅ RESET COMPLETO!"
echo ""
echo "Próximos passos:"
echo "1. Iniciar backend: cd ../execution-portal/backend && python3 server.py"
echo "2. Abrir portal: http://localhost:5173"
echo "3. Clicar 'Iniciar Projeto' no portal"
echo ""
'''

    file_path.write_text(content)
    file_path.chmod(0o755)  # Make executable
    log_success(f"reset-completo.sh criado: {file_path}")
    return True

def verify_structure():
    """Verify that new structure exists"""
    log_info("Verificando estrutura de diretórios...")

    required_dirs = [
        "app-generation/documentation-base",
        "app-generation/app-execution",
        "app-generation/app-artefacts",
        "app-generation/execution-portal/frontend",
        "app-generation/execution-portal/backend",
        "app-solution",
    ]

    missing = []
    for dir_path in required_dirs:
        if not Path(dir_path).exists():
            missing.append(dir_path)

    if missing:
        log_error("Diretórios faltando:")
        for d in missing:
            log_error(f"  - {d}")
        return False

    log_success("Estrutura de diretórios OK")
    return True

def main():
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║  SuperCore v2.0 - Atualização Automática de Paths            ║")
    print("║  app-generation/ + app-solution/                              ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    print()

    # Change to project root
    project_root = Path(__file__).parent
    import os
    os.chdir(project_root)

    # Verify structure
    if not verify_structure():
        log_error("Estrutura incompleta. Execute migrate-to-new-structure.sh primeiro.")
        return 1

    # Update files
    success = True

    success &= update_server_py()
    success &= update_orchestrator_py()
    success &= update_tasks_py()
    success &= create_new_reset_script()

    print()
    if success:
        print("╔════════════════════════════════════════════════════════════════╗")
        print("║  ✅ ATUALIZAÇÃO COMPLETA!                                      ║")
        print("╚════════════════════════════════════════════════════════════════╝")
        print()
        log_success("Todos os paths foram atualizados com sucesso")
        log_info("Backups criados com extensão .backup")
        print()
        print("📝 Próximos passos:")
        print("   1. Revisar mudanças nos arquivos .backup")
        print("   2. Testar: cd app-generation/app-execution && bash reset-completo.sh")
        print("   3. Iniciar portal: cd app-generation/execution-portal/backend && python3 server.py")
        print("   4. Testar 'Iniciar Projeto' no portal")
        print()
        return 0
    else:
        log_error("Algumas atualizações falharam. Verifique os logs acima.")
        return 1

if __name__ == "__main__":
    exit(main())
