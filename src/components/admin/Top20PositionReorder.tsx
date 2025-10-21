import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTop20Positions } from '@/hooks/useTop20Positions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GripVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Top20PositionReorder = () => {
  const { positions, isLoading } = useTop20Positions();
  const { toast } = useToast();
  const [orderedPositions, setOrderedPositions] = useState<typeof positions>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // Initialize ordered positions when data loads
  useState(() => {
    if (positions && orderedPositions.length === 0) {
      setOrderedPositions([...positions]);
    }
  });

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newPositions = [...orderedPositions];
    const draggedItemContent = newPositions[draggedItem];
    newPositions.splice(draggedItem, 1);
    newPositions.splice(index, 0, draggedItemContent);

    setOrderedPositions(newPositions);
    setDraggedItem(index);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      // Update each position individually
      for (let i = 0; i < orderedPositions.length; i++) {
        const position = orderedPositions[i];
        if (position) {
          await supabase
            .from('top20_positions')
            .update({ pilot_id: position.pilot_id, updated_at: new Date().toISOString() })
            .eq('position', i + 1);
        }
      }

      toast({
        title: 'Ordem atualizada!',
        description: 'As posições foram reorganizadas com sucesso.',
      });

      // Refresh positions
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar ordem',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const displayPositions = orderedPositions.length > 0 ? orderedPositions : positions || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reordenar Posições TOP 20</CardTitle>
        <CardDescription>
          Arraste os pilotos para reordenar as posições. Clique em "Salvar Ordem" para aplicar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {displayPositions.map((position, index) => (
            <div
              key={position.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              className="flex items-center gap-4 p-3 bg-card border rounded-lg cursor-move hover:bg-accent transition-colors"
            >
              <GripVertical className="w-5 h-5 text-muted-foreground" />
              <span className="font-bold text-lg w-8">{index + 1}º</span>
              {position.pilot ? (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={position.pilot.image_url || ''} />
                    <AvatarFallback>{position.pilot.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{position.pilot.name}</p>
                    <p className="text-sm text-muted-foreground">{position.pilot.car_name}</p>
                  </div>
                </>
              ) : (
                <div className="flex-1 text-muted-foreground italic">Posição vazia</div>
              )}
            </div>
          ))}
        </div>
        <Button
          onClick={handleSaveOrder}
          disabled={isSaving || orderedPositions.length === 0}
          className="w-full"
        >
          {isSaving ? 'Salvando...' : 'Salvar Ordem'}
        </Button>
      </CardContent>
    </Card>
  );
};
