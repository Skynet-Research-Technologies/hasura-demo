-- Create tables
CREATE TABLE Sport (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

CREATE TABLE Teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sport_id INTEGER,
  FOREIGN KEY (sport_id) REFERENCES Sport(id)
);

CREATE TABLE People (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  team_id INTEGER,
  FOREIGN KEY (team_id) REFERENCES Teams(id)
);

-- Insert dummy data
INSERT INTO Sport (name) VALUES ('Soccer'), ('Basketball'), ('Baseball');

INSERT INTO Teams (name, sport_id) VALUES
  ('Red Dragons', 1),
  ('Blue Whales', 2),
  ('Green Giants', 3);

INSERT INTO People (name, team_id) VALUES
  ('Alice', 1),
  ('Bob', 1),
  ('Charlie', 2),
  ('Diana', 3);