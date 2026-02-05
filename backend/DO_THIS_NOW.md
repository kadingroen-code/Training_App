# Do This Now - Step by Step Instructions

Follow these steps in order to set up your database and get OAuth working.

## Step 1: Install PostgreSQL (if not installed)

Open Terminal and run:

```bash
brew install postgresql@15
brew services start postgresql@15
```

Wait for installation to complete.

## Step 2: Create the Database

```bash
createdb endurance_training
```

If that gives an error, try:

```bash
psql postgres
```

Then in the psql prompt:
```sql
CREATE DATABASE endurance_training;
\q
```

## Step 3: Fix .env File Permissions

```bash
cd /Users/kadingroen/endurance-training-platform/backend
chmod 644 .env
```

## Step 4: Update .env File

Open `backend/.env` in a text editor and make sure it has:

```env
DATABASE_URL=postgresql://kadingroen@localhost:5432/endurance_training
```

(Replace `kadingroen` with your macOS username if different)

If the file doesn't exist or you can't edit it, create it with:

```bash
cd /Users/kadingroen/endurance-training-platform/backend
cat > .env << 'EOF'
DATABASE_URL=postgresql://kadingroen@localhost:5432/endurance_training
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
GARMIN_CLIENT_ID=
GARMIN_CLIENT_SECRET=
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
OAUTH_TOKEN_ENCRYPTION_KEY=
EOF
```

## Step 5: Initialize Database

```bash
cd /Users/kadingroen/endurance-training-platform/backend
python3 init_db.py
```

You should see:
```
✅ Database connection successful
✅ Database tables created successfully!
```

## Step 6: Generate Encryption Key

```bash
cd /Users/kadingroen/endurance-training-platform/backend
python3 generate_encryption_key.py
```

Copy the output (the long string after `OAUTH_TOKEN_ENCRYPTION_KEY=`) and add it to your `.env` file.

## Step 7: Verify Everything Works

```bash
cd /Users/kadingroen/endurance-training-platform/backend
python3 test_oauth_setup.py
```

## Quick Copy-Paste Commands

Run these in order:

```bash
# 1. Install PostgreSQL (if needed)
brew install postgresql@15
brew services start postgresql@15

# 2. Create database
createdb endurance_training

# 3. Go to backend directory
cd /Users/kadingroen/endurance-training-platform/backend

# 4. Fix permissions
chmod 644 .env

# 5. Update DATABASE_URL in .env (edit manually or use the cat command above)

# 6. Initialize database
python3 init_db.py

# 7. Generate encryption key
python3 generate_encryption_key.py

# 8. Add encryption key to .env (edit manually)

# 9. Test setup
python3 test_oauth_setup.py
```

## What Each Step Does

1. **Install PostgreSQL** - Database server needed to store data
2. **Create Database** - Creates the `endurance_training` database
3. **Fix Permissions** - Allows Python to read `.env` file
4. **Update .env** - Sets database connection string
5. **Initialize DB** - Creates all tables (users, oauth_tokens, etc.)
6. **Generate Key** - Creates encryption key for OAuth tokens
7. **Test** - Verifies everything is set up correctly

## Troubleshooting

### "brew: command not found"
Install Homebrew first:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### "createdb: command not found"
PostgreSQL might not be in your PATH. Try:
```bash
/opt/homebrew/bin/createdb endurance_training
# or
/usr/local/bin/createdb endurance_training
```

### "Operation not permitted: '.env'"
The code handles this now, but you can fix it:
```bash
chmod 644 .env
```

### "Database connection failed"
- Check PostgreSQL is running: `brew services list | grep postgres`
- Check DATABASE_URL in `.env` is correct
- Try: `psql -d endurance_training` to test connection

## Next Steps After Setup

Once the database is initialized:

1. Get OAuth credentials from Garmin and Strava
2. Add them to `.env`
3. Start server: `python3 run.py`
4. Test OAuth endpoints

See `OAUTH_SETUP.md` for OAuth configuration details.
