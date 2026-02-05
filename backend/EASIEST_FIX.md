# Easiest Fix: Use Your Username Instead

Since you're having permission issues with the "user" role, the **easiest solution** is to use your macOS username (`kadingroen`) which already has full permissions.

## Quick Fix

1. **Update `.env` file:**
   ```bash
   cd /Users/kadingroen/endurance-training-platform/backend
   nano .env
   ```
   
   Change this line:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/endurance_training
   ```
   
   To this:
   ```env
   DATABASE_URL=postgresql://kadingroen@localhost:5432/endurance_training
   ```
   
   Save and exit (Ctrl+X, Y, Enter)

2. **Run init_db.py:**
   ```bash
   python3 init_db.py
   ```

That's it! Your username already has full permissions, so it should work immediately.

## Alternative: Fix Existing Tables

If you want to keep using the "user" role, run:

```bash
./check_and_fix_tables.sh
```

This will either:
- Drop existing tables (recommended)
- Or grant ownership to "user" role

Then run `python3 init_db.py` again.

## Why This Works

Your macOS username (`kadingroen`) is the database owner and has all permissions. The "user" role you created needs additional permissions which can be complicated. Using your username is simpler and avoids permission issues.
