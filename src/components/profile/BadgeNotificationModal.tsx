import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BadgeDefinition } from '@/lib/badgeDefinitions';

interface BadgeNotificationModalProps {
  badge: BadgeDefinition | null;
  points: number;
  onClose: () => void;
}

export const BadgeNotificationModal = ({ badge, points, onClose }: BadgeNotificationModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (badge) {
      setIsOpen(true);
      
      // Confetti effect based on tier
      const confettiConfig = getConfettiConfig(badge.tier);
      confetti(confettiConfig);
      
      // Vibration for mobile
      if ('vibrate' in navigator) {
        const vibrationPattern = getVibrationPattern(badge.tier);
        navigator.vibrate(vibrationPattern);
      }
    }
  }, [badge]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  if (!badge) return null;

  const tierColors = {
    bronze: 'from-orange-600 to-orange-800',
    silver: 'from-gray-400 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-gray-300 to-gray-400',
    diamond: 'from-cyan-400 to-blue-500',
    legendary: 'from-purple-500 via-pink-500 to-red-500'
  };

  const IconComponent = badge.iconComponent;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-br from-background to-background/80 border-2">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="p-8 space-y-6">
            {/* Badge Icon with Animation */}
            <div className="flex justify-center animate-scale-in">
              <div className={`relative p-8 rounded-full bg-gradient-to-br ${tierColors[badge.tier]} shadow-2xl animate-pulse`}>
                <IconComponent className="h-16 w-16 text-white" />
                
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${tierColors[badge.tier]} blur-2xl opacity-50 animate-pulse`} />
              </div>
            </div>

            {/* Badge Info */}
            <div className="text-center space-y-2 animate-fade-in">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {badge.rarity.toUpperCase()} • {badge.tier.toUpperCase()}
              </div>
              
              <h2 className="text-3xl font-bold">{badge.name}</h2>
              <p className="text-muted-foreground">{badge.description}</p>
            </div>

            {/* Points Reward */}
            <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <span className="text-2xl">💰</span>
              <span className="text-xl font-bold text-green-500">+{points} pontos</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleClose}
                className="flex-1"
              >
                Continuar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // TODO: Implement share functionality
                  handleClose();
                }}
              >
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function getConfettiConfig(tier: string) {
  const baseConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 70,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    width: '10px',
    height: '10px',
  };

  const tierConfigs = {
    bronze: { ...baseConfig, colors: ['#cd7f32', '#b87333'] },
    silver: { ...baseConfig, colors: ['#c0c0c0', '#a8a8a8'] },
    gold: { ...baseConfig, colors: ['#ffd700', '#ffed4e'] },
    platinum: { ...baseConfig, colors: ['#e5e4e2', '#d4d4d4'], elementCount: 100 },
    diamond: { ...baseConfig, colors: ['#b9f2ff', '#00b4d8'], elementCount: 120 },
    legendary: { 
      ...baseConfig, 
      colors: ['#a855f7', '#ec4899', '#ef4444'], 
      elementCount: 150,
      startVelocity: 60 
    }
  };

  return tierConfigs[tier as keyof typeof tierConfigs] || baseConfig;
}

function getVibrationPattern(tier: string): number[] {
  const patterns = {
    bronze: [100],
    silver: [100, 50, 100],
    gold: [100, 50, 100, 50, 100],
    platinum: [200, 100, 200],
    diamond: [200, 100, 200, 100, 200],
    legendary: [300, 100, 300, 100, 300, 100, 300]
  };

  return patterns[tier as keyof typeof patterns] || [100];
}
