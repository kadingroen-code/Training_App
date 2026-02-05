# Fix: "permission denied for schema public"

## The Problem

The PostgreSQL user "user" doesn't have permission to create tables in the `public` schema.

## Quick Fix

Run this command to grant the necessary permissions:

```bash
cd /Users/kadingroen/endurance-training-platform/backend
./fix_postgres_permissions.sh
```

## Manual Fix (Alternative)

If the script doesn't work, run these SQL commands manually:

```bash
psql -d endurance_training
```

Then in the psql prompt, run:

```sql
GRANT USAGE ON SCHEMA public TO "user";
GRANT CREATE ON SCHEMA public TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "user";
\q
```

## After Fixing

Once permissions are granted, run:

```bash
python3 init_db.py
```

It should work now!

## Alternative: Use Your Username Instead

If you prefer, you can use your macOS username (`kadingroen`) instead of "user":

1. Update `.env`:
   ```env
   DATABASE_URL=postgresql://kadingroen@localhost:5432/endurance_training
   ```

2. Your username already has full permissions, so `init_db.py` should work immediately.
