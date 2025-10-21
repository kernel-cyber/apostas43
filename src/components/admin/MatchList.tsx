import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMatches } from '@/hooks/useMatches';
import { Trash2, Play, Trophy, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import FinishMatchModal from './FinishMatchModal';

export default function MatchList() {
  const { matches, isLoading, updateMatchStatus, deleteMatch } = useMatches();
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este match?')) return;
    await deleteMatch.mutateAsync(id);
  };

  const handleStartMatch = async (id: string) => {
    await updateMatchStatus.mutateAsync({ id, status: 'in_progress' });
  };

  const handleOpenFinishModal = (match: any) => {
    setSelectedMatch(match);
    setFinishModalOpen(true);
  };

  if (isLoading) {
    return <div className="text-center text-racing-gray">Carregando matches...</div>;
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 text-racing-gray mx-auto mb-4" />
        <p className="text-racing-gray">Nenhum match cadastrado ainda.</p>
        <p className="text-sm text-racing-gray/60 mt-2">
          Crie seu primeiro match acima!
        </p>
      </div>
    );
  }

  // Group matches by event
  const matchesByEvent = matches.reduce((acc: any, match: any) => {
    const eventId = match.event.id;
    if (!acc[eventId]) {
      acc[eventId] = {
        event: match.event,
        matches: [],
      };
    }
    acc[eventId].matches.push(match);
    return acc;
  }, {});

  return (
    <>
      <div className="space-y-6">
        {Object.values(matchesByEvent).map((group: any) => (
          <div key={group.event.id}>
            <h3 className="text-xl font-bold text-white mb-4 font-racing">
              {group.event.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.matches.map((match: any) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onDelete={handleDelete}
                  onStart={handleStartMatch}
                  onFinish={handleOpenFinishModal}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedMatch && (
        <FinishMatchModal
          open={finishModalOpen}
          onOpenChange={setFinishModalOpen}
          match={selectedMatch}
        />
      )}
    </>
  );
}

function MatchCard({ match, onDelete, onStart, onFinish }: any) {
  const getStatusBadge = () => {
    switch (match.match_status) {
      case 'upcoming':
        return <Badge className="bg-blue-500">Aguardando</Badge>;
      case 'in_progress':
        return <Badge className="bg-racing-yellow text-black">Ao Vivo</Badge>;
      case 'finished':
        return <Badge className="bg-racing-green">Finalizado</Badge>;
    }
  };

  return (
    <Card className="bg-racing-dark border-racing-green/10 hover:border-racing-green/30 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-racing-gray">
            Rodada {match.round_number}
          </Badge>
          {getStatusBadge()}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {match.pilot1.image_url && (
              <img
                src={match.pilot1.image_url}
                alt={match.pilot1.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-bold text-white">{match.pilot1.name}</p>
              <p className="text-sm text-racing-yellow">{match.pilot1.car_name}</p>
            </div>
          </div>

          <div className="text-center text-racing-red font-bold">VS</div>

          <div className="flex items-center gap-3">
            {match.pilot2.image_url && (
              <img
                src={match.pilot2.image_url}
                alt={match.pilot2.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-bold text-white">{match.pilot2.name}</p>
              <p className="text-sm text-racing-yellow">{match.pilot2.car_name}</p>
            </div>
          </div>
        </div>

        {match.scheduled_time && (
          <div className="flex items-center gap-2 text-sm text-racing-gray">
            <Clock className="h-4 w-4" />
            {format(new Date(match.scheduled_time), "dd/MM 'às' HH:mm", { locale: ptBR })}
          </div>
        )}

        {match.winner && (
          <div className="flex items-center gap-2 text-sm text-racing-green">
            <Trophy className="h-4 w-4" />
            Vencedor: {match.winner.name}
          </div>
        )}

        <div className="flex gap-2">
          {match.match_status === 'upcoming' && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onStart(match.id)}
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar
            </Button>
          )}

          {match.match_status === 'in_progress' && (
            <Button
              size="sm"
              className="flex-1 bg-racing-green hover:bg-racing-green/80"
              onClick={() => onFinish(match)}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(match.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
