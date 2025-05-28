-- Migration: update_db_init.sql
-- Description: Update db-init.sql to include tenant_id in all table definitions and optimize indexes
-- Author: Hasura Demo Team
-- Date: 2025-05-27

-- This is a transformation script to update the original db-init.sql
-- to include tenant_id in all table definitions and replace standard indexes
-- with tenant-optimized ones. It incorporates all the changes that were
-- previously made to add multi-tenancy support.

-- Instructions:
-- 1. Review this script
-- 2. Apply it by manually copying it over db-init.sql or using the command:
--    cp /Users/Clayton/Documents/hugo/hasura-demo/scripts/migrations/update_db_init.sql /Users/Clayton/Documents/hugo/hasura-demo/scripts/db-init.sql

-- filepath: /Users/Clayton/Documents/hugo/hasura-demo/scripts/db-init.sql
-- Migration: 20250522_001_initial_schema
-- Description: Create initial tables for sports league database with proper relationships
-- Author: Hasura Demo Team

BEGIN;

-- Sports table - stores different types of sports
CREATE TABLE IF NOT EXISTS Sport (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL, -- Added for multi-tenancy
  name TEXT NOT NULL
);

-- Teams table - stores team information with foreign key to sport
CREATE TABLE IF NOT EXISTS Teams (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL, -- Added for multi-tenancy
  name TEXT NOT NULL,
  sport_id INTEGER,
  CONSTRAINT fk_sport FOREIGN KEY (sport_id) REFERENCES Sport(id) ON DELETE SET NULL
);

-- People table - stores information about players with foreign key to team
CREATE TABLE IF NOT EXISTS People (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL, -- Added for multi-tenancy
  name TEXT NOT NULL,
  team_id INTEGER,
  CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES Teams(id) ON DELETE SET NULL
);

-- Fixtures table - stores information about matches
CREATE TABLE IF NOT EXISTS Fixtures (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL, -- Added for multi-tenancy
  home_team_id INTEGER NOT NULL,
  away_team_id INTEGER NOT NULL,
  sport_id INTEGER NOT NULL,
  fixture_date TIMESTAMP NOT NULL,
  venue TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_home_team FOREIGN KEY (home_team_id) REFERENCES Teams(id) ON DELETE CASCADE,
  CONSTRAINT fk_away_team FOREIGN KEY (away_team_id) REFERENCES Teams(id) ON DELETE CASCADE,
  CONSTRAINT fk_sport FOREIGN KEY (sport_id) REFERENCES Sport(id) ON DELETE CASCADE,
  CONSTRAINT check_status CHECK (status IN ('scheduled', 'in_progress', 'completed', 'postponed', 'cancelled'))
);

-- Results table - stores match results
CREATE TABLE IF NOT EXISTS Results (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL, -- Added for multi-tenancy
  fixture_id INTEGER NOT NULL,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  winner_id INTEGER,
  details JSONB, -- For sport-specific data like scorers, statistics, etc.
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fixture FOREIGN KEY (fixture_id) REFERENCES Fixtures(id) ON DELETE CASCADE,
  CONSTRAINT fk_winner FOREIGN KEY (winner_id) REFERENCES Teams(id) ON DELETE SET NULL
);

-- PlayerStats table - stores individual player performance in matches
CREATE TABLE IF NOT EXISTS PlayerStats (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL, -- Added for multi-tenancy
  fixture_id INTEGER NOT NULL,
  person_id INTEGER NOT NULL,
  minutes_played INTEGER,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  rating DECIMAL(3,1),
  stats JSONB, -- For sport-specific statistics
  CONSTRAINT fk_fixture FOREIGN KEY (fixture_id) REFERENCES Fixtures(id) ON DELETE CASCADE,
  CONSTRAINT fk_person FOREIGN KEY (person_id) REFERENCES People(id) ON DELETE CASCADE,
  CONSTRAINT unique_player_fixture UNIQUE (person_id, fixture_id)
);

-- GameEvents table - serves as an event sourcing table for all game-related events
CREATE TABLE IF NOT EXISTS GameEvents (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL, -- Added for multi-tenancy
  fixture_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  event_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  event_id TEXT NOT NULL, -- Unique identifier for the event for idempotence
  actor_id INTEGER, -- The person or system that caused the event
  event_data JSONB NOT NULL, -- Event payload with the actual data
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  event_version INTEGER NOT NULL DEFAULT 1,

  -- Add sequence tracking columns
  stream_id TEXT, -- Optional identifier for event stream grouping
  sequence_number BIGINT, -- Optional sequence number within a stream
  depends_on_event_id TEXT, -- Optional reference to preceding event
  
  CONSTRAINT fk_event_fixture FOREIGN KEY (fixture_id) REFERENCES Fixtures(id) ON DELETE CASCADE,
  CONSTRAINT fk_event_actor FOREIGN KEY (actor_id) REFERENCES People(id) ON DELETE SET NULL,
  CONSTRAINT unique_event_id UNIQUE (event_id), -- Ensures idempotency
  CONSTRAINT unique_stream_sequence UNIQUE (stream_id, sequence_number) -- Ensures sequence integrity
);

