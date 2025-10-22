import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getBadgeById } from '@/lib/badgeDefinitions';

interface UserBadge {
  id: string;
  badge_id: string;
  is_showcased: boolean;
}

interface BadgeShowcaseProps {
  userId: string;
  badges: UserBadge[];
  onUpdate: () => void;
}

export const BadgeShowcase = ({ userId, badges, onUpdate }: BadgeShowcaseProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const showcasedBadges = badges.filter(b => b.is_showcased);
  const maxShowcase = 3;

  const toggleShowcase = async (badgeId: string, currentState: boolean) => {
    if (!currentState && showcasedBadges.length >= maxShowcase) {
      toast({
        title: '⚠️ Limite atingido',
        description: `Você só pode destacar até ${maxShowcase} badges`,
        className: 'bg-yellow-500/90 text-black border-yellow-600',
      });
      return;
    }

    setLoading(badgeId);

    const { error } = await supabase
      .from('user_badges')
      .update({ is_showcased: !currentState })
      .eq('id', badgeId)
      .eq('user_id', userId);

    if (error) {
      toast({
        title: '❌ Erro',
        description: 'Não foi possível atualizar o badge',
        className: 'bg-red-500/90 text-white border-red-600',
      });
    } else {
      onUpdate();
      toast({
        title: '✅ Atualizado',
        description: currentState ? 'Badge removido do destaque' : 'Badge adicionado ao destaque',
        className: 'bg-green-500/90 text-white border-green-600',
      });
    }

    setLoading(null);
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

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Badges em Destaque</h3>
          <Badge variant="outline">
            {showcasedBadges.length}/{maxShowcase}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          Selecione até {maxShowcase} badges para exibir no seu perfil público
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map((userBadge) => {
            const badge = getBadgeById(userBadge.badge_id);
            if (!badge) return null;

            const IconComponent = badge.iconComponent;
            const isShowcased = userBadge.is_showcased;

            return (
              <Card
                key={userBadge.id}
                className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                  isShowcased ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => toggleShowcase(userBadge.id, isShowcased)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${getTierColor(badge.tier)} flex-shrink-0`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm truncate">{badge.name}</h4>
                      {isShowcased && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {badge.description}
                    </p>
                  </div>
                </div>

                {loading === userBadge.id && (
                  <div className="mt-2 text-center">
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
