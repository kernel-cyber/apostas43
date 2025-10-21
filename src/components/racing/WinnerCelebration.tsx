import { Trophy, X, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Winner {
  name: string;
  car: string;
  position: number;
  avatar: string;
  imageUrl?: string;
}

interface WinnerCelebrationProps {
  winner: Winner;
  show: boolean;
  onComplete: () => void;
}

export default function WinnerCelebration({ winner, show, onComplete }: WinnerCelebrationProps) {
  if (!show) return null;

  return (
    <>
      {/* Confetti Overlay */}
      <div className="fixed inset-0 z-40 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-fall"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 10}%`,
              background: `hsl(${Math.random() * 60 + 30}, 90%, 60%)`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Winner Banner - Modern Top Banner Design */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 animate-slide-in-top"
        style={{ 
          animation: 'slideInFromTop 0.5s ease-out, fadeOut 0.5s ease-out 4.5s forwards',
          willChange: 'transform, opacity'
        }}
      >
        <div className="bg-gradient-to-r from-yellow-500/95 via-orange-500/95 to-yellow-500/95 backdrop-blur-md border-b-4 border-yellow-600 shadow-2xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                {/* Trophy Icon with Glow */}
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-300/50 blur-xl rounded-full animate-pulse" />
                  <Trophy className="w-12 h-12 text-yellow-900 relative z-10 animate-bounce" />
                </div>

                {/* Winner Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-5 h-5 text-yellow-900" />
                    <h3 className="text-lg font-bold text-yellow-900">
                      CAMPEÃO DO MATCH!
                    </h3>
                  </div>
          <div className="flex items-center gap-3">
            {winner.imageUrl ? (
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-yellow-900 flex-shrink-0">
                <img 
                  src={winner.imageUrl} 
                  alt={winner.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <span className="text-3xl">{winner.avatar}</span>
            )}
            <div>
              <p className="text-2xl font-black text-gray-900">
                {winner.name}
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {winner.car} • Posição #{winner.position}
              </p>
            </div>
          </div>
                </div>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-yellow-900 hover:bg-yellow-600/30 shrink-0"
                onClick={onComplete}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInFromTop {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
        
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-fall {
          animation: fall linear infinite;
        }
        
        .animate-slide-in-top {
          animation: slideInFromTop 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
