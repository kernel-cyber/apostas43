-- Criar função para capturar posições iniciais do TOP 20 quando um evento inicia
CREATE OR REPLACE FUNCTION capture_initial_positions(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Para cada piloto no TOP 20, criar/atualizar event_standings com initial_position
  INSERT INTO event_standings (event_id, pilot_id, initial_position, final_position, wins, losses, total_points)
  SELECT 
    p_event_id,
    tp.pilot_id,
    tp.position,  -- Capturar posição atual como inicial
    tp.position,  -- Também definir como final (será atualizada depois)
    0,            -- Wins começam em 0
    0,            -- Losses começam em 0
    0             -- Points começam em 0
  FROM top20_positions tp
  WHERE tp.pilot_id IS NOT NULL
  ON CONFLICT (event_id, pilot_id) 
  DO UPDATE SET
    initial_position = COALESCE(event_standings.initial_position, EXCLUDED.initial_position),
    updated_at = now();
END;
$$;