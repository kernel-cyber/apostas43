import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Crown, AlertCircle } from "lucide-react";
import { useTop20Positions } from "@/hooks/useTop20Positions";
import { useMatches } from "@/hooks/useMatches";
import { Skeleton } from "@/components/ui/skeleton";

export default function RealTournamentBracket() {
  const { positions: top20Positions, isLoading: loadingPositions } = useTop20Positions();
  const { matches, isLoading: loadingMatches } = useMatches();

  // Filtrar apenas matches TOP 20 finalizados
  const top20Matches = matches?.filter((match: any) => 
    match.event?.event_type === 'top_20' && match.match_status === 'finished'
  ) || [];

  const MatchCard = ({ match, showPositions = false }: any) => {
    if (!match) return null;

    const pilot1Position = top20Positions?.find(p => p.pilot_id === match.pilot1_id)?.position;
    const pilot2Position = top20Positions?.find(p => p.pilot_id === match.pilot2_id)?.position;

    return (
      <div className="relative bg-gradient-card border border-border rounded-lg overflow-hidden shadow-card transition-all duration-300 hover:shadow-neon">
        {/* Match Header */}
        <div className="px-3 py-1 bg-trackDark border-b border-border text-xs text-center">
          Rodada {match.round_number}
        </div>
        
        {/* Pilots */}
        <div className="p-3 space-y-2">
          {/* Pilot 1 */}
          <div className={`
            flex items-center justify-between p-2 rounded text-sm
            ${match.winner_id === match.pilot1_id ? 'bg-gradient-winner text-black font-bold' : 'bg-background'}
          `}>
            <div className="flex items-center space-x-2">
              {showPositions && pilot1Position && (
                <span className="text-xs opacity-60">#{pilot1Position}</span>
              )}
              <span className="truncate">{match.pilot1?.name || 'TBD'}</span>
            </div>
            <div className="flex items-center space-x-1">
              {match.winner_id === match.pilot1_id && <Crown className="w-3 h-3 text-neonYellow" />}
              <span className="font-bold text-xs">
                {match.winner_id === match.pilot1_id ? 'W' : match.winner_id ? 'L' : '?'}
              </span>
            </div>
          </div>
          
          {/* Pilot 2 */}
          <div className={`
            flex items-center justify-between p-2 rounded text-sm
            ${match.winner_id === match.pilot2_id ? 'bg-gradient-winner text-black font-bold' : 'bg-background'}
          `}>
            <div className="flex items-center space-x-2">
              {showPositions && pilot2Position && (
                <span className="text-xs opacity-60">#{pilot2Position}</span>
              )}
              <span className="truncate">{match.pilot2?.name || 'TBD'}</span>
            </div>
            <div className="flex items-center space-x-1">
              {match.winner_id === match.pilot2_id && <Crown className="w-3 h-3 text-neonYellow" />}
              <span className="font-bold text-xs">
                {match.winner_id === match.pilot2_id ? 'W' : match.winner_id ? 'L' : '?'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loadingPositions || loadingMatches) {
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
      {/* TOP 20 Current Standings */}
      <Card className="bg-background border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-accent">
            <Target className="w-5 w-5" />
            <span>TOP 20 - Sistema de Liga</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Classificação atual. Rodadas alternadas entre posições ímpares e pares.
          </p>
        </CardHeader>
        <CardContent>
          {/* Current TOP 20 */}
          {top20Positions && top20Positions.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {top20Positions.map((position) => (
                <div
                  key={position.position}
                  className="bg-muted rounded-lg p-3 border border-border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-racing-yellow">
                      #{position.position}
                    </Badge>
                  </div>
                  
                  {position.pilot ? (
                    <div>
                      <p className="font-bold text-foreground text-sm truncate">
                        {position.pilot.name}
                      </p>
                      <p className="text-xs text-racing-yellow truncate">
                        {position.pilot.car_name}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Vazio</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p>TOP 20 não inicializado ainda.</p>
            </div>
          )}

          {/* Liga Rules */}
          <div className="mt-6 p-4 bg-trackDark rounded-lg border border-border">
            <h4 className="font-semibold text-sm mb-2 text-neonGreen">Sistema de Liga TOP 20:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <div className="font-semibold text-neonYellow mb-1">Rodada Ímpar:</div>
                <div>19x18, 17x16, 15x14, 13x12</div>
                <div>11x10, 9x8, 7x6, 5x4, 3x2</div>
                <div className="text-[10px] mt-1 text-muted-foreground">1º não corre</div>
              </div>
              <div>
                <div className="font-semibold text-neonYellow mb-1">Rodada Par:</div>
                <div>20x19, 18x17, 16x15, 14x13</div>
                <div>12x11, 10x9, 8x7, 6x5, 4x3, 2x1</div>
                <div className="text-[10px] mt-1 text-muted-foreground">Todos correm</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Matches */}
      {top20Matches.length > 0 && (
        <Card className="bg-background border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-racing-yellow" />
              <span>Matches Realizados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {top20Matches.slice(0, 6).map((match: any) => (
                <MatchCard key={match.id} match={match} showPositions={true} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {top20Matches.length === 0 && (
        <Card className="bg-background border-border shadow-card">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhum match TOP 20 realizado ainda.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
