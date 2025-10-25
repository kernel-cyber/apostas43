-- ============================================
-- SISTEMA COMPLETO PREMIUM - ÁREA 43
-- ============================================

-- 1. NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('match_start', 'bet_won', 'bet_lost', 'points_update', 'badge_earned', 'challenge_complete', 'system')),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. DAILY CHALLENGES
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL,
  challenge_name TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  reward_points INTEGER NOT NULL,
  reward_badge TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_challenges_user_id ON public.daily_challenges(user_id);
CREATE INDEX idx_daily_challenges_expires_at ON public.daily_challenges(expires_at);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges"
ON public.daily_challenges FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
ON public.daily_challenges FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 3. CHAT DE MATCHES
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_match_id ON public.chat_messages(match_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat messages are viewable by everyone"
ON public.chat_messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert own messages"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. REACTIONS NOS MATCHES
CREATE TABLE IF NOT EXISTS public.match_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('fire', 'clap', 'shock', 'muscle', 'heart')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id, user_id)
);

CREATE INDEX idx_match_reactions_match_id ON public.match_reactions(match_id);

ALTER TABLE public.match_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions are viewable by everyone"
ON public.match_reactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage own reactions"
ON public.match_reactions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. FEED DE ATIVIDADES
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('big_win', 'streak', 'badge_earned', 'bet_placed')),
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_feed_created_at ON public.activity_feed(created_at DESC);

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity feed is viewable by everyone"
ON public.activity_feed FOR SELECT
TO authenticated
USING (true);

-- 6. SISTEMA DE SEASONS
CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_seasons_active ON public.seasons(is_active);

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seasons are viewable by everyone"
ON public.seasons FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage seasons"
ON public.seasons FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. LEAGUE STANDINGS
CREATE TABLE IF NOT EXISTS public.league_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  league_tier TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  wins INTEGER DEFAULT 0,
  total_bets INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(season_id, user_id)
);

CREATE INDEX idx_league_standings_season_id ON public.league_standings(season_id);
CREATE INDEX idx_league_standings_points ON public.league_standings(points DESC);

ALTER TABLE public.league_standings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "League standings are viewable by everyone"
ON public.league_standings FOR SELECT
TO authenticated
USING (true);

-- 8. SEASON REWARDS
CREATE TABLE IF NOT EXISTS public.season_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  reward_points INTEGER NOT NULL,
  reward_badge TEXT,
  claimed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(season_id, user_id)
);

ALTER TABLE public.season_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rewards are viewable by everyone"
ON public.season_rewards FOR SELECT
TO authenticated
USING (true);

-- 9. THEME PREFERENCE
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('dark', 'light', 'racing-yellow', 'neon-green', 'red-hot', 'blue-ice', 'purple-galaxy'));

-- 10. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;