import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trophy, 
  Zap, 
  AlertCircle,
  CheckCircle,
  Crown,
  Target
} from 'lucide-react';

export default function AdminGuide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Guia Administrativo Área 43
            </h1>
            <p className="text-muted-foreground mt-2">
              Como gerenciar eventos, matches e chaveamentos
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Admin
          </Button>
        </div>

        {/* Sistema TOP 20 */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-racing-yellow" />
              Sistema TOP 20 (Lista 43)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-foreground">Como Funciona:</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>
                  <strong className="text-foreground">Rodadas Ímpares:</strong> 19x18, 17x16, 15x14, 13x12, 11x10, 9x8, 7x6, 5x4, 3x2
                </li>
                <li>
                  <strong className="text-foreground">Rodadas Pares:</strong> 20x19, 18x17, 16x15, 14x13, 12x11, 10x9, 8x7, 6x5, 4x3, 2x1
                </li>
                <li>
                  <strong className="text-foreground">Regra Principal:</strong> Vencedor assume a posição do perdedor (sobe no ranking)
                </li>
                <li>
                  <strong className="text-foreground">Ausências:</strong> 2 faltas consecutivas = desligamento automático
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6">Passo a Passo:</h3>
              <ol className="text-muted-foreground space-y-3 list-decimal list-inside">
                <li>
                  Vá na aba <strong className="text-foreground">TOP 20</strong> e inicialize as 20 posições
                </li>
                <li>
                  Atribua pilotos às posições clicando em cada card
                </li>
                <li>
                  Crie um evento na aba <strong className="text-foreground">Eventos</strong>
                </li>
                <li>
                  Vá na aba <strong className="text-foreground">Chaveamento</strong> e selecione o tipo (ímpar ou par)
                </li>
                <li>
                  Clique em "Visualizar Preview" para ver os matches
                </li>
                <li>
                  Clique em "Criar Matches" - todos serão criados automaticamente!
                </li>
                <li>
                  Durante o evento, inicie e finalize cada match
                </li>
                <li>
                  As posições do TOP 20 são atualizadas automaticamente!
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-racing-yellow" />
              Sistema de Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground">
                Os usuários recebem notificações em tempo real para:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-racing-green" />
                  Match finalizado com o vencedor declarado
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-racing-green" />
                  Novo match disponível para apostas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-racing-green" />
                  Atualização de status dos matches
                </li>
              </ul>

              <div className="bg-muted p-4 rounded-lg mt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-racing-yellow mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Importante:</p>
                    <p className="text-sm text-muted-foreground">
                      As notificações funcionam automaticamente. Quando você finaliza um match,
                      todos os usuários online recebem a notificação instantaneamente!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dicas Rápidas */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Dicas Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle className="h-5 w-5 text-racing-green mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Geração Automática</p>
                  <p className="text-sm text-muted-foreground">
                    Use o gerador de chaveamento para criar todos os matches de uma vez
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle className="h-5 w-5 text-racing-green mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Preview Primeiro</p>
                  <p className="text-sm text-muted-foreground">
                    Sempre visualize o preview antes de criar os matches
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle className="h-5 w-5 text-racing-green mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Posições Automáticas</p>
                  <p className="text-sm text-muted-foreground">
                    Após finalizar matches do TOP 20, as posições são atualizadas automaticamente
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <AlertCircle className="h-5 w-5 text-racing-yellow mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Cuidado com Exclusões</p>
                  <p className="text-sm text-muted-foreground">
                    Deletar um match é permanente. Tenha certeza antes de confirmar!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
