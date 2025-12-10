#!/bin/bash
set -e

echo "======================================"
echo "  SuperCore - Quick Start Script"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys (CLAUDE_API_KEY, OPENAI_API_KEY)"
    echo "   You can do this later if you want to proceed without AI features."
    echo ""
    read -p "Press Enter to continue..."
fi

echo "🚀 Starting SuperCore services..."
echo ""

# Start services
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if PostgreSQL is ready
echo "   Checking PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U supercore > /dev/null 2>&1; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done
echo "   ✅ PostgreSQL is ready"

# Check if backend is ready
echo "   Checking backend API..."
for i in {1..30}; do
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo "   ✅ Backend API is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ⚠️  Backend API is not responding. Check logs with: docker-compose logs backend"
    fi
    sleep 1
done

echo ""
echo "======================================"
echo "  🎉 SuperCore is running!"
echo "======================================"
echo ""
echo "🔗 Services:"
echo "   - Backend API:  http://localhost:8080"
echo "   - Health Check: http://localhost:8080/health"
echo "   - PostgreSQL:   localhost:5432"
echo ""
echo "📚 Quick commands:"
echo "   - View logs:        docker-compose logs -f"
echo "   - Stop services:    docker-compose down"
echo "   - Restart:          docker-compose restart"
echo "   - Remove all:       docker-compose down -v"
echo ""
echo "📖 API Examples:"
echo "   # Health check"
echo "   curl http://localhost:8080/health"
echo ""
echo "   # List object definitions"
echo "   curl http://localhost:8080/api/v1/object-definitions"
echo ""
echo "   # List validation rules"
echo "   curl http://localhost:8080/api/v1/validation-rules"
echo ""
echo "📝 Next steps:"
echo "   1. Read the README.md for API documentation"
echo "   2. Check docs/CLAUDE.md for architecture details"
echo "   3. Try creating your first object definition!"
echo ""
