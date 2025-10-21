import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PilotStats {
  defesasSuccess: number;
  defesasTotal: number;
  ataquesSuccess: number;
  ataquesTotal: number;
}

export const useEventPilotStats = (eventId: string | null, pilotId: string | null) => {
  return useQuery({
    queryKey: ['event-pilot-stats', eventId, pilotId],
    queryFn: async (): Promise<PilotStats> => {
      if (!eventId || !pilotId) {
        return { defesasSuccess: 0, defesasTotal: 0, ataquesSuccess: 0, ataquesTotal: 0 };
      }

      // Buscar todos os matches finalizados onde o piloto participou
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          id,
          pilot1_id,
          pilot2_id,
          pilot1_position,
          pilot2_position,
          winner_id,
          match_status
        `)
        .eq('event_id', eventId)
        .eq('match_status', 'finished')
        .or(`pilot1_id.eq.${pilotId},pilot2_id.eq.${pilotId}`);

      if (error) throw error;
      if (!matches || matches.length === 0) {
        return { defesasSuccess: 0, defesasTotal: 0, ataquesSuccess: 0, ataquesTotal: 0 };
      }

      let defesasSuccess = 0;
      let defesasTotal = 0;
      let ataquesSuccess = 0;
      let ataquesTotal = 0;

      matches.forEach(match => {
        // Usar posições históricas salvas no match
        const pilot1Pos = match.pilot1_position;
        const pilot2Pos = match.pilot2_position;

        if (!pilot1Pos || !pilot2Pos) return;

        const isPilot1 = match.pilot1_id === pilotId;
        const myPosition = isPilot1 ? pilot1Pos : pilot2Pos;
        const opponentPosition = isPilot1 ? pilot2Pos : pilot1Pos;
        const isWinner = match.winner_id === pilotId;

        // Defesa: Piloto está em posição SUPERIOR (número menor)
        if (myPosition < opponentPosition) {
          defesasTotal++;
          if (isWinner) defesasSuccess++;
        }
        // Ataque: Piloto está em posição INFERIOR (número maior)
        else if (myPosition > opponentPosition) {
          ataquesTotal++;
          if (isWinner) ataquesSuccess++;
        }
      });

      return { defesasSuccess, defesasTotal, ataquesSuccess, ataquesTotal };
    },
    enabled: !!eventId && !!pilotId,
  });
};
