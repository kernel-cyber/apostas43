import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStandardNotification } from './useStandardNotification';
import { useSoundEffects } from './useSoundEffects';

export const useBetResults = (userId: string | undefined) => {
  const notify = useStandardNotification();
  const { playWin, playLoss } = useSoundEffects();

  const checkBetResult = useCallback(async (matchId: string, winnerId: string) => {
    if (!userId) return;

    // Buscar aposta do usuário neste match
    const { data: bet } = await supabase
      .from('bets')
      .select(`
        *,
        pilot:pilots(name, car_name)
      `)
      .eq('user_id', userId)
      .eq('match_id', matchId)
      .single();

    if (!bet) return;

    const won = bet.pilot_id === winnerId;

    // Buscar odds no momento da aposta
    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (!match) return;

    // Calcular retorno aproximado
    const oddsData = await supabase.rpc('calculate_match_odds', { 
      p_match_id: matchId 
    });

    const odds = oddsData.data as any;
    const isOdds = match.pilot1_id === bet.pilot_id ? odds?.pilot1_odds : odds?.pilot2_odds;
    const potentialReturn = Math.round(bet.amount * (isOdds || 1));

    if (won) {
      notify.success(
        "Você Ganhou!",
        `${bet.pilot?.name} venceu! Você ganhou ${potentialReturn} pontos (${isOdds?.toFixed(2)}x retorno). 💰`
      );
      playWin();
    } else {
      notify.error(
        "Você Perdeu",
        `${bet.pilot?.name} não venceu desta vez. Você perdeu ${bet.amount} pontos.`
      );
      playLoss();
    }
  }, [userId, notify, playWin, playLoss]);

  useEffect(() => {
    const channel = supabase
      .channel('bet-results')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: 'match_status=eq.finished'
      }, async (payload: any) => {
        if (payload.new.winner_id) {
          await checkBetResult(payload.new.id, payload.new.winner_id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [checkBetResult]);
};
