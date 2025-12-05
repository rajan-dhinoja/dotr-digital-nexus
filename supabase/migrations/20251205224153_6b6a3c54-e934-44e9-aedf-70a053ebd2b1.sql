-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('service-images', 'service-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('team-profiles', 'team-profiles', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Storage policies for public read
CREATE POLICY "Public read service images" ON storage.objects FOR SELECT USING (bucket_id = 'service-images');
CREATE POLICY "Public read project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Public read team profiles" ON storage.objects FOR SELECT USING (bucket_id = 'team-profiles');
CREATE POLICY "Public read blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');

-- Admin upload policies
CREATE POLICY "Admin upload service images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'service-images' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin upload project images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin upload team profiles" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'team-profiles' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin upload blog images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND public.is_admin_or_editor(auth.uid()));

-- Admin update policies
CREATE POLICY "Admin update service images" ON storage.objects FOR UPDATE USING (bucket_id = 'service-images' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin update project images" ON storage.objects FOR UPDATE USING (bucket_id = 'project-images' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin update team profiles" ON storage.objects FOR UPDATE USING (bucket_id = 'team-profiles' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin update blog images" ON storage.objects FOR UPDATE USING (bucket_id = 'blog-images' AND public.is_admin_or_editor(auth.uid()));

-- Admin delete policies
CREATE POLICY "Admin delete service images" ON storage.objects FOR DELETE USING (bucket_id = 'service-images' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin delete project images" ON storage.objects FOR DELETE USING (bucket_id = 'project-images' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin delete team profiles" ON storage.objects FOR DELETE USING (bucket_id = 'team-profiles' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admin delete blog images" ON storage.objects FOR DELETE USING (bucket_id = 'blog-images' AND public.is_admin_or_editor(auth.uid()));