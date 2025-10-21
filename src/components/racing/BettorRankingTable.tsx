import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Search } from "lucide-react";
import { useUserRankings } from "@/hooks/useUserRankings";
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
          <Skeleton key={i} className="h-16 w-full" />
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
      <div className="space-y-2">
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
  
  const winRate = user.total_bets > 0 
    ? Math.round((user.total_wins / user.total_bets) * 100) 
    : 0;

  return (
    <Card className="bg-muted border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="w-10 text-center shrink-0">
            {rank <= 3 ? (
              <Trophy
                className={cn(
                  "h-5 w-5 mx-auto",
                  rank === 1 && "text-yellow-500",
                  rank === 2 && "text-gray-400",
                  rank === 3 && "text-orange-600"
                )}
              />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">
                #{rank}
              </span>
            )}
          </div>

          {/* Avatar */}
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
            <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Linha 1: Username + Pontos */}
            <div className="flex justify-between items-center gap-2">
              <p className="font-bold text-white truncate">
                {user.username}
              </p>
              <p className="text-lg font-bold text-primary shrink-0">
                {user.points.toLocaleString()}
                <span className="text-xs text-muted-foreground ml-1">pts</span>
              </p>
            </div>
            
            {/* Linha 2: Tier + Stats inline */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <Badge variant="outline" className="text-xs">
                {tier.name}
              </Badge>
              <span className="text-muted-foreground">
                Taxa: <span className="font-semibold text-foreground">{winRate}%</span>
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                Apostas: <span className="font-semibold text-foreground">{user.total_wins}/{user.total_bets}</span>
              </span>
              <span className="text-muted-foreground">•</span>
              <span className={cn(
                "font-semibold",
                user.profit > 0 ? "text-green-400" : user.profit < 0 ? "text-red-400" : "text-muted-foreground"
              )}>
                {user.profit > 0 ? "↑" : user.profit < 0 ? "↓" : ""} {user.profit > 0 ? "+" : ""}{user.profit}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

