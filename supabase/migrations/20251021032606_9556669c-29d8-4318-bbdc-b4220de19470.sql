-- 1. Adicionar coluna bracket_type na tabela matches
ALTER TABLE matches ADD COLUMN bracket_type TEXT;

-- Definir valores iniciais baseados em round_number (para dados existentes)
UPDATE matches 
SET bracket_type = CASE 
  WHEN round_number % 2 = 1 THEN 'odd'
  ELSE 'even'
END
WHERE bracket_type IS NULL;

-- 2. Criar bucket de avatares para fotos de perfil
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS policies para avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');