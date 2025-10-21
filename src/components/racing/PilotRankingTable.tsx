import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp } from 'lucide-react';
import { usePilotRankings } from '@/hooks/usePilotRankings';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PilotRankingTable() {
  const { rankings, isLoading } = usePilotRankings();

  const RankingList = ({ pilots, isLoading, showPosition = false }: any) => {
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
        {pilots.map((pilot: any, index: number) => (
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
                  <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
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
                    <p className="font-bold text-foreground truncate">
                      {pilot.name}
                    </p>
                    {showPosition && pilot.current_position && (
                      <Badge variant="outline" className="text-racing-yellow">
                        P{pilot.current_position}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-racing-yellow truncate">
                    {pilot.car_name}
                  </p>
                  {pilot.team && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      🏁 {pilot.team}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-racing-green" />
                    <span className="text-sm font-bold">{pilot.points}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pilot.wins}V / {pilot.losses}D
                    {pilot.win_rate > 0 && (
                      <span className="ml-1">({pilot.win_rate}%)</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-racing-yellow" />
          Ranking de Pilotos - TOP 20
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RankingList 
          pilots={rankings} 
          isLoading={isLoading}
          showPosition={true}
        />
      </CardContent>
    </Card>
  );
}
