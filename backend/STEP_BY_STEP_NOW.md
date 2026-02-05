# Step-by-Step Setup Guide - Start Here

Follow these steps in order. Each step builds on the previous one.

## Current Status
- ✅ Homebrew is installed
- ✅ PostgreSQL is installed (you already completed this!)
- ❌ Database not created yet
- ❌ OAuth not configured yet

---

## Step 1: Add PostgreSQL to Your PATH

After installation, make sure `psql` is available. PostgreSQL is installed at `/opt/homebrew/opt/postgresql@15/bin/`.

**Try this first (adds PostgreSQL-specific bin directory):**

```bash
# Add PostgreSQL bin directory to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc

# Reload your shell configuration
source ~/.zshrc

# Verify psql is now available
psql --version
```

**Expected output:** Should show PostgreSQL version (e.g., "psql (PostgreSQL) 15.x")

**If that doesn't work, try the full Homebrew bin path:**

```bash
# Add full Homebrew bin to PATH
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
psql --version
```

**If still "command not found":** Use the full path directly:
```bash
/opt/homebrew/opt/postgresql@15/bin/psql --version
```

If the full path works, the PATH just needs to be updated. Make sure you restarted your terminal or ran `source ~/.zshrc`.

---

## Step 2: Start PostgreSQL Service

Start the PostgreSQL server:

```bash
# Start PostgreSQL service
brew services start postgresql@15

# Verify it's running
brew services list | grep postgres
```

**Expected output:** Should show `postgresql@15` as "started" (green dot).

---

## Step 3: Create the Database

Create the `endurance_training` database:

```bash
# Create the database
createdb endurance_training

# Verify it was created
psql -l | grep endurance_training
```

**Expected output:** Should show `endurance_training` in the list.

**If it fails:** We may need to create a PostgreSQL user first. Share the error.

---

## Step 4: Fix .env File Permissions

Make sure Python can read the `.env` file:

```bash
cd /Users/kadingroen/endurance-training-platform/backend
chmod 644 .env
```

---

## Step 5: Update .env File with DATABASE_URL

Edit the `.env` file and make sure it has:

```env
DATABASE_URL=postgresql://kadingroen@localhost:5432/endurance_training
```

**To edit:**
```bash
# Open in your default editor
open -e .env

# Or use nano
nano .env

# Or use vim
vim .env
```

**Add this line if it's not there:**
```
DATABASE_URL=postgresql://kadingroen@localhost:5432/endurance_training
```

(Replace `kadingroen` with your actual macOS username if different)

---

## Step 6: Initialize Database Tables

Create all the database tables (users, oauth_tokens, etc.):

```bash
cd /Users/kadingroen/endurance-training-platform/backend
python3 init_db.py
```

**Expected output:**
```
✅ Database connection successful
✅ Database tables created successfully!

Tables created:
  - users
  - athlete_profiles
  - workout_templates
  - calendar_events
  - pairs_logs
  - oauth_tokens
```

**If you see errors:** Share them and we'll fix them.

---

## Step 7: Generate OAuth Encryption Key

Generate a secure key for encrypting OAuth tokens:

```bash
cd /Users/kadingroen/endurance-training-platform/backend
python3 generate_encryption_key.py
```

**Copy the output** - it will look like:
```
OAUTH_TOKEN_ENCRYPTION_KEY=E5dts42Q2CpQODvxbZMicgY2sfUcjXRrZBZ2v656DaI=
```

---

## Step 8: Add Encryption Key to .env

Edit `.env` again and add the encryption key:

```bash
# Open .env
nano .env
```

**Add this line:**
```
OAUTH_TOKEN_ENCRYPTION_KEY=<paste_the_key_from_step_10>
```

**Save and exit** (Ctrl+X, then Y, then Enter in nano).

---

## Step 9: Verify Everything Works

Run the test suite:

```bash
cd /Users/kadingroen/endurance-training-platform/backend
python3 test_oauth_setup.py
```

**Expected output:** Should see mostly ✅ marks.

**If you see ❌ marks:** Share the output and we'll fix the issues.

---

## Step 10: Get OAuth Credentials (Optional - For Later)

Once the database is set up, you can configure OAuth:

### Garmin Connect:
1. Visit: https://developer.garmin.com/gc-developer-program/
2. Register your application
3. Set redirect URI: `http://localhost:8000/api/integrations/garmin/oauth/callback`
4. Copy Client ID and Secret

### Strava:
1. Visit: https://www.strava.com/settings/api
2. Create application
3. Set redirect URI: `http://localhost:8000/api/integrations/strava/oauth/callback`
4. Copy Client ID and Secret

### Add to .env:
```env
GARMIN_CLIENT_ID=your_client_id
GARMIN_CLIENT_SECRET=your_client_secret
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
```

---

## Step 11: Start the Server (Final Step)

Once everything is set up:

```bash
cd /Users/kadingroen/endurance-training-platform/backend
python3 run.py
```

**Expected output:** Server starts on `http://localhost:8000`

---

## Quick Reference: All Commands in Order

Copy and paste these one at a time:

```bash
# Step 1: Add to PATH
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
psql --version

# Step 2: Start service
brew services start postgresql@15

# Step 3: Create database
createdb endurance_training

# Step 4: Fix .env permissions
cd /Users/kadingroen/endurance-training-platform/backend
chmod 644 .env

# Step 5: Update .env (edit manually - see step 5 above)

# Step 6: Initialize database
python3 init_db.py

# Step 7: Generate encryption key
python3 generate_encryption_key.py

# Step 8: Add key to .env (edit manually - see step 8 above)

# Step 9: Test
python3 test_oauth_setup.py

# Step 10: Get OAuth credentials (optional - for later)

# Step 11: Start server
python3 run.py
```

---

## Troubleshooting

### If Step 1 fails (psql not found):
- Try: `which psql` to find where it's installed
- May need: `/opt/homebrew/opt/postgresql@15/bin/psql` instead

### If Step 3 fails (database creation):
- May need to create a PostgreSQL user first
- Share the error message

### If Step 6 fails (init_db.py):
- Check DATABASE_URL in .env is correct
- Check PostgreSQL is running: `brew services list`
- Share the error message

---

## What's Next After Setup?

Once all steps are complete:

1. ✅ Database is initialized
2. ✅ OAuth encryption is configured
3. ✅ Server can start
4. ⏭️ Get OAuth credentials from Garmin/Strava (when ready)
5. ⏭️ Test OAuth flow
6. ⏭️ Start syncing activities!

---

## Need Help?

If you get stuck at any step:
1. Share the exact command you ran
2. Share the exact error message
3. I'll help you fix it!

Good luck! 🚀
