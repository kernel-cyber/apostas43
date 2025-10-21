import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Trophy, Calendar } from 'lucide-react';
import BettorRankingTable from './BettorRankingTable';
import PilotRankingTable from './PilotRankingTable';
import { useEvents } from '@/hooks/useEvents';

export default function Leaderboard() {
  const { events, isLoading: eventsLoading } = useEvents();
  
  // Always select the last event as default
  const lastEvent = events && events.length > 0 ? events[events.length - 1] : null;
  const [selectedEventId, setSelectedEventId] = useState<string>(lastEvent?.id || '');
  
  return (
    <Tabs defaultValue="bettors" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="bettors" className="flex items-center gap-2">
          <Award className="w-4 h-4" />
          Apostadores
        </TabsTrigger>
        <TabsTrigger value="pilots" className="flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Pilotos
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="bettors">
        <BettorRankingTable />
      </TabsContent>
      
      <TabsContent value="pilots" className="space-y-4">
        {/* Event Selector */}
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-racing-yellow" />
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecione uma edição" />
            </SelectTrigger>
            <SelectContent>
              {events?.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  🏁 {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedEventId && <PilotRankingTable eventId={selectedEventId} />}
      </TabsContent>
    </Tabs>
  );
}
