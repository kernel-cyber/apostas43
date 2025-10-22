-- Adicionar coluna is_showcased para badges favoritos
ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS is_showcased boolean DEFAULT false;

-- Atualizar get_user_badge_stats com novas estatísticas
CREATE OR REPLACE FUNCTION public.get_user_badge_stats(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  v_unique_pilots integer;
  v_all_in_bets integer;
  v_consecutive_days integer;
  v_favorite_changes integer;
  v_perfect_rounds integer;
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
  
  -- Current streak
  WITH recent_bets AS (
    SELECT 
      b.id,
      CASE WHEN m.winner_id = b.pilot_id THEN 1 ELSE 0 END as won,
      ROW_NUMBER() OVER (ORDER BY b.created_at DESC) as rn
    FROM bets b
    JOIN matches m ON m.id = b.match_id
    WHERE b.user_id = p_user_id 
      AND m.match_status = 'finished'
    ORDER BY b.created_at DESC
  ),
  streak AS (
    SELECT COUNT(*) as streak_count
    FROM recent_bets
    WHERE won = 1
    AND rn <= (SELECT COALESCE(MIN(rn), 9999) FROM recent_bets WHERE won = 0)
  )
  SELECT COALESCE(streak_count, 0) INTO v_current_streak FROM streak;
  
  -- Eventos participados
  SELECT COUNT(DISTINCT m.event_id) INTO v_events_participated
  FROM bets b
  JOIN matches m ON m.id = b.match_id
  WHERE b.user_id = p_user_id;
  
  -- Total apostado
  SELECT COALESCE(SUM(amount), 0) INTO v_total_wagered
  FROM bets WHERE user_id = p_user_id;
  
  -- Vitórias underdog (odds 3.00x+)
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
    
  -- Pilotos únicos apostados
  SELECT COUNT(DISTINCT pilot_id) INTO v_unique_pilots
  FROM bets WHERE user_id = p_user_id;
  
  -- All-in bets (>= 500 pts)
  SELECT COUNT(*) INTO v_all_in_bets
  FROM bets WHERE user_id = p_user_id AND amount >= 500;
  
  -- Dias consecutivos (aproximação)
  SELECT COUNT(DISTINCT DATE(created_at)) INTO v_consecutive_days
  FROM bets 
  WHERE user_id = p_user_id
  AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Mudanças de piloto favorito (aproximação - sempre 0 por enquanto)
  v_favorite_changes := 0;
  
  -- Rodadas perfeitas
  v_perfect_rounds := 0;
  
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
    'has_perfect_round', false,
    'unique_pilots', v_unique_pilots,
    'all_in_bets', v_all_in_bets,
    'consecutive_days', v_consecutive_days,
    'favorite_changes', v_favorite_changes,
    'perfect_rounds', v_perfect_rounds
  );
  
  RETURN v_stats;
END;
$function$;

