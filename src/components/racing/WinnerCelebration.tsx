import { Card, CardContent } from '@/components/ui/card';
import { Crown, Trophy, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Winner {
  name: string;
  car: string;
  position: number;
  avatar: string;
}

interface WinnerCelebrationProps {
  winner: Winner;
  show: boolean;
  onComplete: () => void;
}

export default function WinnerCelebration({ winner, show, onComplete }: WinnerCelebrationProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onComplete}
      />
      
      {/* Confetti Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10%`,
              backgroundColor: ['#FFD700', '#FFA500', '#FF69B4', '#00FF00', '#00BFFF'][i % 5],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Winner Card */}
      <Card className="relative z-10 max-w-md w-full bg-gradient-winner border-4 border-yellow-400 shadow-2xl animate-winner-scale">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 text-black hover:bg-black/10"
          onClick={onComplete}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <CardContent className="p-8 text-center space-y-6">
          {/* Crown Icon */}
          <div className="relative mx-auto w-24 h-24">
            <Crown className="w-full h-full text-yellow-600 animate-bounce" />
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-spin" />
            <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-yellow-400 animate-ping" />
          </div>
          
          {/* Winner Title */}
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-black uppercase tracking-wider">
              Vencedor!
            </h2>
            <div className="w-24 h-1 bg-black mx-auto rounded-full" />
          </div>
          
          {/* Winner Details */}
          <div className="space-y-4 text-black">
            <div className="space-y-1">
              <div className="text-6xl mb-2">{winner.avatar}</div>
              <h3 className="text-2xl font-bold">{winner.name}</h3>
              <p className="text-lg opacity-80">{winner.car}</p>
            </div>
            
            {winner.position > 0 && (
              <div className="flex items-center justify-center gap-2 text-xl font-bold">
                <Trophy className="w-6 h-6" />
                <span>Posição #{winner.position}</span>
              </div>
            )}
          </div>
          
          {/* Celebration Message */}
          <div className="pt-4 text-black/80 font-semibold">
            🎉 Parabéns pela vitória! 🎉
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
