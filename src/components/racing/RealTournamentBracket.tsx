import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Crown, AlertCircle, Play } from "lucide-react";
import { useTop20Positions } from "@/hooks/useTop20Positions";
import { useMatches } from "@/hooks/useMatches";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Top20RulesDialog } from "./Top20RulesDialog";

export default function RealTournamentBracket() {
  const { positions: top20Positions, isLoading: loadingPositions } = useTop20Positions();
  const { matches, isLoading: loadingMatches } = useMatches();
  const queryClient = useQueryClient();

  // Realtime subscription for updates
  useEffect(() => {
    const channel = supabase
      .channel('top20-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'matches'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['matches'] });
        queryClient.invalidateQueries({ queryKey: ['top20-positions'] });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'top20_positions'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['top20-positions'] });
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Filtrar matches TOP 20 (todos os status)
  const top20Matches = matches?.filter((match: any) => 
    match.event?.event_type === 'top_20'
  ) || [];

  // Separar por status com ORDENAÇÃO
  const upcomingMatches = top20Matches
    .filter((m: any) => m.match_status === 'upcoming')
    .sort((a: any, b: any) => {
      // Ordenar por scheduled_time (mais próximo primeiro)
      if (a.scheduled_time && b.scheduled_time) {
        return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime();
      }
      // Fallback: ordenar por maior posição
      const maxPosA = Math.max(a.pilot1?.position || 0, a.pilot2?.position || 0);
      const maxPosB = Math.max(b.pilot1?.position || 0, b.pilot2?.position || 0);
      return maxPosB - maxPosA;
    });
  
  const liveMatches = top20Matches.filter((m: any) => m.match_status === 'in_progress');
  
  const finishedMatches = top20Matches
    .filter((m: any) => m.match_status === 'finished')
    .sort((a: any, b: any) => {
      // Ordenar por updated_at DECRESCENTE (mais recente primeiro)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const MatchCard = ({ match, showPositions = false }: any) => {
    if (!match) return null;

    const pilot1Position = top20Positions?.find(p => p.pilot_id === match.pilot1_id)?.position;
    const pilot2Position = top20Positions?.find(p => p.pilot_id === match.pilot2_id)?.position;
    
    const isLive = match.match_status === 'in_progress';
    const isFinished = match.match_status === 'finished';

    // #16: Determinar ataque/defesa
    const pilot1IsAttacking = pilot1Position && pilot2Position && pilot1Position > pilot2Position;
    const pilot2IsAttacking = pilot1Position && pilot2Position && pilot2Position > pilot1Position;

    return (
      <div className={`
        relative bg-gradient-card border rounded-lg overflow-hidden shadow-card transition-all duration-300 hover:shadow-neon
        ${isLive ? 'border-racing-yellow animate-pulse' : 'border-border'}
      `}>
        {/* Match Header */}
        <div className={`px-3 py-1 border-b text-xs text-center flex items-center justify-center gap-2 ${
          isLive ? 'bg-racing-yellow text-black' : 'bg-trackDark border-border'
        }`}>
          {isLive && <Play className="w-3 h-3 animate-pulse" />}
          {match.bracket_type === 'odd' 
            ? `Rodada Ímpar #${match.round_number}` 
            : match.bracket_type === 'even'
            ? `Rodada Par #${match.round_number}`
            : `Rodada #${match.round_number}`}
          {isLive && <span className="font-bold">AO VIVO</span>}
        </div>
        
        {/* Pilots */}
        <div className="p-3 space-y-2">
          {/* Pilot 1 */}
          <div className={`
            flex items-center justify-between p-2 rounded text-sm
            ${match.winner_id === match.pilot1_id ? 'bg-gradient-winner text-black font-bold' : 'bg-background'}
          `}>
            <div className="flex items-center space-x-2">
              {/* #16: Ícone ataque/defesa */}
              {pilot1IsAttacking ? (
                <span title="Ataca" className="text-red-500">⚔️</span>
              ) : pilot2IsAttacking ? (
                <span title="Defende" className="text-blue-500">🛡️</span>
              ) : null}
              {showPositions && pilot1Position && (
                <span className="text-xs text-neonGreen font-bold">#{pilot1Position}</span>
              )}
              {/* #4: Foto do piloto */}
              {match.pilot1?.image_url && (
                <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                  <img src={match.pilot1.image_url} alt={match.pilot1.name} className="w-full h-full object-cover" />
                </div>
              )}
              {/* #7: Cores padronizadas */}
              <div className="flex flex-col">
                <span className="truncate text-white font-semibold">{match.pilot1?.name || 'TBD'}</span>
                {match.pilot1?.team && (
                  <span className="text-[10px] text-blue-400 truncate">🏁 {match.pilot1.team}</span>
                )}
              </div>
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
              {/* #16: Ícone ataque/defesa */}
              {pilot2IsAttacking ? (
                <span title="Ataca" className="text-red-500">⚔️</span>
              ) : pilot1IsAttacking ? (
                <span title="Defende" className="text-blue-500">🛡️</span>
              ) : null}
              {showPositions && pilot2Position && (
                <span className="text-xs text-neonGreen font-bold">#{pilot2Position}</span>
              )}
              {/* #4: Foto do piloto */}
              {match.pilot2?.image_url && (
                <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                  <img src={match.pilot2.image_url} alt={match.pilot2.name} className="w-full h-full object-cover" />
                </div>
              )}
              {/* #7: Cores padronizadas */}
              <div className="flex flex-col">
                <span className="truncate text-white font-semibold">{match.pilot2?.name || 'TBD'}</span>
                {match.pilot2?.team && (
                  <span className="text-[10px] text-blue-400 truncate">🏁 {match.pilot2.team}</span>
                )}
              </div>
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
          <CardTitle className="flex items-center justify-between space-x-2 text-accent">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>TOP 20 - Sistema de Liga</span>
            </div>
            <Top20RulesDialog />
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Classificação atual. Rodadas alternadas entre posições ímpares e pares.
          </p>
          {/* #9: Botão "?" melhorado - removendo texto redundante das regras */}
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
                      {/* #4: Foto do piloto */}
                      {position.pilot.image_url && (
                        <div className="w-full h-16 rounded overflow-hidden mb-2">
                          <img
                            src={position.pilot.image_url}
                            alt={position.pilot.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {/* #7: Cores padronizadas */}
                      <p className="font-bold text-white text-sm truncate">
                        {position.pilot.name}
                      </p>
                      <p className="text-xs text-racing-yellow truncate">
                        🚗 {position.pilot.car_name}
                      </p>
                      {position.pilot.team && (
                        <p className="text-[10px] text-blue-400 truncate">
                          🏁 {position.pilot.team}
                        </p>
                      )}
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
        </CardContent>
      </Card>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <Card className="bg-background border-racing-yellow shadow-neon">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="w-5 h-5 text-racing-yellow animate-pulse" />
              <span>Matches Ao Vivo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveMatches.map((match: any) => (
                <MatchCard key={match.id} match={match} showPositions={true} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <Card className="bg-background border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-accent" />
              <span>Próximas Rodadas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMatches.map((match: any) => (
                <MatchCard key={match.id} match={match} showPositions={true} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Finished Matches */}
      {finishedMatches.length > 0 && (
        <Card className="bg-background border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-racing-green" />
              <span>Matches Finalizados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {finishedMatches.slice(0, 6).map((match: any) => (
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
              Nenhum match TOP 20 criado ainda.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
