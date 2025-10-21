import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Winner {
  name: string;
  car: string;
  position: number;
  avatar: string;
}

export const useWinnerNotification = () => {
  const [lastWinner, setLastWinner] = useState<Winner | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('winner-notifications')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
      }, async (payload: any) => {
        const newMatch = payload.new;
        
        // Check if match just finished
        if (newMatch.match_status === 'finished' && newMatch.winner_id) {
          // Fetch winner details
          const { data: winner } = await supabase
            .from('pilots')
            .select('name, car_name, current_position, image_url')
            .eq('id', newMatch.winner_id)
            .single();
          
          if (winner) {
            setLastWinner({
              name: winner.name,
              car: winner.car_name,
              position: winner.current_position || 0,
              avatar: winner.image_url || '🏆'
            });
            setShowCelebration(true);
            
            // Auto-hide after 8 seconds
            setTimeout(() => setShowCelebration(false), 8000);
          }
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { lastWinner, showCelebration, setShowCelebration };
};
