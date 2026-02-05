#!/bin/bash

# Drop all existing tables to start fresh
# This fixes permission issues when tables were created by different users

echo "Dropping all existing tables..."
echo ""

psql -d endurance_training << EOF

-- Drop all tables in the correct order (respecting foreign keys)
DROP TABLE IF EXISTS oauth_tokens CASCADE;
DROP TABLE IF EXISTS pairs_logs CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS workout_templates CASCADE;
DROP TABLE IF EXISTS athlete_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Verify tables are dropped
SELECT 'All tables dropped successfully!' AS status;

EOF

echo ""
echo "✅ All tables dropped!"
echo ""
echo "Now run: python3 init_db.py"
