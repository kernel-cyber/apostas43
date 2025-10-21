import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MatchOdds {
  pilot1_odds: number;
  pilot2_odds: number;
  pilot1_total: number;
  pilot2_total: number;
  total_pool: number;
  pilot1_percentage: number;
  pilot2_percentage: number;
}

export const useBetting = (matchId: string | null) => {
  const [odds, setOdds] = useState<MatchOdds | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!matchId) return;

    const fetchOdds = async () => {
      const { data, error } = await supabase.rpc('calculate_match_odds', {
        p_match_id: matchId
      });

      if (error) {
        console.error('Error fetching odds:', error);
        return;
      }

      if (data && typeof data === 'object') {
        setOdds(data as unknown as MatchOdds);
      }
    };

    fetchOdds();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bets',
          filter: `match_id=eq.${matchId}`
        },
        () => {
          fetchOdds();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const placeBet = async (userId: string, pilotId: string, amount: number) => {
    if (!matchId) return { success: false, error: 'Match ID not provided' };

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('place_bet', {
        p_user_id: userId,
        p_match_id: matchId,
        p_pilot_id: pilotId,
        p_amount: amount
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; remaining_points?: number };

      if (!result.success) {
        toast({
          title: 'Erro ao apostar',
          description: result.error || 'Erro desconhecido',
          variant: 'destructive',
        });
        return result;
      }

      toast({
        title: 'Aposta realizada!',
        description: `${amount} pontos apostados com sucesso`,
      });

      return result;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return { odds, placeBet, loading };
};
