import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BettingPanel } from "./BettingPanel";
import { 
  Trophy, Zap, Target, TrendingUp, Star, Medal, Crown, Flame, LogOut, Settings
} from "lucide-react";

interface PilotData {
  name: string;
  car: string;
  position: number;
  wins: number;
  losses: number;
  avatar: string;
  winRate: number;
  bestTime: string;
  recentForm: string[];
}

interface LiveRace {
  id: string;
  pilot1: PilotData;
  pilot2: PilotData;
  pilot1Id: string;
  pilot2Id: string;
  event: string;
  round: string;
  status: "live" | "upcoming" | "finished";
  bets: { pilot1: number; pilot2: number };
  totalPool: number;
  totalBets: number;
  odds: { pilot1: number; pilot2: number };
}

interface LiveEventCardProps {
  race: LiveRace;
  userPoints: number;
  userId: string;
  onBetSuccess: () => void;
  isNew?: boolean;
}

export const LiveEventCard = ({ race, userPoints, userId, onBetSuccess, isNew = false }: LiveEventCardProps) => {
  const { pilot1, pilot2, pilot1Id, pilot2Id, event, round, status, bets, totalPool, totalBets, odds } = race;

  const FormIndicator = ({ form }: { form: string[] }) => (
    <div className="flex space-x-1">
      {form.map((result, i) => (
        <div 
          key={i}
          className={`w-2 h-2 rounded-full ${
            result === 'W' ? 'bg-neonGreen' : 'bg-destructive'
          }`}
        />
      ))}
    </div>
  );

  const PilotCard = ({ pilot, side, odds }: { pilot: PilotData; side: "left" | "right"; odds: number }) => (
    <div className={`
      glass-card p-4 sm:p-6 rounded-2xl transition-all duration-500 hover:shadow-neon
      ${side === "left" ? "text-left" : "text-right"}
    `}>
      <div className="space-y-3 sm:space-y-4">
        {/* Avatar & Position */}
        <div className={`flex items-center ${side === "right" ? "flex-row-reverse space-x-reverse" : ""} space-x-3 sm:space-x-4`}>
          <div className="text-3xl sm:text-4xl">{pilot.avatar}</div>
          <div className={`flex-1 min-w-0 ${side === "right" ? "text-right" : ""}`}>
            <Badge variant="outline" className="text-[10px] sm:text-xs mb-1 sm:mb-2">
              #{pilot.position} • {pilot.winRate}% WR
            </Badge>
            <h3 className="text-base sm:text-xl font-bold text-foreground truncate">{pilot.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{pilot.car}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div>
            <div className="text-base sm:text-lg font-bold text-neonGreen">{pilot.wins}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Wins</div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold text-destructive">{pilot.losses}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Losses</div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold text-accent">{pilot.bestTime}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Best</div>
          </div>
        </div>

        {/* Recent Form */}
        <div className={`flex items-center space-x-2 ${side === "right" ? "flex-row-reverse space-x-reverse" : ""}`}>
          <span className="text-[10px] sm:text-xs text-muted-foreground">Form:</span>
          <FormIndicator form={pilot.recentForm} />
        </div>

        {/* Odds */}
        <div className="text-center p-2 sm:p-3 bg-gradient-card rounded-lg">
          <div className="text-xl sm:text-2xl font-bold premium-gradient-text">{odds.toFixed(2)}x</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">Odds de vitória</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-6xl mx-auto space-y-6 ${isNew ? 'animate-slide-in-top' : ''}`}>
      {/* Event Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <Badge variant="outline" className="border-accent text-accent px-4 py-2 text-lg">
            {event}
          </Badge>
          <h2 className="text-2xl font-bold">{round}</h2>
        </div>

        {/* Live Status */}
        <div className="flex justify-center">
          <div className="glass-card px-4 sm:px-6 py-3 rounded-full">
            <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-neonGreen animate-pulse" />
                <span className="text-neonGreen font-bold">AO VIVO</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center space-x-2">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="hidden sm:inline">{totalBets} apostas</span>
                <span className="sm:hidden">{totalBets}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Battle Card */}
      <Card className="glass-card border-2 border-primary/20 shadow-neon overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>

            {/* Pilots Battle */}
            <div className="relative p-4 sm:p-6 md:p-8">
              <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-center">
                {/* Pilot 1 */}
                <PilotCard pilot={pilot1} side="left" odds={odds.pilot1} />
                
                {/* VS Section */}
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-winner flex items-center justify-center text-4xl font-black text-black shadow-gold">
                      VS
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-neonGreen flex items-center justify-center">
                      <Flame className="w-4 h-4 text-black" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Posição em disputa</div>
                    <div className="text-lg font-bold premium-gradient-text">
                      #{Math.min(pilot1.position, pilot2.position)}
                    </div>
                  </div>
                </div>

                {/* Pilot 2 */}
                <PilotCard pilot={pilot2} side="right" odds={odds.pilot2} />
              </div>

      {/* Betting Heatmap */}
              <div className="mt-8 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between text-sm gap-2">
                  <span className="text-muted-foreground text-xs sm:text-sm">Distribuição das Apostas</span>
                  <span className="text-accent font-semibold text-xs sm:text-sm">
                    Pool: {totalPool.toLocaleString()} pts
                  </span>
                </div>
                
                <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-neonGreen to-accent transition-all duration-1000"
                    style={{ width: `${bets.pilot1}%` }}
                  />
                  <div 
                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-destructive to-orange-500 transition-all duration-1000"
                    style={{ width: `${bets.pilot2}%` }}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between text-sm gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-neonGreen" />
                    <span className="text-xs sm:text-sm truncate">{pilot1.name}: {bets.pilot1}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm truncate">{pilot2.name}: {bets.pilot2}%</span>
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Betting Panel */}
      <BettingPanel 
        matchId={race.id}
        pilot1Id={pilot1Id}
        pilot2Id={pilot2Id}
        pilot1Name={pilot1.name}
        pilot2Name={pilot2.name}
        userPoints={userPoints}
        userId={userId}
        onBetSuccess={onBetSuccess}
      />

      {/* Race Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="glass-card">
          <CardContent className="p-3 md:p-4 text-center">
            <Target className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-primary" />
            <div className="text-base md:text-lg font-bold">NO PREP</div>
            <div className="text-xs text-muted-foreground">Modalidade</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-3 md:p-4 text-center">
            <Trophy className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-neonGreen" />
            <div className="text-base md:text-lg font-bold truncate">{event}</div>
            <div className="text-xs text-muted-foreground">Evento</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card sm:col-span-2 md:col-span-1">
          <CardContent className="p-3 md:p-4 text-center">
            <Star className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-accent" />
            <div className="text-base md:text-lg font-bold">{totalBets}</div>
            <div className="text-xs text-muted-foreground">Apostas Realizadas</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};