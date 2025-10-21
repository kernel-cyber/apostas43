import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEvents } from '@/hooks/useEvents';
import { Loader2, Plus } from 'lucide-react';

export default function EventForm() {
  const { createEvent } = useEvents();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_type: 'top_20' as 'top_20',
    event_date: '',
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEvent.mutateAsync(formData);
    setFormData({
      name: '',
      description: '',
      event_type: 'top_20',
      event_date: '',
      is_active: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Evento *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-racing-dark/50"
            placeholder="Ex: Shark Tank 64 - Temporada 1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event_type">Tipo de Evento *</Label>
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
          <Label htmlFor="event_date">Data do Evento *</Label>
          <Input
            id="event_date"
            type="datetime-local"
            value={formData.event_date}
            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            required
            className="bg-racing-dark/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-racing-dark/50"
          placeholder="Descrição detalhada do evento..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={createEvent.isPending} className="w-full">
        {createEvent.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Criar Evento
          </>
        )}
      </Button>
    </form>
  );
}
