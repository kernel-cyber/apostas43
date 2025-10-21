import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMatches } from '@/hooks/useMatches';
import { Trash2, Play, Trophy, Clock, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import FinishMatchModal from './FinishMatchModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRoundLabel } from '@/lib/roundHelpers';

export default function MatchList() {
  const { matches, isLoading, updateMatchStatus, deleteMatch } = useMatches();
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all'); // Mostrar todos por padrão

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este match?')) return;
    await deleteMatch.mutateAsync(id);
  };

  const handleStartMatch = async (id: string) => {
    // Verificar se já existe match em progresso
    const inProgressMatch = matches?.find((m: any) => 
      m.match_status === 'in_progress' && m.id !== id
    );
    
    if (inProgressMatch) {
      alert('Já existe um match em andamento! Finalize-o antes de iniciar outro.');
      return;
    }
    
    // Iniciar sem bloquear apostas
    await updateMatchStatus.mutateAsync({ 
      id, 
      status: 'in_progress',
      betting_locked: false 
    });
  };

  const handleToggleBetting = async (id: string, currentlyLocked: boolean) => {
    await updateMatchStatus.mutateAsync({
      id,
      status: 'in_progress',
      betting_locked: !currentlyLocked
    });
  };

  const handleOpenFinishModal = (match: any) => {
    setSelectedMatch(match);
    setFinishModalOpen(true);
  };

  if (isLoading) {
    return <div className="text-center text-racing-gray">Carregando matches...</div>;
  }

  // Filtrar e ordenar matches por status - in_progress primeiro, depois upcoming por scheduled_time
  const filteredMatches = (matches?.filter((match: any) => {
    if (statusFilter === 'all') return true;
    return match.match_status === statusFilter;
  }) || []).sort((a: any, b: any) => {
    // Prioridade: in_progress > upcoming > finished
    const statusOrder: any = { 
      'in_progress': 0, 
      'upcoming': 1, 
      'finished': 2 
    };
    
    const statusDiff = statusOrder[a.match_status] - statusOrder[b.match_status];
    if (statusDiff !== 0) return statusDiff;
    
    // Se mesmo status, ordenar por scheduled_time
    if (a.scheduled_time && b.scheduled_time) {
      return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime();
    }
    
    return 0;
  });

  // Encontrar o próximo match (segundo da lista se houver)
  const nextMatch = filteredMatches.length > 1 ? filteredMatches[1] : null;

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

  // Não agrupar por evento, manter ordem sequencial
  const matchesList = filteredMatches;

  return (
    <>
      {/* Filtro de Status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-racing-gray" />
          <span className="text-sm text-racing-gray">Filtrar por:</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="in_progress">Ao Vivo</SelectItem>
            <SelectItem value="upcoming">Para Iniciar</SelectItem>
            <SelectItem value="finished">Finalizados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {matchesList.length === 0 ? (
          <div className="text-center py-8 text-racing-gray">
            Nenhum match encontrado com este filtro.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchesList.map((match: any, index: number) => (
              <MatchCard
                key={match.id}
                match={match}
                onDelete={handleDelete}
                onStart={handleStartMatch}
                onFinish={handleOpenFinishModal}
                onToggleBetting={handleToggleBetting}
                isNext={index === 1}
              />
            ))}
          </div>
        )}
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

function MatchCard({ match, onDelete, onStart, onFinish, onToggleBetting, isNext }: any) {
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
    <Card className={`bg-racing-dark border-racing-green/10 hover:border-racing-green/30 transition-colors ${
      isNext ? 'animate-pulse-border-green' : ''
    }`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-racing-gray">
            {getRoundLabel(match.cycle_position, match.round_number).emoji} {getRoundLabel(match.cycle_position, match.round_number).fullLabel}
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

        <div className="flex flex-wrap gap-2">
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
            <>
              <Button
                size="sm"
                variant={match.betting_locked ? "default" : "outline"}
                onClick={() => onToggleBetting(match.id, match.betting_locked)}
              >
                {match.betting_locked ? '🔒 Abrir Apostas' : '🔓 Fechar Apostas'}
              </Button>
              
              <Button
                size="sm"
                className="flex-1 bg-racing-green hover:bg-racing-green/80"
                onClick={() => onFinish(match)}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Finalizar
              </Button>
            </>
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
