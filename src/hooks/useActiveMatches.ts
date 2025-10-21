import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface Pilot {
  id: string;
  name: string;
  car_name: string;
  position: number | null;
  wins: number;
  losses: number;
  team?: string;
}

interface Match {
  id: string;
  pilot1_id: string;
  pilot2_id: string;
  event_id: string;
  match_status: string;
  round_number: number;
  bracket_type?: string;
  scheduled_time?: string;
}

interface MatchWithPilots extends Match {
  pilot1: Pilot | null;
  pilot2: Pilot | null;
  event: { name: string; event_type: string } | null;
}

export const useActiveMatches = () => {
  const [liveMatch, setLiveMatch] = useState<MatchWithPilots | null>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<MatchWithPilots[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Buscar match ao vivo (in_progress)
        const { data: liveData } = await supabase
          .from('matches' as any)
          .select(`
            *,
            pilot1:pilots!matches_pilot1_id_fkey(id, name, car_name, position, wins, losses, team),
            pilot2:pilots!matches_pilot2_id_fkey(id, name, car_name, position, wins, losses, team),
            event:events(*)
          `)
          .eq('match_status', 'in_progress')
          .maybeSingle();

        if (liveData) {
          setLiveMatch(liveData as any);
        }

        // Buscar próximas matches
        const { data: upcomingData } = await supabase
          .from('matches' as any)
          .select(`
            *,
            pilot1:pilots!matches_pilot1_id_fkey(id, name, car_name, position, wins, losses, team),
            pilot2:pilots!matches_pilot2_id_fkey(id, name, car_name, position, wins, losses, team),
            event:events(*)
          `)
          .eq('match_status', 'upcoming')
          .limit(5);

        setUpcomingMatches((upcomingData || []) as any);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();

    // Subscribe to realtime updates with query invalidation
    const channel = supabase
      .channel('active-matches-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => {
          // Timeout de segurança para garantir que match finalizado suma
          setTimeout(() => {
            fetchMatches();
          }, 500);
          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: ['matches'] });
          queryClient.invalidateQueries({ queryKey: ['active-matches'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // CRITICAL FIX: Clear liveMatch immediately when it finishes
  useEffect(() => {
    if (liveMatch && liveMatch.match_status === 'finished') {
      console.log('🏁 Match finalizado detectado, limpando liveMatch...');
      setLiveMatch(null);
      
      // Buscar novo match após 500ms
      setTimeout(() => {
        const fetchMatches = async () => {
          try {
            const { data: liveData } = await supabase
              .from('matches' as any)
              .select(`
                *,
                pilot1:pilots!matches_pilot1_id_fkey(id, name, car_name, position, wins, losses, team),
                pilot2:pilots!matches_pilot2_id_fkey(id, name, car_name, position, wins, losses, team),
                event:events(*)
              `)
              .eq('match_status', 'in_progress')
              .maybeSingle();

            if (liveData) {
              setLiveMatch(liveData as any);
            }
          } catch (error) {
            console.error('Error fetching new live match:', error);
          }
        };
        fetchMatches();
      }, 500);
    }
  }, [liveMatch?.match_status, liveMatch?.id]);

  return { liveMatch, upcomingMatches, loading };
};
