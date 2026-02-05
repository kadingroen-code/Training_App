# Troubleshooting Database Initialization

## Issue: "Operation not permitted: '.env'"

This error occurs when Python can't read the `.env` file due to permissions.

### Solution 1: Fix .env Permissions

```bash
cd backend
chmod 644 .env
```

### Solution 2: Use Environment Variables Instead

Set DATABASE_URL directly in your shell:

```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/endurance_training"
python3 init_db.py
```

### Solution 3: Use init_db_fixed.py

This script reads .env manually and handles permission issues:

```bash
cd backend
python3 init_db_fixed.py
```

### Solution 4: Check .env File Location

Make sure you're running from the `backend` directory:

```bash
cd /Users/kadingroen/endurance-training-platform/backend
python3 init_db.py
```

## Issue: "Database connection failed"

### Check PostgreSQL is Running

```bash
# Check if PostgreSQL is running
brew services list

# Start PostgreSQL if needed
brew services start postgresql@15
# or
brew services start postgresql
```

### Create Database

```bash
# Create the database
createdb endurance_training

# Or using psql
psql postgres
CREATE DATABASE endurance_training;
\q
```

### Verify DATABASE_URL

Check your `.env` file has the correct DATABASE_URL:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/endurance_training
```

Replace:
- `username` with your PostgreSQL username (often your macOS username)
- `password` with your PostgreSQL password (may be empty)
- `5432` is the default PostgreSQL port

## Issue: "No such file or directory"

### Make sure you're in the right directory

```bash
cd /Users/kadingroen/endurance-training-platform/backend
pwd  # Should show: .../endurance-training-platform/backend
```

### Check files exist

```bash
ls -la init_db.py
ls -la app/core/database.py
ls -la app/models/
```

### Install dependencies

```bash
pip install -r requirements.txt
```

## Quick Fix: Manual Database Setup

If all else fails, you can set up the database manually:

1. **Start PostgreSQL:**
   ```bash
   brew services start postgresql@15
   ```

2. **Create database:**
   ```bash
   createdb endurance_training
   ```

3. **Set DATABASE_URL in environment:**
   ```bash
   export DATABASE_URL="postgresql://your_username@localhost:5432/endurance_training"
   ```

4. **Run init script:**
   ```bash
   python3 init_db.py
   ```

## Still Having Issues?

1. Check PostgreSQL logs:
   ```bash
   tail -f /usr/local/var/log/postgresql@15.log
   # or
   tail -f /opt/homebrew/var/log/postgresql@15.log
   ```

2. Test PostgreSQL connection:
   ```bash
   psql -d endurance_training -c "SELECT version();"
   ```

3. Verify Python can import modules:
   ```bash
   cd backend
   python3 -c "from app.core.database import engine; print('OK')"
   ```
