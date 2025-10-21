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
    try {
      const { data: betsData, error } = await supabase
        .from('bets')
        .select('pilot_id, amount')
        .eq('match_id', matchId);

      if (error) throw error;

      if (!betsData || betsData.length === 0) {
        setDistribution({ pilot1Percentage: 0, pilot2Percentage: 0 });
        return;
      }

      const pilot1Total = betsData
        .filter(bet => bet.pilot_id === pilot1Id)
        .reduce((sum, bet) => sum + bet.amount, 0);

      const pilot2Total = betsData
        .filter(bet => bet.pilot_id === pilot2Id)
        .reduce((sum, bet) => sum + bet.amount, 0);

      const totalPool = pilot1Total + pilot2Total;

      if (totalPool === 0) {
        setDistribution({ pilot1Percentage: 0, pilot2Percentage: 0 });
      } else {
        setDistribution({
          pilot1Percentage: (pilot1Total / totalPool) * 100,
          pilot2Percentage: (pilot2Total / totalPool) * 100
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, pilot1Id, pilot2Id]);

  return distribution;
};
