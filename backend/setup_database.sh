#!/bin/bash

# Database Setup Script
# This script helps set up PostgreSQL and initialize the database

set -e

echo "=========================================="
echo "Database Setup for Endurance Training Platform"
echo "=========================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL (psql) not found"
    echo ""
    echo "Installing PostgreSQL..."
    echo ""
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew not found. Please install Homebrew first:"
        echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    
    echo "Installing PostgreSQL via Homebrew..."
    brew install postgresql@15
    
    echo ""
    echo "✅ PostgreSQL installed"
    echo ""
fi

# Start PostgreSQL service
echo "Starting PostgreSQL service..."
if brew services list | grep -q "postgresql"; then
    brew services start postgresql@15 2>/dev/null || brew services start postgresql 2>/dev/null
else
    # Try to start manually
    pg_ctl -D /usr/local/var/postgresql@15 start 2>/dev/null || \
    pg_ctl -D /opt/homebrew/var/postgresql@15 start 2>/dev/null || \
    echo "⚠️  Could not start PostgreSQL automatically. Please start it manually."
fi

echo "✅ PostgreSQL service started"
echo ""

# Wait a moment for PostgreSQL to be ready
sleep 2

# Get current username
DB_USER="${USER:-$(whoami)}"
DB_NAME="endurance_training"

echo "Creating database: $DB_NAME"
echo "Using user: $DB_USER"
echo ""

# Create database (will fail gracefully if it already exists)
createdb "$DB_NAME" 2>/dev/null || {
    if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        echo "✅ Database '$DB_NAME' already exists"
    else
        echo "❌ Failed to create database. Trying with psql..."
        psql postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || {
            echo "⚠️  Could not create database automatically."
            echo "   Please run manually: createdb $DB_NAME"
            echo "   Or: psql postgres -c \"CREATE DATABASE $DB_NAME;\""
        }
    fi
}

echo ""

# Set DATABASE_URL
DB_URL="postgresql://$DB_USER@localhost:5432/$DB_NAME"
echo "DATABASE_URL=$DB_URL"
echo ""

# Update .env file if possible
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    # Check if DATABASE_URL already exists in .env
    if grep -q "DATABASE_URL" "$ENV_FILE"; then
        echo "⚠️  DATABASE_URL already exists in .env"
        echo "   Current value: $(grep DATABASE_URL "$ENV_FILE" | head -1)"
        echo ""
        read -p "Update DATABASE_URL in .env? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Try to update (may fail due to permissions)
            if sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$DB_URL|" "$ENV_FILE" 2>/dev/null; then
                echo "✅ Updated DATABASE_URL in .env"
            else
                echo "⚠️  Could not update .env automatically (permission issue)"
                echo "   Please manually update .env:"
                echo "   DATABASE_URL=$DB_URL"
            fi
        fi
    else
        echo "Adding DATABASE_URL to .env..."
        if echo "" >> "$ENV_FILE" && echo "DATABASE_URL=$DB_URL" >> "$ENV_FILE" 2>/dev/null; then
            echo "✅ Added DATABASE_URL to .env"
        else
            echo "⚠️  Could not write to .env (permission issue)"
            echo "   Please manually add to .env:"
            echo "   DATABASE_URL=$DB_URL"
        fi
    fi
else
    echo "Creating .env file..."
    cat > "$ENV_FILE" << EOF
# Database Configuration
DATABASE_URL=$DB_URL

# Security
SECRET_KEY=dev-secret-key-change-in-production-use-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# OAuth Providers (configure later)
GARMIN_CLIENT_ID=
GARMIN_CLIENT_SECRET=
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
OAUTH_TOKEN_ENCRYPTION_KEY=
EOF
    echo "✅ Created .env file"
fi

echo ""
echo "=========================================="
echo "Database Setup Complete!"
echo "=========================================="
echo ""
echo "Next step: Initialize database tables"
echo "  python3 init_db.py"
echo ""
