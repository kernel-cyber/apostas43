import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUserBadges, useAvailableBadges } from '@/hooks/useUserBadges';
import { BADGE_DEFINITIONS, BadgeDefinition } from '@/lib/badgeDefinitions';
import { Trophy, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AchievementsDisplayProps {
  userId: string | null;
  userStats: any;
}

export function AchievementsDisplay({ userId, userStats }: AchievementsDisplayProps) {
  const { data: earnedBadges, isLoading: loadingEarned } = useUserBadges(userId);
  const { data: availableBadges, isLoading: loadingAvailable } = useAvailableBadges(userId, userStats);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-700 text-white';
      case 'silver': return 'bg-gray-400 text-gray-900';
      case 'gold': return 'bg-yellow-500 text-gray-900';
      case 'platinum': return 'bg-cyan-400 text-gray-900';
      case 'diamond': return 'bg-blue-500 text-white';
      case 'legendary': return 'bg-purple-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'participation': return 'Participação';
      case 'performance': return 'Performance';
      case 'volume': return 'Volume';
      case 'special': return 'Especial';
      case 'social': return 'Social';
      default: return category;
    }
  };

  const renderBadgeCard = (badge: BadgeDefinition, earned: boolean, progress?: number) => (
    <Card 
      key={badge.id} 
      className={`relative ${earned ? 'border-primary' : 'border-muted opacity-70'}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`text-4xl ${!earned && 'grayscale'}`}>
            {earned ? badge.icon : <Lock className="w-10 h-10 text-muted-foreground" />}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-sm">{badge.name}</h4>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
              <Badge className={getTierColor(badge.tier)} variant="secondary">
                {badge.tier.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{badge.requirement}</span>
                {!earned && progress !== undefined && (
                  <span className="font-medium">{Math.round(progress)}%</span>
                )}
              </div>
              {!earned && progress !== undefined && (
                <Progress value={progress} className="h-1.5" />
              )}
            </div>
            
            <Badge variant="outline" className="text-xs">
              {getCategoryLabel(badge.category)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loadingEarned || loadingAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando conquistas...</p>
        </CardContent>
      </Card>
    );
  }

  const earnedCount = earnedBadges?.length || 0;
  const totalCount = BADGE_DEFINITIONS.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Conquistas
          </CardTitle>
          <Badge variant="secondary" className="text-base">
            {earnedCount} / {totalCount}
          </Badge>
        </div>
        <Progress value={(earnedCount / totalCount) * 100} className="mt-2" />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="earned">
          <TabsList className="w-full">
            <TabsTrigger value="earned" className="flex-1">
              Desbloqueadas ({earnedCount})
            </TabsTrigger>
            <TabsTrigger value="available" className="flex-1">
              Disponíveis ({totalCount - earnedCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="earned" className="space-y-3 mt-4">
            {earnedCount === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Você ainda não desbloqueou nenhuma conquista. Continue apostando!
              </p>
            ) : (
              earnedBadges?.map((badge) => 
                renderBadgeCard(badge.definition as BadgeDefinition, true)
              )
            )}
          </TabsContent>
          
          <TabsContent value="available" className="space-y-3 mt-4">
            {availableBadges && availableBadges.length > 0 ? (
              availableBadges.map((badge) => 
                renderBadgeCard(badge, false, badge.progress)
              )
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Parabéns! Você desbloqueou todas as conquistas! 🎉
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
