#!/bin/bash
# Reset Completo do Squad Orchestrator
# Este script limpa TUDO e prepara para uma inicialização fresh

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
rm -f monitoring/data/bootstrap_status.json
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

# 4. Limpar database (eventos, cards, sessions)
sqlite3 monitoring/data/monitoring.db <<'SQL'
DELETE FROM events;
DELETE FROM cards;
DELETE FROM sessions;
SQL
echo "   ✅ Database limpo"

# 5. Limpar artefactos (opcional - comentado para preservar)
# echo "   🗑️  Limpando artefactos..."
# rm -rf ../../artefactos_implementacao/produto/*
# rm -rf ../../artefactos_implementacao/arquitetura/*
# rm -rf ../../artefactos_implementacao/engenharia/*
# rm -rf ../../artefactos_implementacao/qa/*
# rm -rf ../../artefactos_implementacao/deploy/*

# 6. Limpar Redis queues
redis-cli -n 0 FLUSHDB > /dev/null 2>&1 || echo "   ⚠️  Redis não disponível"
redis-cli -n 1 FLUSHDB > /dev/null 2>&1 || true
redis-cli -n 2 FLUSHDB > /dev/null 2>&1 || true
echo "   ✅ Redis queues limpas"

# 7. Restart Celery worker
echo "🚀 Iniciando Celery worker..."
bash start-celery-worker.sh
sleep 2

echo ""
echo "✅ RESET COMPLETO!"
echo ""
echo "Próximos passos:"
echo "1. Iniciar backend: cd monitoring/backend && python3 server.py"
echo "2. Abrir portal: http://localhost:5173"
echo "3. Clicar 'Iniciar Projeto' no portal"
echo ""
