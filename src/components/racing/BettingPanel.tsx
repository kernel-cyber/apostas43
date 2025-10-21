import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, AlertTriangle, Activity, CheckCircle } from "lucide-react";
import { useBetting } from "@/hooks/useBetting";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface BettingPanelProps {
  matchId: string;
  pilot1Id: string;
  pilot2Id: string;
  pilot1Name: string;
  pilot2Name: string;
  userPoints: number;
  userId: string;
  onBetSuccess: () => void;
}

export const BettingPanel = ({ 
  matchId, 
  pilot1Id, 
  pilot2Id, 
  pilot1Name, 
  pilot2Name, 
  userPoints, 
  userId,
  onBetSuccess 
}: BettingPanelProps) => {
  const [betAmount, setBetAmount] = useState("");
  const [selectedPilot, setSelectedPilot] = useState<string | null>(null);
  const { odds, placeBet, loading, existingBet, checkExistingBet, lastUpdate } = useBetting(matchId);
  const { playBetPlaced } = useSoundEffects();

  useEffect(() => {
    if (userId && matchId) {
      checkExistingBet(userId);
    }
  }, [userId, matchId, checkExistingBet]);

  const quickBets = [50, 100, 250, 500, 1000];
  
  const handleBet = async () => {
    const amount = parseInt(betAmount);
    
    if (!selectedPilot || !amount || amount <= 0 || amount > userPoints) {
      return;
    }

    const result = await placeBet(userId, selectedPilot, amount);
    
    if (result.success) {
      playBetPlaced();
      setBetAmount("");
      setSelectedPilot(null);
      onBetSuccess();
      checkExistingBet(userId);
    }
  };

  // Se já apostou, mostrar card informativo
  if (existingBet) {
    const pilotName = existingBet.pilot_id === pilot1Id ? pilot1Name : pilot2Name;
    
    return (
      <Card className="bg-trackDark border-racing-green/30 shadow-card mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-racing-green" />
              <span>Aposta Realizada</span>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-card rounded-lg border border-racing-green/20">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Piloto escolhido:</span>
                <span className="font-bold text-racing-green">{pilotName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Valor apostado:</span>
                <span className="font-bold text-racing-yellow">{existingBet.amount} pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Possível retorno:</span>
                <span className="font-bold text-neonGreen">
                  {Math.round(existingBet.amount * (existingBet.pilot_id === pilot1Id ? (odds?.pilot1_odds || 1) : (odds?.pilot2_odds || 1)))} pts
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2 text-xs text-muted-foreground p-2 bg-background rounded border border-border">
            <AlertTriangle className="w-3 h-3 mt-0.5" />
            <span>
              Você já possui uma aposta neste match. Aguarde o resultado!
            </span>
          </div>

          {/* Live Stats */}
          {odds && (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                <span>Distribuição de apostas</span>
                <Badge variant="outline" className="animate-pulse border-racing-green text-racing-green">
                  <Activity className="w-3 h-3 mr-1" />
                  Ao vivo
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-base md:text-lg font-bold text-neonGreen">{odds.pilot1_percentage}%</div>
                  <div className="text-xs text-muted-foreground truncate">{pilot1Name}</div>
                </div>
                <div className="text-center">
                  <div className="text-base md:text-lg font-bold text-destructive">{odds.pilot2_percentage}%</div>
                  <div className="text-xs text-muted-foreground truncate">{pilot2Name}</div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-trackDark border-border shadow-card mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-neonYellow" />
            <span>Apostar</span>
          </div>
          <Badge variant="outline" className="border-neonGreen text-neonGreen">
            <Coins className="w-3 h-3 mr-1" />
            {userPoints.toLocaleString()} pts
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pilot Selection */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={selectedPilot === pilot1Id ? "default" : "outline"}
            onClick={() => setSelectedPilot(pilot1Id)}
            className={`h-auto py-3 ${selectedPilot === pilot1Id ? "bg-gradient-winner" : ""}`}
          >
            <div className="text-center w-full">
              <div className="font-semibold text-sm md:text-base truncate">{pilot1Name}</div>
              <div className="text-xs opacity-80">
                Odds: {odds?.pilot1_odds.toFixed(2)}x
              </div>
            </div>
          </Button>
          <Button
            variant={selectedPilot === pilot2Id ? "default" : "outline"}
            onClick={() => setSelectedPilot(pilot2Id)}
            className={`h-auto py-3 ${selectedPilot === pilot2Id ? "bg-gradient-winner" : ""}`}
          >
            <div className="text-center w-full">
              <div className="font-semibold text-sm md:text-base truncate">{pilot2Name}</div>
              <div className="text-xs opacity-80">
                Odds: {odds?.pilot2_odds.toFixed(2)}x
              </div>
            </div>
          </Button>
        </div>

        {/* Quick Bet Amounts */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Valores rápidos:</label>
          <div className="grid grid-cols-5 gap-2">
            {quickBets.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setBetAmount(amount.toString())}
                disabled={amount > userPoints}
                className={`text-xs ${amount > userPoints ? "opacity-50" : ""}`}
              >
                {amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Valor personalizado:</label>
          <Input
            type="number"
            placeholder="Digite o valor"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            className="bg-background"
            max={userPoints}
          />
        </div>

        {/* Bet Summary */}
        {betAmount && selectedPilot && odds && (
          <div className="p-3 bg-gradient-card rounded-lg border border-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-sm">
              <span className="text-xs sm:text-sm">Aposta: {parseInt(betAmount).toLocaleString()} pts</span>
              <span className="text-neonGreen font-semibold text-xs sm:text-sm">
                Retorno: {Math.round(parseInt(betAmount) * (selectedPilot === pilot1Id ? odds.pilot1_odds : odds.pilot2_odds)).toLocaleString()} pts
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleBet}
          disabled={!betAmount || !selectedPilot || loading}
          className="w-full bg-gradient-winner hover:shadow-neon text-sm md:text-base"
        >
          {loading ? (
            "Processando..."
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Confirmar Aposta
            </>
          )}
        </Button>

        {/* Warning */}
        <div className="flex items-start space-x-2 text-xs text-muted-foreground p-2 bg-destructive/10 rounded border border-destructive/20">
          <AlertTriangle className="w-3 h-3 mt-0.5 text-destructive" />
          <span>
            As apostas são apenas por diversão com pontos virtuais. 
            Aposte com responsabilidade.
          </span>
        </div>

        {/* Live Stats */}
        {odds && (
          <>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
              <span>Distribuição de apostas</span>
              <Badge variant="outline" className="animate-pulse border-racing-green text-racing-green">
                <Activity className="w-3 h-3 mr-1" />
                Ao vivo
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-base md:text-lg font-bold text-neonGreen">{odds.pilot1_percentage}%</div>
                <div className="text-xs text-muted-foreground truncate">{pilot1Name}</div>
              </div>
              <div className="text-center">
                <div className="text-base md:text-lg font-bold text-destructive">{odds.pilot2_percentage}%</div>
                <div className="text-xs text-muted-foreground truncate">{pilot2Name}</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
