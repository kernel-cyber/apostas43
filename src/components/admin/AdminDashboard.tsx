import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Trophy, Calendar, TrendingUp, Gamepad2, Target } from 'lucide-react';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [pilots, events, matches, bets, users, points] = await Promise.all([
        (supabase as any).from('pilots').select('*', { count: 'exact', head: true }),
        (supabase as any).from('events').select('*', { count: 'exact', head: true }),
        (supabase as any).from('matches').select('*', { count: 'exact', head: true }),
        (supabase as any).from('bets').select('amount'),
        (supabase as any).from('profiles').select('*', { count: 'exact', head: true }),
        (supabase as any).from('user_points').select('points'),
      ]);

      const totalBets = bets.data?.reduce((sum, bet) => sum + bet.amount, 0) || 0;
      const totalPoints = points.data?.reduce((sum, p) => sum + p.points, 0) || 0;

      return {
        pilots: pilots.count || 0,
        events: events.count || 0,
        matches: matches.count || 0,
        totalBets,
        users: users.count || 0,
        totalPoints,
      };
    },
  });

  const statCards = [
    {
      title: 'Total de Pilotos',
      value: stats?.pilots || 0,
      icon: Trophy,
      color: 'text-racing-yellow',
    },
    {
      title: 'Eventos Criados',
      value: stats?.events || 0,
      icon: Calendar,
      color: 'text-racing-green',
    },
    {
      title: 'Matches Cadastrados',
      value: stats?.matches || 0,
      icon: Gamepad2,
      color: 'text-racing-red',
    },
    {
      title: 'Total de Apostas',
      value: `${stats?.totalBets || 0} pts`,
      icon: Target,
      color: 'text-racing-blue',
    },
    {
      title: 'Usuários Registrados',
      value: stats?.users || 0,
      icon: Users,
      color: 'text-racing-purple',
    },
    {
      title: 'Pontos em Circulação',
      value: `${stats?.totalPoints || 0} pts`,
      icon: TrendingUp,
      color: 'text-racing-orange',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="bg-racing-dark/50 border-racing-green/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-racing-gray">
                {stat.title}
              </CardTitle>
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white font-racing">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
