# PostgreSQL Installation Troubleshooting

## Quick Diagnostic

Run this diagnostic script to identify the issue:

```bash
cd /Users/kadingroen/endurance-training-platform/backend
./diagnose_postgres_install.sh
```

This will test:
- ✅ Homebrew installation
- ✅ Permissions
- ✅ Network connectivity
- ✅ Disk space
- ✅ Cache issues
- ✅ Actual installation attempt

## Common Issues and Fixes

### Issue 1: "Operation not permitted" errors

**Fix:**
```bash
# Fix Homebrew permissions
sudo chown -R $(whoami) $(brew --prefix)/*
brew doctor
```

### Issue 2: Cache corruption

**Fix:**
```bash
# Clean Homebrew cache
brew cleanup
rm -rf ~/Library/Caches/Homebrew
brew update
```

### Issue 3: Network/API errors

**Fix:**
```bash
# Update Homebrew
brew update

# If GitHub is blocked, try a mirror
export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.ustc.edu.cn/homebrew-bottles
brew install postgresql@15
```

### Issue 4: Homebrew not in PATH

**Fix:**
```bash
# Add Homebrew to PATH (for Apple Silicon)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc

# Or for Intel Mac
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

### Issue 5: Missing dependencies

**Fix:**
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Then try again
brew install postgresql@15
```

## Alternative: Use Postgres.app

If Homebrew continues to fail, use Postgres.app instead:

1. Download from: https://postgresapp.com/
2. Install and start the app
3. Use this DATABASE_URL in `.env`:
   ```env
   DATABASE_URL=postgresql://localhost:5432/endurance_training
   ```

## After Successful Installation

Once PostgreSQL is installed:

```bash
# Start the service
brew services start postgresql@15

# Create the database
createdb endurance_training

# Continue with init_db.py
cd /Users/kadingroen/endurance-training-platform/backend
python3 init_db.py
```
