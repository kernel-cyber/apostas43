import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useMatchNotifications = () => {
  const { user } = useAuth();

  const showMatchFinishedNotification = useCallback((match: any) => {
    const winnerName = match.winner?.name || 'Vencedor';
    
    toast({
      title: "🏆 Match Finalizado!",
      description: `${winnerName} é o campeão!`,
      duration: 10000,
    });

    // Play notification sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {});
  }, []);

  const showNewMatchNotification = useCallback((match: any) => {
    const pilot1Name = match.pilot1?.name || 'Piloto 1';
    const pilot2Name = match.pilot2?.name || 'Piloto 2';
    const eventName = match.event?.name || 'Evento';
    
    toast({
      title: "🏁 Novo Match Disponível!",
      description: `${eventName}: ${pilot1Name} vs ${pilot2Name} - Apostas abertas!`,
      duration: 10000,
    });

    // Play notification sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {});
  }, []);

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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, showMatchFinishedNotification, showNewMatchNotification]);

  return null;
};
