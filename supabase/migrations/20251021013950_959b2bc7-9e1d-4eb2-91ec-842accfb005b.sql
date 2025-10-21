-- FASE 1: Estrutura de Banco de Dados para TOP 20 e Rankings

-- 1.1 Criar tabela top20_positions
CREATE TABLE IF NOT EXISTS public.top20_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position INTEGER NOT NULL UNIQUE CHECK (position >= 1 AND position <= 20),
  pilot_id UUID REFERENCES public.pilots(id) ON DELETE SET NULL,
  consecutive_absences INTEGER DEFAULT 0,
  last_match_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_top20_position ON public.top20_positions(position);
CREATE INDEX IF NOT EXISTS idx_top20_pilot ON public.top20_positions(pilot_id);

-- RLS policies para top20_positions
ALTER TABLE public.top20_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view TOP 20" ON public.top20_positions
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify TOP 20" ON public.top20_positions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_top20_positions_updated_at 
  BEFORE UPDATE ON public.top20_positions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 1.2 Adicionar campos aos pilotos para categorização e rankings
ALTER TABLE public.pilots 
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'shark_tank' CHECK (category IN ('top20', 'shark_tank'));

ALTER TABLE public.pilots
  ADD COLUMN IF NOT EXISTS current_position INTEGER,
  ADD COLUMN IF NOT EXISTS best_time TEXT,
  ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Índices para rankings
CREATE INDEX IF NOT EXISTS idx_pilots_category ON public.pilots(category);
CREATE INDEX IF NOT EXISTS idx_pilots_points ON public.pilots(points DESC);
CREATE INDEX IF NOT EXISTS idx_pilots_wins ON public.pilots(wins DESC);

-- 1.3 Adicionar campo bracket_type aos eventos
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS bracket_type TEXT;

-- 1.4 Função para gerar matches automaticamente do TOP 20
CREATE OR REPLACE FUNCTION public.generate_top20_matches(
  p_event_id UUID,
  p_bracket_type TEXT
)
RETURNS TABLE (
  round_num INTEGER,
  pilot1_id UUID,
  pilot2_id UUID,
  pilot1_pos INTEGER,
  pilot2_pos INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_position_pairs INTEGER[][];
  v_pair INTEGER[];
  v_pilot1 UUID;
  v_pilot2 UUID;
  v_round INTEGER := 1;
BEGIN
  -- Definir os pares baseado no tipo de rodada
  IF p_bracket_type = 'top20_odd' THEN
    -- Rodada Ímpar: 19x18, 17x16, 15x14, 13x12, 11x10, 9x8, 7x6, 5x4, 3x2
    v_position_pairs := ARRAY[
      ARRAY[19,18], ARRAY[17,16], ARRAY[15,14], ARRAY[13,12], ARRAY[11,10],
      ARRAY[9,8], ARRAY[7,6], ARRAY[5,4], ARRAY[3,2]
    ];
  ELSIF p_bracket_type = 'top20_even' THEN
    -- Rodada Par: 20x19, 18x17, 16x15, 14x13, 12x11, 10x9, 8x7, 6x5, 4x3, 2x1
    v_position_pairs := ARRAY[
      ARRAY[20,19], ARRAY[18,17], ARRAY[16,15], ARRAY[14,13], ARRAY[12,11],
      ARRAY[10,9], ARRAY[8,7], ARRAY[6,5], ARRAY[4,3], ARRAY[2,1]
    ];
  ELSE
    RAISE EXCEPTION 'Invalid bracket type: %. Use top20_odd or top20_even', p_bracket_type;
  END IF;

  -- Iterar pelos pares e buscar os pilotos
  FOREACH v_pair SLICE 1 IN ARRAY v_position_pairs
  LOOP
    -- Buscar pilotos nas posições
    SELECT pilot_id INTO v_pilot1
    FROM top20_positions
    WHERE position = v_pair[1];
    
    SELECT pilot_id INTO v_pilot2
    FROM top20_positions
    WHERE position = v_pair[2];
    
    -- Apenas retornar se ambos os pilotos existem
    IF v_pilot1 IS NOT NULL AND v_pilot2 IS NOT NULL THEN
      round_num := v_round;
      pilot1_id := v_pilot1;
      pilot2_id := v_pilot2;
      pilot1_pos := v_pair[1];
      pilot2_pos := v_pair[2];
      RETURN NEXT;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$;

-- 1.5 Atualizar função settle_match para incluir lógica de TOP 20
CREATE OR REPLACE FUNCTION public.settle_match(p_match_id uuid, p_winner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
END;
$function$;