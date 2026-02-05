# Fix: "command not found: psql"

## The Problem

You're seeing `zsh: command not found: psql` because PostgreSQL is not installed on your system.

## Solution: Install PostgreSQL

### Option 1: Install via Homebrew (Recommended)

Run the installation script:

```bash
cd /Users/kadingroen/endurance-training-platform/backend
./install_postgres_simple.sh
```

This script will:
1. ✅ Check if Homebrew is installed
2. ✅ Check if PostgreSQL is already installed
3. ✅ Install PostgreSQL with error handling
4. ✅ Set up PATH if needed
5. ✅ Start the PostgreSQL service

### Option 2: Manual Installation

If the script doesn't work, try manually:

```bash
# 1. Install PostgreSQL
brew install postgresql@15

# 2. Add to PATH (for Apple Silicon Mac)
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 3. Start the service
brew services start postgresql@15

# 4. Verify installation
psql --version
```

### Option 3: Use Postgres.app (Easiest)

If Homebrew continues to fail:

1. **Download Postgres.app:**
   - Visit: https://postgresapp.com/
   - Download and install

2. **Start the app:**
   - Open Postgres.app from Applications
   - Click "Initialize" if prompted

3. **Add to PATH:**
   ```bash
   echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

4. **Verify:**
   ```bash
   psql --version
   ```

## After Installation

Once `psql` is available:

```bash
# Create the database
createdb endurance_training

# Or if that doesn't work:
psql postgres
# Then in psql:
CREATE DATABASE endurance_training;
\q
```

## Verify Installation

Check if PostgreSQL is installed:

```bash
# Check if psql is available
which psql

# Check version
psql --version

# Check if service is running
brew services list | grep postgres
```

## Troubleshooting

### "brew: command not found"
Install Homebrew first:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### "Operation not permitted" during install
Fix permissions:
```bash
sudo chown -R $(whoami) $(brew --prefix)/*
brew doctor
```

### "psql: command not found" after installation
Add PostgreSQL to your PATH:
```bash
# For Apple Silicon (M1/M2/M3)
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# For Intel Mac
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Still having issues?
Run the diagnostic script:
```bash
cd /Users/kadingroen/endurance-training-platform/backend
./diagnose_postgres_install.sh
```

## Quick Start After Installation

Once PostgreSQL is installed and `psql` works:

```bash
# 1. Create database
createdb endurance_training

# 2. Go to backend
cd /Users/kadingroen/endurance-training-platform/backend

# 3. Update .env with DATABASE_URL
# DATABASE_URL=postgresql://kadingroen@localhost:5432/endurance_training

# 4. Initialize database tables
python3 init_db.py
```
