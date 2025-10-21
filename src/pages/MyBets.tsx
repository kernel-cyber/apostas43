import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trophy, Target, TrendingUp, Star } from 'lucide-react';
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
            pilot1:pilots!matches_pilot1_id_fkey(id, name, car_name, image_url, team, position),
            pilot2:pilots!matches_pilot2_id_fkey(id, name, car_name, image_url, team, position),
            winner:pilots!matches_winner_id_fkey(id, name),
            event:events(name)
          ),
          pilot:pilots(id, name, car_name, image_url, team)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Para cada aposta finalizada, buscar as odds finais
      const betsWithOdds = await Promise.all(
        data.map(async (bet: any) => {
          if (bet.match.match_status === 'finished') {
            const { data: oddsData } = await supabase.rpc('calculate_match_odds', {
              p_match_id: bet.match.id
            });
            return { ...bet, finalOdds: oddsData };
          }
          return bet;
        })
      );

      return betsWithOdds;
    },
    enabled: !!user,
  });

  const activeBets = bets?.filter((bet: any) => bet.match.match_status !== 'finished');
  const finishedBets = bets?.filter((bet: any) => bet.match.match_status === 'finished');
  const wonBets = finishedBets?.filter((bet: any) => bet.pilot.id === bet.match.winner?.id);
  const lostBets = finishedBets?.filter((bet: any) => bet.match.winner && bet.pilot.id !== bet.match.winner.id);

  // Calcular retornos reais
  const totalReturns = wonBets?.reduce((sum: number, bet: any) => {
    if (!bet.finalOdds) return sum;
    const odds = bet.pilot.id === bet.match.pilot1.id 
      ? bet.finalOdds.pilot1_odds 
      : bet.finalOdds.pilot2_odds;
    return sum + (bet.amount * odds);
  }, 0) || 0;

  const stats = {
    totalBets: bets?.length || 0,
    totalWagered: bets?.reduce((sum: number, bet: any) => sum + bet.amount, 0) || 0,
    wins: wonBets?.length || 0,
    losses: lostBets?.length || 0,
    totalReturns,
  };

  const winRate = stats.totalBets > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) : '0.0';
  const roi = stats.totalWagered > 0 ? (((stats.totalReturns - stats.totalWagered) / stats.totalWagered) * 100).toFixed(1) : '0.0';

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
            <h1 className="text-2xl sm:text-4xl font-bold premium-gradient-text">
              Minhas Apostas
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Histórico completo das suas apostas</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4">
          <Card className="glass-card border-border">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
              </div>
              <p className="text-xl sm:text-3xl font-bold text-foreground">{stats.totalBets}</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-racing-yellow" />
                <p className="text-xs sm:text-sm text-muted-foreground">Apostado</p>
              </div>
              <p className="text-xl sm:text-3xl font-bold text-racing-yellow">{stats.totalWagered}</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-racing-green" />
                <p className="text-xs sm:text-sm text-muted-foreground">Vitórias</p>
              </div>
              <p className="text-xl sm:text-3xl font-bold text-racing-green">{stats.wins}</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-primary" />
                <p className="text-xs sm:text-sm text-muted-foreground">Win Rate</p>
              </div>
              <p className="text-xl sm:text-3xl font-bold text-foreground">{winRate}%</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={`w-4 h-4 ${parseFloat(roi) >= 0 ? 'text-racing-green' : 'text-destructive'}`} />
                <p className="text-xs sm:text-sm text-muted-foreground">ROI</p>
              </div>
              <p className={`text-xl sm:text-3xl font-bold ${parseFloat(roi) >= 0 ? 'text-racing-green' : 'text-destructive'}`}>
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
      {sortedBets.map((bet: any) => {
        const isWinner = bet.match.winner?.id === bet.pilot.id;
        const pilot1IsWinner = bet.match.winner?.id === bet.match.pilot1.id;
        const pilot2IsWinner = bet.match.winner?.id === bet.match.pilot2.id;
        
        // Calcular odds e retorno
        let finalOdds = 0;
        let totalReturn = 0;
        let profit = 0;
        
        if (bet.match.match_status === 'finished' && bet.finalOdds) {
          finalOdds = bet.pilot.id === bet.match.pilot1.id 
            ? bet.finalOdds.pilot1_odds 
            : bet.finalOdds.pilot2_odds;
          totalReturn = bet.amount * finalOdds;
          profit = totalReturn - bet.amount;
        }

        return (
          <Card key={bet.id} className="glass-card border-2 border-border hover:shadow-neon transition-all card-enter">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
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
                {bet.match.match_status === 'finished' && isWinner && (
                  <Badge className="bg-racing-green text-xs">Ganhou!</Badge>
                )}
                {bet.match.match_status === 'finished' && !isWinner && bet.match.winner && (
                  <Badge variant="destructive" className="text-xs">Perdeu</Badge>
                )}
              </div>

              {/* Pilots Layout */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-4">
                {/* Pilot 1 */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 hover:border-neonGreen transition-all">
                      {bet.match.pilot1.image_url && (
                        <img 
                          src={bet.match.pilot1.image_url} 
                          alt={bet.match.pilot1.name} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    {pilot1IsWinner && (
                      <Trophy className="absolute -top-1 -right-1 w-5 h-5 text-racing-yellow" />
                    )}
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="text-[10px] mb-1">#{bet.match.pilot1.position}</Badge>
                    <p className="font-bold text-sm">{bet.match.pilot1.name}</p>
                    <p className="text-xs text-muted-foreground">{bet.match.pilot1.car_name}</p>
                  </div>
                </div>

                {/* VS */}
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-card border border-border flex items-center justify-center font-bold text-sm">
                    VS
                  </div>
                </div>

                {/* Pilot 2 */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 hover:border-neonGreen transition-all">
                      {bet.match.pilot2.image_url && (
                        <img 
                          src={bet.match.pilot2.image_url} 
                          alt={bet.match.pilot2.name} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    {pilot2IsWinner && (
                      <Trophy className="absolute -top-1 -right-1 w-5 h-5 text-racing-yellow" />
                    )}
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="text-[10px] mb-1">#{bet.match.pilot2.position}</Badge>
                    <p className="font-bold text-sm">{bet.match.pilot2.name}</p>
                    <p className="text-xs text-muted-foreground">{bet.match.pilot2.car_name}</p>
                  </div>
                </div>
              </div>

              {/* Bet Details */}
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Sua aposta:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{bet.pilot.name}</Badge>
                    <span className="font-bold text-racing-yellow">{bet.amount} pts</span>
                  </div>
                </div>
                
                {/* Odds e retorno (se finalizado) */}
                {bet.match.match_status === 'finished' && bet.finalOdds && (
                  <>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Odd Final:</span>
                      <span className="font-bold text-racing-yellow">{finalOdds.toFixed(2)}x</span>
                    </div>
                    {isWinner ? (
                      <>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Retorno Total:</span>
                          <span className="font-bold text-racing-green">+{Math.round(totalReturn)} pts</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Lucro:</span>
                          <span className="font-bold text-racing-green">+{Math.round(profit)} pts</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Perda:</span>
                        <span className="font-bold text-destructive">-{bet.amount} pts</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}