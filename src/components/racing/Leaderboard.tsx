import BettorRankingTable from './BettorRankingTable';
import PilotRankingTable from './PilotRankingTable';

export default function Leaderboard() {
  return (
    <div className="space-y-6">
      <BettorRankingTable />
      <PilotRankingTable />
    </div>
  );
}
