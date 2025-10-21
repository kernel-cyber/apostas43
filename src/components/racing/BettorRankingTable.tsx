import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Target } from 'lucide-react';
import { useUserRankings } from '@/hooks/useUserRankings';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function BettorRankingTable() {
  const { rankingsByPoints, rankingsByWinRate, isLoading } = useUserRankings(20);

  const RankingList = ({ rankings, showProfit = false }: any) => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    if (!rankings || rankings.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma aposta realizada ainda.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {rankings.map((user: any, index: number) => (
          <Card key={user.user_id} className="bg-muted border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Ranking Position */}
                <div className="flex-shrink-0 w-10 text-center">
                  {index < 3 ? (
                    <Award className={`h-6 w-6 mx-auto ${
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

                {/* User Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground truncate">
                    {user.username}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {user.total_bets} {user.total_bets === 1 ? 'aposta' : 'apostas'}
                    </Badge>
                    <Badge 
                      variant={user.win_rate >= 60 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      <Target className="h-3 w-3 mr-1" />
                      {user.win_rate}%
                    </Badge>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center justify-end gap-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-racing-green" />
                    <span className="text-sm font-bold">{user.points.toLocaleString()}</span>
                  </div>
                  {showProfit && (
                    <div className={`text-xs ${
                      user.profit > 0 ? 'text-green-500' : 
                      user.profit < 0 ? 'text-red-500' : 
                      'text-muted-foreground'
                    }`}>
                      {user.profit > 0 ? '+' : ''}{user.profit.toLocaleString()} pts
                    </div>
                  )}
                  {!showProfit && (
                    <div className="text-xs text-muted-foreground">
                      {user.total_wins} vitórias
                    </div>
                  )}
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
          <Award className="h-5 w-5 text-racing-yellow" />
          Ranking de Apostadores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="points" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="points">Mais Pontos</TabsTrigger>
            <TabsTrigger value="winrate">Melhor Taxa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="points">
            <RankingList 
              rankings={rankingsByPoints} 
              showProfit={true}
            />
          </TabsContent>
          
          <TabsContent value="winrate">
            <RankingList 
              rankings={rankingsByWinRate}
              showProfit={false}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
