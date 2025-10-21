import { useState } from 'react';
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

      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

      const matchesData = preview.map((match, index) => ({
        event_id: eventId,
        pilot1_id: match.pilot1_id,
        pilot2_id: match.pilot2_id,
        round_number: match.round_num,
        scheduled_time: new Date(scheduledDateTime.getTime() + index * 15 * 60000).toISOString(), // 15 min entre matches
        match_status: 'upcoming',
      }));

      const { error } = await (supabase as any)
        .from('matches')
        .insert(matchesData);
      
      if (error) throw error;

      // Atualizar o bracket_type do evento
      await (supabase as any)
        .from('events')
        .update({ bracket_type: bracketType })
        .eq('id', eventId);
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
        {/* Seletor de Tipo de Rodada */}
        <div className="space-y-2">
          <Label>Tipo de Rodada</Label>
          <Select value={bracketType} onValueChange={(v) => setBracketType(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top20_odd">
                Rodada Ímpar (19x18, 17x16, 15x14...)
              </SelectItem>
              <SelectItem value="top20_even">
                Rodada Par (20x19, 18x17, 16x15...)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {bracketType === 'top20_odd' 
              ? '9 matches: do 19º ao 2º (1º não corre)'
              : '10 matches: do 20º ao 1º'}
          </p>
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
              <h3 className="font-semibold">Preview dos Matches</h3>
              <Badge>{preview.length} matches</Badge>
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
