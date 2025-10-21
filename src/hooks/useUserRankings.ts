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
  roi: number;
  avg_bet: number;
  rank: number;
}

export const useUserRankings = (limit: number = 100) => {
  const { data: rankings, isLoading } = useQuery({
    queryKey: ['user-rankings', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_points')
        .select(`
          user_id,
          points,
          total_bets,
          total_wins,
          profiles!user_points_user_id_fkey(username, avatar_url)
        `)
        .order('points', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return (data || []).map((item: any, index: number) => {
        const profit = item.points - 1000;
        const totalWagered = item.total_bets * 100;
        const roi = totalWagered > 0 ? parseFloat(((profit / totalWagered) * 100).toFixed(1)) : 0;
        const avg_bet = item.total_bets > 0 ? Math.round(totalWagered / item.total_bets) : 0;

        return {
          user_id: item.user_id,
          username: item.profiles?.username || 'Usuário',
          avatar_url: item.profiles?.avatar_url || null,
          points: item.points || 0,
          total_bets: item.total_bets || 0,
          total_wins: item.total_wins || 0,
          win_rate: item.total_bets > 0 
            ? Math.round((item.total_wins / item.total_bets) * 100) 
            : 0,
          profit,
          roi,
          avg_bet,
          rank: index + 1,
        };
      }) as UserRanking[];
    },
  });

  const { data: topWinRate, isLoading: isLoadingWinRate } = useQuery({
    queryKey: ['user-rankings-win-rate', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_points')
        .select(`
          user_id,
          points,
          total_bets,
          total_wins,
          profiles!user_points_user_id_fkey(username, avatar_url)
        `)
        .gte('total_bets', 5)
        .order('total_wins', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return (data || [])
        .map((item: any, index: number) => {
          const profit = item.points - 1000;
          const totalWagered = item.total_bets * 100;
          const roi = totalWagered > 0 ? parseFloat(((profit / totalWagered) * 100).toFixed(1)) : 0;
          const avg_bet = item.total_bets > 0 ? Math.round(totalWagered / item.total_bets) : 0;

          return {
            user_id: item.user_id,
            username: item.profiles?.username || 'Usuário',
            avatar_url: item.profiles?.avatar_url || null,
            points: item.points || 0,
            total_bets: item.total_bets || 0,
            total_wins: item.total_wins || 0,
            win_rate: item.total_bets > 0 
              ? Math.round((item.total_wins / item.total_bets) * 100) 
              : 0,
            profit,
            roi,
            avg_bet,
            rank: index + 1,
          };
        })
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
