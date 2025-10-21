import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRecentForm = (pilotId: string | undefined) => {
  const { data: recentForm, isLoading } = useQuery({
    queryKey: ['recent-form', pilotId],
    queryFn: async () => {
      if (!pilotId) return [];

      const { data, error } = await supabase
        .from('matches')
        .select('winner_id, match_status')
        .or(`pilot1_id.eq.${pilotId},pilot2_id.eq.${pilotId}`)
        .eq('match_status', 'finished')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return (data || []).map(match => 
        match.winner_id === pilotId ? 'W' : 'L'
      );
    },
    enabled: !!pilotId,
  });

  return { recentForm: recentForm || [], isLoading };
};
