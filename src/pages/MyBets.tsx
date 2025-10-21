import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trophy, TrendingUp, Target, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MyBets() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const { data: bets } = useQuery({
    queryKey: ['my-bets', user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('bets')
        .select(`
          *,
          match:matches(
            *,
            pilot1:pilots!matches_pilot1_id_fkey(id, name, car_name, image_url, team),
            pilot2:pilots!matches_pilot2_id_fkey(id, name, car_name, image_url, team),
            winner:pilots!matches_winner_id_fkey(id, name),
            event:events(name)
          ),
          pilot:pilots(id, name, car_name, image_url, team)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const activeBets = bets?.filter((bet: any) => bet.match.match_status !== 'finished');
  const finishedBets = bets?.filter((bet: any) => bet.match.match_status === 'finished');
  const wonBets = finishedBets?.filter((bet: any) => bet.pilot.id === bet.match.winner?.id);
  const lostBets = finishedBets?.filter((bet: any) => bet.match.winner && bet.pilot.id !== bet.match.winner.id);

  const stats = {
    totalBets: bets?.length || 0,
    totalWagered: bets?.reduce((sum: number, bet: any) => sum + bet.amount, 0) || 0,
    wins: wonBets?.length || 0,
    losses: lostBets?.length || 0,
    biggestWin: Math.max(...(wonBets?.map((bet: any) => bet.amount) || [0])),
  };

  const winRate = stats.totalBets > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) : '0.0';
  const roi = stats.totalWagered > 0 ? (((stats.wins * 200 - stats.totalWagered) / stats.totalWagered) * 100).toFixed(1) : '0.0';

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Carregando...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
              Minhas Apostas
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Histórico completo das suas apostas</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* #2: Mobile otimizado - cards menores */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-1 p-2 sm:p-4">
              <CardTitle className="text-[10px] sm:text-sm text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 pt-0">
              <p className="text-lg sm:text-3xl font-bold text-foreground">{stats.totalBets}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-1 p-2 sm:p-4">
              <CardTitle className="text-[10px] sm:text-sm text-muted-foreground">Apostado</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 pt-0">
              <p className="text-lg sm:text-3xl font-bold text-racing-yellow">{stats.totalWagered}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-1 p-2 sm:p-4">
              <CardTitle className="text-[10px] sm:text-sm text-muted-foreground">Vitórias</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 pt-0">
              <p className="text-lg sm:text-3xl font-bold text-racing-green">{stats.wins}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-1 p-2 sm:p-4">
              <CardTitle className="text-[10px] sm:text-sm text-muted-foreground">Win Rate</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 pt-0">
              <p className="text-lg sm:text-3xl font-bold text-foreground">{winRate}%</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-1 p-2 sm:p-4">
              <CardTitle className="text-[10px] sm:text-sm text-muted-foreground">ROI</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 pt-0">
              <p className={`text-lg sm:text-3xl font-bold ${parseFloat(roi) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {parseFloat(roi) > 0 ? '+' : ''}{roi}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <label className="text-sm text-muted-foreground">Ordenar por:</label>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Mais Recente</SelectItem>
              <SelectItem value="amount">Maior Valor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bets List */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs sm:text-sm">Todas ({bets?.length || 0})</TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">Ativas ({activeBets?.length || 0})</TabsTrigger>
            <TabsTrigger value="won" className="text-xs sm:text-sm">Ganhas ({wonBets?.length || 0})</TabsTrigger>
            <TabsTrigger value="lost" className="text-xs sm:text-sm">Perdidas ({lostBets?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 sm:mt-6">
            <BetsList bets={bets} sortBy={sortBy} />
          </TabsContent>

          <TabsContent value="active" className="mt-4 sm:mt-6">
            <BetsList bets={activeBets} sortBy={sortBy} />
          </TabsContent>

          <TabsContent value="won" className="mt-4 sm:mt-6">
            <BetsList bets={wonBets} sortBy={sortBy} />
          </TabsContent>

          <TabsContent value="lost" className="mt-4 sm:mt-6">
            <BetsList bets={lostBets} sortBy={sortBy} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BetsList({ bets, sortBy }: { bets: any[] | undefined; sortBy: 'date' | 'amount' }) {
  if (!bets || bets.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhuma aposta encontrada.</p>
      </div>
    );
  }

  const sortedBets = [...bets].sort((a, b) => {
    if (sortBy === 'amount') {
      return b.amount - a.amount;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      {sortedBets.map((bet: any) => (
        <Card key={bet.id} className="bg-card border-border hover:shadow-neon transition-all">
          <CardContent className="p-3 sm:p-4">
            {/* Header - Compact */}
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="text-[10px] sm:text-xs">
                {bet.match.bracket_type === 'odd' 
                  ? `Rodada Ímpar #${bet.match.round_number}` 
                  : bet.match.bracket_type === 'even'
                  ? `Rodada Par #${bet.match.round_number}`
                  : `Rodada #${bet.match.round_number}`} - {bet.match.event.name}
              </Badge>
              {bet.match.match_status === 'upcoming' && (
                <Badge className="bg-blue-500 text-xs">Aguardando</Badge>
              )}
              {bet.match.match_status === 'in_progress' && (
                <Badge className="bg-racing-yellow text-black text-xs">Ao Vivo</Badge>
              )}
              {bet.match.match_status === 'finished' && bet.match.winner?.id === bet.pilot.id && (
                <Badge className="bg-racing-green text-xs">Ganhou!</Badge>
              )}
              {bet.match.match_status === 'finished' && bet.match.winner && bet.match.winner.id !== bet.pilot.id && (
                <Badge variant="destructive" className="text-xs">Perdeu</Badge>
              )}
            </div>

            {/* Pilots - Inline for Mobile */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {bet.match.pilot1.image_url && (
                  <img
                    src={bet.match.pilot1.image_url}
                    alt={bet.match.pilot1.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-bold text-foreground text-xs sm:text-sm truncate">{bet.match.pilot1.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{bet.match.pilot1.car_name}</p>
                  {bet.match.pilot1.team && (
                    <p className="text-[9px] text-muted-foreground truncate">🏁 {bet.match.pilot1.team}</p>
                  )}
                </div>
              </div>
              
              <span className="text-[10px] sm:text-xs text-muted-foreground px-2">VS</span>
              
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="min-w-0 text-right">
                  <p className="font-bold text-foreground text-xs sm:text-sm truncate">{bet.match.pilot2.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{bet.match.pilot2.car_name}</p>
                  {bet.match.pilot2.team && (
                    <p className="text-[9px] text-muted-foreground truncate">🏁 {bet.match.pilot2.team}</p>
                  )}
                </div>
                {bet.match.pilot2.image_url && (
                  <img
                    src={bet.match.pilot2.image_url}
                    alt={bet.match.pilot2.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                  />
                )}
              </div>
            </div>

            {/* Bet Details */}
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-xs sm:text-sm items-center">
                <span className="text-muted-foreground">Apostou em:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{bet.pilot.name}</span>
                  {bet.match.winner?.id === bet.pilot.id && <Trophy className="w-3 h-3 text-racing-green" />}
                </div>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Valor:</span>
                <span className="text-racing-yellow font-bold">{bet.amount} pts</span>
              </div>
              {bet.match.winner && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Vencedor:</span>
                  <span className="text-racing-green font-bold">{bet.match.winner.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
