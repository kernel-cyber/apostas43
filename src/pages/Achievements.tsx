import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BADGE_DEFINITIONS, getBadgesByCategory } from '@/lib/badgeDefinitions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, TrendingUp, Users, DollarSign, Sparkles, Heart } from 'lucide-react';

export default function Achievements() {
  const { user } = useAuth();
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
      bronze: 'from-orange-600 to-orange-800',
      silver: 'from-gray-400 to-gray-500',
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-gray-300 to-gray-400',
      diamond: 'from-cyan-400 to-blue-500',
      legendary: 'from-purple-500 via-pink-500 to-red-500'
    };
    return colors[tier as keyof typeof colors] || colors.bronze;
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'bg-gray-500/80 text-white',
      rare: 'bg-blue-500/80 text-white',
      epic: 'bg-purple-500/80 text-white',
      legendary: 'bg-racing-yellow text-black',
      secret: 'bg-neonGreen text-black'
    };
    return colors[rarity] || colors.common;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-track-dark to-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <h1 className="text-4xl font-bold neon-text">🏆 Conquistas</h1>
          <p className="text-muted-foreground text-lg">
            Desbloqueie badges e ganhe pontos extras competindo e apostando!
          </p>
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
          <Card className="p-4 glass-card border-accent/20 hover:border-accent/40 transition-all">
            <div className="text-sm text-accent/70">Próxima</div>
            <div className="text-3xl font-bold text-accent">
              {availableBadges[0]?.progress ? Math.round(availableBadges[0].progress) : 0}%
            </div>
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
                  <Card key={badge.id} className="p-4 glass-card card-enter border-racing-yellow/20 hover:border-racing-yellow/40 hover:scale-105 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${getTierColor(badge.tier)} shadow-neon`}>
                        <IconComponent className="h-8 w-8 text-white drop-shadow-lg" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-bold text-lg text-racing-yellow">{badge.name}</h3>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getRarityColor(badge.rarity)}>
                            {getRarityLabel(badge.rarity)}
                          </Badge>
                          <Badge variant="outline" className="border-racing-yellow/30">{getTierLabel(badge.tier)}</Badge>
                          <Badge variant="secondary" className="bg-neonGreen/20 text-neonGreen border-neonGreen/30">
                            +{Math.round(50 * badge.pointMultiplier * getTierMultiplier(badge.tier))} pts
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
                return (
                  <Card key={badge.id} className="p-4 glass-card border-racing-gray/30 opacity-60 hover:opacity-100 hover:border-racing-yellow/30 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-muted opacity-50">
                        <IconComponent className="h-8 w-8 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-bold text-lg">{badge.name}</h3>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getRarityColor(badge.rarity)}>
                            {getRarityLabel(badge.rarity)}
                          </Badge>
                          <Badge variant="outline" className="border-racing-yellow/30">{getTierLabel(badge.tier)}</Badge>
                          <Badge variant="secondary" className="bg-neonGreen/20 text-neonGreen border-neonGreen/30">
                            +{Math.round(50 * badge.pointMultiplier * getTierMultiplier(badge.tier))} pts
                          </Badge>
                        </div>
                        
                        {badge.progress > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progresso</span>
                              <span>{Math.round(badge.progress)}%</span>
                            </div>
                            <Progress value={badge.progress} className="h-2 bg-racing-gray" />
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
