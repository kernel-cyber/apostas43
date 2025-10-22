import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from './useSoundEffects';
import { getBadgeById } from '@/lib/badgeDefinitions';

export const useBadgeNotifications = (userId: string | null) => {
  const { toast } = useToast();
  const { playWin } = useSoundEffects();
  const hasShownInitial = useRef(false);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to new badges
    const channel = supabase
      .channel(`user-badges-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          if (hasShownInitial.current) {
            const badgeDef = getBadgeById(payload.new.badge_id);
            
            if (badgeDef) {
              // Play victory sound
              playWin();
              
              const rewardPoints = getTierReward(badgeDef.tier);
              
              // Show toast notification
              toast({
                title: `🏆 Nova Conquista Desbloqueada!`,
                description: `${badgeDef.icon} ${badgeDef.name}\n${badgeDef.description}\n+${rewardPoints} pontos de recompensa!`,
                className: 'bg-gradient-to-r from-yellow-500/90 to-orange-500/90 text-white border-yellow-600',
                duration: 8000,
              });
            }
          }
        }
      )
      .subscribe();

    // Set flag after initial mount to avoid showing notifications for existing badges
    setTimeout(() => {
      hasShownInitial.current = true;
    }, 1000);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, toast, playWin]);
};

function getTierReward(tier: string): number {
  switch (tier) {
    case 'bronze': return 50;
    case 'silver': return 100;
    case 'gold': return 200;
    case 'platinum': return 300;
    case 'diamond': return 500;
    case 'legendary': return 1000;
    default: return 50;
  }
}
