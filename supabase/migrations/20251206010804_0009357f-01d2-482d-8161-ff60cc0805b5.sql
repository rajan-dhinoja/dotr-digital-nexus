-- Add the existing user as admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('37f411c8-219d-4e8b-aea9-549aa0d6bcf6', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;