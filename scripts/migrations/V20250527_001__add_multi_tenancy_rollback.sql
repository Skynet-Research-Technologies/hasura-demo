-- Migration: V20250527_001__add_multi_tenancy_rollback.sql
-- Description: Rollback tenant_id fields and related indexes from all tables
-- Author: Hasura Demo Team
-- Date: 2025-05-27

-- Ensure script is executed as a transaction for atomicity
BEGIN;

-- Step 1: Drop all tenant-related indexes
DO $$
BEGIN
  -- Drop Teams table indexes
  DROP INDEX IF EXISTS idx_teams_tenant_sport;
  DROP INDEX IF EXISTS idx_teams_tenant_name;
  
  -- Drop People table indexes
  DROP INDEX IF EXISTS idx_people_tenant_team;
  DROP INDEX IF EXISTS idx_people_tenant_name;
  
  -- Drop Fixtures table indexes
  DROP INDEX IF EXISTS idx_fixtures_tenant_home_team;
  DROP INDEX IF EXISTS idx_fixtures_tenant_away_team;
  DROP INDEX IF EXISTS idx_fixtures_tenant_sport;
  DROP INDEX IF EXISTS idx_fixtures_tenant_date;
  DROP INDEX IF EXISTS idx_fixtures_tenant_status;
  DROP INDEX IF EXISTS idx_fixtures_tenant_date_status;
  
  -- Drop Results table indexes
  DROP INDEX IF EXISTS idx_results_tenant_fixture;
  DROP INDEX IF EXISTS idx_results_tenant_winner;
  
  -- Drop PlayerStats table indexes
  DROP INDEX IF EXISTS idx_playerstats_tenant_fixture;
  DROP INDEX IF EXISTS idx_playerstats_tenant_person;
  
  -- Drop Sport table indexes
  DROP INDEX IF EXISTS idx_sport_tenant_name;
  DROP INDEX IF EXISTS idx_sport_name_tenant;
  
  -- Drop GameEvents table indexes
  DROP INDEX IF EXISTS idx_gameevents_tenant_fixture;
  DROP INDEX IF EXISTS idx_gameevents_tenant_type;
  DROP INDEX IF EXISTS idx_gameevents_tenant_timestamp;
  DROP INDEX IF EXISTS idx_gameevents_tenant_processed;
  DROP INDEX IF EXISTS idx_gameevents_tenant_stream;
  DROP INDEX IF EXISTS idx_gameevents_tenant_event_id;
END $$;

