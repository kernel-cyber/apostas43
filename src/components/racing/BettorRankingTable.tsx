import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Target, Trophy, Percent, DollarSign } from 'lucide-react';
import { useUserRankings } from '@/hooks/useUserRankings';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

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
            Ranking de Apostadores - Histórico Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-lg font-semibold text-foreground mb-2">
              Seja o Primeiro!
            </p>
            <p className="text-sm text-muted-foreground">
              Faça suas apostas e apareça no ranking de apostadores.
            </p>
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
          {/* #1: Clarificar que é de todos os tempos */}
          Ranking de Apostadores - Histórico Geral
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rankingsByPoints.map((user: any, index: number) => (
            <Card 
              key={user.user_id} 
              className={`overflow-hidden transition-all hover:shadow-lg ${
                index < 3 
                  ? 'bg-gradient-to-r from-muted/80 to-muted border-racing-yellow/30' 
                  : 'bg-muted border-border'
              }`}
            >
              <CardContent className="p-5">
                {/* Header: Position + User + Points */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Ranking Position */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-background/50">
                    {index < 3 ? (
                      <Award className={`h-7 w-7 ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        'text-amber-700'
                      }`} />
                    ) : (
                      <span className="text-xl font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* User Avatar + Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 border-2 border-racing-yellow/30">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg text-foreground truncate">
                        {user.username}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          <Trophy className="h-3 w-3 mr-1" />
                          {user.total_wins}/{user.total_bets}
                        </Badge>
                        <Badge 
                          variant={user.win_rate >= 60 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          <Target className="h-3 w-3 mr-1" />
                          {user.win_rate}% WR
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Total Points */}
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp className="h-5 w-5 text-racing-yellow" />
                      <span className="text-2xl font-bold text-racing-yellow">
                        {user.points.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">pontos</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
                  {/* Profit/Loss */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className={`h-4 w-4 ${
                        user.profit > 0 ? 'text-green-500' : 
                        user.profit < 0 ? 'text-red-500' : 
                        'text-muted-foreground'
                      }`} />
                      <span className={`text-sm font-bold ${
                        user.profit > 0 ? 'text-green-500' : 
                        user.profit < 0 ? 'text-red-500' : 
                        'text-muted-foreground'
                      }`}>
                        {user.profit > 0 ? '+' : ''}{user.profit.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Lucro</p>
                  </div>

                  {/* ROI */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Percent className={`h-4 w-4 ${
                        user.roi > 0 ? 'text-green-500' : 
                        user.roi < 0 ? 'text-red-500' : 
                        'text-muted-foreground'
                      }`} />
                      <span className={`text-sm font-bold ${
                        user.roi > 0 ? 'text-green-500' : 
                        user.roi < 0 ? 'text-red-500' : 
                        'text-muted-foreground'
                      }`}>
                        {user.roi > 0 ? '+' : ''}{user.roi}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">ROI</p>
                  </div>

                  {/* Avg Bet */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">
                        {user.avg_bet.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Média</p>
                  </div>
                </div>

                {/* Win Rate Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Taxa de Acerto</span>
                    <span className="text-xs font-semibold text-foreground">{user.win_rate}%</span>
                  </div>
                  <Progress 
                    value={user.win_rate} 
                    className={`h-2 ${
                      user.win_rate >= 60 ? 'bg-green-500/20' : 
                      user.win_rate >= 40 ? 'bg-yellow-500/20' : 
                      'bg-red-500/20'
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
