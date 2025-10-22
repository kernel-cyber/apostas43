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
    const colors = {
      common: 'bg-gray-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-yellow-500',
      secret: 'bg-black'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Conquistas</h1>
        <p className="text-muted-foreground">
          Desbloqueie badges e ganhe pontos extras competindo e apostando!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total de Badges</div>
          <div className="text-3xl font-bold">{BADGE_DEFINITIONS.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Desbloqueadas</div>
          <div className="text-3xl font-bold text-green-500">{earnedBadgeIds.size}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Progresso</div>
          <div className="text-3xl font-bold">
            {BADGE_DEFINITIONS.length > 0 
              ? Math.round((earnedBadgeIds.size / BADGE_DEFINITIONS.length) * 100)
              : 0}%
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Próxima</div>
          <div className="text-3xl font-bold">
            {availableBadges[0]?.progress || 0}%
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
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            Todas
          </Button>
          {Object.entries(categoryIcons).map(([category, Icon]) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Badges Grid */}
      <Tabs defaultValue="earned" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="earned">
            Desbloqueadas ({earnedBadges.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Disponíveis ({availableBadges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earned">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedBadges.map((badge) => {
              const IconComponent = badge.iconComponent;
              return (
                <Card key={badge.id} className="p-4 hover:scale-105 transition-transform">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${getTierColor(badge.tier)} shadow-lg`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{badge.name}</h3>
                        <Badge className={getRarityColor(badge.rarity)}>
                          {badge.rarity}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {badge.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{badge.tier}</Badge>
                        <span className="text-green-500">+{Math.round(50 * badge.pointMultiplier * getTierMultiplier(badge.tier))} pts</span>
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
                <Card key={badge.id} className="p-4 opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${getTierColor(badge.tier)} opacity-50`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{badge.name}</h3>
                        <Badge className={getRarityColor(badge.rarity)}>
                          {badge.rarity}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {badge.description}
                      </p>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{badge.requirement}</span>
                          <span className="font-medium">{badge.progress}%</span>
                        </div>
                        <Progress value={badge.progress} className="h-2" />
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{badge.tier}</Badge>
                        <span className="text-muted-foreground">+{Math.round(50 * badge.pointMultiplier * getTierMultiplier(badge.tier))} pts</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
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
