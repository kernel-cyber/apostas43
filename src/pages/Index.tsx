import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPoints } from "@/hooks/useUserPoints";
import { useLiveStats } from "@/hooks/useLiveStats";
import { useActiveMatches } from "@/hooks/useActiveMatches";
import { useMatchNotifications } from "@/hooks/useMatchNotifications";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useBetting } from "@/hooks/useBetting";
import { useRecentForm } from "@/hooks/useRecentForm";
import { useWinnerNotification } from "@/hooks/useWinnerNotification";
import { useBetResults } from "@/hooks/useBetResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RaceCard } from "@/components/racing/RaceCard";
import RealTournamentBracket from "@/components/racing/RealTournamentBracket";
import Leaderboard from "@/components/racing/Leaderboard";
import { LiveEventCard } from "@/components/racing/LiveEventCard";
import WinnerCelebration from "@/components/racing/WinnerCelebration";
import { OnlineUsers } from "@/components/OnlineUsers";
import { Trophy, Zap, Target, TrendingUp, Star, Medal, Crown, Flame, LogOut, Settings, Play, ListOrdered, User } from "lucide-react";
import trackBg from "@/assets/racing-track-bg.jpg";
const Index = () => {
  const {
    user,
    isAdmin,
    signOut,
    loading
  } = useAuth();
  const {
    points,
    loading: pointsLoading
  } = useUserPoints(user?.id);
  const {
    stats,
    loading: statsLoading
  } = useLiveStats();
  const {
    liveMatch,
    upcomingMatches,
    loading: matchesLoading
  } = useActiveMatches();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("live");

  // Winner notification system
  const {
    lastWinner,
    showCelebration,
    setShowCelebration
  } = useWinnerNotification();
  const [previousMatchId, setPreviousMatchId] = useState<string | null>(null);
  const [isNewMatch, setIsNewMatch] = useState(false);

  // Get betting odds for live match
  const {
    odds: liveOdds
  } = useBetting(liveMatch?.id || null);

  // Get recent form for both pilots
  const {
    recentForm: pilot1Form
  } = useRecentForm(liveMatch?.pilot1_id);
  const {
    recentForm: pilot2Form
  } = useRecentForm(liveMatch?.pilot2_id);

  // Enable real-time match notifications
  useMatchNotifications();

  // Hook para detectar resultados de apostas
  useBetResults(user?.id);

  // Sound effects
  const {
    playMatchStart
  } = useSoundEffects();
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Detect new match for animation and play sound
  useEffect(() => {
    if (liveMatch?.id && liveMatch.id !== previousMatchId) {
      setIsNewMatch(true);
      setPreviousMatchId(liveMatch.id);

      // Play sound for new match
      if (previousMatchId !== null) {
        playMatchStart();
      }

      // Reset animation flag
      setTimeout(() => setIsNewMatch(false), 1500);
    }
  }, [liveMatch?.id, previousMatchId, playMatchStart]);

  // Create race object with dynamic data
  const mockRace = liveMatch ? {
    id: liveMatch.id,
    pilot1Id: liveMatch.pilot1_id,
    pilot2Id: liveMatch.pilot2_id,
    pilot1: {
      name: liveMatch.pilot1?.name || "TBD",
      car: liveMatch.pilot1?.car_name || "TBD",
      position: liveMatch.pilot1?.position || 0,
      wins: liveMatch.pilot1?.wins || 0,
      losses: liveMatch.pilot1?.losses || 0,
      avatar: "🏎️",
      winRate: liveMatch.pilot1 && (liveMatch.pilot1 as any).total_races ? Math.round(liveMatch.pilot1.wins / (liveMatch.pilot1 as any).total_races * 100) : 0,
      bestTime: (liveMatch.pilot1 as any)?.best_time || "N/A",
      recentForm: pilot1Form.length > 0 ? pilot1Form : ["?", "?", "?", "?", "?"]
    },
    pilot2: {
      name: liveMatch.pilot2?.name || "TBD",
      car: liveMatch.pilot2?.car_name || "TBD",
      position: liveMatch.pilot2?.position || 0,
      wins: liveMatch.pilot2?.wins || 0,
      losses: liveMatch.pilot2?.losses || 0,
      avatar: "⚡",
      winRate: liveMatch.pilot2 && (liveMatch.pilot2 as any).total_races ? Math.round(liveMatch.pilot2.wins / (liveMatch.pilot2 as any).total_races * 100) : 0,
      bestTime: (liveMatch.pilot2 as any)?.best_time || "N/A",
      recentForm: pilot2Form.length > 0 ? pilot2Form : ["?", "?", "?", "?", "?"]
    },
    event: liveMatch.event?.name || "ÁREA 43",
    round: liveMatch.bracket_type === 'odd' ? `Rodada Ímpar #${liveMatch.round_number}` : liveMatch.bracket_type === 'even' ? `Rodada Par #${liveMatch.round_number}` : `Rodada #${liveMatch.round_number}`,
    status: "live" as const,
    bets: {
      pilot1: liveOdds?.pilot1_percentage || 50,
      pilot2: liveOdds?.pilot2_percentage || 50
    },
    totalPool: liveOdds?.total_pool || stats.totalPool,
    totalBets: stats.totalBets,
    odds: {
      pilot1: liveOdds?.pilot1_odds || 2.00,
      pilot2: liveOdds?.pilot2_odds || 2.00
    }
  } : null;
  const handleBetSuccess = () => {
    // Points will auto-update via realtime subscription
  };
  if (loading || !user || pointsLoading || statsLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Zap className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background track-lines overflow-x-hidden">
      {/* Winner Celebration */}
      {showCelebration && lastWinner && <WinnerCelebration winner={lastWinner} show={showCelebration} onComplete={() => setShowCelebration(false)} />}
      
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 glass-card backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-2 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* #17: Logo correto igual à tela de login + ícone melhor */}
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse" />
              <div className="flex items-center gap-1">
                <span className="font-bold text-base sm:text-lg premium-gradient-text">ÁREA</span>
                <span className="font-bold text-base sm:text-lg text-racing-yellow neon-text">43</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <OnlineUsers />
              {/* #5: Foto de perfil no header */}
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3" onClick={() => navigate('/profile')}>
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Perfil</span>
              </Button>
              {isAdmin && <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3" onClick={() => navigate('/admin')}>
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">ADMIN</span>
                </Button>}
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3" onClick={signOut}>
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">SAIR</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Hero Section */}
      <header className="relative overflow-hidden border-b border-border" style={{
      backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${trackBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
        <div className="relative container mx-auto px-2 sm:px-4 py-12 sm:py-16 md:py-20 text-center">
          {/* Event Status Bar */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="glass-card px-3 sm:px-6 py-2 sm:py-3 rounded-full">
              <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-neonGreen animate-pulse" />
                  <span className="text-neonGreen font-semibold text-xs sm:text-sm">AO VIVO</span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-border" />
                <OnlineUsers />
              </div>
            </div>
          </div>

          {/* Main Title */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Badge variant="outline" className="border-accent text-accent mb-2 sm:mb-4 px-3 sm:px-6 py-1 sm:py-2 text-sm sm:text-lg gold-shimmer">
                <Flame className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-base">NO PREP RACING BRASIL</span>
              </Badge>
          {/* #12: Label corrigido */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-2 sm:mb-4">
            <span className="premium-gradient-text neon-text">ÁREA 43</span>
            <span className="block text-accent">
              </span>
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">Plataforma de apostas do campeonato de drag racing mais emocionante do Brasil.</p>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mt-8 sm:mt-12 max-w-4xl mx-auto px-2">
              {[{
              label: "Seus Pontos",
              value: points.toLocaleString(),
              icon: Star,
              color: "text-accent"
            }, {
              label: "Pool Total",
              value: `${(stats.totalPool / 1000).toFixed(1)}K`,
              icon: Trophy,
              color: "text-primary"
            }, {
              label: "Apostas",
              value: stats.totalBets.toString(),
              icon: TrendingUp,
              color: "text-neonGreen"
            }, {
              label: "Pilotos",
              value: stats.activePilots.toString(),
              icon: Crown,
              color: "text-chrome"
            }].map(({
              label,
              value,
              icon: Icon,
              color
            }, i) => <div key={i} className="glass-card p-3 sm:p-4 rounded-xl text-center card-enter" style={{
              animationDelay: `${i * 0.1}s`
            }}>
                  <Icon className={`w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 ${color}`} />
                  <div className="text-lg sm:text-2xl font-bold text-foreground">{value}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{label}</div>
                </div>)}
            </div>
          </div>
        </div>
      </header>

      {/* Premium Navigation */}
      <nav className="sticky top-[60px] z-40 glass-card backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-2 sm:px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0">
              {[{
              id: "live",
              label: "Rodadas",
              icon: Play,
              badge: "AO VIVO",
              shortLabel: "Rodadas",
              color: "text-neonGreen"
            }, {
              id: "lista43",
              label: "LISTA 43",
              icon: ListOrdered,
              badge: "TOP 20",
              shortLabel: "LISTA",
              color: "text-racing-yellow"
            }, {
              id: "ranking",
              label: "RANKINGS",
              icon: TrendingUp,
              badge: null,
              shortLabel: "RANK",
              color: "text-accent"
            }].map(({
              id,
              label,
              icon: Icon,
              badge,
              shortLabel,
              color
            }) => <TabsTrigger key={id} value={id} className="flex-col space-y-1 py-3 px-2 sm:py-4 sm:px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-center sm:space-x-2 space-y-1 sm:space-y-0">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
                  <span className="font-semibold text-[10px] sm:text-base hidden sm:inline">{label}</span>
                  <span className="font-semibold text-[10px] sm:hidden">{shortLabel}</span>
                  {badge && <Badge variant="outline" className="text-[8px] sm:text-xs px-1 sm:px-2 py-0 sm:py-0.5">
                      {badge}
                    </Badge>}
                </div>
                </TabsTrigger>)}
            </TabsList>

            {/* Tab Contents */}
            <div className="container mx-auto px-4 py-8">
              <TabsContent value="live" className="space-y-8 mt-0">
                {liveMatch ? liveMatch.match_status === 'finished' ? <Card className="glass-card p-12 text-center animate-fade-in">
                      <div className="relative mx-auto w-20 h-20 mb-6">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative bg-gradient-to-br from-primary to-accent p-4 rounded-full">
                          <Trophy className="h-12 w-12 text-primary-foreground" />
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold text-foreground mb-3">Match Finalizado!</h3>
                      <p className="text-lg text-muted-foreground mb-2">
                        Aguardando início de novo match...
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{
                    animationDelay: '0ms'
                  }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{
                    animationDelay: '150ms'
                  }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{
                    animationDelay: '300ms'
                  }} />
                      </div>
                    </Card> : mockRace ? <LiveEventCard race={mockRace} userPoints={points} userId={user.id} onBetSuccess={handleBetSuccess} isNew={isNewMatch} /> : null : <Card className="glass-card p-8 text-center">
                    <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">Nenhuma rodada ao vivo</h3>
                    <p className="text-muted-foreground">Aguarde o próximo evento começar!</p>
                  </Card>}
                
                {/* Upcoming Races */}
                {upcomingMatches.length > 0 && <div className="space-y-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-center">Próximas Rodadas</h3>
                    <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                      {upcomingMatches.sort((a, b) => {
                    // Ordenar por scheduled_time (mais próximo primeiro)
                    if (a.scheduled_time && b.scheduled_time) {
                      return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime();
                    }
                    // Fallback: ordenar por round_number (rodadas menores primeiro)
                    // Depois por MENOR posição dos pilotos (mais importantes primeiro)
                    if (a.round_number !== b.round_number) {
                      return a.round_number - b.round_number;
                    }
                    const minPosA = Math.min(a.pilot1?.position || 999, a.pilot2?.position || 999);
                    const minPosB = Math.min(b.pilot1?.position || 999, b.pilot2?.position || 999);
                    return minPosA - minPosB;
                  }).map((match, index) => <Card key={match.id} className={`glass-card hover:shadow-neon transition-all duration-300 ${index === 0 ? 'animate-pulse-border-green' : ''}`}>
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="outline" className="text-[10px] sm:text-xs">
                                {match.bracket_type === 'odd' ? `Rodada Ímpar #${match.round_number}` : match.bracket_type === 'even' ? `Rodada Par #${match.round_number}` : `Rodada #${match.round_number}`} - {match.event?.name || "EVENTO"}
                              </Badge>
                              <div className="flex items-center space-x-1 sm:space-x-2 text-[10px] sm:text-xs text-muted-foreground">
                                <Star className="w-3 h-3" />
                                <span>Aguardando</span>
                              </div>
                            </div>
                            <div className="text-center space-y-2">
                              <div className="grid grid-cols-3 gap-2 items-center">
                                <div className="text-right">
                                  <div className="font-semibold text-xs sm:text-sm truncate">{match.pilot1?.name || "TBD"}</div>
                                  <div className="text-[10px] sm:text-xs text-accent">#{match.pilot1?.position || "?"}</div>
                                  {match.pilot1?.team && <div className="text-[9px] text-muted-foreground truncate">🏁 {match.pilot1.team}</div>}
                                </div>
                                <div className="text-[10px] sm:text-xs text-muted-foreground">VS</div>
                                <div className="text-left">
                                  <div className="font-semibold text-xs sm:text-sm truncate">{match.pilot2?.name || "TBD"}</div>
                                  <div className="text-[10px] sm:text-xs text-accent">#{match.pilot2?.position || "?"}</div>
                                  {match.pilot2?.team && <div className="text-[9px] text-muted-foreground truncate">🏁 {match.pilot2.team}</div>}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>)}
                    </div>
                  </div>}
              </TabsContent>

              <TabsContent value="lista43" className="mt-0">
                <div className="space-y-8">
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold premium-gradient-text">LISTA 43 - TOP 20</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Acompanhe o chaveamento e as posições atuais da Lista 43 em tempo real.
                    </p>
                  </div>
                  <RealTournamentBracket />
                </div>
              </TabsContent>

              <TabsContent value="ranking" className="mt-0">
                <div className="space-y-8">
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold premium-gradient-text">RANKINGS OFICIAIS</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Classificação oficial dos pilotos da Área 43 baseada em desempenho e pontuação.
                    </p>
                  </div>
                  <Leaderboard />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </nav>
    </div>;
};
export default Index;