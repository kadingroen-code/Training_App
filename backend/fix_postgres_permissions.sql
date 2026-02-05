-- Fix PostgreSQL permissions for the "user" role
-- Grant permissions to use and create in public schema

-- Grant usage on schema public
GRANT USAGE ON SCHEMA public TO "user";

-- Grant create on schema public
GRANT CREATE ON SCHEMA public TO "user";

-- Grant all privileges on all tables in public schema (for future tables)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "user";

-- Grant all privileges on all sequences in public schema (for SERIAL columns)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "user";

-- Make the user the owner of the database (alternative approach)
-- ALTER DATABASE endurance_training OWNER TO "user";
