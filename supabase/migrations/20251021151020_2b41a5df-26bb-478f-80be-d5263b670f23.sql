-- Corrigir a função generate_top20_matches para calcular o round_number correto
DROP FUNCTION IF EXISTS public.generate_top20_matches(uuid, text);

CREATE OR REPLACE FUNCTION public.generate_top20_matches(p_event_id uuid, p_bracket_type text)
RETURNS TABLE(round_num integer, pilot1_id uuid, pilot2_id uuid, pilot1_pos integer, pilot2_pos integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_position_pairs INTEGER[][];
  v_pair INTEGER[];
  v_pilot1 UUID;
  v_pilot2 UUID;
  v_next_round INTEGER;
  v_bracket_suffix TEXT;
BEGIN
  -- Determinar o próximo número de rodada para este evento
  SELECT COALESCE(MAX(round_number), 0) + 1 
  INTO v_next_round
  FROM matches
  WHERE event_id = p_event_id;
  
  -- Extrair apenas 'odd' ou 'even' do bracket_type
  IF p_bracket_type = 'top20_odd' OR p_bracket_type = 'odd' THEN
    v_bracket_suffix := 'odd';
    -- Rodada Ímpar: 19x18, 17x16, 15x14, 13x12, 11x10, 9x8, 7x6, 5x4, 3x2
    v_position_pairs := ARRAY[
      ARRAY[19,18], ARRAY[17,16], ARRAY[15,14], ARRAY[13,12], ARRAY[11,10],
      ARRAY[9,8], ARRAY[7,6], ARRAY[5,4], ARRAY[3,2]
    ];
  ELSIF p_bracket_type = 'top20_even' OR p_bracket_type = 'even' THEN
    v_bracket_suffix := 'even';
    -- Rodada Par: 20x19, 18x17, 16x15, 14x13, 12x11, 10x9, 8x7, 6x5, 4x3, 2x1
    v_position_pairs := ARRAY[
      ARRAY[20,19], ARRAY[18,17], ARRAY[16,15], ARRAY[14,13], ARRAY[12,11],
      ARRAY[10,9], ARRAY[8,7], ARRAY[6,5], ARRAY[4,3], ARRAY[2,1]
    ];
  ELSE
    RAISE EXCEPTION 'Invalid bracket type: %. Use top20_odd, top20_even, odd, or even', p_bracket_type;
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
      round_num := v_next_round;
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