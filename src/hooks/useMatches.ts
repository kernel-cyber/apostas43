import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Match {
  id: string;
  event_id: string;
  pilot1_id: string;
  pilot2_id: string;
  round_number: number;
  scheduled_time: string | null;
  match_status: 'upcoming' | 'in_progress' | 'finished';
  betting_locked: boolean;
  winner_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useMatches = (eventId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches', eventId],
    queryFn: async () => {
      let query = (supabase as any)
        .from('matches')
        .select(`
          *,
          pilot1:pilots!matches_pilot1_id_fkey(id, name, car_name, image_url),
          pilot2:pilots!matches_pilot2_id_fkey(id, name, car_name, image_url),
          winner:pilots!matches_winner_id_fkey(id, name),
          event:events(id, name, event_type)
        `)
        .order('round_number', { ascending: true })
        .order('scheduled_time', { ascending: true, nullsFirst: false });
      
      if (eventId) {
        query = query.eq('event_id', eventId) as any;
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as any;
    },
    enabled: eventId !== undefined || eventId === undefined,
  });

  const createMatch = useMutation({
    mutationFn: async (matchData: Omit<Match, 'id' | 'created_at' | 'updated_at' | 'winner_id' | 'match_status'>) => {
      const { data, error } = await (supabase as any)
        .from('matches')
        .insert([{ ...matchData, match_status: 'upcoming' }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast({
        title: "Match criado!",
        description: "O match foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar match",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMatchStatus = useMutation({
    mutationFn: async ({ id, status, betting_locked }: { id: string; status: Match['match_status']; betting_locked?: boolean }) => {
      const updateData: any = { match_status: status };
      if (betting_locked !== undefined) {
        updateData.betting_locked = betting_locked;
      }
      
      const { data, error } = await (supabase as any)
        .from('matches')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast({
        title: "Status atualizado!",
        description: "O status do match foi atualizado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const finishMatch = useMutation({
    mutationFn: async ({ matchId, winnerId }: { matchId: string; winnerId: string }) => {
      const { error } = await (supabase as any).rpc('settle_match', {
        p_match_id: matchId,
        p_winner_id: winnerId,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['pilots'] });
      queryClient.invalidateQueries({ queryKey: ['user-points'] });
      toast({
        title: "Match finalizado!",
        description: "O vencedor foi declarado e os pontos distribuídos.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao finalizar match",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMatch = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('matches')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast({
        title: "Match deletado",
        description: "O match foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar match",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    matches,
    isLoading,
    createMatch,
    updateMatchStatus,
    finishMatch,
    deleteMatch,
  };
};
