-- Create storage bucket for pilot images
INSERT INTO storage.buckets (id, name, public)
VALUES ('pilot-images', 'pilot-images', true);

-- Create storage policies for pilot images
CREATE POLICY "Pilot images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pilot-images');

CREATE POLICY "Admins can upload pilot images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pilot-images' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update pilot images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pilot-images' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete pilot images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pilot-images' AND
    public.has_role(auth.uid(), 'admin')
  );