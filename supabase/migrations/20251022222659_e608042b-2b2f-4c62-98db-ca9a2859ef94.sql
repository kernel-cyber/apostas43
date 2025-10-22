-- Função para calcular estatísticas do usuário para badges
CREATE OR REPLACE FUNCTION public.get_user_badge_stats(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_stats jsonb;
  v_total_bets integer;
  v_total_wins integer;
  v_win_rate numeric;
  v_current_streak integer;
  v_events_participated integer;
  v_total_wagered numeric;
  v_underdog_wins integer;
  v_favorite_pilot_bets integer;
  v_has_favorite_pilot boolean;
BEGIN
  -- Total de apostas
  SELECT COUNT(*) INTO v_total_bets
  FROM bets WHERE user_id = p_user_id;
  
  -- Total de vitórias
  SELECT COUNT(*) INTO v_total_wins
  FROM bets b
  JOIN matches m ON m.id = b.match_id
  WHERE b.user_id = p_user_id AND m.winner_id = b.pilot_id;
  
  -- Win rate
  IF v_total_bets > 0 THEN
    v_win_rate := (v_total_wins::numeric / v_total_bets::numeric) * 100;
  ELSE
    v_win_rate := 0;
  END IF;
  
  -- Current streak (sequência atual de vitórias)
  WITH recent_bets AS (
    SELECT 
      b.id,
      CASE WHEN m.winner_id = b.pilot_id THEN 1 ELSE 0 END as won
    FROM bets b
    JOIN matches m ON m.id = b.match_id
    WHERE b.user_id = p_user_id 
      AND m.match_status = 'finished'
    ORDER BY b.created_at DESC
  )
  SELECT COUNT(*) INTO v_current_streak
  FROM recent_bets
  WHERE won = 1
  AND id <= (SELECT id FROM recent_bets WHERE won = 0 LIMIT 1);
  
  IF v_current_streak IS NULL THEN
    v_current_streak := v_total_wins; -- Se nunca perdeu, streak = total wins
  END IF;
  
  -- Eventos participados
  SELECT COUNT(DISTINCT m.event_id) INTO v_events_participated
  FROM bets b
  JOIN matches m ON m.id = b.match_id
  WHERE b.user_id = p_user_id;
  
  -- Total apostado
  SELECT COALESCE(SUM(amount), 0) INTO v_total_wagered
  FROM bets WHERE user_id = p_user_id;
  
  -- Vitórias underdog (odds 3.00x+)
  -- Aproximação: piloto posição >= 15 vs posição <= 5
  SELECT COUNT(*) INTO v_underdog_wins
  FROM bets b
  JOIN matches m ON m.id = b.match_id
  WHERE b.user_id = p_user_id 
    AND m.winner_id = b.pilot_id
    AND (
      (m.pilot1_id = b.pilot_id AND m.pilot1_position >= 15 AND m.pilot2_position <= 5)
      OR
      (m.pilot2_id = b.pilot_id AND m.pilot2_position >= 15 AND m.pilot1_position <= 5)
    );
  
  -- Piloto favorito
  SELECT (favorite_pilot_id IS NOT NULL) INTO v_has_favorite_pilot
  FROM profiles WHERE id = p_user_id;
  
  -- Apostas no piloto favorito
  SELECT COUNT(*) INTO v_favorite_pilot_bets
  FROM bets b
  JOIN profiles p ON p.id = b.user_id
  WHERE b.user_id = p_user_id 
    AND b.pilot_id = p.favorite_pilot_id;
  
  -- Montar JSON
  v_stats := jsonb_build_object(
    'total_bets', v_total_bets,
    'total_wins', v_total_wins,
    'win_rate', v_win_rate,
    'current_streak', v_current_streak,
    'events_participated', v_events_participated,
    'total_wagered', v_total_wagered,
    'underdog_wins', v_underdog_wins,
    'favorite_pilot_bets', v_favorite_pilot_bets,
    'has_favorite_pilot', v_has_favorite_pilot,
    'has_perfect_round', false -- TODO: implementar lógica de rodada perfeita
  );
  
  RETURN v_stats;
END;
$$;

-- Função para verificar e conceder badge automaticamente
CREATE OR REPLACE FUNCTION public.check_and_award_badge(p_user_id uuid, p_badge_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_already_earned boolean;
  v_badge_category text;
  v_badge_tier text;
BEGIN
  -- Verificar se já tem o badge
  SELECT EXISTS(
    SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = p_badge_id
  ) INTO v_already_earned;
  
  IF v_already_earned THEN
    RETURN false; -- Já tem o badge
  END IF;
  
  -- Determinar categoria e tier do badge
  SELECT 
    CASE 
      WHEN p_badge_id LIKE '%veteran%' OR p_badge_id = 'first_bet' OR p_badge_id = 'team_player' THEN 
        CASE 
          WHEN p_badge_id LIKE '%bronze%' OR p_badge_id = 'first_bet' OR p_badge_id = 'team_player' THEN 'bronze'
          WHEN p_badge_id LIKE '%silver%' THEN 'silver'
          WHEN p_badge_id LIKE '%gold%' THEN 'gold'
          ELSE 'bronze'
        END
      WHEN p_badge_id LIKE '%sharpshooter%' THEN 'gold'
      WHEN p_badge_id LIKE '%streak%' OR p_badge_id = 'loyal_fan' THEN 'silver'
      WHEN p_badge_id = 'high_roller' THEN 'platinum'
      WHEN p_badge_id LIKE '%master%' THEN 'gold'
      WHEN p_badge_id = 'underdog_hunter' THEN 'diamond'
      WHEN p_badge_id = 'perfect_round' THEN 'legendary'
      ELSE 'bronze'
    END INTO v_badge_tier;
  
  SELECT 
    CASE 
      WHEN p_badge_id LIKE '%veteran%' OR p_badge_id = 'first_bet' THEN 'participation'
      WHEN p_badge_id LIKE '%sharpshooter%' OR p_badge_id LIKE '%streak%' THEN 'performance'
      WHEN p_badge_id LIKE '%roller%' OR p_badge_id LIKE '%master%' THEN 'volume'
      WHEN p_badge_id LIKE '%underdog%' OR p_badge_id LIKE '%perfect%' THEN 'special'
      WHEN p_badge_id LIKE '%team%' OR p_badge_id LIKE '%loyal%' THEN 'social'
      ELSE 'participation'
    END INTO v_badge_category;
  
  -- Conceder badge
  INSERT INTO user_badges (user_id, badge_id, category, tier, progress, earned_at)
  VALUES (p_user_id, p_badge_id, v_badge_category::badge_category, v_badge_tier::badge_tier, 100, now());
  
  -- Dar recompensa de pontos
  UPDATE user_points
  SET points = points + CASE v_badge_tier
    WHEN 'bronze' THEN 50
    WHEN 'silver' THEN 100
    WHEN 'gold' THEN 200
    WHEN 'platinum' THEN 300
    WHEN 'diamond' THEN 500
    WHEN 'legendary' THEN 1000
    ELSE 50
  END,
  updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN true; -- Badge concedido
END;
$$;

-- Função para verificar todos os badges após uma aposta
CREATE OR REPLACE FUNCTION public.check_user_badges_after_bet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_stats jsonb;
  v_badge_awarded boolean;
BEGIN
  -- Buscar estatísticas atualizadas
  v_stats := get_user_badge_stats(NEW.user_id);
  
  -- PARTICIPATION BADGES
  IF (v_stats->>'total_bets')::integer >= 1 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'first_bet');
  END IF;
  
  IF (v_stats->>'events_participated')::integer >= 3 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'event_veteran_bronze');
  END IF;
  
  IF (v_stats->>'events_participated')::integer >= 10 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'event_veteran_silver');
  END IF;
  
  -- PERFORMANCE BADGES
  IF (v_stats->>'total_bets')::integer >= 20 AND (v_stats->>'win_rate')::numeric >= 70 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'sharpshooter');
  END IF;
  
  IF (v_stats->>'current_streak')::integer >= 5 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'winning_streak_5');
  END IF;
  
  -- VOLUME BADGES
  IF (v_stats->>'total_wagered')::numeric >= 10000 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'high_roller');
  END IF;
  
  IF (v_stats->>'total_bets')::integer >= 100 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'bet_master_100');
  END IF;
  
  -- SPECIAL BADGES
  IF (v_stats->>'underdog_wins')::integer >= 10 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'underdog_hunter');
  END IF;
  
  -- SOCIAL BADGES
  IF (v_stats->>'has_favorite_pilot')::boolean = true THEN
    PERFORM check_and_award_badge(NEW.user_id, 'team_player');
  END IF;
  
  IF (v_stats->>'favorite_pilot_bets')::integer >= 20 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'loyal_fan');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para verificar badges após finalizar matches (quando apostas são resolvidas)
CREATE OR REPLACE FUNCTION public.check_badges_after_match_finish()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_bet_user_id uuid;
BEGIN
  -- Apenas executar quando match for finalizado
  IF NEW.match_status = 'finished' AND OLD.match_status != 'finished' THEN
    -- Para cada aposta nesse match, verificar badges
    FOR v_bet_user_id IN 
      SELECT DISTINCT user_id FROM bets WHERE match_id = NEW.id
    LOOP
      PERFORM check_user_badges_after_bet() FROM bets WHERE user_id = v_bet_user_id AND match_id = NEW.id LIMIT 1;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger após finalizar matches
DROP TRIGGER IF EXISTS trigger_check_badges_after_match ON matches;
CREATE TRIGGER trigger_check_badges_after_match
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION check_badges_after_match_finish();

-- Trigger após atualizar piloto favorito
DROP TRIGGER IF EXISTS trigger_check_social_badges ON profiles;
CREATE TRIGGER trigger_check_social_badges
  AFTER UPDATE OF favorite_pilot_id ON profiles
  FOR EACH ROW
  WHEN (NEW.favorite_pilot_id IS NOT NULL AND OLD.favorite_pilot_id IS NULL)
  EXECUTE FUNCTION check_user_badges_after_bet();