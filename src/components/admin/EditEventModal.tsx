import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEvents, Event } from '@/hooks/useEvents';
import { Loader2, Save } from 'lucide-react';

interface EditEventModalProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditEventModal({ event, open, onOpenChange }: EditEventModalProps) {
  const { updateEvent } = useEvents();
  const [formData, setFormData] = useState({
    name: event.name,
    description: event.description || '',
    event_type: event.event_type,
    event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
    is_active: event.is_active,
  });

  useEffect(() => {
    setFormData({
      name: event.name,
      description: event.description || '',
      event_type: event.event_type,
      event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
      is_active: event.is_active,
    });
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateEvent.mutateAsync({
      id: event.id,
      ...formData,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-racing-dark border-racing-green/20">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Evento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Evento *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-racing-dark/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-event_type">Tipo de Evento *</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value: 'top_20') =>
                  setFormData({ ...formData, event_type: value })
                }
              >
                <SelectTrigger className="bg-racing-dark/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top_20">TOP 20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-event_date">Data do Evento *</Label>
              <Input
                id="edit-event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
                className="bg-racing-dark/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-racing-dark/50"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={updateEvent.isPending}
              className="flex-1"
            >
              {updateEvent.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
