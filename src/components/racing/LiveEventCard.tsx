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
  pilot1Team?: string;
  pilot2Team?: string;
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

  const PilotCard = ({ pilot, side, odds, team }: { pilot: PilotData; side: "left" | "right"; odds: number; team?: string }) => (
    <div className={`
      glass-card p-4 sm:p-6 rounded-2xl transition-all duration-500 hover:shadow-neon
      ${side === "left" ? "text-left" : "text-right"}
    `}>
      <div className="space-y-3 sm:space-y-4">
        {/* Avatar & Position - #4: Exibir foto real */}
        <div className={`flex items-center ${side === "right" ? "flex-row-reverse space-x-reverse" : ""} space-x-3 sm:space-x-4`}>
          <div className="text-3xl sm:text-4xl">{pilot.avatar}</div>
          <div className={`flex-1 min-w-0 ${side === "right" ? "text-right" : ""}`}>
            <Badge variant="outline" className="text-[10px] sm:text-xs mb-1 sm:mb-2 text-neonGreen">
              #{pilot.position} • {pilot.winRate}% WR
            </Badge>
            {/* #15: Cores padronizadas */}
            <h3 className="text-base sm:text-xl font-bold text-white truncate">{pilot.name}</h3>
            <p className="text-xs sm:text-sm text-racing-yellow truncate">🚗 {pilot.car}</p>
            {team && <p className="text-xs text-blue-400 truncate">🏁 {team}</p>}
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

        {/* Recent Form - #14: Label mais clara */}
        <div className={`flex items-center space-x-2 ${side === "right" ? "flex-row-reverse space-x-reverse" : ""}`}>
          <span className="text-[10px] sm:text-xs text-muted-foreground" title="Últimas 5 corridas">Forma Recente:</span>
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

        {/* Betting Distribution */}
        <div className="glass-card p-4 rounded-lg max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-sm text-muted-foreground">Distribuição de apostas</span>
            <Badge variant="outline" className="animate-pulse border-racing-green text-racing-green text-xs">
              Ao vivo
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-neonGreen transition-all duration-700">{bets.pilot1.toFixed(1)}%</div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden mt-2">
                <div 
                  className="bg-neonGreen h-2 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${bets.pilot1 || 0}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground truncate mt-2">{pilot1.name}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive transition-all duration-700">{bets.pilot2.toFixed(1)}%</div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden mt-2">
                <div 
                  className="bg-destructive h-2 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${bets.pilot2 || 0}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground truncate mt-2">{pilot2.name}</div>
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
                <PilotCard pilot={pilot1} side="left" odds={odds.pilot1} team={race.pilot1Team} />
                
                {/* VS Section - #13: Emoji fogo */}
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
                    <div className="text-sm text-muted-foreground">⚡ Posição em disputa</div>
                    <div className="text-lg font-bold premium-gradient-text">
                      #{Math.min(pilot1.position, pilot2.position)}
                    </div>
                  </div>
                </div>

                {/* Pilot 2 */}
                <PilotCard pilot={pilot2} side="right" odds={odds.pilot2} team={race.pilot2Team} />
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

      {/* #18: Cards redundantes removidos - informações já aparecem no header/status */}
    </div>
  );
};