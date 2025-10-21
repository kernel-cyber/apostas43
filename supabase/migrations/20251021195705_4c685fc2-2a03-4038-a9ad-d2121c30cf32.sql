-- Criar tipos ENUM para badges
CREATE TYPE badge_category AS ENUM (
  'participation',
  'performance',
  'volume',
  'special',
  'social'
);

CREATE TYPE badge_tier AS ENUM (
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'legendary'
);

-- Criar tabela user_badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress INTEGER DEFAULT 0,
  category badge_category NOT NULL,
  tier badge_tier,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view all badges"
  ON public.user_badges FOR SELECT
  USING (true);

CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Adicionar coluna favorite_pilot_id na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN favorite_pilot_id UUID REFERENCES public.pilots(id) ON DELETE SET NULL;

-- Trigger para atualizar updated_at em user_badges
CREATE TRIGGER update_user_badges_updated_at
  BEFORE UPDATE ON public.user_badges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();