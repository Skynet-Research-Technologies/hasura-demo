-- Clear existing data if needed
-- TRUNCATE TABLE PlayerStats CASCADE;
-- TRUNCATE TABLE Results CASCADE;
-- TRUNCATE TABLE Fixtures CASCADE;

-- Ensure we have basic data in Sport and Teams tables
INSERT INTO Sport (name) 
VALUES ('Soccer'), ('Basketball'), ('Baseball'), ('Tennis'), ('Rugby')
ON CONFLICT (id) DO NOTHING;

INSERT INTO Teams (name, sport_id) 
VALUES 
  ('Red Dragons', 1),
  ('Blue Whales', 2),
  ('Green Giants', 3),
  ('Yellow Eagles', 1),
  ('Purple Panthers', 2),
  ('Orange Tigers', 3),
  ('Black Bears', 4),
  ('White Wolves', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO People (name, team_id)
VALUES 
  ('Alice', 1),
  ('Bob', 1),
  ('Charlie', 2),
  ('Diana', 3),
  ('Edward', 4),
  ('Fiona', 5),
  ('George', 6),
  ('Hannah', 7),
  ('Ian', 8),
  ('Julia', 1),
  ('Kevin', 2),
  ('Laura', 3),
  ('Mike', 4),
  ('Nina', 5),
  ('Oscar', 6)
ON CONFLICT (id) DO NOTHING;

-- Insert fixtures
INSERT INTO Fixtures (home_team_id, away_team_id, sport_id, fixture_date, venue, status)
VALUES
  (1, 4, 1, '2025-06-01 15:00:00', 'Red Dragon Arena', 'completed'),
  (2, 5, 2, '2025-06-02 18:30:00', 'Blue Whale Stadium', 'completed'),
  (3, 6, 3, '2025-06-03 14:00:00', 'Green Giant Field', 'completed'),
  (4, 1, 1, '2025-06-04 20:00:00', 'Yellow Eagle Park', 'completed'),
  (5, 2, 2, '2025-06-05 19:00:00', 'Purple Dome', 'completed'),
  (6, 3, 3, '2025-06-08 13:00:00', 'Orange Field', 'scheduled'),
  (7, 8, 4, '2025-06-09 12:00:00', 'Bear Tennis Court', 'scheduled'),
  (8, 7, 5, '2025-06-10 16:30:00', 'Wolf Stadium', 'scheduled');

-- Insert results
INSERT INTO Results (fixture_id, home_score, away_score, winner_id, details)
VALUES
  (1, 3, 1, 1, '{"scorers": [{"player_id": 1, "minute": 23}, {"player_id": 1, "minute": 45}, {"player_id": 5, "minute": 67}], "possession": {"home": 65, "away": 35}}'::jsonb),
  (2, 88, 92, 5, '{"quarters": [{"home": 24, "away": 18}, {"home": 20, "away": 26}, {"home": 22, "away": 25}, {"home": 22, "away": 23}], "fouls": {"home": 12, "away": 15}}'::jsonb),
  (3, 5, 3, 3, '{"innings": [{"home": 2, "away": 1}, {"home": 0, "away": 2}, {"home": 3, "away": 0}], "hits": {"home": 12, "away": 9}}'::jsonb),
  (4, 2, 2, NULL, '{"scorers": [{"player_id": 5, "minute": 12}, {"player_id": 5, "minute": 55}, {"player_id": 1, "minute": 34}, {"player_id": 2, "minute": 78}], "possession": {"home": 48, "away": 52}}'::jsonb),
  (5, 105, 98, 5, '{"quarters": [{"home": 28, "away": 22}, {"home": 24, "away": 29}, {"home": 25, "away": 28}, {"home": 28, "away": 19}], "fouls": {"home": 10, "away": 14}}'::jsonb);

-- Insert player stats
INSERT INTO PlayerStats (fixture_id, person_id, minutes_played, goals, assists, yellow_cards, red_cards, rating, stats)
VALUES
  -- Soccer match (fixture_id 1)
  (1, 1, 90, 2, 1, 0, 0, 9.5, '{"passes": 45, "shots": 5, "shots_on_target": 3, "distance_covered": 10.5, "key_passes": 4}'::jsonb),
  (1, 2, 85, 0, 2, 1, 0, 8.0, '{"passes": 38, "shots": 1, "shots_on_target": 0, "distance_covered": 9.8, "tackles": 5}'::jsonb),
  (1, 5, 90, 1, 0, 0, 0, 7.5, '{"passes": 32, "shots": 3, "shots_on_target": 2, "distance_covered": 8.7, "tackles": 2}'::jsonb),
  (1, 10, 90, 0, 0, 0, 0, 7.0, '{"passes": 65, "shots": 0, "shots_on_target": 0, "distance_covered": 8.2, "tackles": 6}'::jsonb),
  (1, 13, 90, 0, 0, 1, 0, 6.5, '{"passes": 27, "shots": 2, "shots_on_target": 1, "distance_covered": 9.5, "tackles": 3}'::jsonb),
  
  -- Basketball match (fixture_id 2)
  (2, 3, 32, 22, 5, 0, 0, 8.5, '{"points": 22, "rebounds": 5, "assists": 5, "steals": 2, "blocks": 1, "three_pointers": 4}'::jsonb),
  (2, 6, 28, 18, 3, 0, 0, 7.8, '{"points": 18, "rebounds": 7, "assists": 3, "steals": 1, "blocks": 0, "three_pointers": 2}'::jsonb),
  (2, 11, 35, 25, 8, 0, 0, 9.2, '{"points": 25, "rebounds": 3, "assists": 8, "steals": 3, "blocks": 0, "three_pointers": 5}'::jsonb),
  (2, 14, 30, 14, 2, 0, 0, 7.4, '{"points": 14, "rebounds": 8, "assists": 2, "steals": 0, "blocks": 3, "three_pointers": 0}'::jsonb),
  (2, 2, 26, 16, 4, 0, 0, 7.6, '{"points": 16, "rebounds": 6, "assists": 4, "steals": 2, "blocks": 1, "three_pointers": 2}'::jsonb),
  
  -- Baseball match (fixture_id 3)
  (3, 4, 0, 0, 0, 0, 0, 8.2, '{"at_bats": 4, "hits": 2, "runs": 1, "rbis": 2, "home_runs": 1}'::jsonb),
  (3, 7, 0, 0, 0, 0, 0, 7.9, '{"at_bats": 3, "hits": 1, "runs": 1, "rbis": 0, "stolen_bases": 1}'::jsonb),
  (3, 12, 0, 0, 0, 0, 0, 8.7, '{"innings_pitched": 7, "hits_allowed": 4, "runs_allowed": 1, "strikeouts": 9}'::jsonb),
  (3, 15, 0, 0, 0, 0, 0, 7.5, '{"at_bats": 4, "hits": 2, "runs": 0, "rbis": 1, "stolen_bases": 0}'::jsonb),
  (3, 6, 0, 0, 0, 0, 0, 6.8, '{"innings_pitched": 2, "hits_allowed": 3, "runs_allowed": 2, "strikeouts": 3}'::jsonb),
  
  -- Soccer rematch (fixture_id 4)
  (4, 5, 90, 2, 0, 1, 0, 8.8, '{"passes": 42, "shots": 4, "shots_on_target": 3, "distance_covered": 9.8, "key_passes": 3}'::jsonb),
  (4, 1, 90, 1, 0, 0, 0, 8.3, '{"passes": 39, "shots": 3, "shots_on_target": 2, "distance_covered": 10.2, "tackles": 4}'::jsonb),
  (4, 2, 85, 1, 1, 0, 0, 8.1, '{"passes": 35, "shots": 2, "shots_on_target": 1, "distance_covered": 9.5, "tackles": 3}'::jsonb),
  (4, 13, 90, 0, 2, 1, 0, 7.9, '{"passes": 58, "shots": 1, "shots_on_target": 0, "distance_covered": 10.8, "tackles": 7}'::jsonb),
  (4, 10, 75, 0, 0, 2, 1, 5.5, '{"passes": 25, "shots": 0, "shots_on_target": 0, "distance_covered": 7.5, "tackles": 5}'::jsonb),
  
  -- Basketball rematch (fixture_id 5)
  (5, 6, 36, 28, 7, 0, 0, 9.5, '{"points": 28, "rebounds": 6, "assists": 7, "steals": 3, "blocks": 1, "three_pointers": 6}'::jsonb),
  (5, 3, 34, 24, 4, 0, 0, 8.7, '{"points": 24, "rebounds": 5, "assists": 4, "steals": 2, "blocks": 0, "three_pointers": 4}'::jsonb),
  (5, 11, 38, 22, 10, 0, 0, 9.0, '{"points": 22, "rebounds": 4, "assists": 10, "steals": 1, "blocks": 0, "three_pointers": 3}'::jsonb),
  (5, 14, 32, 18, 3, 0, 0, 8.2, '{"points": 18, "rebounds": 9, "assists": 3, "steals": 1, "blocks": 4, "three_pointers": 0}'::jsonb),
  (5, 15, 28, 16, 2, 0, 0, 7.8, '{"points": 16, "rebounds": 7, "assists": 2, "steals": 0, "blocks": 2, "three_pointers": 0}'::jsonb);