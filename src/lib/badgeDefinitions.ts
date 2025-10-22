import { LucideIcon } from 'lucide-react';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconComponent: LucideIcon;
  category: 'participation' | 'performance' | 'volume' | 'special' | 'social';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'secret';
  requirement: string;
  pointMultiplier: number;
  checkProgress: (userStats: any) => number;
}

import {
  Medal, Award, Trophy, Star, Crown, Gem,
  Users, Calendar, Target, TrendingUp, Flame, Zap,
  DollarSign, Coins, Wallet, Sparkles, Eye, Brain,
  Heart, Shield, Swords, Rocket, CheckCircle, Lock
} from 'lucide-react';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // PARTICIPATION BADGES (15 badges)
  {
    id: 'first_bet',
    name: 'Primeira Aposta',
    description: 'Fez sua primeira aposta no sistema',
    icon: '🎯',
    iconComponent: Target,
    category: 'participation',
    tier: 'bronze',
    rarity: 'common',
    requirement: 'Apostar pela primeira vez',
    pointMultiplier: 1.0,
    checkProgress: (stats) => stats.total_bets >= 1 ? 100 : 0
  },
  {
    id: 'iniciante',
    name: 'Iniciante',
    description: 'Começou sua jornada no sistema de apostas',
    icon: '🌱',
    iconComponent: Medal,
    category: 'participation',
    tier: 'bronze',
    rarity: 'common',
    requirement: '1 aposta',
    pointMultiplier: 1.0,
    checkProgress: (stats) => stats.total_bets >= 1 ? 100 : 0
  },
  {
    id: 'apostador',
    name: 'Apostador',
    description: 'Fez 10 apostas no sistema',
    icon: '🎲',
    iconComponent: Medal,
    category: 'participation',
    tier: 'bronze',
    rarity: 'common',
    requirement: '10 apostas',
    pointMultiplier: 1.0,
    checkProgress: (stats) => Math.min((stats.total_bets / 10) * 100, 100)
  },
  {
    id: 'veterano',
    name: 'Veterano',
    description: 'Fez 50 apostas e continua firme',
    icon: '⭐',
    iconComponent: Award,
    category: 'participation',
    tier: 'silver',
    rarity: 'common',
    requirement: '50 apostas',
    pointMultiplier: 1.0,
    checkProgress: (stats) => Math.min((stats.total_bets / 50) * 100, 100)
  },
  {
    id: 'lenda',
    name: 'Lenda',
    description: 'Atingiu 250 apostas - você é uma lenda!',
    icon: '🏆',
    iconComponent: Trophy,
    category: 'participation',
    tier: 'gold',
    rarity: 'rare',
    requirement: '250 apostas',
    pointMultiplier: 1.0,
    checkProgress: (stats) => Math.min((stats.total_bets / 250) * 100, 100)
  },
  {
    id: 'imortal',
    name: 'Imortal',
    description: 'Alcançou 1000 apostas - status imortal!',
    icon: '⚡',
    iconComponent: Star,
    category: 'participation',
    tier: 'platinum',
    rarity: 'epic',
    requirement: '1000 apostas',
    pointMultiplier: 1.0,
    checkProgress: (stats) => Math.min((stats.total_bets / 1000) * 100, 100)
  },
  {
    id: 'ascendido',
    name: 'Ascendido',
    description: 'Transcendeu com 5000 apostas',
    icon: '💫',
    iconComponent: Gem,
    category: 'participation',
    tier: 'diamond',
    rarity: 'legendary',
    requirement: '5000 apostas',
    pointMultiplier: 1.0,
    checkProgress: (stats) => Math.min((stats.total_bets / 5000) * 100, 100)
  },
  {
    id: 'eterno',
    name: 'Eterno',
    description: 'Atingiu o ápice com 10000 apostas',
    icon: '👑',
    iconComponent: Crown,
    category: 'participation',
    tier: 'legendary',
    rarity: 'legendary',
    requirement: '10000 apostas',
    pointMultiplier: 1.0,
    checkProgress: (stats) => Math.min((stats.total_bets / 10000) * 100, 100)
  },
  {
    id: 'explorador_1',
    name: 'Explorador',
    description: 'Participou do primeiro evento',
    icon: '🗺️',
    iconComponent: Calendar,
    category: 'participation',
    tier: 'bronze',
    rarity: 'common',
    requirement: '1 evento',
    pointMultiplier: 1.0,
    checkProgress: (stats) => stats.events_participated >= 1 ? 100 : 0
  },
  {
    id: 'explorador_3',
    name: 'Explorador Bronze',
    description: 'Participou de 3 eventos',
    icon: '🧭',
    iconComponent: Calendar,
    category: 'participation',
    tier: 'bronze',
    rarity: 'common',
    requirement: '3 eventos',
    pointMultiplier: 1.0,
    checkProgress: (stats) => Math.min((stats.events_participated / 3) * 100, 100)
  },
  {
    id: 'event_veteran_bronze',
    name: 'Veterano Bronze',
    description: 'Participou de 3 eventos diferentes',
    icon: '📅',
    iconComponent: Users,
    category: 'participation',
    tier: 'bronze',
    rarity: 'common',
    requirement: 'Participar de 3 eventos',
    pointMultiplier: 1.0,
    checkProgress: (stats) => Math.min((stats.events_participated / 3) * 100, 100)
  },
  {
    id: 'explorador_5',
    name: 'Explorador Prata',
    description: 'Participou de 5 eventos',
    icon: '🌍',
    iconComponent: Calendar,
    category: 'participation',
    tier: 'silver',
    rarity: 'common',
    requirement: '5 eventos',
    pointMultiplier: 1.0,
    checkProgress: (stats) => Math.min((stats.events_participated / 5) * 100, 100)
  },
  {
    id: 'event_veteran_silver',
    name: 'Veterano Prata',
    description: 'Participou de 10 eventos diferentes',
    icon: '📆',
    iconComponent: Users,
    category: 'participation',
    tier: 'silver',
    rarity: 'rare',
    requirement: 'Participar de 10 eventos',
    pointMultiplier: 1.0,
    checkProgress: (stats) => Math.min((stats.events_participated / 10) * 100, 100)
  },
  {
    id: 'explorador_10',
    name: 'Explorador Ouro',
    description: 'Participou de 10 eventos',
    icon: '🏅',
    iconComponent: Trophy,
    category: 'participation',
    tier: 'gold',
    rarity: 'rare',
    requirement: '10 eventos',
    pointMultiplier: 1.0,
    checkProgress: (stats) => Math.min((stats.events_participated / 10) * 100, 100)
  },
  {
    id: 'explorador_25',
    name: 'Explorador Platina',
    description: 'Participou de 25 eventos',
    icon: '💎',
    iconComponent: Star,
    category: 'participation',
    tier: 'platinum',
    rarity: 'epic',
    requirement: '25 eventos',
    pointMultiplier: 1.0,
    checkProgress: (stats) => Math.min((stats.events_participated / 25) * 100, 100)
  },
  {
    id: 'explorador_50',
    name: 'Explorador Lendário',
    description: 'Participou de 50 eventos',
    icon: '🌌',
    iconComponent: Crown,
    category: 'participation',
    tier: 'legendary',
    rarity: 'legendary',
    requirement: '50 eventos',
    pointMultiplier: 1.0,
    checkProgress: (stats) => Math.min((stats.events_participated / 50) * 100, 100)
  },
  
  // PERFORMANCE BADGES (18 badges)
  {
    id: 'winrate_60',
    name: 'Promissor',
    description: '60%+ de taxa de vitória com 20+ apostas',
    icon: '📈',
    iconComponent: TrendingUp,
    category: 'performance',
    tier: 'bronze',
    rarity: 'common',
    requirement: '60%+ WR com 20+ apostas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => {
      if (stats.total_bets < 20) return (stats.total_bets / 20) * 50;
      if (stats.win_rate >= 60) return 100;
      return 50 + ((stats.win_rate / 60) * 50);
    }
  },
  {
    id: 'winrate_65',
    name: 'Competente',
    description: '65%+ de taxa de vitória com 50+ apostas',
    icon: '📊',
    iconComponent: TrendingUp,
    category: 'performance',
    tier: 'silver',
    rarity: 'rare',
    requirement: '65%+ WR com 50+ apostas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => {
      if (stats.total_bets < 50) return (stats.total_bets / 50) * 50;
      if (stats.win_rate >= 65) return 100;
      return 50 + ((stats.win_rate / 65) * 50);
    }
  },
  {
    id: 'sharpshooter',
    name: 'Atirador de Elite',
    description: 'Mantenha 70%+ de win rate com 100+ apostas',
    icon: '🎖️',
    iconComponent: Target,
    category: 'performance',
    tier: 'gold',
    rarity: 'epic',
    requirement: '70%+ WR com 100+ apostas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => {
      if (stats.total_bets < 100) return (stats.total_bets / 100) * 50;
      if (stats.win_rate >= 70) return 100;
      return 50 + ((stats.win_rate / 70) * 50);
    }
  },
  {
    id: 'winrate_70',
    name: 'Mestre',
    description: '70%+ de taxa de vitória com 100+ apostas',
    icon: '🏅',
    iconComponent: Trophy,
    category: 'performance',
    tier: 'gold',
    rarity: 'epic',
    requirement: '70%+ WR com 100+ apostas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => {
      if (stats.total_bets < 100) return (stats.total_bets / 100) * 50;
      if (stats.win_rate >= 70) return 100;
      return 50 + ((stats.win_rate / 70) * 50);
    }
  },
  {
    id: 'winrate_75',
    name: 'Virtuoso',
    description: '75%+ de taxa de vitória com 200+ apostas',
    icon: '💫',
    iconComponent: Star,
    category: 'performance',
    tier: 'platinum',
    rarity: 'legendary',
    requirement: '75%+ WR com 200+ apostas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => {
      if (stats.total_bets < 200) return (stats.total_bets / 200) * 50;
      if (stats.win_rate >= 75) return 100;
      return 50 + ((stats.win_rate / 75) * 50);
    }
  },
  {
    id: 'winrate_80',
    name: 'Perfeição',
    description: '80%+ de taxa de vitória com 500+ apostas',
    icon: '💎',
    iconComponent: Gem,
    category: 'performance',
    tier: 'diamond',
    rarity: 'legendary',
    requirement: '80%+ WR com 500+ apostas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => {
      if (stats.total_bets < 500) return (stats.total_bets / 500) * 50;
      if (stats.win_rate >= 80) return 100;
      return 50 + ((stats.win_rate / 80) * 50);
    }
  },
  {
    id: 'winrate_85',
    name: 'Divino',
    description: '85%+ de taxa de vitória com 1000+ apostas',
    icon: '👑',
    iconComponent: Crown,
    category: 'performance',
    tier: 'legendary',
    rarity: 'legendary',
    requirement: '85%+ WR com 1000+ apostas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => {
      if (stats.total_bets < 1000) return (stats.total_bets / 1000) * 50;
      if (stats.win_rate >= 85) return 100;
      return 50 + ((stats.win_rate / 85) * 50);
    }
  },
  {
    id: 'streak_3',
    name: 'Começo Quente',
    description: 'Ganhe 3 apostas seguidas',
    icon: '🔥',
    iconComponent: Flame,
    category: 'performance',
    tier: 'bronze',
    rarity: 'common',
    requirement: '3 vitórias consecutivas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => Math.min((stats.current_streak / 3) * 100, 100)
  },
  {
    id: 'winning_streak_5',
    name: 'Sequência de Ouro',
    description: 'Ganhe 5 apostas seguidas',
    icon: '🔥',
    iconComponent: Flame,
    category: 'performance',
    tier: 'silver',
    rarity: 'rare',
    requirement: '5 vitórias consecutivas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => Math.min((stats.current_streak / 5) * 100, 100)
  },
  {
    id: 'streak_5',
    name: 'Em Chamas',
    description: 'Ganhe 5 apostas seguidas',
    icon: '🔥',
    iconComponent: Flame,
    category: 'performance',
    tier: 'silver',
    rarity: 'rare',
    requirement: '5 vitórias consecutivas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => Math.min((stats.current_streak / 5) * 100, 100)
  },
  {
    id: 'streak_10',
    name: 'Imparável',
    description: 'Ganhe 10 apostas seguidas',
    icon: '⚡',
    iconComponent: Zap,
    category: 'performance',
    tier: 'gold',
    rarity: 'epic',
    requirement: '10 vitórias consecutivas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => Math.min((stats.current_streak / 10) * 100, 100)
  },
  {
    id: 'streak_20',
    name: 'Lenda Viva',
    description: 'Ganhe 20 apostas seguidas',
    icon: '💫',
    iconComponent: Star,
    category: 'performance',
    tier: 'platinum',
    rarity: 'legendary',
    requirement: '20 vitórias consecutivas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => Math.min((stats.current_streak / 20) * 100, 100)
  },
  {
    id: 'streak_50',
    name: 'Fenômeno',
    description: 'Ganhe 50 apostas seguidas',
    icon: '💎',
    iconComponent: Gem,
    category: 'performance',
    tier: 'diamond',
    rarity: 'legendary',
    requirement: '50 vitórias consecutivas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => Math.min((stats.current_streak / 50) * 100, 100)
  },
  {
    id: 'streak_100',
    name: 'Transcendente',
    description: 'Ganhe 100 apostas seguidas',
    icon: '👑',
    iconComponent: Crown,
    category: 'performance',
    tier: 'legendary',
    rarity: 'legendary',
    requirement: '100 vitórias consecutivas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => Math.min((stats.current_streak / 100) * 100, 100)
  },
  {
    id: 'invicto',
    name: 'Invicto',
    description: 'Complete 1 evento sem perder',
    icon: '🛡️',
    iconComponent: Shield,
    category: 'performance',
    tier: 'gold',
    rarity: 'epic',
    requirement: '1 evento sem derrotas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => 0
  },
  {
    id: 'dominacao_total',
    name: 'Dominação Total',
    description: 'Complete 3 eventos sem perder',
    icon: '⚔️',
    iconComponent: Swords,
    category: 'performance',
    tier: 'legendary',
    rarity: 'legendary',
    requirement: '3 eventos sem derrotas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => 0
  },
  {
    id: 'recuperacao_epica',
    name: 'Recuperação Épica',
    description: 'Perca 5 seguidas e ganhe 10 seguidas',
    icon: '🌟',
    iconComponent: Sparkles,
    category: 'performance',
    tier: 'diamond',
    rarity: 'legendary',
    requirement: 'Perder 5 e ganhar 10 seguidas',
    pointMultiplier: 1.5,
    checkProgress: (stats) => 0
  },
  
  // VOLUME BADGES (12 badges)
  {
    id: 'apostador_casual',
    name: 'Apostador Casual',
    description: 'Apostou 1.000 pontos no total',
    icon: '💵',
    iconComponent: DollarSign,
    category: 'volume',
    tier: 'bronze',
    rarity: 'common',
    requirement: '1.000 pts apostados',
    pointMultiplier: 0.8,
    checkProgress: (stats) => Math.min((stats.total_wagered / 1000) * 100, 100)
  },
  {
    id: 'apostador_serio',
    name: 'Apostador Sério',
    description: 'Apostou 5.000 pontos no total',
    icon: '💴',
    iconComponent: Coins,
    category: 'volume',
    tier: 'silver',
    rarity: 'common',
    requirement: '5.000 pts apostados',
    pointMultiplier: 0.8,
    checkProgress: (stats) => Math.min((stats.total_wagered / 5000) * 100, 100)
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Apostou mais de 10.000 pontos no total',
    icon: '💰',
    iconComponent: Wallet,
    category: 'volume',
    tier: 'platinum',
    rarity: 'rare',
    requirement: '10.000 pts apostados',
    pointMultiplier: 0.8,
    checkProgress: (stats) => Math.min((stats.total_wagered / 10000) * 100, 100)
  },
  {
    id: 'magnata',
    name: 'Magnata',
    description: 'Apostou 50.000 pontos no total',
    icon: '💎',
    iconComponent: Gem,
    category: 'volume',
    tier: 'diamond',
    rarity: 'epic',
    requirement: '50.000 pts apostados',
    pointMultiplier: 0.8,
    checkProgress: (stats) => Math.min((stats.total_wagered / 50000) * 100, 100)
  },
  {
    id: 'oligarca',
    name: 'Oligarca',
    description: 'Apostou 250.000 pontos no total',
    icon: '👑',
    iconComponent: Crown,
    category: 'volume',
    tier: 'legendary',
    rarity: 'legendary',
    requirement: '250.000 pts apostados',
    pointMultiplier: 0.8,
    checkProgress: (stats) => Math.min((stats.total_wagered / 250000) * 100, 100)
  },
  {
    id: 'bet_master_100',
    name: 'Mestre das Apostas',
    description: 'Fez 100 apostas',
    icon: '🎰',
    iconComponent: Trophy,
    category: 'volume',
    tier: 'gold',
    rarity: 'rare',
    requirement: '100 apostas',
    pointMultiplier: 0.8,
    checkProgress: (stats) => Math.min((stats.total_bets / 100) * 100, 100)
  },
  {
    id: 'all_in_master',
    name: 'All-In Master',
    description: 'Aposte 500+ pts em 10 partidas',
    icon: '🃏',
    iconComponent: Zap,
    category: 'volume',
    tier: 'gold',
    rarity: 'rare',
    requirement: '10 apostas de 500+ pts',
    pointMultiplier: 0.8,
    checkProgress: (stats) => Math.min((stats.all_in_bets / 10) * 100, 100)
  },
  {
    id: 'diversificador',
    name: 'Diversificador',
    description: 'Aposte em todos os pilotos do TOP 5',
    icon: '🎲',
    iconComponent: Users,
    category: 'volume',
    tier: 'silver',
    rarity: 'common',
    requirement: 'Apostar no TOP 5',
    pointMultiplier: 0.8,
    checkProgress: (stats) => 0
  },
  {
    id: 'colecionador',
    name: 'Colecionador',
    description: 'Aposte em 15+ pilotos diferentes',
    icon: '📚',
    iconComponent: CheckCircle,
    category: 'volume',
    tier: 'silver',
    rarity: 'common',
    requirement: '15 pilotos diferentes',
    pointMultiplier: 0.8,
    checkProgress: (stats) => Math.min((stats.unique_pilots / 15) * 100, 100)
  },
  
  // SPECIAL BADGES (20 badges)
  {
    id: 'underdog_1',
    name: 'Caça-Azarão',
    description: 'Ganhe 1 aposta com odds 3.00x+',
    icon: '🦅',
    iconComponent: Eye,
    category: 'special',
    tier: 'bronze',
    rarity: 'common',
    requirement: '1 vitória com odds 3.00x+',
    pointMultiplier: 2.0,
    checkProgress: (stats) => stats.underdog_wins >= 1 ? 100 : 0
  },
  {
    id: 'underdog_5',
    name: 'Caçador Iniciante',
    description: 'Ganhe 5 apostas com odds 3.00x+',
    icon: '🦅',
    iconComponent: Eye,
    category: 'special',
    tier: 'silver',
    rarity: 'rare',
    requirement: '5 vitórias com odds 3.00x+',
    pointMultiplier: 2.0,
    checkProgress: (stats) => Math.min((stats.underdog_wins / 5) * 100, 100)
  },
  {
    id: 'underdog_hunter',
    name: 'Caçador de Azarões',
    description: 'Ganhe 10 apostas com odds 3.00x+',
    icon: '🦅',
    iconComponent: Eye,
    category: 'special',
    tier: 'diamond',
    rarity: 'epic',
    requirement: '10 vitórias com odds 3.00x+',
    pointMultiplier: 2.0,
    checkProgress: (stats) => Math.min((stats.underdog_wins / 10) * 100, 100)
  },
  {
    id: 'underdog_10',
    name: 'Especialista em Azarões',
    description: 'Ganhe 10 apostas com odds 3.00x+',
    icon: '🦅',
    iconComponent: Brain,
    category: 'special',
    tier: 'diamond',
    rarity: 'epic',
    requirement: '10 vitórias com odds 3.00x+',
    pointMultiplier: 2.0,
    checkProgress: (stats) => Math.min((stats.underdog_wins / 10) * 100, 100)
  },
  {
    id: 'underdog_25',
    name: 'Mestre dos Azarões',
    description: 'Ganhe 25 apostas com odds 3.00x+',
    icon: '🦅',
    iconComponent: Rocket,
    category: 'special',
    tier: 'diamond',
    rarity: 'legendary',
    requirement: '25 vitórias com odds 3.00x+',
    pointMultiplier: 2.0,
    checkProgress: (stats) => Math.min((stats.underdog_wins / 25) * 100, 100)
  },
  {
    id: 'underdog_50',
    name: 'Lenda dos Azarões',
    description: 'Ganhe 50 apostas com odds 3.00x+',
    icon: '🦅',
    iconComponent: Crown,
    category: 'special',
    tier: 'legendary',
    rarity: 'legendary',
    requirement: '50 vitórias com odds 3.00x+',
    pointMultiplier: 2.0,
    checkProgress: (stats) => Math.min((stats.underdog_wins / 50) * 100, 100)
  },
  {
    id: 'underdog_100',
    name: 'Deus dos Azarões',
    description: 'Ganhe 100 apostas com odds 3.00x+',
    icon: '🦅',
    iconComponent: Crown,
    category: 'special',
    tier: 'legendary',
    rarity: 'legendary',
    requirement: '100 vitórias com odds 3.00x+',
    pointMultiplier: 2.0,
    checkProgress: (stats) => Math.min((stats.underdog_wins / 100) * 100, 100)
  },
  {
    id: 'perfect_round',
    name: 'Rodada Perfeita',
    description: 'Acerte todas as apostas de uma rodada (min. 5)',
    icon: '✨',
    iconComponent: Sparkles,
    category: 'special',
    tier: 'legendary',
    rarity: 'legendary',
    requirement: '100% de acerto em 5+ apostas de uma rodada',
    pointMultiplier: 2.0,
    checkProgress: (stats) => stats.has_perfect_round ? 100 : 0
  },
  {
    id: 'profeta',
    name: 'Profeta',
    description: 'Acerte top 3 apostas mais difíceis do evento',
    icon: '🔮',
    iconComponent: Brain,
    category: 'special',
    tier: 'legendary',
    rarity: 'legendary',
    requirement: 'Top 3 apostas mais difíceis',
    pointMultiplier: 2.0,
    checkProgress: (stats) => 0
  },
  {
    id: 'sniper',
    name: 'Sniper',
    description: 'Ganhe 5 matchs de diferença ≤2 posições',
    icon: '🎯',
    iconComponent: Target,
    category: 'special',
    tier: 'diamond',
    rarity: 'epic',
    requirement: '5 vitórias em matchs equilibrados',
    pointMultiplier: 2.0,
    checkProgress: (stats) => 0
  },
  {
    id: 'virada_epica',
    name: 'Virada Épica',
    description: 'Ganhe aposta com odds 5.00x+',
    icon: '💫',
    iconComponent: Rocket,
    category: 'special',
    tier: 'diamond',
    rarity: 'legendary',
    requirement: '1 vitória com odds 5.00x+',
    pointMultiplier: 2.0,
    checkProgress: (stats) => 0
  },
  
  // SOCIAL BADGES (10 badges)
  {
    id: 'team_player',
    name: 'Espírito de Equipe',
    description: 'Declare um piloto favorito',
    icon: '❤️',
    iconComponent: Heart,
    category: 'social',
    tier: 'bronze',
    rarity: 'common',
    requirement: 'Escolher piloto favorito',
    pointMultiplier: 1.2,
    checkProgress: (stats) => stats.has_favorite_pilot ? 100 : 0
  },
  {
    id: 'loyal_fan',
    name: 'Torcedor Fiel',
    description: 'Aposte 20x no mesmo piloto',
    icon: '🏁',
    iconComponent: Shield,
    category: 'social',
    tier: 'silver',
    rarity: 'common',
    requirement: '20 apostas no piloto favorito',
    pointMultiplier: 1.2,
    checkProgress: (stats) => Math.min((stats.favorite_pilot_bets / 20) * 100, 100)
  },
  {
    id: 'fanatico_50',
    name: 'Fanático',
    description: 'Aposte 50x no piloto favorito',
    icon: '💙',
    iconComponent: Heart,
    category: 'social',
    tier: 'gold',
    rarity: 'rare',
    requirement: '50 apostas no favorito',
    pointMultiplier: 1.2,
    checkProgress: (stats) => Math.min((stats.favorite_pilot_bets / 50) * 100, 100)
  },
  {
    id: 'fanatico_100',
    name: 'Ultra Fanático',
    description: 'Aposte 100x no piloto favorito',
    icon: '💜',
    iconComponent: Heart,
    category: 'social',
    tier: 'platinum',
    rarity: 'epic',
    requirement: '100 apostas no favorito',
    pointMultiplier: 1.2,
    checkProgress: (stats) => Math.min((stats.favorite_pilot_bets / 100) * 100, 100)
  },
  {
    id: 'fanatico_250',
    name: 'Devotado',
    description: 'Aposte 250x no piloto favorito',
    icon: '💖',
    iconComponent: Heart,
    category: 'social',
    tier: 'diamond',
    rarity: 'legendary',
    requirement: '250 apostas no favorito',
    pointMultiplier: 1.2,
    checkProgress: (stats) => Math.min((stats.favorite_pilot_bets / 250) * 100, 100)
  },
  {
    id: 'fanatico_500',
    name: 'Alma Gêmea',
    description: 'Aposte 500x no piloto favorito',
    icon: '💝',
    iconComponent: Crown,
    category: 'social',
    tier: 'legendary',
    rarity: 'legendary',
    requirement: '500 apostas no favorito',
    pointMultiplier: 1.2,
    checkProgress: (stats) => Math.min((stats.favorite_pilot_bets / 500) * 100, 100)
  }
];

export function getBadgesByCategory(category: string) {
  return BADGE_DEFINITIONS.filter(b => b.category === category);
}

export function getBadgeById(id: string) {
  return BADGE_DEFINITIONS.find(b => b.id === id);
}
