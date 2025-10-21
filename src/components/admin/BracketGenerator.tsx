import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Zap, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface BracketGeneratorProps {
  eventId: string;
}

export default function BracketGenerator({ eventId }: BracketGeneratorProps) {
  const { toast } = useToast();
  const [bracketType, setBracketType] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { data: top20Positions } = useQuery({
    queryKey: ['top20-positions'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('top20_positions')
        .select(`
          *,
          pilot:pilots(id, name, car_name)
        `)
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const generatePreview = async () => {
    if (!bracketType) {
      toast({
        title: "Selecione um tipo de bracket",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      const { data, error } = await (supabase as any)
        .rpc('generate_top20_matches', {
          p_event_id: eventId,
          p_bracket_type: bracketType
        });

      if (error) throw error;

      setPreview(data || []);
      setShowPreview(true);
      
      toast({
        title: "Preview gerado!",
        description: `${data?.length || 0} matches serão criados.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar preview",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBracket = async () => {
    if (preview.length === 0) {
      toast({
        title: "Gere um preview primeiro",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Criar ${preview.length} matches automaticamente?`)) {
      return;
    }

    try {
      setIsGenerating(true);

      // 1. Capturar posições iniciais do TOP 20 para o evento
      const { error: captureError } = await (supabase as any)
        .rpc('capture_initial_positions', {
          p_event_id: eventId
        });

      if (captureError) throw captureError;

      // 2. Update event with bracket type
      await (supabase as any)
        .from('events')
        .update({ bracket_type: bracketType })
        .eq('id', eventId);

      // 3. Create all matches
      const matchesToCreate = preview.map(match => ({
        event_id: eventId,
        pilot1_id: match.pilot1_id,
        pilot2_id: match.pilot2_id,
        pilot1_position: match.pilot1_pos,
        pilot2_position: match.pilot2_pos,
        round_number: match.round_num,
        match_status: 'upcoming',
        bracket_type: bracketType === 'top20_odd' ? 'odd' : 'even'
      }));

      const { error } = await (supabase as any)
        .from('matches')
        .insert(matchesToCreate);

      if (error) throw error;

      toast({
        title: "Chaveamento criado!",
        description: `${preview.length} matches foram criados com sucesso.`,
      });

      setShowPreview(false);
      setPreview([]);
      setBracketType('');
    } catch (error: any) {
      toast({
        title: "Erro ao criar matches",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-racing-green" />
            Gerador Automático de Chaveamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Chaveamento TOP 20</Label>
            <Select value={bracketType} onValueChange={setBracketType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
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
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generatePreview}
              disabled={!bracketType || isGenerating}
              variant="outline"
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar Preview
                </>
              )}
            </Button>

            {showPreview && (
              <Button
                onClick={generateBracket}
                disabled={isGenerating}
                className="flex-1 bg-racing-green hover:bg-racing-green/80"
              >
                <Zap className="mr-2 h-4 w-4" />
                Criar Matches
              </Button>
            )}
          </div>

          {showPreview && preview.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-foreground">
                Preview dos Matches ({preview.length})
              </h4>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {preview.map((match, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Rodada {match.round_num}
                      </span>
                      <span className="text-xs text-racing-gray">
                        Pos {match.pilot1_pos} vs {match.pilot2_pos}
                      </span>
                    </div>
                    <div className="mt-2 font-semibold text-foreground">
                      {top20Positions?.find((p: any) => p.position === match.pilot1_pos)?.pilot?.name || `Pos ${match.pilot1_pos}`}
                      <span className="mx-2 text-racing-red">VS</span>
                      {top20Positions?.find((p: any) => p.position === match.pilot2_pos)?.pilot?.name || `Pos ${match.pilot2_pos}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
