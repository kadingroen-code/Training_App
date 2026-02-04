# Setup Complete! ✅

All manual setup steps have been completed successfully!

## What Was Installed

✅ **Node.js v25.5.0** - Installed via Homebrew  
✅ **PostgreSQL 15.15** - Installed and running via Homebrew  
✅ **Database `endurance_training`** - Created and initialized  
✅ **Backend Dependencies** - All Python packages installed  
✅ **Frontend Dependencies** - All npm packages installed  
✅ **Environment Files** - Created and configured  
✅ **Database Tables** - All 5 tables created:
   - users
   - athlete_profiles
   - workout_templates
   - calendar_events
   - pairs_logs

## How to Start the Application

### Start Backend Server

Open Terminal 1:

```bash
cd /Users/kadingroen/endurance-training-platform/backend
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
python3 run.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Start Frontend Server

Open Terminal 2:

```bash
cd /Users/kadingroen/endurance-training-platform/frontend
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
```

## Verify Everything Works

1. **Test Backend Health:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy"}`

2. **Test Backend API:**
   ```bash
   curl http://localhost:8000/
   ```
   Should return API information

3. **View API Documentation:**
   - Open browser to: `http://localhost:8000/docs`
   - Interactive Swagger UI for all API endpoints

4. **View Frontend:**
   - Open browser to: `http://localhost:3000`
   - You should see the Dynamic Endurance Training Platform homepage

## Important Notes

### PostgreSQL PATH

PostgreSQL was installed as "keg-only" by Homebrew, which means it's not automatically in your PATH. 

**Option 1: Add to your shell profile (recommended)**

Add this line to `~/.zshrc`:
```bash
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
```

Then reload:
```bash
source ~/.zshrc
```

**Option 2: Export in each terminal session**

Before running backend commands:
```bash
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
```

### PostgreSQL Service

PostgreSQL is running as a background service. To manage it:

```bash
# Check status
brew services list | grep postgresql

# Stop PostgreSQL
brew services stop postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Restart PostgreSQL
brew services restart postgresql@15
```

### Environment Files

- `backend/.env` - Contains database URL and configuration
- `frontend/.env.local` - Contains API URL

These files are in `.gitignore` and won't be committed to git.

## Next Steps

1. **Explore the API:**
   - Visit `http://localhost:8000/docs` for interactive API documentation
   - Test endpoints using the Swagger UI

2. **Create Test Data:**
   - Create users (coaches and athletes)
   - Create athlete profiles with VDOT/FTP values
   - Create workout templates
   - Test the dynamic scaling engine

3. **Review Documentation:**
   - `README.md` - Project overview and API endpoints
   - `EXAMPLES.md` - Workout template examples
   - `QUICK_START.md` - Quick reference guide

## Troubleshooting

### Backend won't start

1. **Check PostgreSQL is running:**
   ```bash
   brew services list | grep postgresql
   ```

2. **Check database connection:**
   ```bash
   export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
   psql -d endurance_training -c "SELECT 1;"
   ```

3. **Verify .env file:**
   ```bash
   cat backend/.env | grep DATABASE_URL
   ```

### Frontend won't start

1. **Check Node.js:**
   ```bash
   node --version
   ```

2. **Reinstall dependencies:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

### Database connection errors

1. **Verify PostgreSQL is running:**
   ```bash
   brew services start postgresql@15
   ```

2. **Check DATABASE_URL in backend/.env:**
   - Should be: `postgresql://kadingroen@localhost:5432/endurance_training`
   - If your PostgreSQL has a password, add it: `postgresql://kadingroen:password@localhost:5432/endurance_training`

## Summary

Your Dynamic Endurance Training Platform is now fully set up and ready to use! 🎉

All components are installed, configured, and the database is initialized. You can now start developing and testing the application.
