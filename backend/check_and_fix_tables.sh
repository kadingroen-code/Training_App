#!/bin/bash

# Check existing tables and fix permissions or drop them

echo "Checking existing tables in endurance_training database..."
echo ""

# Connect and check what tables exist
psql -d endurance_training << EOF

-- Check if tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

EOF

echo ""
echo "If tables exist, we need to either:"
echo "  1. Drop them and recreate (recommended)"
echo "  2. Grant ownership to 'user' role"
echo ""
read -p "Drop existing tables and start fresh? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Dropping existing tables..."
    psql -d endurance_training << EOF
    
    -- Drop all tables in public schema
    DROP TABLE IF EXISTS oauth_tokens CASCADE;
    DROP TABLE IF EXISTS pairs_logs CASCADE;
    DROP TABLE IF EXISTS calendar_events CASCADE;
    DROP TABLE IF EXISTS workout_templates CASCADE;
    DROP TABLE IF EXISTS athlete_profiles CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    
    -- Verify tables are dropped
    SELECT 'Tables dropped successfully' AS status;
    
EOF
    echo ""
    echo "✅ Tables dropped. Now run: python3 init_db.py"
else
    echo "Granting ownership to 'user' role instead..."
    psql -d endurance_training << EOF
    
    -- Grant ownership of all tables to 'user'
    ALTER TABLE IF EXISTS users OWNER TO "user";
    ALTER TABLE IF EXISTS athlete_profiles OWNER TO "user";
    ALTER TABLE IF EXISTS workout_templates OWNER TO "user";
    ALTER TABLE IF EXISTS calendar_events OWNER TO "user";
    ALTER TABLE IF EXISTS pairs_logs OWNER TO "user";
    ALTER TABLE IF EXISTS oauth_tokens OWNER TO "user";
    
    -- Grant all privileges
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "user";
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "user";
    
EOF
    echo ""
    echo "✅ Permissions granted. Now try: python3 init_db.py"
fi
