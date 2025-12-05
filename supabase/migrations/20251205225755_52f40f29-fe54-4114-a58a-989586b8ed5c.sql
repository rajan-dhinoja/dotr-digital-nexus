-- Assign admin role to the existing user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'rajandhinoja03@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;