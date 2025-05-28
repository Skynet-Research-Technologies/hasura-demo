-- Migration: V20250527_001__add_multi_tenancy.sql
-- Description: Add tenant_id field to all tables and create optimized indexes for multi-tenancy
-- Author: Hasura Demo Team
-- Date: 2025-05-27

-- Ensure script is executed as a transaction for atomicity
BEGIN;

-- Create a function to check if a column exists in a table
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

-- Step 1: Add tenant_id column to all tables if it doesn't exist
DO $$
BEGIN
  -- Add tenant_id to Sport table
  IF NOT column_exists('sport', 'tenant_id') THEN
    ALTER TABLE Sport ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
  END IF;

  -- Add tenant_id to Teams table
  IF NOT column_exists('teams', 'tenant_id') THEN
    ALTER TABLE Teams ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
  END IF;

  -- Add tenant_id to People table
  IF NOT column_exists('people', 'tenant_id') THEN
    ALTER TABLE People ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
  END IF;

  -- Add tenant_id to Fixtures table
  IF NOT column_exists('fixtures', 'tenant_id') THEN
    ALTER TABLE Fixtures ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
  END IF;

  -- Add tenant_id to Results table
  IF NOT column_exists('results', 'tenant_id') THEN
    ALTER TABLE Results ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
  END IF;

  -- Add tenant_id to PlayerStats table
  IF NOT column_exists('playerstats', 'tenant_id') THEN
    ALTER TABLE PlayerStats ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
  END IF;

  -- Add tenant_id to GameEvents table
  IF NOT column_exists('gameevents', 'tenant_id') THEN
    ALTER TABLE GameEvents ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
  END IF;
END $$;

-- Step 2: Remove existing non-tenant-based indexes that will be replaced by tenant-optimized ones
DO $$
BEGIN
  -- Remove Teams table indexes
  DROP INDEX IF EXISTS idx_teams_sport;
  
  -- Remove People table indexes
  DROP INDEX IF EXISTS idx_people_team;
  
  -- Remove Fixtures table indexes
  DROP INDEX IF EXISTS idx_fixtures_home_team;
  DROP INDEX IF EXISTS idx_fixtures_away_team;
  DROP INDEX IF EXISTS idx_fixtures_sport;
  DROP INDEX IF EXISTS idx_fixtures_date;
  DROP INDEX IF EXISTS idx_fixtures_status;
  
  -- Remove Results table indexes
  DROP INDEX IF EXISTS idx_results_fixture;
  DROP INDEX IF EXISTS idx_results_winner;
  
  -- Remove PlayerStats table indexes
  DROP INDEX IF EXISTS idx_playerstats_fixture;
  DROP INDEX IF EXISTS idx_playerstats_person;
  
  -- Remove GameEvents table indexes
  DROP INDEX IF EXISTS idx_gameevents_fixture;
  DROP INDEX IF EXISTS idx_gameevents_type;
  DROP INDEX IF EXISTS idx_gameevents_timestamp;
  DROP INDEX IF EXISTS idx_gameevents_processed;
END $$;

