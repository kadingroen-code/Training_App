#!/bin/bash

# Quick OAuth Setup Script
# This script helps set up OAuth integrations quickly

echo "=========================================="
echo "OAuth Integration Quick Setup"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Creating .env template..."
    cat > .env << EOF
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/endurance_training

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# OAuth Providers - Garmin
GARMIN_CLIENT_ID=
GARMIN_CLIENT_SECRET=
GARMIN_OAUTH_REDIRECT_URI=http://localhost:8000/api/integrations/garmin/oauth/callback

# OAuth Providers - Strava
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_OAUTH_REDIRECT_URI=http://localhost:8000/api/integrations/strava/oauth/callback
STRAVA_WEBHOOK_SECRET=
STRAVA_VERIFY_TOKEN=

# Token Encryption
OAUTH_TOKEN_ENCRYPTION_KEY=

# API Base URLs
GARMIN_API_BASE_URL=https://connectapi.garmin.com
STRAVA_API_BASE_URL=https://www.strava.com/api/v3
EOF
    echo "✅ Created .env file template"
    echo "⚠️  Please edit .env and add your OAuth credentials"
    echo ""
fi

# Generate encryption key if not set
echo "Generating encryption key..."
python3 generate_encryption_key.py
echo ""
echo "⚠️  Copy the encryption key above to OAUTH_TOKEN_ENCRYPTION_KEY in .env"
echo ""

# Check Python dependencies
echo "Checking Python dependencies..."
if ! python3 -c "import cryptography" 2>/dev/null; then
    echo "⚠️  cryptography not installed. Installing..."
    pip install cryptography
fi

if ! python3 -c "import httpx" 2>/dev/null; then
    echo "⚠️  httpx not installed. Installing..."
    pip install httpx
fi

echo "✅ Dependencies checked"
echo ""

# Initialize database
echo "Initializing database..."
if python3 init_db.py; then
    echo "✅ Database initialized"
else
    echo "❌ Database initialization failed"
    echo "   Make sure PostgreSQL is running and DATABASE_URL is correct"
    exit 1
fi
echo ""

# Run setup checker
echo "Running OAuth setup checker..."
python3 setup_oauth.py
echo ""

# Run tests
echo "Running OAuth tests..."
python3 test_oauth_setup.py
echo ""

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Add OAuth credentials to .env (see OAUTH_SETUP.md)"
echo "2. Run: python setup_oauth.py to verify configuration"
echo "3. Start server: python run.py"
echo "4. Test OAuth endpoints"
echo ""
