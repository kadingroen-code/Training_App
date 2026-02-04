# Dynamic Endurance Training Platform

A comprehensive training platform that replaces static workout templates with a **Dynamic Scaling Engine**. The core value proposition is "build once, assign many," where a single master workout template scales automatically to each athlete's unique fitness markers (VDOT for running, FTP for cycling).

## Architecture

### Backend (FastAPI)
- **Location**: `/backend`
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with Prisma ORM
- **Core Engine**: Dynamic scaling based on VDOT and FTP

### Frontend (Next.js)
- **Location**: `/frontend`
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Key Features

### 1. Dynamic Scaling Engine

#### Running (VDOT)
- Implements regression formula: `VO2 = -4.60 + 0.182258 * (d/t) + 0.000104 * (d/t)^2`
- Calculates pace targets for zones: Easy, Threshold, Interval (VO2max)
- Automatically resolves percentage-based targets (e.g., "105% VDOT-Pace")

#### Cycling (FTP)
- Power zones based on Functional Threshold Power:
  - Zone 2 (Endurance): 55% - 75% FTP
  - Zone 4 (Threshold): 91% - 105% FTP
  - Zone 5 (VO2max): 106% - 120% FTP
- Adaptive FTP adjustment: +2% after completing Level 9.0+ sessions

### 2. Workout Template System
- **Markdown Parser**: Coaches can input workouts in natural language:
  ```
  Warmup - 10m 60% FTP
  Main Set 5x - 800m 105% VDOT-Pace
  Cooldown - 5m easy
  ```
- Templates store relative targets that resolve to absolute values per athlete

### 3. Bulk Assignment
- Assign a 12-week training plan to 50+ athletes simultaneously
- Each athlete receives personalized targets based on their current fitness markers

### 4. PAIRS Module
- Post-Activity Injury Risk Screening
- Log muscle soreness and joint pain (0-10 scale)
- Automatic coach alerts for high-risk scores (≥7)

### 5. Integrations
- **Garmin Connect API**: Sync activities and push structured workouts
- **Strava V3 API**: Secondary data source with webhook support
- **Apple WorkoutKit**: Generate CustomWorkout objects for watchOS 10+

## Database Schema

### Core Entities
- **User**: Coaches and athletes with OAuth tokens
- **AthleteProfile**: Fitness markers (VDOT, FTP, max HR, threshold pace)
- **WorkoutTemplate**: Master workout structures with logic JSON
- **CalendarEvent**: Resolved workouts assigned to athletes
- **PAIRSLog**: Post-workout injury risk assessments

## Setup Instructions

### Backend Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Set up PostgreSQL database and configure `DATABASE_URL` in `.env`

3. Initialize Prisma:
```bash
npx prisma generate
npx prisma db push
```

4. Run FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure API URL in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run development server:
```bash
npm run dev
```

## API Endpoints

### Workouts
- `GET /api/workouts/` - List workout templates
- `POST /api/workouts/` - Create new template
- `GET /api/workouts/{id}` - Get template
- `POST /api/workouts/{id}/resolve` - Resolve template for athlete

### Athletes
- `GET /api/athletes/{id}/profile` - Get athlete profile
- `PUT /api/athletes/{id}/profile` - Update fitness markers

### Calendar
- `GET /api/calendar/athlete/{id}` - Get athlete calendar
- `POST /api/calendar/` - Create calendar event

### PAIRS
- `POST /api/pairs/` - Create PAIRS log
- `GET /api/pairs/athlete/{id}` - Get athlete logs
- `GET /api/pairs/alerts` - Get coach alerts

### Integrations
- `POST /api/integrations/garmin/oauth/callback` - Garmin OAuth
- `GET /api/integrations/garmin/activities/{id}` - Sync Garmin activities
- `POST /api/integrations/strava/webhook` - Strava webhook handler

## Mathematical Formulas

### VDOT Calculation
```
VO2 = -4.60 + 0.182258 * (distance_meters / time_minutes) + 0.000104 * (distance_meters / time_minutes)²
```

### Pace Constants (days/km)
- Easy: 0.085520318486574
- Threshold: 0.06970165201477
- Interval: 0.064668134797248

### FTP Power Zones
- Zone 2: 55% - 75% FTP
- Zone 4: 91% - 105% FTP
- Zone 5: 106% - 120% FTP

## License

MIT
