-- Função para salvar o ranking final de uma edição
CREATE OR REPLACE FUNCTION public.finalize_event_rankings(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Salvar as posições atuais do TOP 20 como ranking final da edição
  INSERT INTO event_standings (event_id, pilot_id, final_position, wins, losses, total_points)
  SELECT 
    p_event_id,
    tp.pilot_id,
    tp.position,
    COALESCE(es.wins, 0),
    COALESCE(es.losses, 0),
    COALESCE(es.total_points, 0)
  FROM top20_positions tp
  LEFT JOIN event_standings es ON es.event_id = p_event_id AND es.pilot_id = tp.pilot_id
  WHERE tp.pilot_id IS NOT NULL
  ON CONFLICT (event_id, pilot_id) 
  DO UPDATE SET
    final_position = EXCLUDED.final_position,
    wins = EXCLUDED.wins,
    losses = EXCLUDED.losses,
    total_points = EXCLUDED.total_points,
    updated_at = now();
  
  -- Marcar o evento como inativo (finalizado)
  UPDATE events
  SET is_active = false,
      updated_at = now()
  WHERE id = p_event_id;
END;
$function$;