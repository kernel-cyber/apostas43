import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/useEvents';
import { Trash2, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function EventList() {
  const { events, isLoading, deleteEvent } = useEvents();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja deletar o evento "${name}"?`)) return;
    await deleteEvent.mutateAsync(id);
  };

  if (isLoading) {
    return <div className="text-center text-racing-gray">Carregando eventos...</div>;
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-racing-gray mx-auto mb-4" />
        <p className="text-racing-gray">Nenhum evento cadastrado ainda.</p>
        <p className="text-sm text-racing-gray/60 mt-2">
          Crie seu primeiro evento acima!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onDelete={handleDelete} />
      ))}
    </div>
  );
}

function EventCard({ event, onDelete }: { event: any; onDelete: (id: string, name: string) => void }) {
  const { data: matchCount } = useQuery({
    queryKey: ['match-count', event.id],
    queryFn: async () => {
      const { count } = await (supabase as any)
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id);
      return count || 0;
    },
  });

  const eventTypeLabel = event.event_type === 'shark_tank' ? 'Shark Tank' : 'TOP 20';
  const eventTypeColor = event.event_type === 'shark_tank' ? 'bg-racing-red' : 'bg-racing-blue';

  return (
    <Card className="bg-racing-dark border-racing-green/10 hover:border-racing-green/30 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg mb-2">{event.name}</h3>
            <Badge className={`${eventTypeColor} text-white`}>
              {eventTypeLabel}
            </Badge>
          </div>
          {event.is_active && (
            <Badge variant="outline" className="border-racing-green text-racing-green">
              Ativo
            </Badge>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-racing-gray line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-racing-gray">
          <Calendar className="h-4 w-4" />
          {format(new Date(event.event_date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
        </div>

        <div className="flex items-center gap-2 text-sm text-racing-gray">
          <Users className="h-4 w-4" />
          {matchCount || 0} matches cadastrados
        </div>

        <Button
          variant="destructive"
          size="sm"
          className="w-full mt-2"
          onClick={() => onDelete(event.id, event.name)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Deletar Evento
        </Button>
      </CardContent>
    </Card>
  );
}
