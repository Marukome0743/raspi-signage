-- Seed auth users (admin and regular user)
-- password: password123 for both
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, confirmation_token,
  email_change, email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, recovery_token, reauthentication_token,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'admin@example.com',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(), '',
  '', '', '', '', '', '', '',
  '{"provider":"email","providers":["email"]}', '{}', false
), (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'user@example.com',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(), '',
  '', '', '', '', '', '', '',
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
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '[
     {"fileName":"titleimg_pc.png","path":"https://www.openupgroup.co.jp/_assets/images/RN/top/titleimg_pc.png","type":"image","viewTime":10000},
     {"fileName":"service_rn.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/top/service_rn.jpg","type":"image","viewTime":10000},
     {"fileName":"btnpurpose01.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/top/btnpurpose01.jpg","type":"image","viewTime":10000},
     {"fileName":"btnpurpose02.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/top/btnpurpose02.jpg","type":"image","viewTime":10000},
     {"fileName":"purpose_index02.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/purpose/our-purpose/purpose_index02.jpg","type":"image","viewTime":10000}
   ]'::jsonb, '[]'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '[
     {"fileName":"btnpurpose03.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/top/btnpurpose03.jpg","type":"image","viewTime":10000},
     {"fileName":"sustainability.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/top/sustainability.jpg","type":"image","viewTime":10000},
     {"fileName":"img_visual_01_sp.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/service/img_visual_01_sp.jpg","type":"image","viewTime":10000},
     {"fileName":"advantage_thumb.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/service/advantage_thumb.jpg","type":"image","viewTime":10000},
     {"fileName":"purpose_index06.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/purpose/our-purpose/purpose_index06.jpg","type":"image","viewTime":10000}
   ]'::jsonb, '[]'::jsonb),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd',
   '[
     {"fileName":"interview_thumbnail_bnt7.jpg","path":"https://www.openupgroup.co.jp/_assets/images/purpose/open-upper/interview_thumbnail_bnt7.jpg","type":"image","viewTime":10000},
     {"fileName":"interview_thumbnail_bnt6.jpg","path":"https://www.openupgroup.co.jp/_assets/images/purpose/open-upper/interview_thumbnail_bnt6.jpg","type":"image","viewTime":10000},
     {"fileName":"interview_thumbnail_bnt4.jpg","path":"https://www.openupgroup.co.jp/_assets/images/purpose/open-upper/interview_thumbnail_bnt4.jpg","type":"image","viewTime":10000},
     {"fileName":"interview_thumbnail_bnt3.jpg","path":"https://www.openupgroup.co.jp/_assets/images/purpose/open-upper/interview_thumbnail_bnt3.jpg","type":"image","viewTime":10000},
     {"fileName":"purpose_index03.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/purpose/our-purpose/purpose_index03.jpg","type":"image","viewTime":10000}
   ]'::jsonb, '[]'::jsonb),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
   '[
     {"fileName":"interview_thumbnail_yms7.jpg","path":"https://www.openupgroup.co.jp/_assets/images/purpose/open-upper/interview_thumbnail_yms7.jpg","type":"image","viewTime":10000},
     {"fileName":"interview_thumbnail_yms6.jpg","path":"https://www.openupgroup.co.jp/_assets/images/purpose/open-upper/interview_thumbnail_yms6.jpg","type":"image","viewTime":10000},
     {"fileName":"interview_thumbnail_yms5.jpg","path":"https://www.openupgroup.co.jp/_assets/images/purpose/open-upper/interview_thumbnail_yms5.jpg","type":"image","viewTime":10000},
     {"fileName":"interview_thumbnail_yms4.jpg","path":"https://www.openupgroup.co.jp/_assets/images/purpose/open-upper/interview_thumbnail_yms4.jpg","type":"image","viewTime":10000},
     {"fileName":"purpose_index04.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/purpose/our-purpose/purpose_index04.jpg","type":"image","viewTime":10000}
   ]'::jsonb, '[]'::jsonb),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff',
   '[
     {"fileName":"interview_thumbnail_ope6.jpg","path":"https://www.openupgroup.co.jp/_assets/images/purpose/open-upper/interview_thumbnail_ope6.jpg","type":"image","viewTime":10000},
     {"fileName":"interview_thumbnail_ope5.jpg","path":"https://www.openupgroup.co.jp/_assets/images/purpose/open-upper/interview_thumbnail_ope5.jpg","type":"image","viewTime":10000},
     {"fileName":"interview_thumbnail_ope4.jpg","path":"https://www.openupgroup.co.jp/_assets/images/purpose/open-upper/interview_thumbnail_ope4.jpg","type":"image","viewTime":10000},
     {"fileName":"interview_thumbnail_ope3.jpg","path":"https://www.openupgroup.co.jp/_assets/images/purpose/open-upper/interview_thumbnail_ope3.jpg","type":"image","viewTime":10000}
   ]'::jsonb, '[]'::jsonb),
  ('11111111-aaaa-bbbb-cccc-111111111111',
   '[
     {"fileName":"interview_thumbnail_bnt2.jpg","path":"https://www.openupgroup.co.jp/_assets/images/purpose/open-upper/interview_thumbnail_bnt2.jpg","type":"image","viewTime":10000},
     {"fileName":"interview_thumbnail_ope2.jpg","path":"https://www.openupgroup.co.jp/_assets/images/purpose/open-upper/interview_thumbnail_ope2.jpg","type":"image","viewTime":10000},
     {"fileName":"img03.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/case/011/img03.jpg","type":"image","viewTime":10000},
     {"fileName":"img03.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/case/009/img03.jpg","type":"image","viewTime":10000}
   ]'::jsonb, '[]'::jsonb),
  ('22222222-aaaa-bbbb-cccc-222222222222',
   '[
     {"fileName":"img04.png","path":"https://www.openupgroup.co.jp/_assets/images/RN/case/001/img04.png","type":"image","viewTime":10000},
     {"fileName":"img02.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/case/002/img02.jpg","type":"image","viewTime":10000},
     {"fileName":"img01.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/case/004/img01.jpg","type":"image","viewTime":10000},
     {"fileName":"img01.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/case/005/img01.jpg","type":"image","viewTime":10000}
   ]'::jsonb, '[]'::jsonb),
  ('33333333-aaaa-bbbb-cccc-333333333333',
   '[
     {"fileName":"img05.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/case/006/img05.jpg","type":"image","viewTime":10000},
     {"fileName":"img02.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/case/007/img02.jpg","type":"image","viewTime":10000},
     {"fileName":"img04.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/case/008/img04.jpg","type":"image","viewTime":10000},
     {"fileName":"purpose_index01_1.jpg","path":"https://www.openupgroup.co.jp/_assets/images/RN/purpose/our-purpose/purpose_index01_1.jpg","type":"image","viewTime":10000}
   ]'::jsonb, '[]'::jsonb);

