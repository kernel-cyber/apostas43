import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { getRoundLabel, getCycleStatus, getNextBracketType } from '@/lib/roundHelpers';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AutoMatchSchedulerProps {
  eventId: string;
}

export default function AutoMatchScheduler({ eventId }: AutoMatchSchedulerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bracketType, setBracketType] = useState<'top20_odd' | 'top20_even'>('top20_odd');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [preview, setPreview] = useState<any[]>([]);

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch last match data and round counts
  const { data: lastMatch } = useQuery({
    queryKey: ['last-match', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('bracket_type, round_number, cycle_position')
        .eq('event_id', eventId)
        .order('round_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Count odd and even rounds
  const { data: roundCounts } = useQuery({
    queryKey: ['round-counts', eventId],
    queryFn: async () => {
      const { data: oddData } = await supabase
        .from('matches')
        .select('round_number', { count: 'exact', head: false })
        .eq('event_id', eventId)
        .eq('bracket_type', 'odd');

      const { data: evenData } = await supabase
        .from('matches')
        .select('round_number', { count: 'exact', head: false })
        .eq('event_id', eventId)
        .eq('bracket_type', 'even');

      // Count unique round numbers
      const oddCount = oddData ? new Set(oddData.map((m: any) => m.round_number)).size : 0;
      const evenCount = evenData ? new Set(evenData.map((m: any) => m.round_number)).size : 0;

      return { oddCount, evenCount };
    },
  });

  // Auto-suggest next bracket type based on last match and round counts
  useEffect(() => {
    if (lastMatch && roundCounts) {
      const nextType = getNextBracketType(
        lastMatch.bracket_type,
        roundCounts.oddCount,
        roundCounts.evenCount
      );
      setBracketType(nextType);
    }
  }, [lastMatch, roundCounts]);

  const generatePreview = useMutation({
    mutationFn: async () => {
      const { data, error } = await (supabase as any)
        .rpc('generate_top20_matches', {
          p_event_id: eventId,
          p_bracket_type: bracketType,
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setPreview(data);
      toast({
        title: "Preview gerado!",
        description: `${data.length} matches serão criados.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao gerar preview",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createMatches = useMutation({
    mutationFn: async () => {
      if (!scheduledDate || !scheduledTime) {
        throw new Error('Data e hora são obrigatórios');
      }

      // 1. Capturar posições iniciais do TOP 20 para o evento
      const { error: captureError } = await (supabase as any)
        .rpc('capture_initial_positions', {
          p_event_id: eventId
        });

      if (captureError) throw captureError;

      // 2. Criar matches agendados
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      
      // Extrair apenas 'odd' ou 'even' do bracketType
      const bracketSuffix = bracketType.includes('odd') ? 'odd' : 'even';

      const matchesData = preview.map((match, index) => ({
        event_id: eventId,
        pilot1_id: match.pilot1_id,
        pilot2_id: match.pilot2_id,
        pilot1_position: match.pilot1_pos,
        pilot2_position: match.pilot2_pos,
        round_number: match.round_num,
        bracket_type: bracketSuffix, // Salvar 'odd' ou 'even' no match
        cycle_position: match.cycle_pos, // Adicionar cycle_position
        scheduled_time: new Date(scheduledDateTime.getTime() + index * 15 * 60000).toISOString(), // 15 min entre matches
        match_status: 'upcoming',
      }));

      const { error } = await (supabase as any)
        .from('matches')
        .insert(matchesData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast({
        title: "Matches criados!",
        description: "Os matches foram agendados com sucesso.",
      });
      setPreview([]);
      setScheduledDate('');
      setScheduledTime('');
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar matches",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-racing-yellow" />
          Gerador Automático de Matches TOP 20
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cycle Status Alert */}
        {roundCounts && (
          <Alert className={
            getCycleStatus(roundCounts.oddCount, roundCounts.evenCount).type === 'success'
              ? 'border-green-500 bg-green-500/10'
              : getCycleStatus(roundCounts.oddCount, roundCounts.evenCount).type === 'warning'
              ? 'border-yellow-500 bg-yellow-500/10'
              : 'border-blue-500 bg-blue-500/10'
          }>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {getCycleStatus(roundCounts.oddCount, roundCounts.evenCount).message}
            </AlertDescription>
          </Alert>
        )}

        {/* Seletor de Tipo de Rodada */}
        <div className="space-y-2">
          <Label>Tipo de Rodada</Label>
          <Select value={bracketType} onValueChange={(v) => setBracketType(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top20_odd">
                🔵 Rodada Ímpar (19x18, 17x16, 15x14...)
              </SelectItem>
              <SelectItem value="top20_even">
                🟢 Rodada Par (20x19, 18x17, 16x15...)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {bracketType === 'top20_odd' 
              ? '9 matches: do 19º ao 2º (1º e 20º não correm)'
              : '10 matches: do 20º ao 1º (todos correm)'}
          </p>
          {lastMatch && roundCounts && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                📊 Histórico: {roundCounts.oddCount} rodada{roundCounts.oddCount !== 1 ? 's' : ''} ímpar{roundCounts.oddCount !== 1 ? 'es' : ''}, {roundCounts.evenCount} rodada{roundCounts.evenCount !== 1 ? 's' : ''} par{roundCounts.evenCount !== 1 ? 'es' : ''}
              </p>
              <p className="text-xs text-racing-yellow">
                ℹ️ Última: {getRoundLabel(lastMatch.cycle_position, lastMatch.round_number).cycleLabel}
              </p>
            </div>
          )}
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data</Label>
            <Input 
              type="date" 
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Hora Inicial</Label>
            <Input 
              type="time" 
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>
        </div>

        {/* Botão de Preview */}
        <Button 
          onClick={() => generatePreview.mutate()}
          disabled={generatePreview.isPending}
          variant="outline"
          className="w-full"
        >
          {generatePreview.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando Preview...
            </>
          ) : (
            'Gerar Preview'
          )}
        </Button>

        {/* Preview dos Matches */}
        {preview.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">📋 Preview dos Matches</h3>
              <div className="flex items-center gap-2">
                {preview[0] && (
                  <Badge variant="outline">
                    {getRoundLabel(preview[0].cycle_pos, preview[0].round_num).emoji} {getRoundLabel(preview[0].cycle_pos, preview[0].round_num).cycleLabel}
                  </Badge>
                )}
                <Badge>{preview.length} matches</Badge>
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {preview.map((match, index) => (
                <div 
                  key={index}
                  className="p-3 bg-muted rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{match.pilot1_pos}</Badge>
                    <span className="text-sm">vs</span>
                    <Badge variant="outline">#{match.pilot2_pos}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Rodada {match.round_num}
                  </span>
                </div>
              ))}
            </div>

            {/* Botão de Criar */}
            <Button 
              onClick={() => createMatches.mutate()}
              disabled={createMatches.isPending || !scheduledDate || !scheduledTime}
              className="w-full"
            >
              {createMatches.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando Matches...
                </>
              ) : (
                'Criar Todos os Matches'
              )}
            </Button>
          </div>
        )}

        {/* Aviso */}
        <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
          <AlertCircle className="h-5 w-5 text-racing-yellow flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Importante:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Certifique-se de que todas as posições TOP 20 estão preenchidas</li>
              <li>Cada match será agendado com 15 minutos de intervalo</li>
              <li>O tipo de rodada será salvo no evento</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
