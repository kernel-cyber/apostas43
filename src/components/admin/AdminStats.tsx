import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Clock, CheckCircle, Users } from 'lucide-react';

export default function AdminStats() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [matchesRes, pilotsRes, eventsRes] = await Promise.all([
        (supabase as any).from('matches').select('match_status', { count: 'exact' }),
        (supabase as any).from('pilots').select('id', { count: 'exact' }),
        (supabase as any).from('events').select('id, is_active', { count: 'exact' }),
      ]);

      const upcomingMatches = matchesRes.data?.filter((m: any) => m.match_status === 'upcoming').length || 0;
      const inProgressMatches = matchesRes.data?.filter((m: any) => m.match_status === 'in_progress').length || 0;
      const finishedMatches = matchesRes.data?.filter((m: any) => m.match_status === 'finished').length || 0;
      const activeEvents = eventsRes.data?.filter((e: any) => e.is_active).length || 0;

      return {
        totalPilots: pilotsRes.count || 0,
        upcomingMatches,
        inProgressMatches,
        finishedMatches,
        activeEvents,
      };
    },
  });

  const statCards = [
    {
      title: 'Pilotos Cadastrados',
      value: stats?.totalPilots || 0,
      icon: Users,
      color: 'text-racing-green',
    },
    {
      title: 'Matches Aguardando',
      value: stats?.upcomingMatches || 0,
      icon: Clock,
      color: 'text-racing-yellow',
    },
    {
      title: 'Matches Ao Vivo',
      value: stats?.inProgressMatches || 0,
      icon: Trophy,
      color: 'text-racing-red',
    },
    {
      title: 'Matches Finalizados',
      value: stats?.finishedMatches || 0,
      icon: CheckCircle,
      color: 'text-racing-green',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
