-- Create table to store final event standings/rankings
CREATE TABLE public.event_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  pilot_id UUID NOT NULL,
  final_position INTEGER NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, pilot_id)
);

-- Enable RLS
ALTER TABLE public.event_standings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Event standings are viewable by everyone"
ON public.event_standings
FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage event standings"
ON public.event_standings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_event_standings_updated_at
BEFORE UPDATE ON public.event_standings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_event_standings_event_id ON public.event_standings(event_id);
CREATE INDEX idx_event_standings_pilot_id ON public.event_standings(pilot_id);
CREATE INDEX idx_event_standings_position ON public.event_standings(event_id, final_position);

-- Function to update event standings when match is finished
CREATE OR REPLACE FUNCTION public.update_event_standings_for_match(p_match_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_match RECORD;
  v_winner_id UUID;
  v_loser_id UUID;
BEGIN
  -- Get match details
  SELECT m.*, e.id as event_id
  INTO v_match
  FROM matches m
  JOIN events e ON e.id = m.event_id
  WHERE m.id = p_match_id AND m.match_status = 'finished';
  
  IF v_match IS NULL THEN
    RETURN;
  END IF;
  
  v_winner_id := v_match.winner_id;
  v_loser_id := CASE 
    WHEN v_match.pilot1_id = v_winner_id THEN v_match.pilot2_id 
    ELSE v_match.pilot1_id 
  END;
  
  -- Update or insert winner stats
  INSERT INTO event_standings (event_id, pilot_id, final_position, wins, losses, total_points)
  SELECT 
    v_match.event_id,
    v_winner_id,
    COALESCE((SELECT position FROM top20_positions WHERE pilot_id = v_winner_id), 99),
    1,
    0,
    100
  ON CONFLICT (event_id, pilot_id) 
  DO UPDATE SET
    wins = event_standings.wins + 1,
    total_points = event_standings.total_points + 100,
    final_position = COALESCE((SELECT position FROM top20_positions WHERE pilot_id = v_winner_id), event_standings.final_position),
    updated_at = now();
  
  -- Update or insert loser stats
  INSERT INTO event_standings (event_id, pilot_id, final_position, wins, losses, total_points)
  SELECT 
    v_match.event_id,
    v_loser_id,
    COALESCE((SELECT position FROM top20_positions WHERE pilot_id = v_loser_id), 99),
    0,
    1,
    0
  ON CONFLICT (event_id, pilot_id) 
  DO UPDATE SET
    losses = event_standings.losses + 1,
    final_position = COALESCE((SELECT position FROM top20_positions WHERE pilot_id = v_loser_id), event_standings.final_position),
    updated_at = now();
    
END;
$$;

-- Update settle_match function to also update event standings
CREATE OR REPLACE FUNCTION public.settle_match(p_match_id uuid, p_winner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_bet record;
  v_odds jsonb;
  v_winner_odds numeric;
  v_match record;
  v_loser_id uuid;
  v_winner_position integer;
  v_loser_position integer;
BEGIN
  -- Buscar informações do match
  SELECT * INTO v_match FROM matches WHERE id = p_match_id;
  
  -- Calcular odds
  v_odds := calculate_match_odds(p_match_id);
  
  IF v_match.pilot1_id = p_winner_id THEN
    v_winner_odds := (v_odds->>'pilot1_odds')::numeric;
    v_loser_id := v_match.pilot2_id;
  ELSE
    v_winner_odds := (v_odds->>'pilot2_odds')::numeric;
    v_loser_id := v_match.pilot1_id;
  END IF;
  
  -- Atualizar status do match
  UPDATE matches
  SET winner_id = p_winner_id,
      match_status = 'finished',
      updated_at = now()
  WHERE id = p_match_id;
  
  -- Distribuir pontos das apostas
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
$$;