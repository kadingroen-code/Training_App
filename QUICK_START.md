# Quick Start Guide - Manual Setup Steps

Follow these steps in order to complete the setup.

## Step 1: Install Node.js

Since you have Homebrew installed, this is straightforward:

```bash
brew install node
```

**Verify installation:**
```bash
node --version  # Should show v18.x or higher
npm --version   # Should show 9.x or higher
```

## Step 2: Install PostgreSQL

Using Homebrew:

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Verify installation:**
```bash
psql --version  # Should show PostgreSQL version
```

**Create the database:**
```bash
createdb endurance_training
```

**Test connection:**
```bash
psql -d endurance_training -c "SELECT version();"
```

## Step 3: Create Environment Files

### Backend Environment (`backend/.env`)

Run this command to create the file:

```bash
cat > backend/.env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://$(whoami)@localhost:5432/endurance_training

# Security
SECRET_KEY=dev-secret-key-change-in-production-use-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (comma-separated list)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# OAuth Providers (optional - leave empty if not testing integrations)
GARMIN_CLIENT_ID=
GARMIN_CLIENT_SECRET=
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=

# API Base URLs
GARMIN_API_BASE_URL=https://connectapi.garmin.com
STRAVA_API_BASE_URL=https://www.strava.com/api/v3
EOF
```

**Note:** The `DATABASE_URL` uses `$(whoami)` which will insert your macOS username. If your PostgreSQL requires a password, you'll need to edit the file and add it:
```
DATABASE_URL=postgresql://username:password@localhost:5432/endurance_training
```

### Frontend Environment (`frontend/.env.local`)

```bash
cat > frontend/.env.local << 'EOF'
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
```

## Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## Step 5: Initialize Database Tables

```bash
cd backend
python3 init_db.py
cd ..
```

You should see: "Database tables created successfully!"

## Step 6: Start the Servers

### Terminal 1 - Backend Server

```bash
cd backend
python3 run.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Terminal 2 - Frontend Server

```bash
cd frontend
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
```

## Step 7: Verify Everything Works

1. **Test Backend Health:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy"}`

2. **Test Backend Root:**
   ```bash
   curl http://localhost:8000/
   ```
   Should return API information

3. **Open Frontend:**
   - Open your browser to `http://localhost:3000`
   - You should see the Dynamic Endurance Training Platform homepage

4. **Check API Docs:**
   - Visit `http://localhost:8000/docs` for interactive API documentation

## Troubleshooting

### PostgreSQL Connection Issues

If you get connection errors:

1. **Check if PostgreSQL is running:**
   ```bash
   brew services list | grep postgresql
   ```

2. **Start PostgreSQL if needed:**
   ```bash
   brew services start postgresql@15
   ```

3. **Check your username:**
   ```bash
   whoami  # Use this in DATABASE_URL
   ```

4. **If PostgreSQL has a password:**
   - Edit `backend/.env`
   - Update `DATABASE_URL` to include password:
     ```
     DATABASE_URL=postgresql://username:password@localhost:5432/endurance_training
     ```

### Node.js Issues

If `npm install` fails:

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Try again:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

### Database Initialization Issues

If `init_db.py` fails:

1. **Check database connection:**
   ```bash
   psql -d endurance_training -c "SELECT 1;"
   ```

2. **Verify DATABASE_URL in backend/.env:**
   ```bash
   cat backend/.env | grep DATABASE_URL
   ```

3. **Check Python can import modules:**
   ```bash
   cd backend
   python3 -c "from app.core.database import engine; print('OK')"
   ```

## Next Steps After Setup

Once everything is running:

1. Explore the API at `http://localhost:8000/docs`
2. Check out the frontend at `http://localhost:3000`
3. Review the README.md for API endpoints
4. Check EXAMPLES.md for workout template examples
