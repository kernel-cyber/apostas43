import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserPoints = (userId: string | undefined) => {
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPoints = async () => {
      const { data, error } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching points:', error);
        setLoading(false);
        return;
      }

      setPoints(data?.points ?? 0);
      setLoading(false);
    };

    fetchPoints();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`user-points-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_points',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          setPoints(payload.new.points);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { points, loading };
};