-- Step 2: Recreate the original non-tenant-based indexes
DO $$
BEGIN
  -- Create a function to check if an index exists
  CREATE OR REPLACE FUNCTION index_exists(idx_name TEXT) RETURNS BOOLEAN AS $$
  DECLARE
    result BOOLEAN;
  BEGIN
    SELECT COUNT(*) > 0 INTO result
    FROM pg_indexes
    WHERE indexname = idx_name;
    RETURN result;
  END;
  $$ LANGUAGE plpgsql;

  -- Recreate Teams table indexes
  IF NOT index_exists('idx_teams_sport') THEN
    CREATE INDEX idx_teams_sport ON Teams(sport_id);
  END IF;
  
  -- Recreate People table indexes
  IF NOT index_exists('idx_people_team') THEN
    CREATE INDEX idx_people_team ON People(team_id);
  END IF;
  
  -- Recreate Fixtures table indexes
  IF NOT index_exists('idx_fixtures_home_team') THEN
    CREATE INDEX idx_fixtures_home_team ON Fixtures(home_team_id);
  END IF;
  
  IF NOT index_exists('idx_fixtures_away_team') THEN
    CREATE INDEX idx_fixtures_away_team ON Fixtures(away_team_id);
  END IF;
  
  IF NOT index_exists('idx_fixtures_sport') THEN
    CREATE INDEX idx_fixtures_sport ON Fixtures(sport_id);
  END IF;
  
  IF NOT index_exists('idx_fixtures_date') THEN
    CREATE INDEX idx_fixtures_date ON Fixtures(fixture_date);
  END IF;
  
  IF NOT index_exists('idx_fixtures_status') THEN
    CREATE INDEX idx_fixtures_status ON Fixtures(status);
  END IF;
  
  -- Recreate Results table indexes
  IF NOT index_exists('idx_results_fixture') THEN
    CREATE INDEX idx_results_fixture ON Results(fixture_id);
  END IF;
  
  IF NOT index_exists('idx_results_winner') THEN
    CREATE INDEX idx_results_winner ON Results(winner_id);
  END IF;
  
  -- Recreate PlayerStats table indexes
  IF NOT index_exists('idx_playerstats_fixture') THEN
    CREATE INDEX idx_playerstats_fixture ON PlayerStats(fixture_id);
  END IF;
  
  IF NOT index_exists('idx_playerstats_person') THEN
    CREATE INDEX idx_playerstats_person ON PlayerStats(person_id);
  END IF;
  
  -- Recreate GameEvents table indexes
  IF NOT index_exists('idx_gameevents_fixture') THEN
    CREATE INDEX idx_gameevents_fixture ON GameEvents(fixture_id);
  END IF;
  
  IF NOT index_exists('idx_gameevents_type') THEN
    CREATE INDEX idx_gameevents_type ON GameEvents(event_type);
  END IF;
  
  IF NOT index_exists('idx_gameevents_timestamp') THEN
    CREATE INDEX idx_gameevents_timestamp ON GameEvents(event_timestamp);
  END IF;
  
  IF NOT index_exists('idx_gameevents_processed') THEN
    CREATE INDEX idx_gameevents_processed ON GameEvents(processed);
  END IF;

  DROP FUNCTION IF EXISTS index_exists;
END $$;

-- Step 3: Drop tenant_id columns from all tables
DO $$
BEGIN
  -- Create a function to check if a column exists
  CREATE OR REPLACE FUNCTION column_exists(t_name TEXT, c_name TEXT) RETURNS BOOLEAN AS $$
  DECLARE
    result BOOLEAN;
  BEGIN
    SELECT COUNT(*) > 0 INTO result
    FROM information_schema.columns
    WHERE table_name = t_name AND column_name = c_name;
    RETURN result;
  END;
  $$ LANGUAGE plpgsql;

  -- Remove tenant_id from tables if it exists
  IF column_exists('sport', 'tenant_id') THEN
    ALTER TABLE Sport DROP COLUMN tenant_id;
  END IF;

  IF column_exists('teams', 'tenant_id') THEN
    ALTER TABLE Teams DROP COLUMN tenant_id;
  END IF;

  IF column_exists('people', 'tenant_id') THEN
    ALTER TABLE People DROP COLUMN tenant_id;
  END IF;

  IF column_exists('fixtures', 'tenant_id') THEN
    ALTER TABLE Fixtures DROP COLUMN tenant_id;
  END IF;

  IF column_exists('results', 'tenant_id') THEN
    ALTER TABLE Results DROP COLUMN tenant_id;
  END IF;

  IF column_exists('playerstats', 'tenant_id') THEN
    ALTER TABLE PlayerStats DROP COLUMN tenant_id;
  END IF;

  IF column_exists('gameevents', 'tenant_id') THEN
    ALTER TABLE GameEvents DROP COLUMN tenant_id;
  END IF;

  -- Clean up the helper function
  DROP FUNCTION IF EXISTS column_exists;
END $$;

-- Step 4: Record rollback in schema_migrations
DELETE FROM schema_migrations WHERE version = 'V20250527_001';

-- Insert a record that this rollback was performed
INSERT INTO schema_migrations (version, description)
VALUES ('V20250527_001_rollback', 'Rolled back multi-tenancy support')
ON CONFLICT (version) DO NOTHING;

COMMIT;
