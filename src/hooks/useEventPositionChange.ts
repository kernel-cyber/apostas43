import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PositionChange {
  startPosition: number | null;
  currentPosition: number | null;
  change: number; // positivo = ganhou posições (subiu), negativo = perdeu posições (desceu)
}

export const useEventPositionChange = (eventId: string | null, pilotId: string | null) => {
  return useQuery({
    queryKey: ['event-position-change', eventId, pilotId],
    queryFn: async (): Promise<PositionChange> => {
      if (!eventId || !pilotId) {
        return { startPosition: null, currentPosition: null, change: 0 };
      }

      // Buscar a posição inicial do piloto (primeira vez que participou de um match nesta edição)
      const { data: firstMatch } = await supabase
        .from('matches')
        .select('id, pilot1_id, pilot2_id, created_at')
        .eq('event_id', eventId)
        .or(`pilot1_id.eq.${pilotId},pilot2_id.eq.${pilotId}`)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (!firstMatch) {
        return { startPosition: null, currentPosition: null, change: 0 };
      }

      // Buscar posição atual do piloto no TOP 20
      const { data: currentPos } = await supabase
        .from('top20_positions')
        .select('position')
        .eq('pilot_id', pilotId)
        .single();

      // Para pegar a posição inicial, vamos usar o event_standings que guarda a posição final
      // Mas precisamos inferir a posição inicial olhando o primeiro match
      // Vamos buscar a posição que o piloto tinha no momento do primeiro match
      // Como não temos histórico, vamos usar a diferença entre a posição final e o número de vitórias
      const { data: standing } = await supabase
        .from('event_standings')
        .select('final_position, wins, losses')
        .eq('event_id', eventId)
        .eq('pilot_id', pilotId)
        .single();

      if (!standing || !currentPos) {
        return { startPosition: null, currentPosition: null, change: 0 };
      }

      // Estimar posição inicial baseado em:
      // Se o piloto ganhou posições (venceu matches contra superiores), a posição inicial era maior
      // Se perdeu posições (perdeu matches contra inferiores), a posição inicial era menor
      // Como não temos histórico exato, vamos usar uma heurística simples:
      
      const { data: matches } = await supabase
        .from('matches')
        .select(`
          id,
          pilot1_id,
          pilot2_id,
          winner_id,
          created_at
        `)
        .eq('event_id', eventId)
        .or(`pilot1_id.eq.${pilotId},pilot2_id.eq.${pilotId}`)
        .eq('match_status', 'finished')
        .order('created_at', { ascending: true });

      if (!matches || matches.length === 0) {
        return { 
          startPosition: standing.final_position, 
          currentPosition: currentPos.position, 
          change: 0 
        };
      }

      // Buscar posições dos oponentes
      const opponentIds = matches.map(m => 
        m.pilot1_id === pilotId ? m.pilot2_id : m.pilot1_id
      );

      const { data: opponentPositions } = await supabase
        .from('top20_positions')
        .select('pilot_id, position')
        .in('pilot_id', opponentIds);

      const positionMap = new Map(
        opponentPositions?.map(p => [p.pilot_id, p.position]) || []
      );

      // Calcular mudanças estimadas
      let estimatedChange = 0;
      matches.forEach(match => {
        const opponentId = match.pilot1_id === pilotId ? match.pilot2_id : match.pilot1_id;
        const opponentPos = positionMap.get(opponentId);
        const won = match.winner_id === pilotId;

        if (opponentPos && currentPos.position) {
          // Se venceu alguém em posição melhor (número menor), ganhou posições
          if (won && opponentPos < currentPos.position) {
            estimatedChange++;
          }
          // Se perdeu para alguém em posição pior (número maior), perdeu posições
          if (!won && opponentPos > currentPos.position) {
            estimatedChange--;
          }
        }
      });

      const startPosition = currentPos.position - estimatedChange;

      return {
        startPosition,
        currentPosition: currentPos.position,
        change: estimatedChange // positivo = ganhou posições
      };
    },
    enabled: !!eventId && !!pilotId,
  });
};
