# Quick Start Guide - Local Development

## ✅ Setup Complete!

Your environment is ready. Test data has been created:
- **Coach ID:** 1 (coach@example.com)
- **Athlete ID:** 2 (athlete@example.com)
- **Athlete Profile:** VDOT=50.0, FTP=250W, Max HR=190

## 🚀 Start the Servers

### Option 1: Use the Helper Scripts

**Terminal 1 - Backend:**
```bash
./start_backend.sh
```

**Terminal 2 - Frontend:**
```bash
./start_frontend.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
python3 run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## ✅ Verify Everything Works

### 1. Check Backend Health
```bash
curl http://localhost:8000/health
```
Should return: `{"status":"healthy"}`

### 2. View API Documentation
Open in browser: **http://localhost:8000/docs**

This is the interactive Swagger UI where you can test all endpoints!

### 3. View Frontend
Open in browser: **http://localhost:3000**

## 🧪 Test the API

### Test 1: Get Athlete Profile
```bash
curl http://localhost:8000/api/athletes/2/profile
```

### Test 2: Create a Workout Template
Use the API docs at `http://localhost:8000/docs`:
- Endpoint: `POST /api/workouts/`
- Body:
```json
{
  "name": "Threshold Run",
  "description": "5x 1km at threshold pace",
  "sport": "running",
  "markdown_source": "Warmup - 10m easy\nMain Set 5x - 1km 100% VDOT-Pace\nCooldown - 5m easy"
}
```
- Query parameter: `coach_id=1`

### Test 3: Resolve Workout for Athlete
- Endpoint: `POST /api/workouts/{template_id}/resolve?athlete_id=2`
- This will return the workout with absolute targets based on the athlete's VDOT/FTP

### Test 4: Create Calendar Event
- Endpoint: `POST /api/calendar/`
- Body:
```json
{
  "athlete_id": 2,
  "template_id": 1,
  "scheduled_date": "2024-01-15"
}
```

### Test 5: Create PAIRS Log
- Endpoint: `POST /api/pairs/?athlete_id=2`
- Body:
```json
{
  "muscle_soreness": 3,
  "joint_pain": 2,
  "notes": "Feeling good after workout"
}
```

## 📚 Available Endpoints

### Workouts
- `GET /api/workouts/` - List templates
- `POST /api/workouts/` - Create template
- `GET /api/workouts/{id}` - Get template
- `POST /api/workouts/{id}/resolve` - Resolve for athlete

### Athletes
- `GET /api/athletes/{id}/profile` - Get profile
- `PUT /api/athletes/{id}/profile` - Update profile

### Calendar
- `GET /api/calendar/athlete/{id}` - Get athlete calendar
- `POST /api/calendar/` - Create event

### PAIRS
- `POST /api/pairs/` - Create log
- `GET /api/pairs/athlete/{id}` - Get athlete logs
- `GET /api/pairs/alerts` - Get coach alerts

### Coaches
- `GET /api/coaches/{id}/athletes` - Get coach's athletes
- `POST /api/coaches/{id}/bulk-assign` - Bulk assign workout

## 🛠️ Development Tips

1. **API Testing:** Use the Swagger UI at `/docs` - it's interactive!
2. **Database Access:**
   ```bash
   export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
   psql -d endurance_training
   ```
3. **View Data:**
   ```sql
   SELECT * FROM users;
   SELECT * FROM athlete_profiles;
   SELECT * FROM workout_templates;
   ```
4. **Hot Reload:** Both servers auto-reload on file changes
5. **Check Logs:** Watch terminal output for errors

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL: `brew services list | grep postgresql`
- Check `.env` file exists in `backend/`
- Check database connection

### Frontend won't start
- Check Node.js: `node --version`
- Try: `cd frontend && npm install`
- Check port 3000 is available

### API calls fail
- Verify backend is running on port 8000
- Check CORS settings
- Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

## 📝 Next Steps

1. **Explore the API** - Try all endpoints in Swagger UI
2. **Test Workout Resolution** - See how VDOT/FTP scaling works
3. **Create More Test Data** - Run `python3 backend/create_test_data.py` again (will create duplicates)
4. **Build Frontend Features** - Start building UI components
5. **Implement Authentication** - Complete the JWT auth system

## 📖 Documentation

- **Setup Guide:** `SETUP_COMPLETE.md`
- **Deployment:** `DEPLOYMENT_CHECKLIST.md`
- **Pre-Deployment Fixes:** `PRE_DEPLOYMENT_FIXES.md`
- **Full Development Guide:** See the plan file

Happy coding! 🎉
