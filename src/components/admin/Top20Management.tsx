import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy, AlertCircle, UserPlus } from 'lucide-react';
import { useTop20Positions } from '@/hooks/useTop20Positions';
import CompactTop20Card from './CompactTop20Card';
import Top20PositionModal from './Top20PositionModal';

export default function Top20Management() {
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { 
    positions: top20Positions, 
    isLoading, 
    updatePosition,
    initializePositions 
  } = useTop20Positions();

  const handleOpenModal = (position: number) => {
    setSelectedPosition(position);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPosition(null);
  };

  const handleSave = (pilotId: string | null) => {
    if (selectedPosition) {
      updatePosition.mutate(
        { position: selectedPosition, pilotId },
        {
          onSuccess: () => {
            handleCloseModal();
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-racing-green" />
      </div>
    );
  }

  const currentPosition = top20Positions?.find(p => p.position === selectedPosition);

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-racing-yellow" />
              TOP 20 - Lista 43
            </CardTitle>
            {(!top20Positions || top20Positions.length === 0) && (
              <Button 
                onClick={() => initializePositions.mutate()}
                disabled={initializePositions.isPending}
              >
                {initializePositions.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inicializando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Inicializar TOP 20
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {(!top20Positions || top20Positions.length === 0) ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p>TOP 20 não inicializado.</p>
              <p className="text-sm mt-2">Clique no botão acima para criar as posições.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {top20Positions.map((position) => (
                <CompactTop20Card
                  key={position.position}
                  position={position.position}
                  pilot={position.pilot}
                  consecutive_absences={position.consecutive_absences}
                  last_match_date={position.last_match_date}
                  onEdit={() => handleOpenModal(position.position)}
                  isSelected={selectedPosition === position.position}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Top20PositionModal
        open={isModalOpen}
        onClose={handleCloseModal}
        position={selectedPosition}
        currentPilotId={currentPosition?.pilot_id}
        onSave={handleSave}
        isSaving={updatePosition.isPending}
      />
    </div>
  );
}
