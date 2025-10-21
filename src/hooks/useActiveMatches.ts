import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Pilot {
  id: string;
  name: string;
  car_name: string;
  position: number | null;
  wins: number;
  losses: number;
}

interface Match {
  id: string;
  pilot1_id: string;
  pilot2_id: string;
  event_id: string;
  match_status: string;
  round_number: number;
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

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Buscar match ao vivo (in_progress)
        const { data: liveData } = await supabase
          .from('matches' as any)
          .select(`
            *,
            pilot1:pilots!matches_pilot1_id_fkey(*),
            pilot2:pilots!matches_pilot2_id_fkey(*),
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
            pilot1:pilots!matches_pilot1_id_fkey(*),
            pilot2:pilots!matches_pilot2_id_fkey(*),
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

    // Subscribe to realtime updates
    const channel = supabase
      .channel('active-matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { liveMatch, upcomingMatches, loading };
};
