import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserRanking {
  user_id: string;
  username: string;
  avatar_url: string | null;
  points: number;
  total_bets: number;
  total_wins: number;
  win_rate: number;
  profit: number;
}

export const useUserRankings = (limit: number = 100) => {
  const { data: rankings, isLoading } = useQuery({
    queryKey: ['user-rankings', limit],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('user_points')
        .select(`
          user_id,
          points,
          total_bets,
          total_wins,
          profile:profiles(username, avatar_url)
        `)
        .order('points', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return (data || []).map((item: any, index: number) => ({
        user_id: item.user_id,
        username: item.profile?.username || 'Usuário',
        avatar_url: item.profile?.avatar_url || null,
        points: item.points || 0,
        total_bets: item.total_bets || 0,
        total_wins: item.total_wins || 0,
        win_rate: item.total_bets > 0 
          ? Math.round((item.total_wins / item.total_bets) * 100) 
          : 0,
        profit: item.points - 1000, // Assumindo que todos começam com 1000 pontos
        rank: index + 1,
      })) as UserRanking[];
    },
  });

  const { data: topWinRate, isLoading: isLoadingWinRate } = useQuery({
    queryKey: ['user-rankings-win-rate', limit],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('user_points')
        .select(`
          user_id,
          points,
          total_bets,
          total_wins,
          profile:profiles(username, avatar_url)
        `)
        .gte('total_bets', 5) // Mínimo de 5 apostas para aparecer no ranking de win rate
        .order('total_wins', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return (data || [])
        .map((item: any) => ({
          user_id: item.user_id,
          username: item.profile?.username || 'Usuário',
          avatar_url: item.profile?.avatar_url || null,
          points: item.points || 0,
          total_bets: item.total_bets || 0,
          total_wins: item.total_wins || 0,
          win_rate: item.total_bets > 0 
            ? Math.round((item.total_wins / item.total_bets) * 100) 
            : 0,
          profit: item.points - 1000,
        }))
        .sort((a: any, b: any) => b.win_rate - a.win_rate)
        .slice(0, limit) as UserRanking[];
    },
  });

  return {
    rankingsByPoints: rankings,
    rankingsByWinRate: topWinRate,
    isLoading: isLoading || isLoadingWinRate,
  };
};
