import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Minus, Crown } from "lucide-react";
import { getRoundLabel } from "@/lib/roundHelpers";

interface CycleTimelineProps {
  matches: any[];
  top20Positions: any[];
}

interface CycleData {
  cycleNumber: number;
  rounds: {
    [key: number]: any[]; // cycle_position -> matches
  };
  positionChanges: Map<string, { from: number; to: number }>;
}

export default function CycleTimeline({ matches, top20Positions }: CycleTimelineProps) {
  // Agrupar matches por ciclo
  const groupMatchesByCycle = () => {
    const finishedMatches = matches
      .filter((m: any) => m.match_status === 'finished')
      .sort((a: any, b: any) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());

    if (finishedMatches.length === 0) return [];

    const cycles = new Map<number, CycleData>();
    
    finishedMatches.forEach((match: any) => {
      const cycleNum = Math.ceil(match.round_number / 2);
      
      if (!cycles.has(cycleNum)) {
        cycles.set(cycleNum, {
          cycleNumber: cycleNum,
          rounds: {},
          positionChanges: new Map()
        });
      }

      const cycle = cycles.get(cycleNum)!;
      const cyclePos = match.cycle_position || 0;
      
      if (!cycle.rounds[cyclePos]) {
        cycle.rounds[cyclePos] = [];
      }
      
      cycle.rounds[cyclePos].push(match);
    });

    return Array.from(cycles.values()).reverse(); // Mais recente primeiro
  };

  const cycles = groupMatchesByCycle();

  const getPilotPosition = (pilotId: string) => {
    return top20Positions?.find(p => p.pilot_id === pilotId)?.position || null;
  };

  const MatchMiniCard = ({ match }: { match: any }) => {
    const pilot1Pos = getPilotPosition(match.pilot1_id);
    const pilot2Pos = getPilotPosition(match.pilot2_id);
    const winnerId = match.winner_id;

    return (
      <div className="bg-muted/50 rounded p-2 space-y-1 text-xs border border-border hover:border-racing-green/30 transition-colors">
        {/* Winner */}
        <div className={`flex items-center gap-1 ${winnerId === match.pilot1_id ? 'text-green-400' : 'text-muted-foreground'}`}>
          {winnerId === match.pilot1_id && <Crown className="w-3 h-3 text-racing-yellow" />}
          <span className="font-medium">#{pilot1Pos}</span>
          <span className="truncate flex-1">{match.pilot1?.name}</span>
          <span className="font-bold">{winnerId === match.pilot1_id ? 'W' : 'L'}</span>
        </div>
        {/* Loser */}
        <div className={`flex items-center gap-1 ${winnerId === match.pilot2_id ? 'text-green-400' : 'text-muted-foreground'}`}>
          {winnerId === match.pilot2_id && <Crown className="w-3 h-3 text-racing-yellow" />}
          <span className="font-medium">#{pilot2Pos}</span>
          <span className="truncate flex-1">{match.pilot2?.name}</span>
          <span className="font-bold">{winnerId === match.pilot2_id ? 'W' : 'L'}</span>
        </div>
      </div>
    );
  };

  const CycleCard = ({ cycle, isLatest }: { cycle: CycleData; isLatest: boolean }) => {
    const roundKeys = Object.keys(cycle.rounds).map(Number).sort();
    const totalMatches = Object.values(cycle.rounds).flat().length;

    return (
      <div className="relative">
        {/* Connecting line */}
        {!isLatest && (
          <div className="absolute left-1/2 -top-4 w-0.5 h-4 bg-gradient-to-b from-racing-green to-transparent" />
        )}

        <Card className={`bg-background border-2 transition-all ${
          isLatest ? 'border-racing-green shadow-neon' : 'border-border'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant={isLatest ? "default" : "outline"} className="text-sm">
                  Ciclo {cycle.cycleNumber}
                </Badge>
                {isLatest && (
                  <span className="text-xs text-racing-green font-normal">Mais Recente</span>
                )}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {totalMatches} match{totalMatches !== 1 ? 'es' : ''}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {roundKeys.map((cyclePos) => {
              const roundMatches = cycle.rounds[cyclePos] || [];
              const roundLabel = getRoundLabel(cyclePos, roundMatches[0]?.round_number || 0);

              return (
                <div key={cyclePos} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-accent">
                      {roundLabel.emoji} {roundLabel.cycleLabel}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                    <Badge variant="secondary" className="text-xs">
                      Rodada {roundMatches[0]?.round_number}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {roundMatches.map((match: any) => (
                      <MatchMiniCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (cycles.length === 0) {
    return (
      <Card className="bg-background border-border">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Nenhum ciclo completo ainda. Complete matches para ver a evolução!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-accent">Evolução por Ciclos</h3>
        <p className="text-sm text-muted-foreground">
          Visualize a progressão do evento através dos ciclos de rodadas
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {cycles.map((cycle, index) => (
          <CycleCard key={cycle.cycleNumber} cycle={cycle} isLatest={index === 0} />
        ))}
      </div>

      {/* Stats Summary */}
      <Card className="bg-muted/50 border-border">
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-accent">{cycles.length}</p>
              <p className="text-xs text-muted-foreground">Ciclos Completos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">
                {matches.filter((m: any) => m.match_status === 'finished').length}
              </p>
              <p className="text-xs text-muted-foreground">Matches Finalizados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-racing-green">
                {cycles.length * 2}
              </p>
              <p className="text-xs text-muted-foreground">Rodadas Completas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-racing-yellow">
                {cycles[0]?.cycleNumber || 0}
              </p>
              <p className="text-xs text-muted-foreground">Ciclo Atual</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
