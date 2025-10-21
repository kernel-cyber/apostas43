-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for event types
CREATE TYPE public.event_type AS ENUM ('shark_tank', 'lista_43');

-- Create enum for match status
CREATE TYPE public.match_status AS ENUM ('upcoming', 'live', 'finished');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User roles are viewable by everyone"
  ON public.user_roles FOR SELECT
  USING (true);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create pilots table
CREATE TABLE public.pilots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  car_name TEXT NOT NULL,
  car_model TEXT,
  image_url TEXT,
  position INTEGER,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_races INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pilots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pilots are viewable by everyone"
  ON public.pilots FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert pilots"
  ON public.pilots FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update pilots"
  ON public.pilots FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete pilots"
  ON public.pilots FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  event_type event_type NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage events"
  ON public.events FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  pilot1_id UUID REFERENCES public.pilots(id) ON DELETE CASCADE NOT NULL,
  pilot2_id UUID REFERENCES public.pilots(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  match_status match_status DEFAULT 'upcoming',
  winner_id UUID REFERENCES public.pilots(id) ON DELETE SET NULL,
  scheduled_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are viewable by everyone"
  ON public.matches FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage matches"
  ON public.matches FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create bets table
CREATE TABLE public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  pilot_id UUID REFERENCES public.pilots(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bets"
  ON public.bets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bets"
  ON public.bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bets"
  ON public.bets FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create user_points table
CREATE TABLE public.user_points (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 1000,
  total_bets INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points"
  ON public.user_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all points for leaderboard"
  ON public.user_points FOR SELECT
  USING (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.user_points (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pilots_updated_at BEFORE UPDATE ON public.pilots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for online presence
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;