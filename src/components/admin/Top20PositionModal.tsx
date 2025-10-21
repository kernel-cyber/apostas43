import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Top20PositionModalProps {
  open: boolean;
  onClose: () => void;
  position: number | null;
  currentPilotId?: string | null;
  onSave: (pilotId: string | null) => void;
  isSaving: boolean;
}

export default function Top20PositionModal({
  open,
  onClose,
  position,
  currentPilotId,
  onSave,
  isSaving,
}: Top20PositionModalProps) {
  const [selectedPilotId, setSelectedPilotId] = useState<string>(currentPilotId || 'null');

  useEffect(() => {
    if (open) {
      setSelectedPilotId(currentPilotId || 'null');
    }
  }, [open, currentPilotId]);

  const { data: allPilots } = useQuery({
    queryKey: ['all-pilots'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('pilots')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const handleSave = () => {
    onSave(selectedPilotId === 'null' ? null : selectedPilotId);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Editar Posição #{position}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecionar Piloto</label>
            <Select value={selectedPilotId} onValueChange={setSelectedPilotId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um piloto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Deixar vazio</SelectItem>
                {allPilots?.map((pilot: any) => (
                  <SelectItem key={pilot.id} value={pilot.id}>
                    {pilot.name} - {pilot.car_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
