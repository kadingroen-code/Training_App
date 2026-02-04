#!/bin/bash
# Script to start the backend server

cd "$(dirname "$0")/backend"

# Add PostgreSQL to PATH if needed
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

echo "🚀 Starting backend server..."
echo "📍 Backend will be available at: http://localhost:8000"
echo "📚 API docs will be available at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 run.py
