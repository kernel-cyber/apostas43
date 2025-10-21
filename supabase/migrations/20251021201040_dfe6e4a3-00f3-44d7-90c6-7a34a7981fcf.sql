-- Adicionar foreign key entre user_points e profiles
ALTER TABLE user_points 
ADD CONSTRAINT user_points_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;