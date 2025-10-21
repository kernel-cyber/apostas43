import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Shield, Swords, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { usePilotRankings } from '@/hooks/usePilotRankings';
import { useEventStandings } from '@/hooks/useEventStandings';
import { useEventPilotStats } from '@/hooks/useEventPilotStats';
import { Skeleton } from '@/components/ui/skeleton';

interface PilotRankingTableProps {
  eventId: string;
}

export default function PilotRankingTable({ eventId }: PilotRankingTableProps) {
  const { data: eventStandings, isLoading } = useEventStandings(eventId);
  
  const pilots = eventStandings?.map(standing => ({
    id: standing.pilot?.id || standing.pilot_id,
    name: standing.pilot?.name || 'Unknown',
    car_name: standing.pilot?.car_name || 'N/A',
    image_url: standing.pilot?.image_url,
    team: standing.pilot?.team,
    wins: standing.wins,
    losses: standing.losses,
    current_position: standing.final_position,
    initial_position: standing.initial_position,
    position_change: standing.initial_position && standing.final_position 
      ? standing.initial_position - standing.final_position  // positivo = subiu
      : 0
  })) || [];

  const RankingList = ({ pilots, isLoading, showPosition = false, eventId }: any) => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    if (!pilots || pilots.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum piloto cadastrado ainda.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {pilots.map((pilot: any, index: number) => {
          const PilotCard = () => {
            const { data: stats } = useEventPilotStats(eventId, pilot.id);
            
            return (
          <Card key={pilot.id} className="bg-muted border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Ranking Position */}
                    <div className="flex-shrink-0 w-10 text-center">
                      {index < 3 ? (
                        <Trophy className={`h-6 w-6 mx-auto ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          'text-amber-700'
                        }`} />
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Pilot Image */}
                    {pilot.image_url && (
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary/30">
                        <img
                          src={pilot.image_url}
                          alt={pilot.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Pilot Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-white truncate">
                          {pilot.name}
                        </p>
                        {showPosition && pilot.current_position && (
                          <>
                            <Badge variant="outline" className="text-neonGreen border-neonGreen">
                              #{pilot.current_position}
                            </Badge>
                            {pilot.position_change !== 0 && (
                              <Badge 
                                variant="outline" 
                                className={`flex items-center gap-1 ${
                                  pilot.position_change > 0 ? 'text-green-500 border-green-500' :
                                  'text-red-500 border-red-500'
                                }`}
                              >
                                {pilot.position_change > 0 ? (
                                  <>
                                    <ArrowUp className="h-3 w-3" />
                                    +{pilot.position_change}
                                  </>
                                ) : (
                                  <>
                                    <ArrowDown className="h-3 w-3" />
                                    {pilot.position_change}
                                  </>
                                )}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                  <p className="text-xs text-racing-yellow truncate">
                    🚗 {pilot.car_name}
                  </p>
                  {pilot.team && (
                    <p className="text-[10px] text-blue-400 truncate">
                      🏁 {pilot.team}
                    </p>
                  )}
                </div>

                {/* Stats - Todas as Estatísticas Visíveis */}
                <div className="flex-shrink-0 text-right">
                  <div className="space-y-1">
                    {/* Vitórias e Derrotas */}
                    <div className="flex items-center gap-2 justify-end text-sm">
                      <span className="text-muted-foreground">V/D:</span>
                      <span className="font-bold text-green-500">{pilot.wins || 0}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="font-bold text-red-500">{pilot.losses || 0}</span>
                    </div>
                    
                    {/* Defesas e Ataques */}
                    <div className="flex items-center gap-2 justify-end text-xs">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-blue-400" />
                        <span className="font-semibold text-blue-400">
                          {stats?.defesasSuccess || 0}/{stats?.defesasTotal || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Swords className="h-3 w-3 text-orange-400" />
                        <span className="font-semibold text-orange-400">
                          {stats?.ataquesSuccess || 0}/{stats?.ataquesTotal || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            );
          };
          
          return <PilotCard key={pilot.id} />;
        })}
      </div>
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-racing-yellow" />
          Ranking por Edição
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RankingList 
          pilots={pilots} 
          isLoading={isLoading}
          showPosition={true}
          eventId={eventId}
        />
      </CardContent>
    </Card>
  );
}
