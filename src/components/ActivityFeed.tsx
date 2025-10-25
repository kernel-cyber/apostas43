import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect } from 'react';

export const ActivityFeed = () => {
  const { data: activities = [], refetch } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('activity-feed-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      big_win: '💰',
      streak: '🔥',
      badge_earned: '🏅',
      bet_placed: '🎲'
    };
    return icons[type] || '📢';
  };

  return (
    <Card className="p-4">
      <h3 className="font-bold text-lg mb-4">🌟 Feed de Atividades</h3>
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-muted rounded-lg hover:bg-accent/50 transition-colors"
            >
              <span className="text-2xl">{getIcon(activity.activity_type)}</span>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{activity.username}</span>{' '}
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