-- Atualizar check_and_award_badge com multiplicadores de categoria
CREATE OR REPLACE FUNCTION public.check_and_award_badge(p_user_id uuid, p_badge_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_already_earned boolean;
  v_badge_category text;
  v_badge_tier text;
  v_base_points integer;
  v_multiplier numeric;
  v_final_points integer;
BEGIN
  -- Verificar se já tem o badge
  SELECT EXISTS(
    SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = p_badge_id
  ) INTO v_already_earned;
  
  IF v_already_earned THEN
    RETURN false;
  END IF;
  
  -- Determinar tier e pontos base
  v_badge_tier := CASE 
    WHEN p_badge_id LIKE '%bronze%' OR p_badge_id IN ('first_bet', 'team_player', 'iniciante', 'apostador', 'explorador_1') THEN 'bronze'
    WHEN p_badge_id LIKE '%silver%' OR p_badge_id IN ('winning_streak_5', 'loyal_fan', 'veterano', 'explorador_3', 'maratonista') THEN 'silver'
    WHEN p_badge_id LIKE '%gold%' OR p_badge_id IN ('sharpshooter', 'bet_master_100', 'lenda', 'streak_10', 'invicto') THEN 'gold'
    WHEN p_badge_id LIKE '%platinum%' OR p_badge_id IN ('high_roller', 'imortal', 'streak_20') THEN 'platinum'
    WHEN p_badge_id LIKE '%diamond%' OR p_badge_id IN ('underdog_hunter', 'ascendido', 'streak_50', 'magnata') THEN 'diamond'
    WHEN p_badge_id LIKE '%legendary%' OR p_badge_id IN ('perfect_round', 'eterno', 'streak_100', 'oligarca', 'dominacao_total') THEN 'legendary'
    ELSE 'bronze'
  END;
  
  v_base_points := CASE v_badge_tier
    WHEN 'bronze' THEN 50
    WHEN 'silver' THEN 100
    WHEN 'gold' THEN 200
    WHEN 'platinum' THEN 300
    WHEN 'diamond' THEN 500
    WHEN 'legendary' THEN 1000
    ELSE 50
  END;
  
  -- Determinar categoria
  v_badge_category := CASE 
    WHEN p_badge_id LIKE '%veteran%' OR p_badge_id LIKE '%iniciante%' OR p_badge_id LIKE '%apostador%' OR p_badge_id LIKE '%lenda%' OR p_badge_id LIKE '%explorador%' OR p_badge_id IN ('first_bet', 'maratonista', 'dedicado') THEN 'participation'
    WHEN p_badge_id LIKE '%sharpshooter%' OR p_badge_id LIKE '%streak%' OR p_badge_id LIKE '%winrate%' OR p_badge_id IN ('recuperacao_epica', 'invicto', 'dominacao_total') THEN 'performance'
    WHEN p_badge_id LIKE '%roller%' OR p_badge_id LIKE '%master%' OR p_badge_id LIKE '%magnata%' OR p_badge_id LIKE '%oligarca%' OR p_badge_id IN ('all_in_master', 'diversificador') THEN 'volume'
    WHEN p_badge_id LIKE '%underdog%' OR p_badge_id LIKE '%perfect%' OR p_badge_id LIKE '%profeta%' OR p_badge_id LIKE '%virada%' OR p_badge_id LIKE '%sniper%' THEN 'special'
    WHEN p_badge_id LIKE '%team%' OR p_badge_id LIKE '%loyal%' OR p_badge_id LIKE '%fanatico%' OR p_badge_id LIKE '%influenciador%' THEN 'social'
    ELSE 'participation'
  END;
  
  -- Multiplicador por categoria
  v_multiplier := CASE v_badge_category
    WHEN 'participation' THEN 1.0
    WHEN 'performance' THEN 1.5
    WHEN 'volume' THEN 0.8
    WHEN 'special' THEN 2.0
    WHEN 'social' THEN 1.2
    ELSE 1.0
  END;
  
  v_final_points := ROUND(v_base_points * v_multiplier);
  
  -- Conceder badge
  INSERT INTO user_badges (user_id, badge_id, category, tier, progress, earned_at)
  VALUES (p_user_id, p_badge_id, v_badge_category::badge_category, v_badge_tier::badge_tier, 100, now());
  
  -- Dar recompensa de pontos
  UPDATE user_points
  SET points = points + v_final_points,
  updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$function$;

-- Atualizar check_user_badges_after_bet para incluir novos badges
CREATE OR REPLACE FUNCTION public.check_user_badges_after_bet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_stats jsonb;
BEGIN
  v_stats := get_user_badge_stats(NEW.user_id);
  
  -- PARTICIPATION BADGES
  IF (v_stats->>'total_bets')::integer >= 1 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'first_bet');
    PERFORM check_and_award_badge(NEW.user_id, 'iniciante');
  END IF;
  
  IF (v_stats->>'total_bets')::integer >= 10 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'apostador');
  END IF;
  
  IF (v_stats->>'total_bets')::integer >= 50 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'veterano');
  END IF;
  
  IF (v_stats->>'total_bets')::integer >= 250 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'lenda');
  END IF;
  
  IF (v_stats->>'total_bets')::integer >= 1000 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'imortal');
  END IF;
  
  IF (v_stats->>'total_bets')::integer >= 5000 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'ascendido');
  END IF;
  
  IF (v_stats->>'total_bets')::integer >= 10000 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'eterno');
  END IF;
  
  IF (v_stats->>'events_participated')::integer >= 1 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'explorador_1');
  END IF;
  
  IF (v_stats->>'events_participated')::integer >= 3 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'event_veteran_bronze');
    PERFORM check_and_award_badge(NEW.user_id, 'explorador_3');
  END IF;
  
  IF (v_stats->>'events_participated')::integer >= 5 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'explorador_5');
  END IF;
  
  IF (v_stats->>'events_participated')::integer >= 10 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'event_veteran_silver');
    PERFORM check_and_award_badge(NEW.user_id, 'explorador_10');
  END IF;
  
  IF (v_stats->>'events_participated')::integer >= 25 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'explorador_25');
  END IF;
  
  IF (v_stats->>'events_participated')::integer >= 50 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'explorador_50');
  END IF;
  
  -- PERFORMANCE BADGES
  IF (v_stats->>'total_bets')::integer >= 20 AND (v_stats->>'win_rate')::numeric >= 60 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'winrate_60');
  END IF;
  
  IF (v_stats->>'total_bets')::integer >= 50 AND (v_stats->>'win_rate')::numeric >= 65 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'winrate_65');
  END IF;
  
  IF (v_stats->>'total_bets')::integer >= 100 AND (v_stats->>'win_rate')::numeric >= 70 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'sharpshooter');
    PERFORM check_and_award_badge(NEW.user_id, 'winrate_70');
  END IF;
  
  IF (v_stats->>'total_bets')::integer >= 200 AND (v_stats->>'win_rate')::numeric >= 75 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'winrate_75');
  END IF;
  
  IF (v_stats->>'total_bets')::integer >= 500 AND (v_stats->>'win_rate')::numeric >= 80 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'winrate_80');
  END IF;
  
  IF (v_stats->>'total_bets')::integer >= 1000 AND (v_stats->>'win_rate')::numeric >= 85 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'winrate_85');
  END IF;
  
  IF (v_stats->>'current_streak')::integer >= 3 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'streak_3');
  END IF;
  
  IF (v_stats->>'current_streak')::integer >= 5 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'winning_streak_5');
    PERFORM check_and_award_badge(NEW.user_id, 'streak_5');
  END IF;
  
  IF (v_stats->>'current_streak')::integer >= 10 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'streak_10');
  END IF;
  
  IF (v_stats->>'current_streak')::integer >= 20 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'streak_20');
  END IF;
  
  IF (v_stats->>'current_streak')::integer >= 50 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'streak_50');
  END IF;
  
  IF (v_stats->>'current_streak')::integer >= 100 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'streak_100');
  END IF;
  
  -- VOLUME BADGES
  IF (v_stats->>'total_wagered')::numeric >= 1000 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'apostador_casual');
  END IF;
  
  IF (v_stats->>'total_wagered')::numeric >= 5000 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'apostador_serio');
  END IF;
  
  IF (v_stats->>'total_wagered')::numeric >= 10000 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'high_roller');
  END IF;
  
  IF (v_stats->>'total_wagered')::numeric >= 50000 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'magnata');
  END IF;
  
  IF (v_stats->>'total_wagered')::numeric >= 250000 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'oligarca');
  END IF;
  
  IF (v_stats->>'total_bets')::integer >= 100 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'bet_master_100');
  END IF;
  
  IF (v_stats->>'all_in_bets')::integer >= 10 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'all_in_master');
  END IF;
  
  IF (v_stats->>'unique_pilots')::integer >= 15 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'colecionador');
  END IF;
  
  -- SPECIAL BADGES
  IF (v_stats->>'underdog_wins')::integer >= 1 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'underdog_1');
  END IF;
  
  IF (v_stats->>'underdog_wins')::integer >= 5 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'underdog_5');
  END IF;
  
  IF (v_stats->>'underdog_wins')::integer >= 10 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'underdog_hunter');
    PERFORM check_and_award_badge(NEW.user_id, 'underdog_10');
  END IF;
  
  IF (v_stats->>'underdog_wins')::integer >= 25 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'underdog_25');
  END IF;
  
  IF (v_stats->>'underdog_wins')::integer >= 50 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'underdog_50');
  END IF;
  
  IF (v_stats->>'underdog_wins')::integer >= 100 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'underdog_100');
  END IF;
  
  -- SOCIAL BADGES
  IF (v_stats->>'has_favorite_pilot')::boolean = true THEN
    PERFORM check_and_award_badge(NEW.user_id, 'team_player');
  END IF;
  
  IF (v_stats->>'favorite_pilot_bets')::integer >= 20 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'loyal_fan');
  END IF;
  
  IF (v_stats->>'favorite_pilot_bets')::integer >= 50 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'fanatico_50');
  END IF;
  
  IF (v_stats->>'favorite_pilot_bets')::integer >= 100 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'fanatico_100');
  END IF;
  
  IF (v_stats->>'favorite_pilot_bets')::integer >= 250 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'fanatico_250');
  END IF;
  
  IF (v_stats->>'favorite_pilot_bets')::integer >= 500 THEN
    PERFORM check_and_award_badge(NEW.user_id, 'fanatico_500');
  END IF;
  
  RETURN NEW;
END;
$function$;