-- Seed pixel_sizes
insert into public.pixel_sizes (id, width, height, pixel_width, pixel_height, margin_top, margin_left, display_content_flg, get_pixel_flg) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 1920, 1080, 1920, 1080, 0, 0, true, false);

-- Seed contents (areas)
insert into public.contents (id, area_id, area_name, order_id, pixel_size_id, deleted) values
  (gen_random_uuid(), '0', '関東', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', false),
  (gen_random_uuid(), '1', '関西', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', false),
  (gen_random_uuid(), '2', '北海道', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'cccccccc-cccc-cccc-cccc-cccccccccccc', false),
  (gen_random_uuid(), '3', '東北', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', false),
  (gen_random_uuid(), '4', '中部', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', false),
  (gen_random_uuid(), '5', '中国', '11111111-aaaa-bbbb-cccc-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', false),
  (gen_random_uuid(), '6', '四国', '22222222-aaaa-bbbb-cccc-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', false),
  (gen_random_uuid(), '7', '九州', '33333333-aaaa-bbbb-cccc-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', false);

-- Seed users profile
insert into public.users (id, email, user_name, management, coverage_area, pass_flg, deleted) values
  ('11111111-1111-1111-1111-111111111111', 'admin@example.com', '管理者', true, '{0,1,2,3,4,5,6,7}', false, false),
  ('22222222-2222-2222-2222-222222222222', 'user@example.com', '一般ユーザー', false, '{0}', false, false);
