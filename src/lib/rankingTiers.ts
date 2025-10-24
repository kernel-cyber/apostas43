export interface RankingTier {
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  gradient: string;
  icon: string;
  badgeLimit: number;
}

export const RANKING_TIERS: RankingTier[] = [
  {
    name: 'Lendário',
    minPoints: 10000,
    maxPoints: Infinity,
    color: 'from-purple-500 via-pink-500 to-red-500',
    gradient: 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20',
    icon: '👑',
    badgeLimit: 5
  },
  {
    name: 'Diamante',
    minPoints: 5000,
    maxPoints: 9999,
    color: 'from-cyan-400 to-blue-500',
    gradient: 'bg-gradient-to-r from-cyan-400/20 to-blue-500/20',
    icon: '💎',
    badgeLimit: 4
  },
  {
    name: 'Platina',
    minPoints: 3000,
    maxPoints: 4999,
    color: 'from-gray-300 to-gray-400',
    gradient: 'bg-gradient-to-r from-gray-300/20 to-gray-400/20',
    icon: '⭐',
    badgeLimit: 3
  },
  {
    name: 'Ouro',
    minPoints: 2000,
    maxPoints: 2999,
    color: 'from-yellow-400 to-yellow-600',
    gradient: 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20',
    icon: '🏆',
    badgeLimit: 3
  },
  {
    name: 'Prata',
    minPoints: 1500,
    maxPoints: 1999,
    color: 'from-gray-400 to-gray-500',
    gradient: 'bg-gradient-to-r from-gray-400/20 to-gray-500/20',
    icon: '🥈',
    badgeLimit: 2
  },
  {
    name: 'Bronze',
    minPoints: 1000,
    maxPoints: 1499,
    color: 'from-orange-600 to-orange-800',
    gradient: 'bg-gradient-to-r from-orange-600/20 to-orange-800/20',
    icon: '🥉',
    badgeLimit: 1
  }
];

export function getUserTier(points: number): RankingTier {
  return RANKING_TIERS.find(
    tier => points >= tier.minPoints && points <= tier.maxPoints
  ) || RANKING_TIERS[RANKING_TIERS.length - 1];
}
