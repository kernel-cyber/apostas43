import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface EditPilotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pilot: any;
  onSuccess: () => void;
}

export default function EditPilotModal({ open, onOpenChange, pilot, onSuccess }: EditPilotModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: pilot?.name || '',
    car_name: pilot?.car_name || '',
    car_model: pilot?.car_model || '',
    position: pilot?.position || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await (supabase as any)
      .from('pilots')
      .update({
        name: formData.name,
        car_name: formData.car_name,
        car_model: formData.car_model || null,
        position: formData.position ? parseInt(formData.position) : null,
      })
      .eq('id', pilot.id);

    if (error) {
      toast({
        title: 'Erro ao atualizar piloto',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Piloto atualizado!',
        description: 'As informações foram atualizadas com sucesso.',
      });
      onSuccess();
      onOpenChange(false);
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-racing-dark border-racing-green/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-racing text-white">
            Editar Piloto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_name">Nome do Piloto</Label>
            <Input
              id="edit_name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-racing-dark/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_car_name">Nome do Carro</Label>
            <Input
              id="edit_car_name"
              value={formData.car_name}
              onChange={(e) => setFormData({ ...formData, car_name: e.target.value })}
              required
              className="bg-racing-dark/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_car_model">Modelo do Carro</Label>
            <Input
              id="edit_car_model"
              value={formData.car_model}
              onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
              className="bg-racing-dark/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_position">Posição (1-20)</Label>
            <Input
              id="edit_position"
              type="number"
              min="1"
              max="20"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="bg-racing-dark/50"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
