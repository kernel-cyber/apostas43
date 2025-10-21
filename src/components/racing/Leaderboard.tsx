import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Trophy } from 'lucide-react';
import BettorRankingTable from './BettorRankingTable';
import PilotRankingTable from './PilotRankingTable';

export default function Leaderboard() {
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
      
      <TabsContent value="pilots">
        <PilotRankingTable />
      </TabsContent>
    </Tabs>
  );
}