-- Step 3: Create optimized composite indexes for tenant-based queries
DO $$
BEGIN
  -- Teams table indexes
  IF NOT index_exists('idx_teams_tenant_sport') THEN
    CREATE INDEX idx_teams_tenant_sport ON Teams(tenant_id, sport_id);
  END IF;
  
  IF NOT index_exists('idx_teams_tenant_name') THEN
    CREATE INDEX idx_teams_tenant_name ON Teams(tenant_id, name);
  END IF;
  
  -- People table indexes
  IF NOT index_exists('idx_people_tenant_team') THEN
    CREATE INDEX idx_people_tenant_team ON People(tenant_id, team_id);
  END IF;
  
  IF NOT index_exists('idx_people_tenant_name') THEN
    CREATE INDEX idx_people_tenant_name ON People(tenant_id, name);
  END IF;
  
  -- Fixtures table indexes
  IF NOT index_exists('idx_fixtures_tenant_home_team') THEN
    CREATE INDEX idx_fixtures_tenant_home_team ON Fixtures(tenant_id, home_team_id);
  END IF;
  
  IF NOT index_exists('idx_fixtures_tenant_away_team') THEN
    CREATE INDEX idx_fixtures_tenant_away_team ON Fixtures(tenant_id, away_team_id);
  END IF;
  
  IF NOT index_exists('idx_fixtures_tenant_sport') THEN
    CREATE INDEX idx_fixtures_tenant_sport ON Fixtures(tenant_id, sport_id);
  END IF;
  
  IF NOT index_exists('idx_fixtures_tenant_date') THEN
    CREATE INDEX idx_fixtures_tenant_date ON Fixtures(tenant_id, fixture_date);
  END IF;
  
  IF NOT index_exists('idx_fixtures_tenant_status') THEN
    CREATE INDEX idx_fixtures_tenant_status ON Fixtures(tenant_id, status);
  END IF;
  
  IF NOT index_exists('idx_fixtures_tenant_date_status') THEN
    CREATE INDEX idx_fixtures_tenant_date_status ON Fixtures(tenant_id, fixture_date, status);
  END IF;
  
  -- Results table indexes
  IF NOT index_exists('idx_results_tenant_fixture') THEN
    CREATE INDEX idx_results_tenant_fixture ON Results(tenant_id, fixture_id);
  END IF;
  
  IF NOT index_exists('idx_results_tenant_winner') THEN
    CREATE INDEX idx_results_tenant_winner ON Results(tenant_id, winner_id);
  END IF;
  
  -- PlayerStats table indexes
  IF NOT index_exists('idx_playerstats_tenant_fixture') THEN
    CREATE INDEX idx_playerstats_tenant_fixture ON PlayerStats(tenant_id, fixture_id);
  END IF;
  
  IF NOT index_exists('idx_playerstats_tenant_person') THEN
    CREATE INDEX idx_playerstats_tenant_person ON PlayerStats(tenant_id, person_id);
  END IF;
  
  -- Sport table indexes
  IF NOT index_exists('idx_sport_tenant_name') THEN
    CREATE INDEX idx_sport_tenant_name ON Sport(tenant_id, name);
  END IF;
  
  IF NOT index_exists('idx_sport_name_tenant') THEN
    CREATE INDEX idx_sport_name_tenant ON Sport(name, tenant_id);
  END IF;
  
  -- GameEvents table indexes
  IF NOT index_exists('idx_gameevents_tenant_fixture') THEN
    CREATE INDEX idx_gameevents_tenant_fixture ON GameEvents(tenant_id, fixture_id);
  END IF;
  
  IF NOT index_exists('idx_gameevents_tenant_type') THEN
    CREATE INDEX idx_gameevents_tenant_type ON GameEvents(tenant_id, event_type);
  END IF;
  
  IF NOT index_exists('idx_gameevents_tenant_timestamp') THEN
    CREATE INDEX idx_gameevents_tenant_timestamp ON GameEvents(tenant_id, event_timestamp);
  END IF;
  
  IF NOT index_exists('idx_gameevents_tenant_processed') THEN
    CREATE INDEX idx_gameevents_tenant_processed ON GameEvents(tenant_id, processed);
  END IF;
  
  IF NOT index_exists('idx_gameevents_tenant_stream') THEN
    CREATE INDEX idx_gameevents_tenant_stream ON GameEvents(tenant_id, stream_id, sequence_number);
  END IF;
  
  IF NOT index_exists('idx_gameevents_tenant_event_id') THEN
    CREATE INDEX idx_gameevents_tenant_event_id ON GameEvents(tenant_id, event_id);
  END IF;
END $$;

-- Step 4: Create a migration tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) NOT NULL PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- Record this migration
INSERT INTO schema_migrations (version, description)
VALUES ('V20250527_001', 'Add multi-tenancy support') 
ON CONFLICT (version) DO NOTHING;

-- Clean up helper functions
DROP FUNCTION IF EXISTS column_exists;
DROP FUNCTION IF EXISTS index_exists;

COMMIT;
