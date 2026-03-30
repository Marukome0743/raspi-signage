-- orders table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  set1 jsonb not null default '[]'::jsonb,
  hidden jsonb not null default '[]'::jsonb
);

-- pixel_sizes table
create table public.pixel_sizes (
  id uuid primary key default gen_random_uuid(),
  width integer not null default 0,
  height integer not null default 0,
  pixel_width integer not null default 0,
  pixel_height integer not null default 0,
  margin_top integer not null default 0,
  margin_left integer not null default 0,
  display_content_flg boolean not null default true,
  get_pixel_flg boolean not null default false
);

-- contents table
create table public.contents (
  id uuid primary key default gen_random_uuid(),
  area_id text not null,
  area_name text not null,
  order_id uuid references public.orders(id),
  pixel_size_id uuid references public.pixel_sizes(id),
  deleted boolean not null default false
);

-- users table (linked to auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  user_name text not null,
  management boolean not null default false,
  coverage_area text[] not null default '{}',
  pass_flg boolean not null default false,
  deleted boolean not null default false
);

-- RLS
alter table public.orders enable row level security;
alter table public.pixel_sizes enable row level security;
alter table public.contents enable row level security;
alter table public.users enable row level security;

-- Authenticated users can read all tables
create policy "Authenticated users can read orders" on public.orders
  for select to authenticated using (true);
create policy "Authenticated users can read pixel_sizes" on public.pixel_sizes
  for select to authenticated using (true);
create policy "Authenticated users can read contents" on public.contents
  for select to authenticated using (true);
create policy "Authenticated users can read users" on public.users
  for select to authenticated using (true);

-- Authenticated users can insert/update/delete
create policy "Authenticated users can insert orders" on public.orders
  for insert to authenticated with check (true);
create policy "Authenticated users can update orders" on public.orders
  for update to authenticated using (true);
create policy "Authenticated users can insert pixel_sizes" on public.pixel_sizes
  for insert to authenticated with check (true);
create policy "Authenticated users can update pixel_sizes" on public.pixel_sizes
  for update to authenticated using (true);
create policy "Authenticated users can insert contents" on public.contents
  for insert to authenticated with check (true);
create policy "Authenticated users can update contents" on public.contents
  for update to authenticated using (true);
create policy "Authenticated users can insert users" on public.users
  for insert to authenticated with check (true);
create policy "Authenticated users can update users" on public.users
  for update to authenticated using (true);

-- Allow anon read for signage display (public-facing page uses getServerSideProps with service_role,
-- but keep anon select on orders/contents/pixel_sizes for flexibility)
create policy "Anon can read orders" on public.orders
  for select to anon using (true);
create policy "Anon can read pixel_sizes" on public.pixel_sizes
  for select to anon using (true);
create policy "Anon can read contents" on public.contents
  for select to anon using (true);
