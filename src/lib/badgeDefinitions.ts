export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'participation' | 'performance' | 'volume' | 'special' | 'social';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';
  requirement: string;
  checkProgress: (userStats: any) => number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // PARTICIPATION BADGES
  {
    id: 'first_bet',
    name: 'Primeira Aposta',
    description: 'Fez sua primeira aposta',
    icon: '🎯',
    category: 'participation',
    tier: 'bronze',
    requirement: 'Apostar pela primeira vez',
    checkProgress: (stats) => stats.total_bets >= 1 ? 100 : 0
  },
  {
    id: 'event_veteran_bronze',
    name: 'Veterano Bronze',
    description: 'Participou de 3 eventos diferentes',
    icon: '📅',
    category: 'participation',
    tier: 'bronze',
    requirement: 'Participar de 3 eventos',
    checkProgress: (stats) => Math.min((stats.events_participated / 3) * 100, 100)
  },
  {
    id: 'event_veteran_silver',
    name: 'Veterano Prata',
    description: 'Participou de 10 eventos diferentes',
    icon: '📆',
    category: 'participation',
    tier: 'silver',
    requirement: 'Participar de 10 eventos',
    checkProgress: (stats) => Math.min((stats.events_participated / 10) * 100, 100)
  },
  
  // PERFORMANCE BADGES
  {
    id: 'sharpshooter',
    name: 'Atirador de Elite',
    description: 'Mantenha 70%+ de win rate com 20+ apostas',
    icon: '🎖️',
    category: 'performance',
    tier: 'gold',
    requirement: '70%+ WR com 20+ apostas',
    checkProgress: (stats) => {
      if (stats.total_bets < 20) return (stats.total_bets / 20) * 50;
      if (stats.win_rate >= 70) return 100;
      return 50 + ((stats.win_rate / 70) * 50);
    }
  },
  {
    id: 'winning_streak_5',
    name: 'Sequência de Ouro',
    description: 'Ganhe 5 apostas seguidas',
    icon: '🔥',
    category: 'performance',
    tier: 'silver',
    requirement: '5 vitórias consecutivas',
    checkProgress: (stats) => Math.min((stats.current_streak / 5) * 100, 100)
  },
  
  // VOLUME BADGES
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Apostou mais de 10.000 pontos no total',
    icon: '💰',
    category: 'volume',
    tier: 'platinum',
    requirement: '10.000 pts apostados',
    checkProgress: (stats) => Math.min((stats.total_wagered / 10000) * 100, 100)
  },
  {
    id: 'bet_master_100',
    name: 'Mestre das Apostas',
    description: 'Fez 100 apostas',
    icon: '🎰',
    category: 'volume',
    tier: 'gold',
    requirement: '100 apostas',
    checkProgress: (stats) => Math.min((stats.total_bets / 100) * 100, 100)
  },
  
  // SPECIAL BADGES
  {
    id: 'underdog_hunter',
    name: 'Caçador de Azarões',
    description: 'Ganhe 10 apostas com odds 3.00x+',
    icon: '🦅',
    category: 'special',
    tier: 'diamond',
    requirement: '10 vitórias com odds 3.00x+',
    checkProgress: (stats) => Math.min((stats.underdog_wins / 10) * 100, 100)
  },
  {
    id: 'perfect_round',
    name: 'Rodada Perfeita',
    description: 'Acerte todas as apostas de uma rodada (min. 5)',
    icon: '✨',
    category: 'special',
    tier: 'legendary',
    requirement: '100% de acerto em 5+ apostas de uma rodada',
    checkProgress: (stats) => stats.has_perfect_round ? 100 : 0
  },
  
  // SOCIAL BADGES
  {
    id: 'team_player',
    name: 'Espírito de Equipe',
    description: 'Declare um piloto favorito',
    icon: '❤️',
    category: 'social',
    tier: 'bronze',
    requirement: 'Escolher piloto favorito',
    checkProgress: (stats) => stats.has_favorite_pilot ? 100 : 0
  },
  {
    id: 'loyal_fan',
    name: 'Torcedor Fiel',
    description: 'Aposte 20x no mesmo piloto',
    icon: '🏁',
    category: 'social',
    tier: 'silver',
    requirement: '20 apostas no piloto favorito',
    checkProgress: (stats) => Math.min((stats.favorite_pilot_bets / 20) * 100, 100)
  }
];

export function getBadgesByCategory(category: string) {
  return BADGE_DEFINITIONS.filter(b => b.category === category);
}

export function getBadgeById(id: string) {
  return BADGE_DEFINITIONS.find(b => b.id === id);
}
