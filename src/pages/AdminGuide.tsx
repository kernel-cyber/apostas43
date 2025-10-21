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

        {/* Sistema de 4 Ciclos */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-racing-yellow" />
              Sistema de 4 Ciclos - TOP 20
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-invert max-w-none">
              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="font-semibold text-foreground mb-2">⚠️ IMPORTANTE: Entenda o Ciclo Completo</p>
                <p className="text-sm text-muted-foreground">
                  Cada evento completo deve seguir <strong>4 etapas obrigatórias</strong> para garantir que todos os pilotos participem de forma justa:
                </p>
              </div>

              <div className="grid gap-4 mt-4">
                <div className="border border-blue-500/30 bg-blue-500/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-blue-500/20">1ª ETAPA</Badge>
                    <span className="font-bold text-foreground">1ª Rodada Ímpar</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>🔵 <strong>9 matches:</strong> 19x18, 17x16, 15x14, 13x12, 11x10, 9x8, 7x6, 5x4, 3x2</li>
                    <li>🚫 <strong>Não correm:</strong> 1º e 20º (ficam parados)</li>
                    <li>✅ Vencedor assume a posição do perdedor</li>
                  </ul>
                </div>

                <div className="border border-green-500/30 bg-green-500/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-green-500/20">2ª ETAPA</Badge>
                    <span className="font-bold text-foreground">1ª Rodada Par</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>🟢 <strong>10 matches:</strong> 20x19, 18x17, 16x15, 14x13, 12x11, 10x9, 8x7, 6x5, 4x3, 2x1</li>
                    <li>✅ <strong>TODOS correm</strong> (incluindo 1º e 20º)</li>
                    <li>✅ Vencedor assume a posição do perdedor</li>
                  </ul>
                </div>

                <div className="border border-blue-500/30 bg-blue-500/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-blue-500/20">3ª ETAPA</Badge>
                    <span className="font-bold text-foreground">2ª Rodada Ímpar</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>🔵 <strong>9 matches:</strong> 19x18, 17x16, 15x14, 13x12, 11x10, 9x8, 7x6, 5x4, 3x2</li>
                    <li>🚫 <strong>Não correm:</strong> 1º e 20º (ficam parados novamente)</li>
                    <li>✅ Vencedor assume a posição do perdedor</li>
                  </ul>
                </div>

                <div className="border border-green-500/30 bg-green-500/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-green-500/20">4ª ETAPA</Badge>
                    <span className="font-bold text-foreground">2ª Rodada Par</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>🟢 <strong>10 matches:</strong> 20x19, 18x17, 16x15, 14x13, 12x11, 10x9, 8x7, 6x5, 4x3, 2x1</li>
                    <li>✅ <strong>TODOS correm</strong> (incluindo 1º e 20º)</li>
                    <li>🏁 Ciclo completo! Pode iniciar novo ciclo se desejar</li>
                  </ul>
                </div>
              </div>

              <div className="bg-racing-yellow/10 border border-racing-yellow/30 p-4 rounded-lg mt-4">
                <p className="font-semibold text-racing-yellow mb-2">💡 Dica Importante:</p>
                <p className="text-sm text-muted-foreground">
                  O sistema <strong>sugere automaticamente</strong> qual tipo de rodada criar com base no histórico. 
                  Você verá mensagens como "Faltam 2 etapas para completar o ciclo" ou "Ciclo completo! Pronto para iniciar novo ciclo".
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passo a Passo Completo */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-racing-yellow" />
              Passo a Passo: Gerenciar Evento Completo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-foreground">1️⃣ Preparação Inicial</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Aba "Pilotos":</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>✅ Cadastre todos os pilotos que participarão</li>
                  <li>✅ Preencha nome, carro, modelo, equipe, melhor tempo</li>
                  <li>✅ Adicione foto do piloto (opcional mas recomendado)</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2 mt-3">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Aba "TOP 20":</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>✅ Clique em "Inicializar Todas as Posições" (apenas na primeira vez)</li>
                  <li>✅ Clique em cada card de posição (1 a 20)</li>
                  <li>✅ Selecione o piloto para aquela posição</li>
                  <li>✅ As posições são a base para geração dos matches!</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-6">2️⃣ Criar Evento</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Aba "Eventos":</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>✅ Clique em "Criar Novo Evento"</li>
                  <li>✅ Preencha nome (ex: "Campeonato Área 43 - Etapa 1")</li>
                  <li>✅ Adicione descrição (opcional)</li>
                  <li>✅ Escolha o tipo: <strong>TOP 20</strong> ou Regular</li>
                  <li>✅ Defina data e hora do evento</li>
                  <li>✅ Marque como "Evento Ativo" se for iniciar agora</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-6">3️⃣ Gerar Chaveamento (Matches)</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Aba "Chaveamento":</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>✅ Selecione o evento criado</li>
                  <li>✅ O sistema sugerirá automaticamente o tipo de rodada (Ímpar ou Par)</li>
                  <li>✅ Você verá o status: "1ª Rodada Ímpar" ou "Faltam X etapas para completar ciclo"</li>
                  <li>✅ Defina data e hora de início dos matches</li>
                  <li>✅ Clique em "Gerar Preview" para visualizar os matches</li>
                  <li>✅ Confira se os enfrentamentos estão corretos</li>
                  <li>✅ Clique em "Criar Todos os Matches" - serão criados com 15min de intervalo</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-6">4️⃣ Durante o Evento</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Aba "Matches":</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>🎯 Você verá todos os matches criados com status "Agendado"</li>
                  <li>🎯 Quando chegar a hora, clique em "Iniciar Match"</li>
                  <li>🎯 O status muda para "Em Progresso" e apostas são <strong>bloqueadas automaticamente</strong></li>
                  <li>🎯 Usuários não podem mais apostar neste match</li>
                  <li>🎯 Após a corrida, clique em "Finalizar Match"</li>
                  <li>🎯 Selecione o vencedor</li>
                  <li>🎯 O sistema automaticamente:
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Distribui pontos para os apostadores que acertaram</li>
                      <li>• Atualiza estatísticas dos pilotos</li>
                      <li>• <strong>Troca posições no TOP 20</strong> (vencedor sobe)</li>
                      <li>• Atualiza standings do evento</li>
                      <li>• Envia notificações para todos os usuários</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-6">5️⃣ Continuar o Ciclo</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">
                  Após finalizar todos os matches de uma etapa:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>✅ Volte para aba "Chaveamento"</li>
                  <li>✅ O sistema já sugerirá automaticamente a próxima rodada</li>
                  <li>✅ Exemplo: se você fez "1ª Rodada Ímpar", sugerirá "1ª Rodada Par"</li>
                  <li>✅ Repita o processo de gerar preview e criar matches</li>
                  <li>✅ Complete as 4 etapas para um ciclo completo!</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Funcionalidades por Aba */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Funcionalidades por Aba
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-bold text-foreground mb-2">📊 Estatísticas</h4>
                <p className="text-sm text-muted-foreground">
                  • Visualize total de pilotos cadastrados, eventos criados, matches realizados<br/>
                  • Acompanhe total de apostas e usuários ativos<br/>
                  • Veja quem está online em tempo real
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold text-foreground mb-2">🏎️ Pilotos</h4>
                <p className="text-sm text-muted-foreground">
                  • Cadastre novos pilotos com todas as informações<br/>
                  • Edite dados existentes (nome, carro, equipe, tempo)<br/>
                  • Faça upload de fotos dos pilotos<br/>
                  • Delete pilotos (cuidado: não pode ter matches associados)
                </p>
              </div>

              <div className="border-l-4 border-racing-yellow pl-4">
                <h4 className="font-bold text-foreground mb-2">👑 TOP 20</h4>
                <p className="text-sm text-muted-foreground">
                  • Inicialize as 20 posições (apenas uma vez)<br/>
                  • Atribua pilotos para cada posição clicando nos cards<br/>
                  • Reordene posições arrastando os cards<br/>
                  • As posições são atualizadas automaticamente após matches<br/>
                  • Acompanhe ausências consecutivas (2 faltas = desligamento)
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-bold text-foreground mb-2">📅 Eventos</h4>
                <p className="text-sm text-muted-foreground">
                  • Crie eventos do tipo TOP 20 ou Regular<br/>
                  • Defina nome, descrição, data e hora<br/>
                  • Marque como "Ativo" para aparecer na home<br/>
                  • Edite eventos existentes<br/>
                  • Visualize standings (classificação) do evento<br/>
                  • Delete eventos (cuidado: deleta todos os matches associados)
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-bold text-foreground mb-2">⚔️ Chaveamento</h4>
                <p className="text-sm text-muted-foreground">
                  • Gere matches automaticamente seguindo regras TOP 20<br/>
                  • Sistema sugere automaticamente próxima rodada (Ímpar ou Par)<br/>
                  • Veja status do ciclo: "Faltam X etapas para completar"<br/>
                  • Preview antes de criar (confira os enfrentamentos)<br/>
                  • Matches criados com 15 minutos de intervalo automático<br/>
                  • Sistema salva histórico de rodadas
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-bold text-foreground mb-2">🏁 Matches</h4>
                <p className="text-sm text-muted-foreground">
                  • Veja todos os matches: Agendados, Em Progresso, Finalizados<br/>
                  • <strong>Iniciar Match:</strong> Muda status e bloqueia apostas automaticamente<br/>
                  • <strong>Finalizar Match:</strong> Seleciona vencedor e sistema processa tudo:<br/>
                  &nbsp;&nbsp;→ Distribui pontos aos apostadores vencedores<br/>
                  &nbsp;&nbsp;→ Atualiza estatísticas dos pilotos<br/>
                  &nbsp;&nbsp;→ Troca posições TOP 20<br/>
                  &nbsp;&nbsp;→ Envia notificações em tempo real<br/>
                  • Delete matches individualmente se necessário
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Notificações e Apostas */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-racing-yellow" />
              Sistema de Notificações e Apostas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-foreground">Notificações Automáticas</h3>
              <p className="text-sm text-muted-foreground mb-3">
                O sistema envia notificações em tempo real para todos os usuários online quando:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-racing-green mt-1 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-foreground">Match Finalizado:</strong> Mostra vencedor, odds e pontos distribuídos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-racing-green mt-1 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-foreground">Novo Match Disponível:</strong> Alerta quando um novo match é aberto para apostas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-racing-green mt-1 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-foreground">Match Iniciado:</strong> Avisa que apostas foram bloqueadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-racing-green mt-1 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-foreground">Vitória em Aposta:</strong> Usuário recebe notificação quando ganha pontos</span>
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6">Controle de Apostas</h3>
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <p className="font-semibold text-foreground mb-1">🟢 Apostas Abertas</p>
                  <p className="text-sm text-muted-foreground">
                    • Match com status "Agendado" → Usuários podem apostar<br/>
                    • Odds são calculadas em tempo real baseado nas apostas<br/>
                    • Quanto mais apostas em um piloto, menor o retorno
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">🔴 Apostas Bloqueadas</p>
                  <p className="text-sm text-muted-foreground">
                    • Quando você clica "Iniciar Match"<br/>
                    • Campo <code className="bg-background px-1 rounded">betting_locked</code> é marcado como TRUE<br/>
                    • Usuários veem "Apostas Encerradas" e não podem mais apostar<br/>
                    • Garante justiça (ninguém aposta depois de saber o resultado)
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">🏆 Finalização</p>
                  <p className="text-sm text-muted-foreground">
                    • Ao finalizar, sistema calcula automaticamente:<br/>
                    • Pontos ganhos = <code className="bg-background px-1 rounded">valor_aposta × odds</code><br/>
                    • Exemplo: aposta 100pts com odds 2.5 = ganha 250pts<br/>
                    • Pontos são creditados instantaneamente
                  </p>
                </div>
              </div>

              <div className="bg-racing-yellow/10 border border-racing-yellow/30 p-4 rounded-lg mt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-racing-yellow mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-racing-yellow mb-1">Importante:</p>
                    <p className="text-sm text-muted-foreground">
                      Tudo é automático! Você só precisa:<br/>
                      1. Iniciar match (bloqueia apostas)<br/>
                      2. Finalizar match + escolher vencedor (distribui pontos)<br/>
                      O resto acontece sozinho: notificações, atualizações, trocas de posição.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Melhores Práticas e Troubleshooting */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Melhores Práticas e Solução de Problemas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-racing-green" />
                  Melhores Práticas
                </h4>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <span className="text-racing-yellow font-bold">✅</span>
                    <div>
                      <p className="font-semibold text-foreground">Sempre use o gerador automático de chaveamento</p>
                      <p className="text-sm text-muted-foreground">
                        Evita erros humanos e garante que os enfrentamentos sigam as regras TOP 20
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <span className="text-racing-yellow font-bold">✅</span>
                    <div>
                      <p className="font-semibold text-foreground">Confira o preview antes de criar</p>
                      <p className="text-sm text-muted-foreground">
                        Veja se os enfrentamentos estão corretos. Depois de criar não dá pra alterar em lote.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <span className="text-racing-yellow font-bold">✅</span>
                    <div>
                      <p className="font-semibold text-foreground">Inicie matches apenas quando for começar</p>
                      <p className="text-sm text-muted-foreground">
                        Ao iniciar, apostas são bloqueadas. Só inicie quando a corrida for realmente começar.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <span className="text-racing-yellow font-bold">✅</span>
                    <div>
                      <p className="font-semibold text-foreground">Complete os 4 ciclos</p>
                      <p className="text-sm text-muted-foreground">
                        Para garantir justiça, complete Ímpar → Par → Ímpar → Par. Todos os pilotos terão corrido 2 vezes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <span className="text-racing-yellow font-bold">✅</span>
                    <div>
                      <p className="font-semibold text-foreground">Deixe o sistema atualizar as posições</p>
                      <p className="text-sm text-muted-foreground">
                        Não reordene manualmente após matches TOP 20. O sistema troca automaticamente vencedor/perdedor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-racing-yellow" />
                  Problemas Comuns e Soluções
                </h4>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <span className="text-red-400 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-foreground">Preview não aparece / Erro ao gerar matches</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Causa:</strong> Posições TOP 20 não preenchidas<br/>
                        <strong>Solução:</strong> Vá na aba TOP 20 e preencha TODAS as 20 posições com pilotos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <span className="text-red-400 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-foreground">Usuários reclamam que não conseguem apostar</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Causa:</strong> Match já foi iniciado (betting_locked = true)<br/>
                        <strong>Solução:</strong> Se iniciou por engano, delete e recrie o match. Depois que inicia, não dá pra desbloquear apostas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <span className="text-red-400 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-foreground">Posições TOP 20 não trocaram após match</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Causa 1:</strong> Match não é do tipo TOP 20<br/>
                        <strong>Causa 2:</strong> Pilotos não estão no TOP 20<br/>
                        <strong>Solução:</strong> Verifique se evento é tipo TOP 20 e se ambos pilotos têm posição atribuída
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <span className="text-red-400 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-foreground">Sugestão de rodada está errada</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Causa:</strong> Sistema analisa histórico de matches do evento<br/>
                        <strong>Solução:</strong> Se quiser resetar, crie um novo evento. Cada evento tem seu próprio ciclo independente.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <span className="text-red-400 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-foreground">Não consigo deletar piloto</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Causa:</strong> Piloto tem matches ou apostas associadas<br/>
                        <strong>Solução:</strong> Delete primeiro os matches que envolvem este piloto, depois o piloto
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">Dica Final</p>
                    <p className="text-sm text-muted-foreground">
                      O sistema foi projetado para ser simples: você só gerencia o básico (criar eventos, iniciar/finalizar matches). 
                      Todo o resto (cálculos, notificações, atualizações, distribuição de pontos) acontece automaticamente. 
                      Confie no sistema! 🚀
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
