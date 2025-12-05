#!/bin/bash

# LBPay v2 - Quick Start Script

set -e

echo "🚀 LBPay v2 - Quick Start"
echo "========================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start databases
echo "📦 Starting databases (PostgreSQL, Valkey, Meilisearch, Keycloak)..."
docker compose up -d

# Wait for databases to be healthy
echo "⏳ Waiting for databases to be ready..."
sleep 10

# Check if databases are healthy
echo "🔍 Checking database health..."
docker compose ps

# Setup backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env not found. Please copy backend/.env.example to backend/.env and configure it."
    echo "   Then run this script again."
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "🗄️  Running database migrations..."
npm run migration:run || echo "⚠️  Migrations failed. You may need to run them manually."

echo "🚀 Starting backend..."
npm run start:dev &
BACKEND_PID=$!

cd ..

# Setup frontend
if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  Frontend .env.local not found. Please copy frontend/.env.local.example to frontend/.env.local"
    echo "   Then run this script again."
    kill $BACKEND_PID
    exit 1
fi

echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🚀 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Access points:"
echo "   - Frontend:  http://localhost:3000"
echo "   - Backend:   http://localhost:4000/graphql"
echo "   - Keycloak:  http://localhost:8080 (admin/admin)"
echo ""
echo "📚 Next steps:"
echo "   1. Configure Keycloak (see SETUP_GUIDE.md)"
echo "   2. Access http://localhost:3000"
echo ""
echo "🛑 To stop all services:"
echo "   - Press Ctrl+C"
echo "   - Run: docker compose down"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; docker compose down; exit 0" INT

wait
