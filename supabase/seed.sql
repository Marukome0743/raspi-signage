-- Seed auth users (admin and regular user)
-- password: password123 for both
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, confirmation_token,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'admin@example.com',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(), '',
  '{"provider":"email","providers":["email"]}', '{}', false
), (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'user@example.com',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(), '',
  '{"provider":"email","providers":["email"]}', '{}', false
);

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  jsonb_build_object('sub', '11111111-1111-1111-1111-111111111111', 'email', 'admin@example.com'),
  'email', now(), now(), now()
), (
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  jsonb_build_object('sub', '22222222-2222-2222-2222-222222222222', 'email', 'user@example.com'),
  'email', now(), now(), now()
);

-- Seed orders
insert into public.orders (id, set1, hidden) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '[]'::jsonb, '[]'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '[]'::jsonb, '[]'::jsonb);

-- Seed pixel_sizes
insert into public.pixel_sizes (id, width, height, pixel_width, pixel_height, margin_top, margin_left, display_content_flg, get_pixel_flg) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 1920, 1080, 1920, 1080, 0, 0, true, false);

-- Seed contents (areas)
insert into public.contents (id, area_id, area_name, order_id, pixel_size_id, deleted) values
  (gen_random_uuid(), '0', '関東', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', false),
  (gen_random_uuid(), '1', '関西', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', null, false);

-- Seed users profile
insert into public.users (id, email, user_name, management, coverage_area, pass_flg, deleted) values
  ('11111111-1111-1111-1111-111111111111', 'admin@example.com', '管理者', true, '{0,1}', false, false),
  ('22222222-2222-2222-2222-222222222222', 'user@example.com', '一般ユーザー', false, '{0}', false, false);
