#!/bin/bash
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

# 4. Recriar database do portal (deletar para forçar criação limpa)
rm -f ../execution-portal/backend/data/monitoring.db
echo "   ✅ Database deletado (será recriado pelo server.py)"

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
