-- Fix critical security issues

-- 1. Add admin authorization check to settle_match function
CREATE OR REPLACE FUNCTION public.settle_match(p_match_id uuid, p_winner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_bet record;
  v_match record;
  v_loser_id uuid;
  v_winner_position integer;
  v_loser_position integer;
  v_total_pool numeric := 0;
  v_winner_pool numeric := 0;
  v_loser_pool numeric := 0;
  v_payout_ratio numeric;
BEGIN
  -- CRITICAL: Add authorization check at start
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can settle matches';
  END IF;
  
  -- Buscar informações do match
  SELECT * INTO v_match FROM matches WHERE id = p_match_id;
  
  -- Determinar perdedor
  IF v_match.pilot1_id = p_winner_id THEN
    v_loser_id := v_match.pilot2_id;
  ELSE
    v_loser_id := v_match.pilot1_id;
  END IF;
  
  -- Calcular pools totais
  SELECT 
    COALESCE(SUM(amount), 0) INTO v_total_pool
  FROM bets
  WHERE match_id = p_match_id;
  
  SELECT 
    COALESCE(SUM(CASE WHEN pilot_id = p_winner_id THEN amount ELSE 0 END), 0) INTO v_winner_pool
  FROM bets
  WHERE match_id = p_match_id;
  
  SELECT 
    COALESCE(SUM(CASE WHEN pilot_id = v_loser_id THEN amount ELSE 0 END), 0) INTO v_loser_pool
  FROM bets
  WHERE match_id = p_match_id;
  
  -- Atualizar status do match
  UPDATE matches
  SET winner_id = p_winner_id,
      match_status = 'finished',
      updated_at = now()
  WHERE id = p_match_id;
  
  -- Calcular ratio de pagamento CORRETO
  IF v_winner_pool > 0 THEN
    -- Apostas unilaterais (só no vencedor): garantir 2.00x por aposta
    -- Sistema injeta fundos para cobrir o dobro do winner_pool
    IF v_loser_pool = 0 THEN
      v_payout_ratio := 2.00;
    -- Apostas bilaterais: distribuir pool total proporcionalmente
    ELSE
      v_payout_ratio := v_total_pool / v_winner_pool;
    END IF;
    
    -- Distribuir pontos PROPORCIONALMENTE ao valor apostado de cada usuário
    FOR v_bet IN 
      SELECT user_id, amount
      FROM bets
      WHERE match_id = p_match_id AND pilot_id = p_winner_id
    LOOP
      UPDATE user_points
      SET points = points + ROUND(v_bet.amount * v_payout_ratio),
          total_wins = total_wins + 1,
          updated_at = now()
      WHERE user_id = v_bet.user_id;
    END LOOP;
  END IF;
  
  -- Atualizar estatísticas dos pilotos
  UPDATE pilots
  SET wins = wins + 1,
      total_races = total_races + 1,
      points = points + 100,
      updated_at = now()
  WHERE id = p_winner_id;
  
  UPDATE pilots
  SET losses = losses + 1,
      total_races = total_races + 1,
      points = GREATEST(points - 50, 0),
      updated_at = now()
  WHERE id = v_loser_id;
  
  -- Se for evento TOP 20, trocar posições
  SELECT position INTO v_winner_position 
  FROM top20_positions 
  WHERE pilot_id = p_winner_id;
  
  SELECT position INTO v_loser_position 
  FROM top20_positions 
  WHERE pilot_id = v_loser_id;
  
  IF v_winner_position IS NOT NULL AND v_loser_position IS NOT NULL THEN
    -- Trocar posições se vencedor estava em posição inferior
    IF v_winner_position > v_loser_position THEN
      UPDATE top20_positions SET pilot_id = p_winner_id WHERE position = v_loser_position;
      UPDATE top20_positions SET pilot_id = v_loser_id WHERE position = v_winner_position;
      
      -- Atualizar posição atual nos pilotos
      UPDATE pilots SET current_position = v_loser_position WHERE id = p_winner_id;
      UPDATE pilots SET current_position = v_winner_position WHERE id = v_loser_id;
    END IF;
    
    -- Atualizar data do último match
    UPDATE top20_positions 
    SET last_match_date = now(), 
        consecutive_absences = 0
    WHERE pilot_id IN (p_winner_id, v_loser_id);
  END IF;
  
  -- Update event standings
  PERFORM update_event_standings_for_match(p_match_id);
END;
$function$;

-- 2. Add unique constraint to prevent duplicate bets (race condition protection)
ALTER TABLE bets 
ADD CONSTRAINT unique_user_match_bet 
UNIQUE (user_id, match_id);

-- 3. Update place_bet function to check for duplicate bets
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
  -- Check for existing bet first (race condition protection)
  IF EXISTS (
    SELECT 1 FROM bets 
    WHERE user_id = p_user_id AND match_id = p_match_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You already have a bet on this match');
  END IF;

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