-- Migration: 20250522_001_initial_schema
-- Description: Create initial tables for sports league database with proper relationships
-- Author: Hasura Demo Team

BEGIN;

-- Sports table - stores different types of sports
CREATE TABLE IF NOT EXISTS Sport (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- Teams table - stores team information with foreign key to sport
CREATE TABLE IF NOT EXISTS Teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sport_id INTEGER,
  CONSTRAINT fk_sport FOREIGN KEY (sport_id) REFERENCES Sport(id) ON DELETE SET NULL
);

-- People table - stores information about players with foreign key to team
CREATE TABLE IF NOT EXISTS People (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  team_id INTEGER,
  CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES Teams(id) ON DELETE SET NULL
);

-- Fixtures table - stores information about matches
CREATE TABLE IF NOT EXISTS Fixtures (
  id SERIAL PRIMARY KEY,
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
  CONSTRAINT unique_event_id UNIQUE (event_id) -- Ensures idempotency
  CONSTRAINT unique_stream_sequence UNIQUE (stream_id, sequence_number) -- Ensures sequence integrity
);

-- Create indexes for better query performance (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_teams_sport') THEN
    CREATE INDEX idx_teams_sport ON Teams(sport_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_people_team') THEN
    CREATE INDEX idx_people_team ON People(team_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fixtures_home_team') THEN
    CREATE INDEX idx_fixtures_home_team ON Fixtures(home_team_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fixtures_away_team') THEN
    CREATE INDEX idx_fixtures_away_team ON Fixtures(away_team_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fixtures_sport') THEN
    CREATE INDEX idx_fixtures_sport ON Fixtures(sport_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fixtures_date') THEN
    CREATE INDEX idx_fixtures_date ON Fixtures(fixture_date);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fixtures_status') THEN
    CREATE INDEX idx_fixtures_status ON Fixtures(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_results_fixture') THEN
    CREATE INDEX idx_results_fixture ON Results(fixture_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_results_winner') THEN
    CREATE INDEX idx_results_winner ON Results(winner_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_playerstats_fixture') THEN
    CREATE INDEX idx_playerstats_fixture ON PlayerStats(fixture_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_playerstats_person') THEN
    CREATE INDEX idx_playerstats_person ON PlayerStats(person_id);
  END IF;
END $$;

-- Create indexes for GameEvents table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gameevents_fixture') THEN
    CREATE INDEX idx_gameevents_fixture ON GameEvents(fixture_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gameevents_type') THEN
    CREATE INDEX idx_gameevents_type ON GameEvents(event_type);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gameevents_timestamp') THEN
    CREATE INDEX idx_gameevents_timestamp ON GameEvents(event_timestamp);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gameevents_processed') THEN
    CREATE INDEX idx_gameevents_processed ON GameEvents(processed);
  END IF;
END $$;

COMMIT;