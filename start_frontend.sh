#!/bin/bash
# Script to start the frontend server

cd "$(dirname "$0")/frontend"

echo "🚀 Starting frontend server..."
echo "📍 Frontend will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
