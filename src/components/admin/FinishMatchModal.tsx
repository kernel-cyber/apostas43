import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMatches } from '@/hooks/useMatches';
import { Trophy } from 'lucide-react';

interface FinishMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: any;
}

export default function FinishMatchModal({ open, onOpenChange, match }: FinishMatchModalProps) {
  const { finishMatch } = useMatches();

  const handleSelectWinner = async (winnerId: string) => {
    await finishMatch.mutateAsync({ matchId: match.id, winnerId });
    onOpenChange(false);
  };

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border-racing-yellow/20 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            🏆 Declarar Vencedor
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Selecione o piloto vencedor. Os pontos serão distribuídos e as posições atualizadas automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Button
            className="w-full h-auto py-6 bg-secondary/80 hover:bg-secondary border-2 border-racing-yellow/40 hover:border-racing-yellow transition-all"
            onClick={() => handleSelectWinner(match.pilot1.id)}
            disabled={finishMatch.isPending}
          >
            <div className="flex items-center gap-4 w-full">
              {match.pilot1.image_url && (
                <img
                  src={match.pilot1.image_url}
                  alt={match.pilot1.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-racing-yellow/50"
                />
              )}
              <div className="text-left flex-1">
                <p className="text-xl font-bold text-white">{match.pilot1.name}</p>
                <p className="text-sm text-racing-yellow font-semibold">{match.pilot1.car_name}</p>
              </div>
              <Trophy className="h-8 w-8 text-racing-yellow" />
            </div>
          </Button>

          <div className="text-center text-racing-yellow font-bold text-lg">VS</div>

          <Button
            className="w-full h-auto py-6 bg-secondary/80 hover:bg-secondary border-2 border-racing-yellow/40 hover:border-racing-yellow transition-all"
            onClick={() => handleSelectWinner(match.pilot2.id)}
            disabled={finishMatch.isPending}
          >
            <div className="flex items-center gap-4 w-full">
              {match.pilot2.image_url && (
                <img
                  src={match.pilot2.image_url}
                  alt={match.pilot2.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-racing-yellow/50"
                />
              )}
              <div className="text-left flex-1">
                <p className="text-xl font-bold text-white">{match.pilot2.name}</p>
                <p className="text-sm text-racing-yellow font-semibold">{match.pilot2.car_name}</p>
              </div>
              <Trophy className="h-8 w-8 text-racing-yellow" />
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
