import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BettingDistribution {
  pilot1Percentage: number;
  pilot2Percentage: number;
}

export const useLiveBettingDistribution = (matchId: string, pilot1Id: string, pilot2Id: string) => {
  const [distribution, setDistribution] = useState<BettingDistribution>({
    pilot1Percentage: 0,
    pilot2Percentage: 0
  });

  const fetchDistribution = async () => {
    if (!matchId) return;
    try {
      const { data, error } = await supabase.rpc('calculate_match_odds', { 
        p_match_id: matchId 
      });

      if (error) throw error;

      if (data && typeof data === 'object') {
        const result = data as any;
        const p1 = Number(result.pilot1_percentage ?? 0);
        const p2 = Number(result.pilot2_percentage ?? 0);

        setDistribution({
          pilot1Percentage: Math.round(p1 * 10) / 10,
          pilot2Percentage: Math.round(p2 * 10) / 10
        });
      }
    } catch (error) {
      console.error('Error fetching betting distribution:', error);
    }
  };

  useEffect(() => {
    fetchDistribution();

    const channel = supabase
      .channel(`bets-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bets',
          filter: `match_id=eq.${matchId}`
        },
        () => {
          fetchDistribution();
        }
      )
      .subscribe();

    // Fallback polling para apostas de outros usuários
    const intervalId = setInterval(fetchDistribution, 1500);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [matchId, pilot1Id, pilot2Id]);

  return distribution;
};
