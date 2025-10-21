import { Trophy, X, Zap } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay with gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/95 via-primary/20 to-black/95 backdrop-blur-md animate-fade-in"
        onClick={onComplete}
      />
      
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10%`,
              width: i % 3 === 0 ? '12px' : '8px',
              height: i % 3 === 0 ? '12px' : '8px',
              background: [
                'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-foreground)))',
                'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-foreground)))',
                'hsl(var(--chart-1))',
                'hsl(var(--chart-2))',
                'hsl(var(--chart-3))'
              ][i % 5],
              borderRadius: i % 2 === 0 ? '50%' : '2px',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: 0.8
            }}
          />
        ))}
      </div>
      
      {/* Winner announcement card */}
      <div className="relative z-10 max-w-2xl w-full animate-winner-scale">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-4 -right-4 z-20 bg-background/80 backdrop-blur-sm hover:bg-background border border-border shadow-lg rounded-full"
          onClick={onComplete}
        >
          <X className="h-5 w-5" />
        </Button>
        
        {/* Main content */}
        <div className="relative bg-gradient-to-br from-background via-accent/5 to-background border-2 border-primary shadow-2xl shadow-primary/50 rounded-2xl overflow-hidden">
          {/* Animated border glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-20 animate-pulse" />
          
          <div className="relative p-8 md:p-12 space-y-6">
            {/* Trophy icon with glow */}
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary to-accent p-6 rounded-full shadow-xl">
                <Trophy className="w-20 h-20 text-primary-foreground drop-shadow-lg animate-bounce" />
              </div>
              {/* Lightning bolts */}
              <Zap className="absolute -left-4 top-4 w-8 h-8 text-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
              <Zap className="absolute -right-4 top-4 w-8 h-8 text-accent animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            
            {/* Winner title */}
            <div className="space-y-3 text-center">
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-wider bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
                VENCEDOR!
              </h2>
              <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full" />
            </div>
            
            {/* Winner details */}
            <div className="space-y-4 text-center">
              {winner.avatar && (
                <div className="text-7xl drop-shadow-lg animate-bounce">{winner.avatar}</div>
              )}
              <div className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold text-foreground">{winner.name}</h3>
                <p className="text-lg md:text-xl text-accent font-semibold">{winner.car}</p>
              </div>
              
              {winner.position > 0 && (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-full">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-lg font-bold text-foreground">Posição #{winner.position}</span>
                </div>
              )}
            </div>
            
            {/* Celebration text */}
            <div className="pt-4">
              <p className="text-xl md:text-2xl font-bold text-center bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                🎉 Parabéns pela vitória! 🎉
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
