-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.bets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_points;

-- Function to calculate dynamic odds based on bet distribution
CREATE OR REPLACE FUNCTION calculate_match_odds(p_match_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_pilot1_total numeric := 0;
  v_pilot2_total numeric := 0;
  v_total_pool numeric := 0;
  v_result jsonb;
BEGIN
  -- Get total bets for each pilot
  SELECT 
    COALESCE(SUM(CASE WHEN pilot_id = m.pilot1_id THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN pilot_id = m.pilot2_id THEN amount ELSE 0 END), 0)
  INTO v_pilot1_total, v_pilot2_total
  FROM bets b
  JOIN matches m ON m.id = p_match_id
  WHERE b.match_id = p_match_id;
  
  v_total_pool := v_pilot1_total + v_pilot2_total;
  
  -- Calculate odds (total pool / pilot bets) with minimum odds of 1.01
  IF v_total_pool > 0 THEN
    v_result := jsonb_build_object(
      'pilot1_odds', GREATEST(1.01, ROUND((v_total_pool / NULLIF(v_pilot1_total, 0))::numeric, 2)),
      'pilot2_odds', GREATEST(1.01, ROUND((v_total_pool / NULLIF(v_pilot2_total, 0))::numeric, 2)),
      'pilot1_total', v_pilot1_total,
      'pilot2_total', v_pilot2_total,
      'total_pool', v_total_pool,
      'pilot1_percentage', CASE WHEN v_total_pool > 0 THEN ROUND((v_pilot1_total / v_total_pool * 100)::numeric, 1) ELSE 0 END,
      'pilot2_percentage', CASE WHEN v_total_pool > 0 THEN ROUND((v_pilot2_total / v_total_pool * 100)::numeric, 1) ELSE 0 END
    );
  ELSE
    -- Default odds when no bets
    v_result := jsonb_build_object(
      'pilot1_odds', 2.00,
      'pilot2_odds', 2.00,
      'pilot1_total', 0,
      'pilot2_total', 0,
      'total_pool', 0,
      'pilot1_percentage', 50,
      'pilot2_percentage', 50
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- Function to process bet placement
CREATE OR REPLACE FUNCTION place_bet(
  p_user_id uuid,
  p_match_id uuid,
  p_pilot_id uuid,
  p_amount integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_points integer;
  v_match_status match_status;
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
  
  -- Check match status
  SELECT match_status INTO v_match_status
  FROM matches
  WHERE id = p_match_id;
  
  IF v_match_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found');
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
$$;

-- Function to settle match and distribute winnings
CREATE OR REPLACE FUNCTION settle_match(
  p_match_id uuid,
  p_winner_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bet record;
  v_odds jsonb;
  v_winner_odds numeric;
BEGIN
  -- Calculate final odds
  v_odds := calculate_match_odds(p_match_id);
  
  -- Determine winner odds
  SELECT pilot1_id INTO v_winner_odds
  FROM matches
  WHERE id = p_match_id AND pilot1_id = p_winner_id;
  
  IF FOUND THEN
    v_winner_odds := (v_odds->>'pilot1_odds')::numeric;
  ELSE
    v_winner_odds := (v_odds->>'pilot2_odds')::numeric;
  END IF;
  
  -- Update match with winner
  UPDATE matches
  SET winner_id = p_winner_id,
      match_status = 'finished',
      updated_at = now()
  WHERE id = p_match_id;
  
  -- Distribute winnings to winners
  FOR v_bet IN 
    SELECT user_id, amount
    FROM bets
    WHERE match_id = p_match_id AND pilot_id = p_winner_id
  LOOP
    UPDATE user_points
    SET points = points + ROUND(v_bet.amount * v_winner_odds),
        total_wins = total_wins + 1,
        updated_at = now()
    WHERE user_id = v_bet.user_id;
  END LOOP;
  
  -- Update pilot stats
  UPDATE pilots
  SET wins = wins + 1,
      total_races = total_races + 1,
      updated_at = now()
  WHERE id = p_winner_id;
  
  UPDATE pilots
  SET losses = losses + 1,
      total_races = total_races + 1,
      updated_at = now()
  WHERE id IN (
    SELECT pilot1_id FROM matches WHERE id = p_match_id
    UNION
    SELECT pilot2_id FROM matches WHERE id = p_match_id
  )
  AND id != p_winner_id;
END;
$$;