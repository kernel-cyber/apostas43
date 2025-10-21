import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Crown, AlertCircle, Play } from "lucide-react";
import { useTop20Positions } from "@/hooks/useTop20Positions";
import { useMatches } from "@/hooks/useMatches";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Top20RulesDialog } from "./Top20RulesDialog";
import { getRoundLabel } from "@/lib/roundHelpers";

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

  // Separar por status com ORDENAÇÃO CORRETA
  const upcomingMatches = top20Matches
    .filter((m: any) => m.match_status === 'upcoming')
    .sort((a: any, b: any) => {
      // Ordenar por scheduled_time (mais próximo primeiro)
      if (a.scheduled_time && b.scheduled_time) {
        return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime();
      }
      // Fallback: ordenar por round_number, depois por MENOR posição (mais importante)
      if (a.round_number !== b.round_number) {
        return a.round_number - b.round_number;
      }
      const minPosA = Math.min(a.pilot1?.position || 999, a.pilot2?.position || 999);
      const minPosB = Math.min(b.pilot1?.position || 999, b.pilot2?.position || 999);
      return minPosA - minPosB;
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
          <span>{getRoundLabel(match.cycle_position, match.round_number).emoji}</span>
          <span>{getRoundLabel(match.cycle_position, match.round_number).fullLabel}</span>
          {isLive && <span className="font-bold">AO VIVO</span>}
        </div>
        
        {/* Pilots */}
        <div className="p-4 space-y-3">
          {/* Pilot 1 */}
          <div className={`
            flex items-center gap-3 p-3 rounded-lg
            ${match.winner_id === match.pilot1_id ? 'bg-gradient-winner text-black' : 'bg-background'}
          `}>
            {/* Ícone ataque/defesa */}
            <div className="flex-shrink-0">
              {pilot1IsAttacking ? (
                <span title="Ataca" className="text-red-500 text-xl">⚔️</span>
              ) : pilot2IsAttacking ? (
                <span title="Defende" className="text-blue-500 text-xl">🛡️</span>
              ) : <div className="w-5"></div>}
            </div>
            
            {/* Posição */}
            {showPositions && pilot1Position && (
              <Badge variant="outline" className="text-neonGreen border-neonGreen flex-shrink-0">
                #{pilot1Position}
              </Badge>
            )}
            
            {/* Foto do piloto */}
            {match.pilot1?.image_url && (
              <img
                src={match.pilot1.image_url}
                alt={match.pilot1.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            )}
            
            {/* Info do piloto */}
            <div className="flex-1 min-w-0">
              <p className={`font-bold truncate ${match.winner_id === match.pilot1_id ? 'text-black' : 'text-white'}`}>
                {match.pilot1?.name || 'TBD'}
              </p>
              <p className={`text-sm truncate ${match.winner_id === match.pilot1_id ? 'text-black/70' : 'text-racing-yellow'}`}>
                🚗 {match.pilot1?.car_name || "N/A"}
              </p>
              {match.pilot1?.team && (
                <p className={`text-xs truncate ${match.winner_id === match.pilot1_id ? 'text-black/60' : 'text-blue-400'}`}>
                  🏁 {match.pilot1.team}
                </p>
              )}
            </div>
            
            {/* Status */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {match.winner_id === match.pilot1_id && <Crown className="w-5 h-5 text-neonYellow" />}
              {isFinished && (
                <span className="font-bold">
                  {match.winner_id === match.pilot1_id ? 'W' : 'L'}
                </span>
              )}
            </div>
          </div>
          
          {/* VS */}
          <div className="text-center text-racing-red font-bold text-lg">VS</div>
          
          {/* Pilot 2 */}
          <div className={`
            flex items-center gap-3 p-3 rounded-lg
            ${match.winner_id === match.pilot2_id ? 'bg-gradient-winner text-black' : 'bg-background'}
          `}>
            {/* Ícone ataque/defesa */}
            <div className="flex-shrink-0">
              {pilot2IsAttacking ? (
                <span title="Ataca" className="text-red-500 text-xl">⚔️</span>
              ) : pilot1IsAttacking ? (
                <span title="Defende" className="text-blue-500 text-xl">🛡️</span>
              ) : <div className="w-5"></div>}
            </div>
            
            {/* Posição */}
            {showPositions && pilot2Position && (
              <Badge variant="outline" className="text-neonGreen border-neonGreen flex-shrink-0">
                #{pilot2Position}
              </Badge>
            )}
            
            {/* Foto do piloto */}
            {match.pilot2?.image_url && (
              <img
                src={match.pilot2.image_url}
                alt={match.pilot2.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            )}
            
            {/* Info do piloto */}
            <div className="flex-1 min-w-0">
              <p className={`font-bold truncate ${match.winner_id === match.pilot2_id ? 'text-black' : 'text-white'}`}>
                {match.pilot2?.name || 'TBD'}
              </p>
              <p className={`text-sm truncate ${match.winner_id === match.pilot2_id ? 'text-black/70' : 'text-racing-yellow'}`}>
                🚗 {match.pilot2?.car_name || "N/A"}
              </p>
              {match.pilot2?.team && (
                <p className={`text-xs truncate ${match.winner_id === match.pilot2_id ? 'text-black/60' : 'text-blue-400'}`}>
                  🏁 {match.pilot2.team}
                </p>
              )}
            </div>
            
            {/* Status */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {match.winner_id === match.pilot2_id && <Crown className="w-5 h-5 text-neonYellow" />}
              {isFinished && (
                <span className="font-bold">
                  {match.winner_id === match.pilot2_id ? 'W' : 'L'}
                </span>
              )}
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
            <Tabs defaultValue="odd" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="odd">Rodada Ímpar</TabsTrigger>
                <TabsTrigger value="even">Rodada Par</TabsTrigger>
              </TabsList>
              <TabsContent value="odd" className="mt-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingMatches
                    .filter((match: any) => match.bracket_type === 'odd')
                    .map((match: any, index: number) => (
                      <div key={match.id} className={index === 0 ? 'animate-pulse-border-green rounded-lg' : ''}>
                        <MatchCard match={match} showPositions={true} />
                      </div>
                    ))}
                </div>
                {upcomingMatches.filter((match: any) => match.bracket_type === 'odd').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhuma rodada ímpar agendada</p>
                )}
              </TabsContent>
              <TabsContent value="even" className="mt-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingMatches
                    .filter((match: any) => match.bracket_type === 'even')
                    .map((match: any, index: number) => (
                      <div key={match.id} className={index === 0 ? 'animate-pulse-border-green rounded-lg' : ''}>
                        <MatchCard match={match} showPositions={true} />
                      </div>
                    ))}
                </div>
                {upcomingMatches.filter((match: any) => match.bracket_type === 'even').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhuma rodada par agendada</p>
                )}
              </TabsContent>
            </Tabs>
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
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-trackDark">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="odd">🔵 Rodadas Ímpares</TabsTrigger>
                <TabsTrigger value="even">🔴 Rodadas Pares</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {finishedMatches.map((match: any) => (
                    <MatchCard key={match.id} match={match} showPositions={true} />
                  ))}
                </div>
                {finishedMatches.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum match finalizado</p>
                )}
              </TabsContent>

              <TabsContent value="odd" className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {finishedMatches
                    .filter((m: any) => m.bracket_type === 'odd')
                    .map((match: any) => (
                      <MatchCard key={match.id} match={match} showPositions={true} />
                    ))}
                </div>
                {finishedMatches.filter((m: any) => m.bracket_type === 'odd').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum match ímpar finalizado</p>
                )}
              </TabsContent>

              <TabsContent value="even" className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {finishedMatches
                    .filter((m: any) => m.bracket_type === 'even')
                    .map((match: any) => (
                      <MatchCard key={match.id} match={match} showPositions={true} />
                    ))}
                </div>
                {finishedMatches.filter((m: any) => m.bracket_type === 'even').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum match par finalizado</p>
                )}
              </TabsContent>
            </Tabs>
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
