# Quick Fix for .env Permission Issues

## The Problem

You're getting: `PermissionError: [Errno 1] Operation not permitted: '.env'`

This happens when Python can't read your `.env` file due to file permissions or macOS security settings.

## The Solution

The code has been updated to handle this automatically! It will:
1. Try to read `.env` file
2. If it fails due to permissions, use defaults and environment variables
3. Continue working normally

## Quick Fixes

### Option 1: Fix File Permissions (Recommended)

```bash
cd backend
chmod 644 .env
```

### Option 2: Use Environment Variables

Instead of relying on `.env`, set variables directly:

```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/endurance_training"
python3 init_db.py
```

### Option 3: Just Run It!

The code now handles permission errors automatically. Just run:

```bash
cd backend
python3 init_db.py
```

It will use defaults if `.env` can't be read, but you should still set `DATABASE_URL` in your environment or fix the `.env` permissions.

## Verify It Works

```bash
cd backend
python3 -c "from app.core.config import settings; print('✅ Config loaded successfully')"
```

If you see the checkmark, it's working!

## Next Steps

1. **Fix .env permissions:**
   ```bash
   chmod 644 backend/.env
   ```

2. **Or set DATABASE_URL in environment:**
   ```bash
   export DATABASE_URL="postgresql://your_user@localhost:5432/endurance_training"
   ```

3. **Initialize database:**
   ```bash
   python3 init_db.py
   ```

The code will now work even if `.env` has permission issues, but you'll need to set `DATABASE_URL` via environment variables instead.
