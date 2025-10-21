-- Reset user points to initial values
UPDATE user_points 
SET 
  points = 1000,
  total_bets = 0,
  total_wins = 0,
  updated_at = now();

-- Reset pilot statistics
UPDATE pilots 
SET 
  wins = 0,
  losses = 0,
  total_races = 0,
  points = 0,
  updated_at = now();