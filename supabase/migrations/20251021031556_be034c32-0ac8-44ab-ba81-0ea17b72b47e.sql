-- Atualizar função place_bet para permitir apostas em matches in_progress
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
  
  -- Permitir apostas em matches 'upcoming' ou 'in_progress' (desde que betting_locked seja false)
  IF v_match_status NOT IN ('upcoming', 'in_progress') THEN
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