#!/bin/bash

# SuperCore Monitoring Setup Script
# This script initializes and starts the complete monitoring stack

set -e

echo "======================================"
echo "SuperCore Monitoring Setup"
echo "======================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: docker-compose is not installed${NC}"
    echo "Please install docker-compose and try again"
    exit 1
fi

echo -e "${GREEN}✓${NC} docker-compose is available"

# Navigate to project root
cd "$(dirname "$0")/.."

echo ""
echo "Starting monitoring services..."
echo ""

# Start monitoring stack
docker-compose up -d prometheus grafana alertmanager postgres-exporter node-exporter

# Wait for services to be healthy
echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check service health
check_service() {
    local service=$1
    local port=$2
    local name=$3

    if curl -s http://localhost:$port > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name is running on port $port"
    else
        echo -e "${YELLOW}⚠${NC} $name is starting on port $port..."
    fi
}

echo ""
echo "Service Status:"
echo "---------------"
check_service "prometheus" "9090" "Prometheus"
check_service "grafana" "3001" "Grafana"
check_service "alertmanager" "9093" "AlertManager"
check_service "postgres-exporter" "9187" "PostgreSQL Exporter"
check_service "node-exporter" "9100" "Node Exporter"

echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "Access your monitoring services:"
echo ""
echo "  Grafana:       http://localhost:3001"
echo "    Username: admin"
echo "    Password: admin"
echo ""
echo "  Prometheus:    http://localhost:9090"
echo "  AlertManager:  http://localhost:9093"
echo ""
echo "Backend metrics will be available at:"
echo "  http://localhost:8080/metrics"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f grafana"
echo "  docker-compose logs -f prometheus"
echo ""
echo "To stop all services:"
echo "  docker-compose down"
echo ""
echo "For more information, see: monitoring/README.md"
echo ""
