import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PilotRanking {
  id: string;
  name: string;
  car_name: string;
  team?: string | null;
  image_url: string | null;
  wins: number;
  losses: number;
  total_races: number;
  points: number;
  current_position: number | null;
  position: number | null;
  win_rate: number;
}

export const usePilotRankings = () => {
  // Always fetch from top20_positions for proper ordering
  const { data: rankings, isLoading } = useQuery({
    queryKey: ['pilot-rankings-top20'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('top20_positions')
        .select(`
          position,
          pilot:pilots(id, name, car_name, team, image_url, wins, losses, total_races, points, position)
        `)
        .not('pilot_id', 'is', null)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item.pilot,
        current_position: item.position,
        win_rate: item.pilot?.total_races > 0 
          ? Math.round((item.pilot.wins / item.pilot.total_races) * 100) 
          : 0
      })) as PilotRanking[];
    },
  });

  return {
    rankings,
    isLoading,
  };
};
