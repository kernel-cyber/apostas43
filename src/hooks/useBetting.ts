import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStandardNotification } from './useStandardNotification';

interface MatchOdds {
  pilot1_odds: number;
  pilot2_odds: number;
  pilot1_total: number;
  pilot2_total: number;
  total_pool: number;
  pilot1_percentage: number;
  pilot2_percentage: number;
}

interface ExistingBet {
  id: string;
  amount: number;
  pilot_id: string;
  pilot: { name: string };
  created_at: string;
}

export const useBetting = (matchId: string | null) => {
  const notify = useStandardNotification();
  const [odds, setOdds] = useState<MatchOdds | null>(null);
  const [loading, setLoading] = useState(false);
  const [existingBet, setExistingBet] = useState<ExistingBet | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const checkExistingBet = async (userId: string) => {
    if (!matchId) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('bets')
        .select(`
          id,
          amount,
          pilot_id,
          created_at,
          pilot:pilots(name)
        `)
        .eq('match_id', matchId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      setExistingBet(data);
    } catch (error) {
      console.error('Error checking existing bet:', error);
    }
  };

  const fetchOdds = async () => {
    if (!matchId) return;

    const { data, error } = await supabase.rpc('calculate_match_odds', {
      p_match_id: matchId
    });

    if (error) {
      console.error('Error fetching odds:', error);
      return;
    }

    if (data && typeof data === 'object') {
      setOdds(data as unknown as MatchOdds);
      setLastUpdate(new Date());
    }
  };

  useEffect(() => {
    if (!matchId) return;

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
        // Traduzir erros específicos para português
        let errorMessage = result.error || 'Ocorreu um erro desconhecido. Tente novamente.';
        
        if (result.error?.includes('locked')) {
          errorMessage = '🔒 Apostas fechadas neste momento. Aguarde o próximo match!';
        } else if (result.error?.includes('Insufficient points')) {
          errorMessage = '💰 Pontos insuficientes. Aposte um valor menor!';
        } else if (result.error?.includes('not open for betting')) {
          errorMessage = '⏰ Este match não está aceitando apostas no momento.';
        }
        
        notify.error(
          'Não foi possível realizar a aposta',
          errorMessage
        );
        return result;
      }

      notify.success(
        'Aposta Realizada com Sucesso!',
        `Você apostou ${amount} pontos. Boa sorte! 🍀`
      );

      fetchOdds();
      return result;
    } catch (error: any) {
      notify.error(
        'Erro',
        error.message || 'Ocorreu um erro ao processar sua aposta.'
      );
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Retornar também a função de verificar aposta e o timestamp
  return { 
    odds, 
    placeBet, 
    loading, 
    existingBet, 
    checkExistingBet,
    lastUpdate 
  };
};
