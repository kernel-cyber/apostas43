-- Fix search_path for swap_top20_positions function
CREATE OR REPLACE FUNCTION public.swap_top20_positions(p_positions integer[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_temp_pilot_id uuid;
  v_position integer;
  v_index integer;
BEGIN
  FOR v_index IN 1..array_length(p_positions, 1)
  LOOP
    v_position := v_index;
    v_temp_pilot_id := (
      SELECT pilot_id FROM top20_positions WHERE position = p_positions[v_index]
    );
    
    UPDATE top20_positions 
    SET pilot_id = v_temp_pilot_id,
        updated_at = now()
    WHERE position = v_position;
  END LOOP;
END;
$function$;