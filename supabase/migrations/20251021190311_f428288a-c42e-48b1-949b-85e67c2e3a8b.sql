-- Atualizar settle_match para garantir pagamentos proporcionais corretos
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