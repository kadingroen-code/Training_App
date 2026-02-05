# Complete Setup Guide - Step by Step

This guide will walk you through setting up everything needed to get the OAuth integration working.

## Step 1: Install PostgreSQL

If PostgreSQL is not installed:

```bash
# Install via Homebrew
brew install postgresql@15

# Start the service
brew services start postgresql@15
```

Or use the automated script:

```bash
cd backend
./setup_database.sh
```

## Step 2: Create Database

```bash
# Create the database
createdb endurance_training

# Or if that doesn't work:
psql postgres
CREATE DATABASE endurance_training;
\q
```

## Step 3: Fix .env File Permissions

```bash
cd backend
chmod 644 .env
```

## Step 4: Update .env with DATABASE_URL

Edit `backend/.env` and add/update:

```env
DATABASE_URL=postgresql://kadingroen@localhost:5432/endurance_training
```

Replace `kadingroen` with your actual PostgreSQL username if different.

## Step 5: Initialize Database Tables

```bash
cd backend
python3 init_db.py
```

You should see:
```
✅ Database connection successful
✅ Database tables created successfully!
```

## Step 6: Generate OAuth Encryption Key

```bash
cd backend
python3 generate_encryption_key.py
```

Copy the output and add to `.env`:
```env
OAUTH_TOKEN_ENCRYPTION_KEY=<generated_key>
```

## Step 7: Verify Setup

```bash
cd backend
python3 test_oauth_setup.py
```

## Quick Setup (All at Once)

Run the automated setup script:

```bash
cd backend
./setup_database.sh
python3 init_db.py
python3 generate_encryption_key.py
```

Then manually add the encryption key to `.env` and configure OAuth credentials.

## Troubleshooting

### "Operation not permitted: '.env'"

The code now handles this automatically, but you can fix it:

```bash
chmod 644 backend/.env
```

### "PostgreSQL not found"

Install it:
```bash
brew install postgresql@15
brew services start postgresql@15
```

### "Database connection failed"

1. Check PostgreSQL is running:
   ```bash
   brew services list | grep postgres
   ```

2. Check DATABASE_URL is correct in `.env`

3. Try connecting manually:
   ```bash
   psql -d endurance_training
   ```

### "Permission denied" errors

Some operations may need your password or sudo. The setup script will guide you.

## What's Next?

Once the database is initialized:

1. **Get OAuth credentials** from Garmin and Strava (see `OAUTH_SETUP.md`)
2. **Add credentials to `.env`**
3. **Start the server**: `python3 run.py`
4. **Test OAuth endpoints**

## Need Help?

- See `TROUBLESHOOTING.md` for detailed troubleshooting
- See `OAUTH_SETUP.md` for OAuth configuration
- See `QUICK_FIX_ENV.md` for .env permission fixes
