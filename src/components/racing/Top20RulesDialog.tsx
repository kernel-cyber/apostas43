import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const Top20RulesDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="w-5 h-5 text-racing-yellow" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-racing-dark border-racing-green/20">
        <DialogHeader>
          <DialogTitle className="text-2xl text-racing-yellow">
            Como Funciona o Sistema TOP 20?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 text-white">
          <div className="space-y-2">
            <h4 className="font-bold text-lg text-racing-green">🏁 Rodada Ímpar:</h4>
            <p className="text-racing-gray leading-relaxed">
              Enfrenta 19x18, 17x16, 15x14, 13x12, 11x10, 9x8, 7x6, 5x4, 3x2.
              O 1º colocado não corre nesta rodada (passa direto).
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-lg text-racing-green">🏁 Rodada Par:</h4>
            <p className="text-racing-gray leading-relaxed">
              Enfrenta 20x19, 18x17, 16x15, 14x13, 12x11, 10x9, 8x7, 6x5, 4x3, 2x1.
              Todos os 20 pilotos correm nesta rodada.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-lg text-racing-green">🔄 Troca de Posições:</h4>
            <p className="text-racing-gray leading-relaxed">
              Se o piloto de posição inferior vencer, ele troca de posição com o adversário.
              Exemplo: Se o 20º vencer o 19º, ele assume a 19ª posição e o perdedor vai para a 20ª.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-lg text-racing-green">📊 Sistema de Pontos:</h4>
            <p className="text-racing-gray leading-relaxed">
              Vencedores ganham +100 pontos, perdedores perdem -50 pontos.
              A classificação final é baseada na posição atual no TOP 20.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
