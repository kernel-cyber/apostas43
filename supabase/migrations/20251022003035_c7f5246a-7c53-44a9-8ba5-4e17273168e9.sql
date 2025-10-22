-- Função para resetar event_standings de um evento
CREATE OR REPLACE FUNCTION public.reset_event_standings(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Deletar todos os registros de event_standings para o evento
  DELETE FROM event_standings WHERE event_id = p_event_id;
END;
$$;

-- Melhorar a função capture_initial_positions para sempre começar com 0
CREATE OR REPLACE FUNCTION public.capture_initial_positions(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Para cada piloto no TOP 20, criar event_standings com valores zerados
  -- Se já existir, apenas atualizar initial_position se for NULL
  INSERT INTO event_standings (event_id, pilot_id, initial_position, final_position, wins, losses, total_points)
  SELECT 
    p_event_id,
    tp.pilot_id,
    tp.position,  -- Capturar posição atual como inicial
    tp.position,  -- Também definir como final (será atualizada depois)
    0,            -- Wins SEMPRE começam em 0 para novo evento
    0,            -- Losses SEMPRE começam em 0 para novo evento
    0             -- Points SEMPRE começam em 0 para novo evento
  FROM top20_positions tp
  WHERE tp.pilot_id IS NOT NULL
  ON CONFLICT (event_id, pilot_id) 
  DO UPDATE SET
    -- Se já existe registro, apenas atualizar initial_position se for NULL
    -- NÃO sobrescrever wins/losses/points (isso preserva dados de re-capturas)
    initial_position = COALESCE(event_standings.initial_position, EXCLUDED.initial_position),
    updated_at = now();
END;
$$;

-- Função helper para verificar se event_standings já existe para um evento
CREATE OR REPLACE FUNCTION public.has_event_standings(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM event_standings WHERE event_id = p_event_id
  );
$$;