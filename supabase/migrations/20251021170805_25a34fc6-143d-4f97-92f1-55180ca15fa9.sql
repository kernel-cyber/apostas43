-- Corrigir a função para pegar dados corretos dos pilotos
CREATE OR REPLACE FUNCTION public.finalize_event_rankings(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Deletar registros antigos para recriar com dados corretos
  DELETE FROM event_standings WHERE event_id = p_event_id;
  
  -- Salvar as posições atuais do TOP 20 com os dados REAIS dos pilotos
  INSERT INTO event_standings (event_id, pilot_id, final_position, wins, losses, total_points)
  SELECT 
    p_event_id,
    tp.pilot_id,
    tp.position,
    COALESCE(p.wins, 0),        -- Dados da tabela pilots
    COALESCE(p.losses, 0),      -- Dados da tabela pilots
    COALESCE(p.points, 0)       -- Dados da tabela pilots
  FROM top20_positions tp
  LEFT JOIN pilots p ON p.id = tp.pilot_id
  WHERE tp.pilot_id IS NOT NULL;
  
  -- Marcar o evento como inativo (finalizado)
  UPDATE events
  SET is_active = false,
      updated_at = now()
  WHERE id = p_event_id;
END;
$function$;