import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Zap, Timer, TrendingUp } from "lucide-react";

interface Pilot {
  name: string;
  car: string;
  position: number;
  wins: number;
  losses: number;
  team?: string;
  imageUrl?: string;
}

interface RaceCardProps {
  match: {
    id: number;
    pilot1: Pilot;
    pilot2: Pilot;
    pilot1Team?: string;
    pilot2Team?: string;
    round: string;
    status: "live" | "upcoming" | "finished";
    bets: { pilot1: number; pilot2: number };
    winner?: 1 | 2;
  };
}

export const RaceCard = ({ match }: RaceCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { pilot1, pilot2, round, status, bets, winner } = match;

  useEffect(() => {
    if (status === "live") {
      setIsAnimating(true);
    }
  }, [status]);

  const getStatusColor = () => {
    switch (status) {
      case "live": return "neonGreen";
      case "upcoming": return "neonYellow";
      case "finished": return "racingGray";
      default: return "muted";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "live": return "AO VIVO";
      case "upcoming": return "PRÓXIMO";
      case "finished": return "FINALIZADO";
      default: return "AGENDADO";
    }
  };

  const PilotCard = ({ pilot, side, isWinner, team }: { pilot: Pilot; side: "left" | "right"; isWinner?: boolean; team?: string }) => (
    <div className={`
      relative flex-1 p-6 rounded-lg transition-all duration-500
      ${isWinner ? 'bg-gradient-winner shadow-neon winner-pulse' : 'bg-gradient-card'}
      ${side === "left" ? "text-left" : "text-right"}
    `}>
      <div className="flex flex-col space-y-3">
        <div className={`flex items-center ${side === "right" ? "flex-row-reverse" : ""} gap-2`}>
          {/* Foto do piloto */}
          {pilot.imageUrl && (
            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
              <img 
                src={pilot.imageUrl} 
                alt={pilot.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Círculo de posição */}
          <div className="w-12 h-12 rounded-full bg-racingGray flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-neonGreen">#{pilot.position}</span>
          </div>
          
          {/* Info do piloto */}
          <div className={side === "right" ? "text-right" : ""}>
            <h3 className="text-lg font-bold text-white">{pilot.name}</h3>
            <p className="text-sm text-racing-yellow">🚗 {pilot.car}</p>
            {team && <p className="text-xs text-blue-400">🏁 {team}</p>}
          </div>
        </div>
        
        <div className={`flex ${side === "right" ? "justify-end" : ""} space-x-4 text-xs`}>
          <div className="text-center">
            <div className="text-neonGreen font-bold text-lg">{pilot.wins}</div>
            <div className="text-muted-foreground">Vitórias</div>
          </div>
          <div className="text-center">
            <div className="text-destructive font-bold text-lg">{pilot.losses}</div>
            <div className="text-muted-foreground">Derrotas</div>
          </div>
          <div className="text-center">
            <div className="text-accent font-bold text-lg">
              {((pilot.wins / (pilot.wins + pilot.losses)) * 100).toFixed(0)}%
            </div>
            <div className="text-muted-foreground">Taxa</div>
          </div>
        </div>

        {isWinner && (
          <div className="flex items-center justify-center mt-2">
            <Trophy className="w-5 h-5 text-neonYellow mr-2" />
            <span className="font-bold text-neonYellow">VENCEDOR</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="bg-background border-border shadow-card overflow-hidden card-enter">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-trackDark border-b border-border">
          <div className="flex items-center space-x-3">
            <Badge 
              variant="outline" 
              className={`border-${getStatusColor()} text-${getStatusColor()} ${status === "live" ? "animate-pulse" : ""}`}
            >
              {status === "live" && <div className={`w-2 h-2 rounded-full bg-${getStatusColor()} mr-2`} />}
              {getStatusText()}
            </Badge>
            <span className="text-sm text-muted-foreground">{round}</span>
          </div>
          
          {status === "live" && (
            <div className="flex items-center space-x-2 text-neonGreen">
              <Timer className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-mono">02:45</span>
            </div>
          )}
        </div>

        {/* Main Battle */}
        <div className="relative p-6">
          <div className="flex items-center gap-6">
            <PilotCard 
              pilot={pilot1} 
              side="left" 
              isWinner={winner === 1}
              team={match.pilot1Team}
            />
            
            {/* VS Section - #13: Emojis */}
            <div className="flex flex-col items-center space-y-2 min-w-[120px]">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
                ${status === "live" ? "bg-gradient-winner animate-pulse" : "bg-gradient-card"}
                border-2 border-border
              `}>
                VS
              </div>
              
              {status === "live" && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Zap className="w-3 h-3" />
                  <span>⚡ LARGADA!</span>
                </div>
              )}
            </div>

            <PilotCard 
              pilot={pilot2} 
              side="right" 
              isWinner={winner === 2}
              team={match.pilot2Team}
            />
          </div>

          {/* Betting Heatmap */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Apostas Distribuição</span>
              <span>{bets.pilot1 + bets.pilot2}% apostado</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-neonGreen to-neonYellow transition-all duration-500"
                style={{ width: `${bets.pilot1}%` }}
              />
              <div 
                className="absolute right-0 top-0 h-full bg-gradient-to-l from-destructive to-orange-500 transition-all duration-500"
                style={{ width: `${bets.pilot2}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neonGreen">{pilot1.name} {bets.pilot1}%</span>
              <span className="text-destructive">{pilot2.name} {bets.pilot2}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};