-- Create composite indexes optimized for multi-tenant queries (with tenant_id first)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_teams_tenant_sport') THEN
    CREATE INDEX idx_teams_tenant_sport ON Teams(tenant_id, sport_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_people_tenant_team') THEN
    CREATE INDEX idx_people_tenant_team ON People(tenant_id, team_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fixtures_tenant_home_team') THEN
    CREATE INDEX idx_fixtures_tenant_home_team ON Fixtures(tenant_id, home_team_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fixtures_tenant_away_team') THEN
    CREATE INDEX idx_fixtures_tenant_away_team ON Fixtures(tenant_id, away_team_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fixtures_tenant_sport') THEN
    CREATE INDEX idx_fixtures_tenant_sport ON Fixtures(tenant_id, sport_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fixtures_tenant_date') THEN
    CREATE INDEX idx_fixtures_tenant_date ON Fixtures(tenant_id, fixture_date);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fixtures_tenant_status') THEN
    CREATE INDEX idx_fixtures_tenant_status ON Fixtures(tenant_id, status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_results_tenant_fixture') THEN
    CREATE INDEX idx_results_tenant_fixture ON Results(tenant_id, fixture_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_results_tenant_winner') THEN
    CREATE INDEX idx_results_tenant_winner ON Results(tenant_id, winner_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_playerstats_tenant_fixture') THEN
    CREATE INDEX idx_playerstats_tenant_fixture ON PlayerStats(tenant_id, fixture_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_playerstats_tenant_person') THEN
    CREATE INDEX idx_playerstats_tenant_person ON PlayerStats(tenant_id, person_id);
  END IF;
  
  -- Create additional tenant-specific indexes for specific query patterns
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sport_tenant_name') THEN
    CREATE INDEX idx_sport_tenant_name ON Sport(tenant_id, name);
  END IF;

  -- Create an index on Sport(name) filtered by tenant_id for text search with tenant isolation
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sport_name_tenant') THEN
    CREATE INDEX idx_sport_name_tenant ON Sport(name, tenant_id);
  END IF;
  
  -- Create an index for Teams(name) by tenant for name lookups
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_teams_tenant_name') THEN
    CREATE INDEX idx_teams_tenant_name ON Teams(tenant_id, name);
  END IF;
  
  -- Create an index for People(name) by tenant for name lookups
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_people_tenant_name') THEN
    CREATE INDEX idx_people_tenant_name ON People(tenant_id, name);
  END IF;
  
  -- Create an index for common date range + tenant queries
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fixtures_tenant_date_status') THEN
    CREATE INDEX idx_fixtures_tenant_date_status ON Fixtures(tenant_id, fixture_date, status);
  END IF;
END $$;

-- Create composite indexes for GameEvents table optimized for tenant-based queries
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gameevents_tenant_fixture') THEN
    CREATE INDEX idx_gameevents_tenant_fixture ON GameEvents(tenant_id, fixture_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gameevents_tenant_type') THEN
    CREATE INDEX idx_gameevents_tenant_type ON GameEvents(tenant_id, event_type);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gameevents_tenant_timestamp') THEN
    CREATE INDEX idx_gameevents_tenant_timestamp ON GameEvents(tenant_id, event_timestamp);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gameevents_tenant_processed') THEN
    CREATE INDEX idx_gameevents_tenant_processed ON GameEvents(tenant_id, processed);
  END IF;
  
  -- Create index for stream sequence lookups within tenant
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gameevents_tenant_stream') THEN
    CREATE INDEX idx_gameevents_tenant_stream ON GameEvents(tenant_id, stream_id, sequence_number);
  END IF;
  
  -- Create index for event_id lookups filtered by tenant (idempotency checks)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gameevents_tenant_event_id') THEN
    CREATE INDEX idx_gameevents_tenant_event_id ON GameEvents(tenant_id, event_id);
  END IF;
END $$;

-- Note: Row Level Security (RLS) policies will be managed by Hasura v3

-- Create a migrations tracking table to record schema versions
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) NOT NULL PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- Record the initial schema version
INSERT INTO schema_migrations (version, description)
VALUES ('V20250522_001', 'Initial schema with multi-tenancy')
ON CONFLICT (version) DO NOTHING;

COMMIT;
