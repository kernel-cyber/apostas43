import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBadgeById, BadgeDefinition } from '@/lib/badgeDefinitions';
import { useSoundEffects } from './useSoundEffects';

export const useBadgeNotifications = (userId: string | null) => {
  const { playWin } = useSoundEffects();
  const initialBadgesLoaded = useRef(false);
  const [modalBadge, setModalBadge] = useState<{ badge: BadgeDefinition; points: number } | null>(null);

  useEffect(() => {
    if (!userId) return;

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
          if (!initialBadgesLoaded.current) return;

          const badge = getBadgeById(payload.new.badge_id);
          if (!badge) return;

          const tierReward = getTierReward(payload.new.tier);
          
          playTierSound(payload.new.tier);
          setModalBadge({ badge, points: tierReward });
        }
      )
      .subscribe();

    setTimeout(() => {
      initialBadgesLoaded.current = true;
    }, 1000);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, playWin]);

  return {
    modalBadge,
    clearModal: () => setModalBadge(null)
  };
};

function playTierSound(tier: string) {
  const audio = new Audio('/sounds/win.mp3');
  
  const volumeMap: Record<string, number> = {
    bronze: 0.3,
    silver: 0.4,
    gold: 0.5,
    platinum: 0.6,
    diamond: 0.7,
    legendary: 0.9
  };
  
  audio.volume = volumeMap[tier] || 0.5;
  audio.play().catch(console.error);
}

function getTierReward(tier: string): number {
  const rewards: Record<string, number> = {
    bronze: 50,
    silver: 100,
    gold: 200,
    platinum: 300,
    diamond: 500,
    legendary: 1000
  };
  return rewards[tier] || 50;
}
