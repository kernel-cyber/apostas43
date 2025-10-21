import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle } from 'lucide-react';

interface CompactTop20CardProps {
  position: number;
  pilot?: {
    name: string;
    car_name: string;
    image_url?: string | null;
    team?: string | null;
  } | null;
  consecutive_absences: number;
  last_match_date?: string | null;
  onEdit: () => void;
  isSelected?: boolean;
}

export default function CompactTop20Card({
  position,
  pilot,
  consecutive_absences,
  last_match_date,
  onEdit,
  isSelected,
}: CompactTop20CardProps) {
  return (
    <Card
      className={`bg-muted border transition-all cursor-pointer hover:border-racing-green/50 ${
        isSelected ? 'border-racing-green ring-2 ring-racing-green/20' : 'border-border'
      }`}
      onClick={onEdit}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Posição */}
          <div className="flex-shrink-0">
            <Badge 
              variant="outline" 
              className="text-racing-yellow font-bold w-10 h-10 flex items-center justify-center text-base"
            >
              #{position}
            </Badge>
          </div>

          {/* Imagem do Piloto */}
          {pilot?.image_url ? (
            <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
              <img
                src={pilot.image_url}
                alt={pilot.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded bg-muted-foreground/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
          )}

          {/* Informações do Piloto */}
          <div className="flex-1 min-w-0">
            {pilot ? (
              <>
                  {/* #7: Cores padronizadas no admin */}
                  <p className="font-bold text-white text-sm truncate">
                    {pilot.name}
                  </p>
                  <p className="text-xs text-racing-yellow truncate">
                    🚗 {pilot.car_name}
                  </p>
                  {pilot.team && (
                    <p className="text-[10px] text-blue-400 truncate">
                      🏁 {pilot.team}
                    </p>
                  )}
                  {last_match_date && (
                    <p className="text-xs text-muted-foreground truncate">
                      {format(new Date(last_match_date), 'dd/MM/yy', { locale: ptBR })}
                    </p>
                  )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Posição vazia</p>
            )}
          </div>

          {/* Badge de Faltas */}
          {consecutive_absences > 0 && (
            <div className="flex-shrink-0">
              <Badge variant="destructive" className="text-xs">
                {consecutive_absences} {consecutive_absences === 1 ? 'falta' : 'faltas'}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
