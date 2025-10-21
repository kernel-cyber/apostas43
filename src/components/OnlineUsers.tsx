import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function OnlineUsers() {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const channel = supabase.channel('online-users');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count);
      })
      .on('presence', { event: 'join' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count);
      })
      .on('presence', { event: 'leave' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString()
            });
          }
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <Badge variant="outline" className="gap-2 bg-racing-green/10 border-racing-green/20 text-racing-green">
      <Users className="h-4 w-4 animate-pulse" />
      <span className="font-racing">{onlineCount} ONLINE</span>
    </Badge>
  );
}
