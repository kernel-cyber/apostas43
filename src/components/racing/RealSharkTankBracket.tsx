import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Zap, Crown, Target, AlertCircle } from "lucide-react";
import { useMatches } from "@/hooks/useMatches";
import { usePilotRankings } from "@/hooks/usePilotRankings";
import { Skeleton } from "@/components/ui/skeleton";

export default function RealSharkTankBracket() {
  const { matches, isLoading: loadingMatches } = useMatches();
  const { rankings: sharkTankPilots, isLoading: loadingPilots } = usePilotRankings('shark_tank');

  // Filtrar apenas matches Shark Tank
  const sharkTankMatches = matches?.filter((match: any) => 
    match.event?.event_type === 'shark_tank'
  ) || [];

  // Agrupar por round
  const groupByRound = (matches: any[]) => {
    const grouped: { [key: number]: any[] } = {};
    matches.forEach(match => {
      if (!grouped[match.round_number]) {
        grouped[match.round_number] = [];
      }
      grouped[match.round_number].push(match);
    });
    return grouped;
  };

  const matchesByRound = groupByRound(sharkTankMatches);
  const finishedMatches = sharkTankMatches.filter((m: any) => m.match_status === 'finished');
  const upcomingMatches = sharkTankMatches.filter((m: any) => m.match_status === 'upcoming');

  const MatchCard = ({ match, isUpcoming = false }: any) => {
    if (!match) return null;

    return (
      <div className={`
        glass-card rounded-lg overflow-hidden transition-all duration-300 hover:shadow-neon
        ${isUpcoming ? 'opacity-60' : ''}
        ${match.winner_id ? 'border-primary/30' : 'border-accent/30'}
      `}>
        {/* Match Header */}
        <div className="px-3 py-2 bg-trackDark/50 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Rodada {match.round_number}</span>
            <Badge variant="outline" className="text-xs">
              {match.match_status === 'finished' ? 'Finalizado' : 
               match.match_status === 'in_progress' ? 'Em andamento' : 
               'Aguardando'}
            </Badge>
          </div>
        </div>
        
        {/* Pilots */}
        <div className="p-3 space-y-2">
          {/* Pilot 1 */}
          <div className={`
            flex items-center justify-between p-2 rounded text-sm
            ${match.winner_id === match.pilot1_id ? 'bg-gradient-winner text-black font-bold' : 'bg-background/50'}
          `}>
            <span className="truncate">{match.pilot1?.name || 'TBD'}</span>
            <div className="flex items-center space-x-1">
              {match.winner_id === match.pilot1_id && <Crown className="w-3 h-3 text-accent" />}
              <span className="font-bold text-xs">
                {match.winner_id === match.pilot1_id ? 'W' : match.winner_id ? 'L' : '?'}
              </span>
            </div>
          </div>
          
          {/* Pilot 2 */}
          <div className={`
            flex items-center justify-between p-2 rounded text-sm
            ${match.winner_id === match.pilot2_id ? 'bg-gradient-winner text-black font-bold' : 'bg-background/50'}
          `}>
            <span className="truncate">{match.pilot2?.name || 'TBD'}</span>
            <div className="flex items-center space-x-1">
              {match.winner_id === match.pilot2_id && <Crown className="w-3 h-3 text-accent" />}
              <span className="font-bold text-xs">
                {match.winner_id === match.pilot2_id ? 'W' : match.winner_id ? 'L' : '?'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Live/Upcoming indicator */}
        {!match.winner_id && (
          <div className="px-3 py-2 bg-accent/10 border-t border-accent/20">
            <div className="flex items-center justify-center space-x-1 text-xs text-accent">
              <Zap className="w-3 h-3" />
              <span>{match.match_status === 'in_progress' ? 'AO VIVO' : 'AGUARDANDO'}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loadingMatches || loadingPilots) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tournament Info */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="glass-card text-center">
          <CardContent className="p-4">
            <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{sharkTankPilots?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Pilotos Shark Tank</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card text-center">
          <CardContent className="p-4">
            <Target className="w-8 h-8 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">{finishedMatches.length}</div>
            <div className="text-sm text-muted-foreground">Matches Finalizados</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card text-center">
          <CardContent className="p-4">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-neonGreen" />
            <div className="text-2xl font-bold">{upcomingMatches.length}</div>
            <div className="text-sm text-muted-foreground">Próximos Matches</div>
          </CardContent>
        </Card>
      </div>

      {/* Tournament Bracket */}
      {sharkTankMatches.length > 0 ? (
        <div className="space-y-12">
          {Object.keys(matchesByRound).sort().map((roundNum) => (
            <div key={roundNum} className="space-y-6">
              <div className="text-center">
                <Badge className="bg-gradient-winner text-black text-lg px-6 py-2 font-bold">
                  Rodada {roundNum}
                </Badge>
              </div>
              <div className={`grid gap-4 ${
                matchesByRound[Number(roundNum)].length <= 2 ? 'max-w-2xl mx-auto grid-cols-1 md:grid-cols-2' :
                matchesByRound[Number(roundNum)].length <= 4 ? 'max-w-4xl mx-auto grid-cols-2 md:grid-cols-4' :
                'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
              }`}>
                {matchesByRound[Number(roundNum)].map((match: any) => (
                  <MatchCard 
                    key={match.id} 
                    match={match}
                    isUpcoming={match.match_status === 'upcoming'}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhum evento Shark Tank criado ainda.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Aguarde a criação do próximo torneio!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Final Challenge Info */}
      <div className="mt-16 glass-card p-8 rounded-2xl border-2 border-primary/30">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <Trophy className="w-12 h-12 mx-auto text-accent" />
            <h3 className="text-2xl font-bold premium-gradient-text">DESAFIO FINAL</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Os 4 finalistas do Shark Tank enfrentam as últimas 4 posições do TOP 20 (17º, 18º, 19º e 20º). 
              Vencedores garantem vaga na lista oficial da Área 43.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              { finalista: "Finalista 1", posicao: "17º Colocado" },
              { finalista: "Finalista 2", posicao: "18º Colocado" },
              { finalista: "Finalista 3", posicao: "19º Colocado" },
              { finalista: "Finalista 4", posicao: "20º Colocado" },
            ].map((challenge, i) => (
              <div key={i} className="bg-trackDark/50 rounded-lg p-4 border border-border">
                <div className="text-center space-y-3">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-accent">{challenge.finalista}</div>
                    <div className="text-xs text-muted-foreground">VS</div>
                    <div className="text-sm font-semibold text-primary">{challenge.posicao}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Aguardando
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
