import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Trophy, Target, TrendingDown, Search } from "lucide-react";
import { useUserRankings } from "@/hooks/useUserRankings";
import { getUserTier } from "@/lib/rankingTiers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function BettorRankingTable() {
  const { rankingsByPoints, isLoading } = useUserRankings(20);
  const [sortBy, setSortBy] = useState<'points' | 'win_rate' | 'profit'>('points');
  const [search, setSearch] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!rankingsByPoints || rankingsByPoints.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum apostador ainda</p>
        </CardContent>
      </Card>
    );
  }

  // Filtrar e ordenar
  let filteredRankings = [...rankingsByPoints];
  
  if (search) {
    filteredRankings = filteredRankings.filter((user: any) => 
      user.username.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (sortBy === 'win_rate') {
    filteredRankings.sort((a: any, b: any) => b.win_rate - a.win_rate);
  } else if (sortBy === 'profit') {
    filteredRankings.sort((a: any, b: any) => b.profit - a.profit);
  }

  const top3 = filteredRankings.slice(0, 3);
  const rest = filteredRankings.slice(3);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-2">
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-40 glass-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="points">🏆 Pontos</SelectItem>
            <SelectItem value="win_rate">🎯 Win Rate</SelectItem>
            <SelectItem value="profit">💰 Lucro</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar apostador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 glass-card"
          />
        </div>
      </div>

      {/* Podium Top 3 */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2º Lugar */}
          <PodiumCard user={top3[1]} rank={2} />
          
          {/* 1º Lugar (maior) */}
          <PodiumCard user={top3[0]} rank={1} isWinner />
          
          {/* 3º Lugar */}
          <PodiumCard user={top3[2]} rank={3} />
        </div>
      )}

      {/* Lista 4º+ */}
      <div className="space-y-3">
        {rest.map((user: any, idx: number) => {
          const rank = idx + 4;
          const tier = getUserTier(user.points);
          const winRate = user.total_bets > 0 
            ? Math.round((user.total_wins / user.total_bets) * 100) 
            : 0;

          return (
            <Card key={user.user_id} className={`glass-card ${tier.gradient} border-2 hover:shadow-neon transition-all duration-300`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Rank + Tier Icon */}
                  <div className="text-center min-w-[60px]">
                    <div className="text-4xl mb-1">{tier.icon}</div>
                    <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
                  </div>
                  
                  {/* Avatar + User + Badges */}
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-12 w-12 border-2 border-primary/30">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{user.username}</p>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {tier.name}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {winRate}% WR
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary flex items-center gap-1 justify-end">
                      {user.points.toLocaleString()}
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <p className={`text-xs ${user.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {user.profit > 0 ? '+' : ''}{user.profit} lucro
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

interface PodiumCardProps {
  user: any;
  rank: number;
  isWinner?: boolean;
}

const PodiumCard = ({ user, rank, isWinner }: PodiumCardProps) => {
  const tier = getUserTier(user.points);
  const winRate = user.total_bets > 0 
    ? Math.round((user.total_wins / user.total_bets) * 100) 
    : 0;
  
  const medalIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';

  return (
    <Card className={`glass-card relative overflow-hidden ${isWinner ? 'scale-110 z-10 shadow-neon' : ''} transition-all duration-300 hover:shadow-neon`}>
      <div className={`absolute inset-0 ${tier.gradient} opacity-30`} />
      <CardContent className={`text-center ${isWinner ? 'py-8' : 'py-6'} relative z-10`}>
        <div className={`${isWinner ? 'text-7xl' : 'text-6xl'} mb-2`}>{medalIcon}</div>
        
        <Avatar className={`${isWinner ? 'h-24 w-24' : 'h-20 w-20'} mx-auto border-4 border-primary mb-3`}>
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="text-2xl">{user.username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <p className={`font-bold ${isWinner ? 'text-2xl' : 'text-xl'} mb-1`}>{user.username}</p>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className={`${isWinner ? 'text-4xl' : 'text-3xl'} font-bold text-primary`}>
            {user.points}
          </span>
          {isWinner && <Trophy className="h-6 w-6 text-primary" />}
        </div>
        
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {tier.name} {tier.icon}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Target className="h-3 w-3 mr-1" />
            {winRate}%
          </Badge>
        </div>

        {user.profit !== 0 && (
          <p className={`text-sm mt-2 font-semibold ${user.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {user.profit > 0 ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
            {user.profit > 0 ? '+' : ''}{user.profit}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
