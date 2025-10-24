-- Allow users to insert their own badges
CREATE POLICY "Users can insert own badges"
ON public.user_badges
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);