# Local Development Setup Guide

This guide will help you complete the setup of the Dynamic Endurance Training Platform for local development.

## Prerequisites

Before starting, ensure you have:
- Python 3.8+ (✅ Installed: Python 3.13.7)
- Node.js 18+ (❌ Not installed - see below)
- PostgreSQL 12+ (❌ Not installed - see below)
- npm (comes with Node.js)

## Completed Steps

✅ Backend Python dependencies installed
✅ Environment file templates documented below

## Remaining Setup Steps

### 1. Create Environment Files

#### Backend Environment (`backend/.env`)

Create a file `backend/.env` with the following content:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/endurance_training

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
```

**Important:** Update `DATABASE_URL` with your actual PostgreSQL credentials after installing PostgreSQL.

#### Frontend Environment (`frontend/.env.local`)

Create a file `frontend/.env.local` with:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Install Node.js

#### macOS (using Homebrew)
```bash
brew install node
```

#### macOS (using official installer)
Download from [nodejs.org](https://nodejs.org/)

#### Verify installation
```bash
node --version
npm --version
```

### 3. Install Frontend Dependencies

Once Node.js is installed:

```bash
cd frontend
npm install
```

### 4. Install PostgreSQL

#### macOS (using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### macOS (using Postgres.app)
Download from [postgresapp.com](https://postgresapp.com/)

#### Create Database

After PostgreSQL is running, create the database:

```bash
# Using psql
psql postgres
CREATE DATABASE endurance_training;
\q

# Or using createdb command
createdb endurance_training
```

### 5. Update Database URL

Edit `backend/.env` and update the `DATABASE_URL` with your PostgreSQL credentials:

```env
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/endurance_training
```

If you're using the default PostgreSQL setup on macOS:
- Username: your macOS username (or `postgres`)
- Password: (may be empty or set during installation)
- Port: 5432 (default)

### 6. Initialize Database Tables

**Important Note:** The codebase uses SQLAlchemy (not Prisma) for database operations. The Prisma schema exists but is not actively used by the application code.

From the `backend/` directory:

```bash
cd backend
python3 init_db.py
```

This will:
- Create all database tables using SQLAlchemy models
- Set up the schema based on the models in `app/models/`

**Alternative:** If you prefer to use Prisma (for future migration), you can also run:
```bash
npx prisma generate
npx prisma db push
```
However, the application code currently uses SQLAlchemy, so `init_db.py` is the recommended approach.

### 7. Verify Setup

#### Start Backend Server

```bash
cd backend
python3 run.py
# Or: uvicorn app.main:app --reload --port 8000
```

The backend should start on `http://localhost:8000`

Test the health endpoint:
```bash
curl http://localhost:8000/health
```

#### Start Frontend Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:3000`

#### Verify Connection

1. Open `http://localhost:3000` in your browser
2. Check the browser console for any API connection errors
3. The frontend should be able to communicate with the backend API

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `brew services list` (if using Homebrew)
- Check connection: `psql -d endurance_training`
- Verify DATABASE_URL format in `backend/.env`

### Prisma Issues

- Ensure Node.js is installed: `node --version`
- Ensure you're in the `backend/` directory when running Prisma commands
- Check that `DATABASE_URL` is correctly set in `backend/.env`

### Port Conflicts

- Backend default: 8000 (change in `run.py` if needed)
- Frontend default: 3000 (Next.js will auto-increment if 3000 is taken)

### Python Import Errors

- Ensure all dependencies are installed: `pip3 list`
- If using a virtual environment, activate it before running the server

## Next Steps

Once setup is complete:
1. Create test users (coaches and athletes)
2. Create workout templates
3. Test the dynamic scaling engine
4. Explore the API endpoints at `http://localhost:8000/docs` (FastAPI auto-generated docs)

## Additional Notes

- The backend uses both SQLAlchemy and Prisma. Verify which ORM is actually being used in the routers.
- For production, change `SECRET_KEY` to a secure random string.
- OAuth credentials (Garmin, Strava) are optional and only needed for integration testing.
