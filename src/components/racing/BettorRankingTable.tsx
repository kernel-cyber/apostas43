import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Target } from 'lucide-react';
import { useUserRankings } from '@/hooks/useUserRankings';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function BettorRankingTable() {
  const { rankingsByPoints, isLoading } = useUserRankings(20);

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-racing-yellow" />
            Ranking de Apostadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rankingsByPoints || rankingsByPoints.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-racing-yellow" />
            Ranking de Apostadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma aposta realizada ainda.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-racing-yellow" />
          Ranking de Apostadores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rankingsByPoints.map((user: any, index: number) => (
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
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground truncate">
                        {user.username}
                      </p>
                      <Badge 
                        variant={user.win_rate >= 60 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        <Target className="h-3 w-3 mr-1" />
                        {user.win_rate}% WR
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {user.total_bets} {user.total_bets === 1 ? 'aposta' : 'apostas'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {user.total_wins} vitórias
                      </span>
                    </div>
                  </div>

          {/* ROI Badge */}
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center justify-end gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-racing-green" />
              <span className="text-lg font-bold">{user.points.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className={`${
                user.profit > 0 ? 'text-green-500' : 
                user.profit < 0 ? 'text-red-500' : 
                'text-muted-foreground'
              }`}>
                {user.profit > 0 ? '+' : ''}{user.profit.toLocaleString()} pts
              </div>
              <Badge variant="outline" className={`text-[10px] ${
                user.roi > 0 ? 'border-green-500 text-green-500' : 
                user.roi < 0 ? 'border-red-500 text-red-500' : 
                'border-muted text-muted-foreground'
              }`}>
                ROI: {user.roi > 0 ? '+' : ''}{user.roi}%
              </Badge>
            </div>
          </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
