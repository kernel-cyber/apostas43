import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Top20Position {
  id: string;
  position: number;
  pilot_id: string | null;
  consecutive_absences: number;
  last_match_date: string | null;
  created_at: string;
  updated_at: string;
  pilot?: {
    id: string;
    name: string;
    car_name: string;
    image_url: string | null;
    team?: string | null;
  } | null;
}

export const useTop20Positions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: positions, isLoading } = useQuery({
    queryKey: ['top20-positions'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('top20_positions')
        .select(`
          *,
          pilot:pilots(id, name, car_name, image_url, team)
        `)
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data as Top20Position[];
    },
  });

  const updatePosition = useMutation({
    mutationFn: async ({ position, pilotId }: { position: number; pilotId: string | null }) => {
      const { error } = await (supabase as any)
        .from('top20_positions')
        .update({
          pilot_id: pilotId,
          consecutive_absences: 0,
          last_match_date: null,
          updated_at: new Date().toISOString()
        })
        .eq('position', position);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['top20-positions'] });
      toast({
        title: "Posição atualizada!",
        description: "A posição foi atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar posição",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const initializePositions = useMutation({
    mutationFn: async () => {
      const positions = Array.from({ length: 20 }, (_, i) => ({
        position: i + 1,
        pilot_id: null,
        consecutive_absences: 0,
        last_match_date: null,
      }));

      const { error } = await (supabase as any)
        .from('top20_positions')
        .upsert(positions, { onConflict: 'position' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['top20-positions'] });
      toast({
        title: "TOP 20 inicializado!",
        description: "As 20 posições foram criadas.",
      });
    },
  });

  return {
    positions,
    isLoading,
    updatePosition,
    initializePositions,
  };
};
