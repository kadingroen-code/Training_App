#!/bin/bash

# Fix PostgreSQL permissions for schema public
# This grants the "user" role permission to create tables

echo "Fixing PostgreSQL permissions..."
echo ""

# Connect to the database and run the SQL commands
psql -d endurance_training << EOF

-- Grant usage on schema public
GRANT USAGE ON SCHEMA public TO "user";

-- Grant create on schema public
GRANT CREATE ON SCHEMA public TO "user";

-- Grant all privileges on all tables in public schema (for future tables)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "user";

-- Grant all privileges on all sequences in public schema (for SERIAL columns)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "user";

-- Verify permissions
\dn+ public

EOF

echo ""
echo "✅ Permissions fixed!"
echo ""
echo "Now try running: python3 init_db.py"
