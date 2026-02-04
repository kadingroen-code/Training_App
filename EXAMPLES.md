# Usage Examples

## Dynamic Engine Examples

### Running Workout with VDOT Scaling

```python
from app.engine.vdot_engine import VDOTEngine

# Initialize with athlete's VDOT
engine = VDOTEngine(vdot=50.0)

# Calculate pace for different zones
easy_pace = engine.calculate_pace_for_zone("easy")  # min/km
threshold_pace = engine.calculate_pace_for_zone("threshold")
interval_pace = engine.calculate_pace_for_zone("interval")

# Resolve percentage-based target
pace_105 = engine.resolve_pace_target(1.05, "threshold")  # 105% of threshold pace

# Calculate time for a distance
time_800m = engine.calculate_time_for_distance(800, pace_105)  # minutes
```

### Cycling Workout with FTP Scaling

```python
from app.engine.ftp_engine import FTPEngine

# Initialize with athlete's FTP
engine = FTPEngine(ftp=250.0)  # watts

# Get power ranges for zones
zone_2_min, zone_2_max = engine.calculate_power_for_zone("zone_2")  # 55-75% FTP
zone_4_min, zone_4_max = engine.calculate_power_for_zone("zone_4")  # 91-105% FTP

# Resolve percentage-based target
power_60 = engine.resolve_power_target(0.60)  # 60% FTP = 150W

# Check for adaptive adjustment
if engine.check_adaptive_adjustment(9.0):  # Level 9.0 session
    new_ftp = engine.apply_adaptive_adjustment()  # +2% increase
```

### Resolving Complete Workouts

```python
from app.engine.workout_resolver import WorkoutResolver

# Initialize resolver with athlete's fitness markers
resolver = WorkoutResolver(vdot=50.0, ftp=250.0)

# Template with relative targets
workout_template = {
    "sport": "run",
    "segments": [
        {
            "type": "warmup",
            "distance": 1000,
            "pace_target": "easy"
        },
        {
            "type": "main",
            "repetitions": 5,
            "distance": 800,
            "pace_target": "105% VDOT-Pace",
            "zone": "threshold"
        },
        {
            "type": "cooldown",
            "distance": 1000,
            "pace_target": "easy"
        }
    ]
}

# Resolve to absolute values
resolved = resolver.resolve_workout(workout_template)

# Result includes absolute paces and times:
# {
#   "sport": "run",
#   "segments": [
#     {
#       "type": "warmup",
#       "distance": 1000,
#       "absolute_pace_min_per_km": 5.2,
#       "target_time_minutes": 5.2
#     },
#     ...
#   ],
#   "resolved": true
# }
```

## Markdown Parser Examples

### Parsing Running Workout

```python
from app.parsers.markdown_parser import MarkdownWorkoutParser

parser = MarkdownWorkoutParser()

markdown = """
Warmup - 1km easy
Main Set 5x - 800m 105% VDOT-Pace
Cooldown - 1km easy
"""

template = parser.parse(markdown, sport="run")
```

### Parsing Cycling Workout

```python
markdown = """
Warmup - 10m 60% FTP
Main Set 3x - 5m 105% FTP
Cooldown - 10m easy
"""

template = parser.parse(markdown, sport="bike")
```

## API Usage Examples

### Create Workout Template

```bash
curl -X POST http://localhost:8000/api/workouts/ \
  -H "Content-Type: application/json" \
  -d '{
    "coach_id": 1,
    "name": "Threshold Intervals",
    "sport": "run",
    "markdown_source": "Warmup - 1km easy\nMain Set 5x - 800m 105% VDOT-Pace\nCooldown - 1km easy"
  }'
```

### Resolve Workout for Athlete

```bash
curl -X POST http://localhost:8000/api/workouts/1/resolve?athlete_id=2
```

### Bulk Assign Workout

```bash
curl -X POST http://localhost:8000/api/coaches/1/bulk-assign \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": 1,
    "athlete_ids": [2, 3, 4, 5],
    "start_date": "2024-01-01"
  }'
```

### Create PAIRS Log

```bash
curl -X POST "http://localhost:8000/api/pairs/?athlete_id=2" \
  -H "Content-Type: application/json" \
  -d '{
    "calendar_event_id": 1,
    "muscle_soreness": 6,
    "joint_pain": 2,
    "notes": "Feeling good, slight quad soreness"
  }'
```

## Frontend Usage

### Using the API Client

```typescript
import { workoutApi, athleteApi, calendarApi } from '@/lib/api'

// Get athlete profile
const profile = await athleteApi.getProfile(athleteId)

// Create workout template
const template = await workoutApi.create({
  name: "Threshold Intervals",
  sport: "run",
  markdown_source: "Warmup - 1km easy\nMain Set 5x - 800m 105% VDOT-Pace"
})

// Resolve workout for athlete
const resolved = await workoutApi.resolve(templateId, athleteId)

// Get athlete calendar
const calendar = await calendarApi.getAthleteCalendar(athleteId, "2024-01-01", "2024-01-31")
```
