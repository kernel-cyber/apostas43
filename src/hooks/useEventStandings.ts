import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EventStanding {
  id: string;
  event_id: string;
  pilot_id: string;
  final_position: number;
  wins: number;
  losses: number;
  total_points: number;
  pilot?: {
    id: string;
    name: string;
    car_name: string;
    image_url?: string;
    team?: string;
  };
}

export const useEventStandings = (eventId: string | null) => {
  return useQuery({
    queryKey: ['event-standings', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('event_standings')
        .select('*')
        .eq('event_id', eventId)
        .order('total_points', { ascending: false })
        .order('wins', { ascending: false });
      
      if (error) throw error;
      
      // Manually fetch pilot data for each standing
      const standingsWithPilots = await Promise.all(
        data.map(async (standing) => {
          const { data: pilotData } = await supabase
            .from('pilots')
            .select('id, name, car_name, image_url, team')
            .eq('id', standing.pilot_id)
            .single();
          
          return {
            ...standing,
            pilot: pilotData
          };
        })
      );
      
      return standingsWithPilots as EventStanding[];
    },
    enabled: !!eventId,
  });
};
