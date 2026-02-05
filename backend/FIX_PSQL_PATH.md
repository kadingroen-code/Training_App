# Fix: "command not found: psql"

## The Problem

PostgreSQL is installed, but `psql` command is not found because it's not in your PATH.

## The Solution

PostgreSQL is installed at: `/opt/homebrew/opt/postgresql@15/bin/psql`

Add this directory to your PATH.

## Quick Fix

Run these commands:

```bash
# Add PostgreSQL bin directory to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc

# Reload your shell
source ~/.zshrc

# Verify it works
psql --version
```

**Expected output:** `psql (PostgreSQL) 15.x`

## Alternative: Use Full Path

If PATH still doesn't work, you can use the full path directly:

```bash
# Instead of: psql
# Use: /opt/homebrew/opt/postgresql@15/bin/psql

# Example:
/opt/homebrew/opt/postgresql@15/bin/psql --version
/opt/homebrew/opt/postgresql@15/bin/createdb endurance_training
```

## Verify PATH is Set

Check if the path was added:

```bash
# Check your PATH
echo $PATH | grep postgresql

# Or check .zshrc
tail -3 ~/.zshrc
```

## If It Still Doesn't Work

1. **Close and reopen your terminal** - PATH changes only apply to new terminal sessions
2. **Or manually reload:** `source ~/.zshrc`
3. **Check the path exists:** `ls -la /opt/homebrew/opt/postgresql@15/bin/psql`

## After Fixing PATH

Once `psql --version` works, continue with:

```bash
# Step 2: Start PostgreSQL
brew services start postgresql@15

# Step 3: Create database
createdb endurance_training
```
