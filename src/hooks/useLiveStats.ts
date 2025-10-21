import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LiveStats {
  totalBets: number;
  totalPool: number;
  activePilots: number;
  activeEvents: number;
}

export const useLiveStats = () => {
  const [stats, setStats] = useState<LiveStats>({
    totalBets: 0,
    totalPool: 0,
    activePilots: 0,
    activeEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total de apostas e pool total
        const { data: betsData } = await supabase
          .from('bets' as any)
          .select('amount');
        
        const totalBets = betsData?.length || 0;
        const totalPool = betsData?.reduce((sum: number, bet: any) => sum + (bet.amount || 0), 0) || 0;

        // Pilotos ativos
        const { data: pilotsData } = await supabase
          .from('pilots' as any)
          .select('id');
        
        // Eventos ativos
        const { data: eventsData } = await supabase
          .from('events' as any)
          .select('id')
          .eq('is_active', true);

        setStats({
          totalBets,
          totalPool,
          activePilots: pilotsData?.length || 0,
          activeEvents: eventsData?.length || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('live-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bets'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, loading };
};
