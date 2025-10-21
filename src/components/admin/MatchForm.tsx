import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMatches } from '@/hooks/useMatches';
import { useEvents } from '@/hooks/useEvents';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus } from 'lucide-react';

export default function MatchForm() {
  const { createMatch } = useMatches();
  const { events } = useEvents();
  const [formData, setFormData] = useState({
    event_id: '',
    pilot1_id: '',
    pilot2_id: '',
    round_number: '1',
  });

  const { data: pilots } = useQuery({
    queryKey: ['pilots'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('pilots')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Get pilots already in matches for this event to filter them out
  const { data: eventMatches } = useQuery({
    queryKey: ['event-matches', formData.event_id],
    queryFn: async () => {
      if (!formData.event_id) return [];
      const { data, error } = await (supabase as any)
        .from('matches')
        .select('pilot1_id, pilot2_id')
        .eq('event_id', formData.event_id);
      if (error) throw error;
      return data;
    },
    enabled: !!formData.event_id,
  });

  // Filter out pilots already in matches
  const usedPilotIds = new Set(
    eventMatches?.flatMap(m => [m.pilot1_id, m.pilot2_id]) || []
  );
  
  const availablePilotsForPilot1 = pilots?.filter(p => 
    !usedPilotIds.has(p.id) || p.id === formData.pilot1_id
  );
  
  const availablePilotsForPilot2 = pilots?.filter(p => 
    !usedPilotIds.has(p.id) || p.id === formData.pilot2_id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.pilot1_id === formData.pilot2_id) {
      alert('Selecione pilotos diferentes!');
      return;
    }

    await createMatch.mutateAsync({
      event_id: formData.event_id,
      pilot1_id: formData.pilot1_id,
      pilot2_id: formData.pilot2_id,
      round_number: parseInt(formData.round_number),
      scheduled_time: null,
      betting_locked: false,
    });

    setFormData({
      event_id: formData.event_id, // Keep event selected
      pilot1_id: '',
      pilot2_id: '',
      round_number: formData.round_number,
    });
  };

  const activeEvents = events?.filter(e => e.is_active) || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event_id">Evento *</Label>
          <Select
            value={formData.event_id}
            onValueChange={(value) => setFormData({ ...formData, event_id: value })}
            required
          >
            <SelectTrigger className="bg-racing-dark/50">
              <SelectValue placeholder="Selecione o evento" />
            </SelectTrigger>
            <SelectContent>
              {activeEvents.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="round_number">Rodada *</Label>
          <Input
            id="round_number"
            type="number"
            min="1"
            value={formData.round_number}
            onChange={(e) => setFormData({ ...formData, round_number: e.target.value })}
            required
            className="bg-racing-dark/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pilot1_id">Piloto 1 *</Label>
          <Select
            value={formData.pilot1_id}
            onValueChange={(value) => setFormData({ ...formData, pilot1_id: value })}
            required
          >
            <SelectTrigger className="bg-racing-dark/50">
              <SelectValue placeholder="Selecione o piloto 1" />
            </SelectTrigger>
            <SelectContent>
              {availablePilotsForPilot1?.map((pilot) => (
                <SelectItem key={pilot.id} value={pilot.id}>
                  {pilot.name} - {pilot.car_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pilot2_id">Piloto 2 *</Label>
          <Select
            value={formData.pilot2_id}
            onValueChange={(value) => setFormData({ ...formData, pilot2_id: value })}
            required
          >
            <SelectTrigger className="bg-racing-dark/50">
              <SelectValue placeholder="Selecione o piloto 2" />
            </SelectTrigger>
            <SelectContent>
              {availablePilotsForPilot2?.map((pilot) => (
                <SelectItem key={pilot.id} value={pilot.id}>
                  {pilot.name} - {pilot.car_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={createMatch.isPending} className="w-full">
        {createMatch.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Criar Match
          </>
        )}
      </Button>
    </form>
  );
}
