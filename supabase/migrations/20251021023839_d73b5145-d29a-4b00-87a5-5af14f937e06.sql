-- Add betting_locked column to matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS betting_locked BOOLEAN DEFAULT FALSE;

-- Update event_type enum to remove shark_tank
ALTER TYPE event_type RENAME TO event_type_old;
CREATE TYPE event_type AS ENUM ('top_20');
ALTER TABLE events ALTER COLUMN event_type TYPE event_type USING event_type::text::event_type;
DROP TYPE event_type_old;

-- Update existing shark_tank events to top_20
UPDATE events SET event_type = 'top_20' WHERE event_type::text = 'shark_tank';

-- Remove category column from pilots as it's no longer needed
ALTER TABLE pilots DROP COLUMN IF EXISTS category;

-- Update place_bet function to check betting_locked
CREATE OR REPLACE FUNCTION public.place_bet(p_user_id uuid, p_match_id uuid, p_pilot_id uuid, p_amount integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_points integer;
  v_match_status match_status;
  v_betting_locked boolean;
  v_result jsonb;
BEGIN
  -- Check user points
  SELECT points INTO v_user_points
  FROM user_points
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  IF v_user_points IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User points not found');
  END IF;
  
  IF v_user_points < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient points');
  END IF;
  
  -- Check match status and betting_locked
  SELECT match_status, betting_locked INTO v_match_status, v_betting_locked
  FROM matches
  WHERE id = p_match_id;
  
  IF v_match_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found');
  END IF;
  
  IF v_betting_locked = TRUE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Betting is locked for this match');
  END IF;
  
  IF v_match_status != 'upcoming' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match is not open for betting');
  END IF;
  
  -- Deduct points
  UPDATE user_points
  SET points = points - p_amount,
      total_bets = total_bets + 1,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Insert bet
  INSERT INTO bets (user_id, match_id, pilot_id, amount)
  VALUES (p_user_id, p_match_id, p_pilot_id, p_amount);
  
  RETURN jsonb_build_object('success', true, 'remaining_points', v_user_points - p_amount);
END;
$function$;

-- Create function to swap top20 positions
CREATE OR REPLACE FUNCTION public.swap_top20_positions(p_positions integer[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_temp_pilot_id uuid;
  v_position integer;
  v_index integer;
BEGIN
  -- p_positions is an array where index represents new position and value is the pilot_id
  FOR v_index IN 1..array_length(p_positions, 1)
  LOOP
    v_position := v_index;
    v_temp_pilot_id := (
      SELECT pilot_id FROM top20_positions WHERE position = p_positions[v_index]
    );
    
    UPDATE top20_positions 
    SET pilot_id = v_temp_pilot_id,
        updated_at = now()
    WHERE position = v_position;
  END LOOP;
END;
$function$;