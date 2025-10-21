import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BADGE_DEFINITIONS, getBadgeById } from '@/lib/badgeDefinitions';

export const useUserBadges = (userId: string | null) => {
  return useQuery({
    queryKey: ['user-badges', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      
      // Enriquecer com definições
      return (data || []).map(badge => ({
        ...badge,
        definition: getBadgeById(badge.badge_id)
      }));
    },
    enabled: !!userId
  });
};

// Hook para calcular progresso de badges não ganhos
export const useAvailableBadges = (userId: string | null, userStats: any) => {
  return useQuery({
    queryKey: ['available-badges', userId, userStats],
    queryFn: async () => {
      if (!userId) return [];
      
      // Buscar badges já ganhos
      const { data: earnedBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId);
      
      const earnedIds = new Set(earnedBadges?.map(b => b.badge_id) || []);
      
      // Filtrar badges disponíveis
      return BADGE_DEFINITIONS
        .filter(badge => !earnedIds.has(badge.id))
        .map(badge => ({
          ...badge,
          progress: badge.checkProgress(userStats || {})
        }))
        .sort((a, b) => b.progress - a.progress); // Mais próximos primeiro
    },
    enabled: !!userId && !!userStats
  });
};
