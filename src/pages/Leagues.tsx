import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Clock, TrendingUp, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const LEAGUE_TIERS = [
  { name: 'Bronze', min: 0, max: 1499, color: 'from-orange-600 to-orange-800', icon: '🥉' },
  { name: 'Prata', min: 1500, max: 1999, color: 'from-gray-400 to-gray-500', icon: '🥈' },
  { name: 'Ouro', min: 2000, max: 2999, color: 'from-yellow-400 to-yellow-600', icon: '🏆' },
  { name: 'Platina', min: 3000, max: 4999, color: 'from-gray-300 to-gray-400', icon: '⭐' },
  { name: 'Diamante', min: 5000, max: 9999, color: 'from-cyan-400 to-blue-500', icon: '💎' },
  { name: 'Lendário', min: 10000, max: Infinity, color: 'from-purple-500 via-pink-500 to-red-500', icon: '👑' },
];

export default function Leagues() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: userPoints } = useQuery({
    queryKey: ['user-points', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user
  });

  const { data: currentSeason } = useQuery({
    queryKey: ['current-season'],
    queryFn: async () => {
      const { data } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .single();
      return data;
    }
  });

  const { data: leagueStandings } = useQuery({
    queryKey: ['league-standings', currentSeason?.id],
    queryFn: async () => {
      if (!currentSeason) return [];
      const { data } = await supabase
        .from('league_standings')
        .select('*')
        .eq('season_id', currentSeason.id)
        .order('points', { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: !!currentSeason
  });

  const currentLeague = LEAGUE_TIERS.find(
    tier => userPoints && userPoints.points >= tier.min && userPoints.points <= tier.max
  ) || LEAGUE_TIERS[0];

  const nextLeague = LEAGUE_TIERS.find(tier => tier.min > (userPoints?.points || 0));
  const progressToNext = nextLeague 
    ? ((userPoints?.points || 0) - currentLeague.min) / (nextLeague.min - currentLeague.min) * 100
    : 100;

  if (!user || !userPoints) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🏆 Ligas e Competições</h1>
      </div>

      {/* Current League */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`text-6xl bg-gradient-to-r ${currentLeague.color} bg-clip-text text-transparent`}>
              {currentLeague.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Liga {currentLeague.name}</h2>
              <p className="text-muted-foreground">Seus pontos: {userPoints.points}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            #{leagueStandings.findIndex(s => s.user_id === user.id) + 1 || '-'}
          </Badge>
        </div>
        
        {nextLeague && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso para {nextLeague.name}</span>
              <span>{nextLeague.min - userPoints.points} pts restantes</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}
      </Card>

      {/* Season Info */}
      {currentSeason && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-bold text-lg">Season Atual: {currentSeason.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Termina {formatDistanceToNow(new Date(currentSeason.end_date), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* League Tiers */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">🎯 Todas as Ligas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEAGUE_TIERS.map((tier) => {
            const playersInTier = leagueStandings.filter(
              s => s.points >= tier.min && s.points <= tier.max
            ).length;

            return (
              <div
                key={tier.name}
                className={`p-4 rounded-lg border-2 ${
                  tier.name === currentLeague.name
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{tier.icon}</span>
                  <div>
                    <p className="font-bold">{tier.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tier.min} - {tier.max === Infinity ? '∞' : tier.max} pts
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {playersInTier} jogadores
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top Players */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">👑 Top 10 da Season</h3>
        <div className="space-y-2">
          {leagueStandings.slice(0, 10).map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                player.user_id === user.id ? 'bg-primary/20' : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Badge variant={index < 3 ? 'default' : 'secondary'}>
                  #{index + 1}
                </Badge>
                <span className="font-semibold">{player.username}</span>
                <Badge variant="outline">{player.league_tier}</Badge>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {player.wins}W / {player.total_bets}B
                </span>
                <span className="font-bold">{player.points} pts</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Rewards */}
      <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Award className="h-5 w-5" />
          Prêmios de Fim de Season
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
            <p className="text-2xl mb-2">🥇</p>
            <p className="font-bold">1º Lugar</p>
            <p className="text-sm text-muted-foreground">Badge Exclusivo + 1000 pts</p>
          </div>
          <div className="p-4 bg-gray-400/20 rounded-lg border border-gray-400/30">
            <p className="text-2xl mb-2">🥈</p>
            <p className="font-bold">2º Lugar</p>
            <p className="text-sm text-muted-foreground">Badge Prata + 500 pts</p>
          </div>
          <div className="p-4 bg-orange-600/20 rounded-lg border border-orange-600/30">
            <p className="text-2xl mb-2">🥉</p>
            <p className="font-bold">3º Lugar</p>
            <p className="text-sm text-muted-foreground">Badge Bronze + 250 pts</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
