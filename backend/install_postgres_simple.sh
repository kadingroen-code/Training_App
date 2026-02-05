#!/bin/bash

# Simple PostgreSQL Installation Script
# This script will help install PostgreSQL step by step

set -e

echo "=========================================="
echo "PostgreSQL Installation Guide"
echo "=========================================="
echo ""

# Step 1: Check Homebrew
echo "Step 1: Checking Homebrew..."
if command -v brew &> /dev/null; then
    echo "✅ Homebrew is installed"
    BREW_VERSION=$(brew --version | head -1)
    echo "   $BREW_VERSION"
else
    echo "❌ Homebrew is not installed"
    echo ""
    echo "Please install Homebrew first:"
    echo '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    echo ""
    echo "After installing Homebrew, run this script again."
    exit 1
fi
echo ""

# Step 2: Check if PostgreSQL is already installed
echo "Step 2: Checking for existing PostgreSQL installation..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo "✅ PostgreSQL is already installed!"
    echo "   $PSQL_VERSION"
    echo ""
    echo "You can skip installation and go directly to creating the database."
    exit 0
fi

# Check common installation locations
if [ -f "/opt/homebrew/bin/psql" ] || [ -f "/usr/local/bin/psql" ]; then
    echo "✅ PostgreSQL binaries found but not in PATH"
    echo "   You may need to add PostgreSQL to your PATH"
else
    echo "⚠️  PostgreSQL not found - needs to be installed"
fi
echo ""

# Step 3: Try to install PostgreSQL
echo "Step 3: Installing PostgreSQL..."
echo ""

# Check what went wrong with previous installation attempt
echo "Attempting installation with verbose output..."
echo "If this fails, the error message will help diagnose the issue."
echo ""

if brew install postgresql@15 2>&1 | tee /tmp/postgres_install.log; then
    echo ""
    echo "✅ PostgreSQL installed successfully!"
    echo ""
    
    # Step 4: Add to PATH if needed
    echo "Step 4: Setting up PATH..."
    BREW_PREFIX=$(brew --prefix)
    PSQL_PATH="$BREW_PREFIX/bin/psql"
    
    if [ -f "$PSQL_PATH" ]; then
        echo "✅ PostgreSQL installed at: $PSQL_PATH"
        echo ""
        echo "To use psql, you may need to add to your PATH:"
        echo "  export PATH=\"$BREW_PREFIX/bin:\$PATH\""
        echo ""
        echo "Or add to ~/.zshrc:"
        echo "  echo 'export PATH=\"$BREW_PREFIX/bin:\$PATH\"' >> ~/.zshrc"
        echo "  source ~/.zshrc"
    fi
    
    # Step 5: Start PostgreSQL service
    echo ""
    echo "Step 5: Starting PostgreSQL service..."
    if brew services start postgresql@15 2>&1; then
        echo "✅ PostgreSQL service started"
    else
        echo "⚠️  Could not start service automatically"
        echo "   Try manually: brew services start postgresql@15"
    fi
    
    echo ""
    echo "=========================================="
    echo "Installation Complete!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "  1. Add PostgreSQL to PATH (see above)"
    echo "  2. Create database: createdb endurance_training"
    echo "  3. Run: python3 init_db.py"
    
else
    INSTALL_EXIT=$?
    echo ""
    echo "❌ Installation failed with exit code: $INSTALL_EXIT"
    echo ""
    echo "Error details saved to: /tmp/postgres_install.log"
    echo ""
    echo "Common issues and fixes:"
    echo ""
    echo "1. Permission errors:"
    echo "   sudo chown -R \$(whoami) \$(brew --prefix)/*"
    echo ""
    echo "2. Cache issues:"
    echo "   brew cleanup"
    echo "   rm -rf ~/Library/Caches/Homebrew"
    echo "   brew update"
    echo ""
    echo "3. Network issues:"
    echo "   Check your internet connection"
    echo "   Try: brew update"
    echo ""
    echo "4. Alternative: Use Postgres.app"
    echo "   Download from: https://postgresapp.com/"
    echo ""
    echo "Full error log:"
    tail -30 /tmp/postgres_install.log
    exit 1
fi
