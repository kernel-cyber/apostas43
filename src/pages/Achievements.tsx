import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BADGE_DEFINITIONS, getBadgesByCategory } from '@/lib/badgeDefinitions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, TrendingUp, Users, DollarSign, Sparkles, Heart, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Achievements() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categoryLabels: Record<string, string> = {
    participation: 'Participação',
    performance: 'Desempenho',
    volume: 'Volume',
    special: 'Especial',
    social: 'Social'
  };

  const getRarityLabel = (rarity: string) => {
    const labels: Record<string, string> = {
      common: 'Comum',
      rare: 'Rara',
      epic: 'Épica',
      legendary: 'Lendária',
      secret: 'Secreta'
    };
    return labels[rarity] || labels.common;
  };

  const getTierLabel = (tier: string) => {
    const labels: Record<string, string> = {
      bronze: 'Bronze',
      silver: 'Prata',
      gold: 'Ouro',
      platinum: 'Platina',
      diamond: 'Diamante',
      legendary: 'Lendário'
    };
    return labels[tier] || labels.bronze;
  };

  const { data: userBadges } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-badge-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_user_badge_stats', { p_user_id: user.id });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const earnedBadgeIds = new Set(userBadges?.map(b => b.badge_id) || []);

  const filteredBadges = BADGE_DEFINITIONS.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const earnedBadges = filteredBadges.filter(b => earnedBadgeIds.has(b.id));
  const availableBadges = filteredBadges
    .filter(b => !earnedBadgeIds.has(b.id))
    .map(badge => ({
      ...badge,
      progress: badge.checkProgress(userStats || {})
    }))
    .sort((a, b) => b.progress - a.progress);

  const categoryIcons = {
    participation: Users,
    performance: TrendingUp,
    volume: DollarSign,
    special: Sparkles,
    social: Heart
  };

  const getTierColor = (tier: string) => {
    const colors = {
      bronze: 'from-orange-600 via-orange-700 to-orange-900 shadow-[0_0_20px_rgba(194,65,12,0.6)]',
      silver: 'from-gray-300 via-gray-400 to-gray-600 shadow-[0_0_20px_rgba(156,163,175,0.6)]',
      gold: 'from-yellow-400 via-yellow-500 to-yellow-600 shadow-[0_0_25px_rgba(234,179,8,0.7)]',
      platinum: 'from-cyan-300 via-gray-300 to-gray-400 shadow-[0_0_25px_rgba(165,243,252,0.7)]',
      diamond: 'from-cyan-400 via-blue-500 to-blue-600 shadow-[0_0_30px_rgba(34,211,238,0.8)]',
      legendary: 'from-purple-500 via-pink-500 to-red-500 shadow-[0_0_35px_rgba(168,85,247,0.9)]'
    };
    return colors[tier as keyof typeof colors] || colors.bronze;
  };

  const getRarityColor = (rarity: string) => {
    const styles = {
      common: 'bg-gradient-to-br from-gray-500 to-gray-600 text-white border-2 border-gray-400/50 shadow-[0_0_10px_rgba(156,163,175,0.3)]',
      rare: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-2 border-blue-400/60 shadow-[0_0_15px_rgba(59,130,246,0.5)]',
      epic: 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 text-white border-2 border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-pulse',
      legendary: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-black border-2 border-yellow-300/80 shadow-[0_0_25px_rgba(234,179,8,0.8)] font-bold animate-pulse',
      secret: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 text-black border-2 border-emerald-300/80 shadow-[0_0_30px_rgba(16,185,129,0.9)] font-bold animate-pulse'
    };
    return styles[rarity as keyof typeof styles] || styles.common;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-track-dark to-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold neon-text">🏆 Conquistas</h1>
            <p className="text-muted-foreground text-lg">
              Desbloqueie badges e ganhe pontos extras competindo e apostando!
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 glass-card border-racing-yellow/20 hover:border-racing-yellow/40 transition-all">
            <div className="text-sm text-racing-yellow/70">Total de Badges</div>
            <div className="text-3xl font-bold text-racing-yellow">{BADGE_DEFINITIONS.length}</div>
          </Card>
          <Card className="p-4 glass-card border-neonGreen/20 hover:border-neonGreen/40 transition-all">
            <div className="text-sm text-neonGreen/70">Desbloqueadas</div>
            <div className="text-3xl font-bold text-neonGreen">{earnedBadgeIds.size}</div>
          </Card>
          <Card className="p-4 glass-card border-primary/20 hover:border-primary/40 transition-all">
            <div className="text-sm text-primary/70">Progresso</div>
            <div className="text-3xl font-bold text-primary">
              {BADGE_DEFINITIONS.length > 0 
                ? Math.round((earnedBadgeIds.size / BADGE_DEFINITIONS.length) * 100)
                : 0}%
            </div>
          </Card>
          <Card className="p-4 glass-card border-2 border-accent/30 hover:border-accent/50 transition-all">
            <div className="text-sm text-accent/70 mb-1">🎯 Próxima Badge</div>
            {availableBadges[0] && availableBadges[0].progress > 0 ? (
              <div>
                <div className="text-lg font-bold text-accent truncate" title={availableBadges[0].name}>
                  {availableBadges[0].name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={availableBadges[0].progress} className="h-2 flex-1 bg-racing-gray" />
                  <span className="text-sm text-accent/80 font-semibold">
                    {Math.round(availableBadges[0].progress)}%
                  </span>
                </div>
              </div>
            ) : availableBadges.length === 0 ? (
              <div className="text-lg font-bold text-neonGreen animate-pulse">
                🎉 Todas Desbloqueadas!
              </div>
            ) : (
              <div className="text-sm text-accent/60">
                Complete ações para desbloquear badges
              </div>
            )}
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar badges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-racing-yellow/30 focus:border-racing-yellow"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' 
                ? 'bg-racing-yellow text-black hover:bg-racing-yellow/90' 
                : 'border-racing-yellow/30 hover:border-racing-yellow hover:bg-racing-yellow/10'
              }
            >
              Todas
            </Button>
            {Object.entries(categoryIcons).map(([category, Icon]) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category
                  ? 'bg-racing-yellow text-black hover:bg-racing-yellow/90'
                  : 'border-racing-yellow/30 hover:border-racing-yellow hover:bg-racing-yellow/10'
                }
              >
                <Icon className="h-4 w-4 mr-2" />
                {categoryLabels[category] || category}
              </Button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <Tabs defaultValue="earned" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-card/50 border border-racing-yellow/20">
            <TabsTrigger 
              value="earned"
              className="data-[state=active]:bg-racing-yellow data-[state=active]:text-black"
            >
              Desbloqueadas ({earnedBadges.length})
            </TabsTrigger>
            <TabsTrigger 
              value="available"
              className="data-[state=active]:bg-racing-yellow data-[state=active]:text-black"
            >
              Disponíveis ({availableBadges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earned">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedBadges.map((badge) => {
                const IconComponent = badge.iconComponent;
                return (
                  <Card key={badge.id} className="p-4 glass-card card-enter border-2 border-racing-yellow/30 hover:border-racing-yellow/60 hover:scale-105 hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-xl bg-gradient-to-br ring-2 ring-white/20",
                        getTierColor(badge.tier)
                      )}>
                        <IconComponent className="h-8 w-8 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-bold text-lg text-racing-yellow drop-shadow-[0_2px_4px_rgba(234,179,8,0.3)]">
                            {badge.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getRarityColor(badge.rarity)}>
                            ✨ {getRarityLabel(badge.rarity)}
                          </Badge>
                          <Badge variant="outline" className="border-racing-yellow/40 bg-racing-yellow/10 text-racing-yellow">
                            🏆 {getTierLabel(badge.tier)}
                          </Badge>
                          <Badge className="bg-gradient-to-r from-neonGreen/30 to-neonGreen/20 text-neonGreen border-2 border-neonGreen/40 shadow-[0_0_10px_rgba(0,255,0,0.3)]">
                            💰 +{Math.round(50 * badge.pointMultiplier * getTierMultiplier(badge.tier))} pts
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="available">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableBadges.map((badge) => {
                const IconComponent = badge.iconComponent;
                const isReady = badge.progress >= 100;
                
                return (
                  <Card 
                    key={badge.id} 
                    className={cn(
                      "p-4 glass-card card-enter border-2 transition-all duration-300",
                      isReady 
                        ? "border-neonGreen/70 opacity-100 hover:opacity-100 shadow-[0_0_30px_rgba(0,255,0,0.4)] animate-pulse" 
                        : "border-racing-gray/30 opacity-60 hover:opacity-100 hover:border-racing-yellow/40"
                    )}
                  >
                    {isReady && (
                      <Badge className="mb-2 w-full bg-gradient-to-r from-neonGreen via-green-400 to-neonGreen text-black border-2 border-green-300 shadow-[0_0_15px_rgba(0,255,0,0.6)] font-bold animate-pulse">
                        ✓ PRONTO PARA DESBLOQUEAR!
                      </Badge>
                    )}
                    
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-xl bg-gradient-to-br ring-2",
                        isReady ? "ring-neonGreen/60" : "ring-white/10",
                        getTierColor(badge.tier)
                      )}>
                        <IconComponent className={cn(
                          "h-8 w-8 text-white drop-shadow-lg",
                          isReady && "animate-bounce"
                        )} />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className={cn("font-bold text-lg", isReady ? "text-neonGreen" : "")}>
                            {badge.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getRarityColor(badge.rarity)}>
                            ✨ {getRarityLabel(badge.rarity)}
                          </Badge>
                          <Badge variant="outline" className="border-racing-yellow/30">🏆 {getTierLabel(badge.tier)}</Badge>
                          <Badge className="bg-gradient-to-r from-neonGreen/30 to-neonGreen/20 text-neonGreen border-2 border-neonGreen/40 shadow-[0_0_10px_rgba(0,255,0,0.3)]">
                            💰 +{Math.round(50 * badge.pointMultiplier * getTierMultiplier(badge.tier))} pts
                          </Badge>
                        </div>
                        
                        {badge.progress > 0 && (
                          <div className="space-y-1 mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progresso</span>
                              <span className={isReady ? "text-neonGreen font-bold" : ""}>
                                {Math.round(badge.progress)}%
                              </span>
                            </div>
                            <Progress 
                              value={badge.progress} 
                              className={cn(
                                "h-2",
                                isReady ? "bg-neonGreen/20" : "bg-racing-gray"
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function getTierMultiplier(tier: string): number {
  const multipliers = {
    bronze: 1,
    silver: 2,
    gold: 4,
    platinum: 6,
    diamond: 10,
    legendary: 20
  };
  return multipliers[tier as keyof typeof multipliers] || 1;
}
