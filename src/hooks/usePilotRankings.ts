import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PilotRanking {
  id: string;
  name: string;
  car_name: string;
  image_url: string | null;
  wins: number;
  losses: number;
  total_races: number;
  points: number;
  current_position: number | null;
  category: 'top20' | 'shark_tank';
  win_rate: number;
}

export const usePilotRankings = (category?: 'top20' | 'shark_tank') => {
  const { data: rankings, isLoading } = useQuery({
    queryKey: ['pilot-rankings', category],
    queryFn: async () => {
      let query = (supabase as any)
        .from('pilots')
        .select('*');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('points', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((pilot: any) => ({
        ...pilot,
        win_rate: pilot.total_races > 0 
          ? Math.round((pilot.wins / pilot.total_races) * 100) 
          : 0
      })) as PilotRanking[];
    },
  });

  const { data: top20Rankings, isLoading: isLoadingTop20 } = useQuery({
    queryKey: ['pilot-rankings-top20'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('top20_positions')
        .select(`
          position,
          pilot:pilots(id, name, car_name, image_url, wins, losses, total_races, points)
        `)
        .not('pilot_id', 'is', null)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item.pilot,
        current_position: item.position,
        category: 'top20' as const,
        win_rate: item.pilot?.total_races > 0 
          ? Math.round((item.pilot.wins / item.pilot.total_races) * 100) 
          : 0
      })) as PilotRanking[];
    },
    enabled: !category || category === 'top20',
  });

  return {
    rankings: category === 'top20' ? top20Rankings : rankings,
    isLoading: category === 'top20' ? isLoadingTop20 : isLoading,
  };
};
