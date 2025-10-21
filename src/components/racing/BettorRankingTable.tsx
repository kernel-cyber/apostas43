import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Trophy, Target, TrendingDown, Search, Flame, Snowflake } from "lucide-react";
import { useUserRankings } from "@/hooks/useUserRankings";
import { useUserBadges } from "@/hooks/useUserBadges";
import { getUserTier } from "@/lib/rankingTiers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function BettorRankingTable() {
  const { rankingsByPoints, isLoading } = useUserRankings(50);
  const [sortBy, setSortBy] = useState<'points' | 'win_rate' | 'profit' | 'roi'>('points');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');

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
  
  // Busca por username
  if (search) {
    filteredRankings = filteredRankings.filter((user: any) => 
      user.username.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Filtro por tier
  if (tierFilter !== 'all') {
    filteredRankings = filteredRankings.filter((user: any) => {
      const tier = getUserTier(user.points);
      return tier.name.toLowerCase() === tierFilter.toLowerCase();
    });
  }

  // Ordenação
  if (sortBy === 'win_rate') {
    filteredRankings.sort((a: any, b: any) => b.win_rate - a.win_rate);
  } else if (sortBy === 'profit') {
    filteredRankings.sort((a: any, b: any) => b.profit - a.profit);
  } else if (sortBy === 'roi') {
    filteredRankings.sort((a: any, b: any) => b.roi - a.roi);
  }

  // Reassign ranks after filtering
  const rankedList = filteredRankings.map((user, idx) => ({ ...user, displayRank: idx + 1 }));

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-40 glass-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="points">🏆 Pontos</SelectItem>
            <SelectItem value="win_rate">🎯 Win Rate</SelectItem>
            <SelectItem value="profit">💰 Lucro</SelectItem>
            <SelectItem value="roi">📈 ROI</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-40 glass-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Tiers</SelectItem>
            <SelectItem value="legendary">👑 Legendary</SelectItem>
            <SelectItem value="diamond">💎 Diamond</SelectItem>
            <SelectItem value="platinum">⭐ Platinum</SelectItem>
            <SelectItem value="gold">🏆 Gold</SelectItem>
            <SelectItem value="silver">🥈 Silver</SelectItem>
            <SelectItem value="bronze">🥉 Bronze</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar apostador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 glass-card"
          />
        </div>
      </div>

      {/* Lista Unificada Premium */}
      <div className="space-y-3">
        {rankedList.map((user: any) => (
          <BettorRankingCard key={user.user_id} user={user} rank={user.displayRank} />
        ))}
      </div>
    </div>
  );
}

interface BettorRankingCardProps {
  user: any;
  rank: number;
}

const BettorRankingCard = ({ user, rank }: BettorRankingCardProps) => {
  const tier = getUserTier(user.points);
  const { data: badges = [] } = useUserBadges(user.user_id);
  
  const winRate = user.total_bets > 0 
    ? Math.round((user.total_wins / user.total_bets) * 100) 
    : 0;
  
  const roi = user.roi || 0;
  const avgBet = user.avg_bet || 0;
  
  // Calcular streak (vitórias consecutivas ou derrotas)
  const wins = user.total_wins || 0;
  const losses = (user.total_bets || 0) - wins;
  const hasHotStreak = winRate >= 70 && user.total_bets >= 5;
  const hasColdStreak = winRate <= 30 && user.total_bets >= 5;

  // Border especial para top 3
  const getRankBorderClass = () => {
    if (rank === 1) return "border-yellow-500/70 shadow-yellow-500/30 shadow-lg";
    if (rank === 2) return "border-gray-400/70 shadow-gray-400/30 shadow-lg";
    if (rank === 3) return "border-orange-700/70 shadow-orange-700/30 shadow-lg";
    return "";
  };

  const getMedalIcon = () => {
    if (rank === 1) return <Trophy className="h-8 w-8 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-7 w-7 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-orange-700" />;
    return null;
  };

  return (
    <Card 
      className={cn(
        "glass-card border-2 hover:shadow-neon transition-all duration-300 card-enter",
        getRankBorderClass(),
        tier.gradient
      )}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Posição + Tier Icon */}
          <div className="flex-shrink-0 text-center min-w-[50px] sm:min-w-[60px]">
            {rank <= 3 ? (
              <div className="mb-1">
                {getMedalIcon()}
              </div>
            ) : (
              <div className="text-3xl sm:text-4xl mb-1">{tier.icon}</div>
            )}
            <span className="text-xs sm:text-sm font-bold text-muted-foreground">#{rank}</span>
          </div>

          {/* Avatar */}
          <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-primary/30 flex-shrink-0">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="text-xl">{user.username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          
          {/* Info Principal */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Linha 1: Username + Pontos */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <p className="font-bold text-base sm:text-lg truncate">{user.username}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {tier.icon} {tier.name}
                  </Badge>
                  {hasHotStreak && (
                    <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                      <Flame className="h-3 w-3 mr-1" />
                      Hot Streak
                    </Badge>
                  )}
                  {hasColdStreak && (
                    <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                      <Snowflake className="h-3 w-3 mr-1" />
                      Cold Streak
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {user.points.toLocaleString()}
                </div>
                <p className={cn(
                  "text-xs sm:text-sm font-semibold",
                  user.profit > 0 ? 'text-green-400' : user.profit < 0 ? 'text-red-400' : 'text-muted-foreground'
                )}>
                  {user.profit > 0 ? (
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                  ) : user.profit < 0 ? (
                    <TrendingDown className="inline h-3 w-3 mr-1" />
                  ) : null}
                  {user.profit > 0 ? '+' : ''}{user.profit} lucro
                </p>
              </div>
            </div>

            {/* Linha 2: Estatísticas Detalhadas */}
            <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span className="font-semibold text-foreground">{winRate}%</span> WR
              </span>
              <span>
                📊 <span className="font-semibold text-foreground">{wins}/{user.total_bets}</span>
              </span>
              <span className={cn(
                "font-semibold",
                roi > 0 ? 'text-green-400' : roi < 0 ? 'text-red-400' : ''
              )}>
                📈 ROI: {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
              </span>
              <span>
                💵 Média: <span className="font-semibold text-foreground">{avgBet.toFixed(0)}</span>
              </span>
            </div>

            {/* Linha 3: Badges/Conquistas */}
            {badges.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {badges.slice(0, 3).map((badge: any) => (
                  <Badge 
                    key={badge.id} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {badge.definition?.icon} {badge.definition?.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

