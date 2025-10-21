import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy, TrendingUp, Target } from 'lucide-react';
import { useEffect } from 'react';

export default function MyBets() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
            pilot1:pilots!matches_pilot1_id_fkey(id, name, car_name, image_url),
            pilot2:pilots!matches_pilot2_id_fkey(id, name, car_name, image_url),
            winner:pilots!matches_winner_id_fkey(id, name),
            event:events(name)
          ),
          pilot:pilots(id, name, car_name, image_url)
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

  const stats = {
    totalBets: bets?.length || 0,
    totalWagered: bets?.reduce((sum: number, bet: any) => sum + bet.amount, 0) || 0,
    wins: finishedBets?.filter((bet: any) => bet.pilot.id === bet.match.winner?.id).length || 0,
    losses: finishedBets?.filter((bet: any) => bet.match.winner && bet.pilot.id !== bet.match.winner.id).length || 0,
  };

  const winRate = stats.totalBets > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) : '0.0';

  if (loading) {
    return <div className="min-h-screen bg-racing-dark flex items-center justify-center">
      <p className="text-racing-gray">Carregando...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-racing-dark p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white font-racing">
              Minhas Apostas
            </h1>
            <p className="text-racing-gray mt-2">Histórico completo das suas apostas</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-racing-dark/50 border-racing-green/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-racing-gray">Total de Apostas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.totalBets}</p>
            </CardContent>
          </Card>

          <Card className="bg-racing-dark/50 border-racing-green/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-racing-gray">Total Apostado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-racing-yellow">{stats.totalWagered} pts</p>
            </CardContent>
          </Card>

          <Card className="bg-racing-dark/50 border-racing-green/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-racing-gray">Vitórias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-racing-green">{stats.wins}</p>
            </CardContent>
          </Card>

          <Card className="bg-racing-dark/50 border-racing-green/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-racing-gray">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{winRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Bets List */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Todas ({bets?.length || 0})</TabsTrigger>
            <TabsTrigger value="active">Ativas ({activeBets?.length || 0})</TabsTrigger>
            <TabsTrigger value="finished">Finalizadas ({finishedBets?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <BetsList bets={bets} />
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <BetsList bets={activeBets} />
          </TabsContent>

          <TabsContent value="finished" className="mt-6">
            <BetsList bets={finishedBets} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BetsList({ bets }: { bets: any[] | undefined }) {
  if (!bets || bets.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-racing-gray mx-auto mb-4" />
        <p className="text-racing-gray">Nenhuma aposta encontrada.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {bets.map((bet: any) => (
        <Card key={bet.id} className="bg-racing-dark/50 border-racing-green/10">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-racing-gray">
                {bet.match.event.name}
              </Badge>
              {bet.match.match_status === 'upcoming' && (
                <Badge className="bg-blue-500">Aguardando</Badge>
              )}
              {bet.match.match_status === 'in_progress' && (
                <Badge className="bg-racing-yellow text-black">Ao Vivo</Badge>
              )}
              {bet.match.match_status === 'finished' && bet.match.winner?.id === bet.pilot.id && (
                <Badge className="bg-racing-green">Ganhou!</Badge>
              )}
              {bet.match.match_status === 'finished' && bet.match.winner && bet.match.winner.id !== bet.pilot.id && (
                <Badge variant="destructive">Perdeu</Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {bet.match.pilot1.image_url && (
                  <img
                    src={bet.match.pilot1.image_url}
                    alt={bet.match.pilot1.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-bold text-white text-sm">{bet.match.pilot1.name}</p>
                  <p className="text-xs text-racing-gray">{bet.match.pilot1.car_name}</p>
                </div>
              </div>

              <div className="text-center text-racing-red font-bold text-sm">VS</div>

              <div className="flex items-center gap-3">
                {bet.match.pilot2.image_url && (
                  <img
                    src={bet.match.pilot2.image_url}
                    alt={bet.match.pilot2.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-bold text-white text-sm">{bet.match.pilot2.name}</p>
                  <p className="text-xs text-racing-gray">{bet.match.pilot2.car_name}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-racing-green/20 pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-racing-gray">Apostou em:</span>
                <span className="text-white font-bold">{bet.pilot.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-racing-gray">Valor:</span>
                <span className="text-racing-yellow font-bold">{bet.amount} pts</span>
              </div>
              {bet.match.winner && (
                <div className="flex justify-between text-sm">
                  <span className="text-racing-gray">Vencedor:</span>
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
