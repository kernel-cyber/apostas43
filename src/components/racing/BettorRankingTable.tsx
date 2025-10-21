import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Trophy, Target, TrendingDown, Search } from "lucide-react";
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
            <SelectItem value="points">Pontos</SelectItem>
            <SelectItem value="win_rate">Taxa de Acerto</SelectItem>
            <SelectItem value="profit">Lucro</SelectItem>
            <SelectItem value="roi">Retorno</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-40 glass-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Níveis</SelectItem>
            <SelectItem value="legendary">Legendary</SelectItem>
            <SelectItem value="diamond">Diamond</SelectItem>
            <SelectItem value="platinum">Platinum</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="bronze">Bronze</SelectItem>
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
  const wins = user.total_wins || 0;

  // Border especial para top 3
  const getRankBorderClass = () => {
    if (rank === 1) return "border-yellow-500/70 shadow-yellow-500/30 shadow-lg";
    if (rank === 2) return "border-gray-400/70 shadow-gray-400/30 shadow-lg";
    if (rank === 3) return "border-orange-700/70 shadow-orange-700/30 shadow-lg";
    return "";
  };

  const getMedalIcon = () => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-orange-700" />;
    return null;
  };

  return (
    <Card 
      className={cn(
        "glass-card border hover:shadow-neon transition-all duration-300",
        getRankBorderClass()
      )}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Posição */}
          <div className="flex flex-col items-center justify-center min-w-[48px]">
            {rank <= 3 ? (
              getMedalIcon()
            ) : (
              <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
            )}
          </div>

          {/* Avatar */}
          <Avatar className="h-12 w-12 border-2 border-border flex-shrink-0">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          
          {/* Info Principal */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Linha 1: Username + Pontos */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-lg font-bold">{user.username}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  {tier.name}
                </Badge>
              </div>
              
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-bold text-primary">
                  {user.points.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">pts</span>
                </p>
                <p className={cn(
                  "text-sm font-semibold flex items-center justify-end gap-1",
                  user.profit > 0 ? 'text-green-400' : user.profit < 0 ? 'text-red-400' : 'text-muted-foreground'
                )}>
                  {user.profit > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : user.profit < 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null}
                  {user.profit > 0 ? '+' : ''}{user.profit}
                </p>
              </div>
            </div>

            {/* Divisor */}
            <div className="border-t border-border/50" />

            {/* Linha 2: Stats Grid 2x2 */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Taxa:</span>
                <span className="font-semibold">{winRate}%</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Apostas:</span>
                <span className="font-semibold">{wins}/{user.total_bets}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Retorno:</span>
                <span className={cn(
                  "font-semibold",
                  roi > 0 ? 'text-green-400' : roi < 0 ? 'text-red-400' : ''
                )}>
                  {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Sequência:</span>
                <span className="font-semibold">{Math.min(wins, 5)} vitórias</span>
              </div>
            </div>

            {/* Linha 3: Badges/Conquistas */}
            {badges.length > 0 && (
              <div className="flex gap-1.5 flex-wrap pt-1">
                {badges.slice(0, 3).map((badge: any) => (
                  <Badge 
                    key={badge.id} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {badge.definition?.name}
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

