import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStandardNotification } from './useStandardNotification';
import { useAuth } from '@/contexts/AuthContext';

export const useMatchNotifications = () => {
  const { user } = useAuth();
  const notify = useStandardNotification();

  const showMatchFinishedNotification = useCallback((match: any) => {
    const winnerName = match.winner?.name || 'Vencedor';
    
    const roundText = match.bracket_type === 'odd' 
      ? `Rodada Ímpar #${match.round_number}` 
      : match.bracket_type === 'even'
      ? `Rodada Par #${match.round_number}`
      : `Rodada #${match.round_number}`;
    
    notify.success(
      "Match Finalizado!",
      `${winnerName} é o campeão da ${roundText}!`
    );

    // Play notification sound
    const audio = new Audio('/sounds/match-finish.mp3');
    audio.play().catch(() => {});
  }, [notify]);

  const showNewMatchNotification = useCallback((match: any) => {
    const pilot1Name = match.pilot1?.name || 'Piloto 1';
    const pilot2Name = match.pilot2?.name || 'Piloto 2';
    
    const roundText = match.bracket_type === 'odd' 
      ? `Rodada Ímpar #${match.round_number}` 
      : match.bracket_type === 'even'
      ? `Rodada Par #${match.round_number}`
      : `Rodada #${match.round_number}`;
    
    notify.info(
      "Novo Match Disponível!",
      `${roundText} - ${pilot1Name} vs ${pilot2Name} está disponível! Apostas abertas!`
    );

    // Play notification sound
    const audio = new Audio('/sounds/match-start.mp3');
    audio.play().catch(() => {});
  }, [notify]);

  const showBettingClosedNotification = useCallback((match: any) => {
    const pilot1Name = match.pilot1?.name || 'Piloto 1';
    const pilot2Name = match.pilot2?.name || 'Piloto 2';
    
    const roundText = match.bracket_type === 'odd' 
      ? `Rodada Ímpar #${match.round_number}` 
      : match.bracket_type === 'even'
      ? `Rodada Par #${match.round_number}`
      : `Rodada #${match.round_number}`;
    
    notify.warning(
      "Apostas Encerradas!",
      `${roundText} - As apostas para ${pilot1Name} vs ${pilot2Name} foram encerradas.`
    );
    
    const audio = new Audio('/sounds/bet-placed.mp3');
    audio.play().catch(() => {});
  }, [notify]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('match-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: 'match_status=eq.finished'
        },
        async (payload) => {
          console.log('Match finished:', payload);
          
          // Fetch complete match data with pilots and winner
          const { data: match } = await (supabase as any)
            .from('matches')
            .select(`
              *,
              pilot1:pilots!matches_pilot1_id_fkey(id, name, car_name),
              pilot2:pilots!matches_pilot2_id_fkey(id, name, car_name),
              winner:pilots!matches_winner_id_fkey(id, name),
              event:events(id, name)
            `)
            .eq('id', payload.new.id)
            .single();

          if (match) {
            showMatchFinishedNotification(match);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches'
        },
        async (payload) => {
          console.log('New match created:', payload);
          
          // Fetch complete match data
          const { data: match } = await (supabase as any)
            .from('matches')
            .select(`
              *,
              pilot1:pilots!matches_pilot1_id_fkey(id, name, car_name),
              pilot2:pilots!matches_pilot2_id_fkey(id, name, car_name),
              event:events(id, name)
            `)
            .eq('id', payload.new.id)
            .single();

          if (match && match.match_status === 'upcoming') {
            showNewMatchNotification(match);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: 'match_status=eq.upcoming'
        },
        async (payload) => {
          console.log('Match status changed to upcoming:', payload);
          
          // Only notify if status just changed to upcoming
          if (payload.old.match_status !== 'upcoming') {
            const { data: match } = await (supabase as any)
              .from('matches')
              .select(`
                *,
                pilot1:pilots!matches_pilot1_id_fkey(id, name, car_name),
                pilot2:pilots!matches_pilot2_id_fkey(id, name, car_name),
                event:events(id, name)
              `)
              .eq('id', payload.new.id)
              .single();

            if (match) {
              showNewMatchNotification(match);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches'
        },
        async (payload) => {
          // CRITICAL FIX: Notificar quando apostas são fechadas (TODOS OS USUÁRIOS)
          if (payload.old && payload.new && 
              payload.old.betting_locked === false && 
              payload.new.betting_locked === true) {
            
            const { data: match } = await (supabase as any)
              .from('matches')
              .select(`
                *,
                pilot1:pilots!matches_pilot1_id_fkey(name, team),
                pilot2:pilots!matches_pilot2_id_fkey(name, team),
                event:events(id, name)
              `)
              .eq('id', payload.new.id)
              .single();

            if (match) {
              showBettingClosedNotification(match);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, showMatchFinishedNotification, showNewMatchNotification, showBettingClosedNotification]);

  return null;
};
