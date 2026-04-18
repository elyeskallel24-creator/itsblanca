create table if not exists public.products (
  id text primary key,
  name text not null,
  price numeric not null default 0,
  description text not null default '',
  category text not null default 'Autre',
  badge text,
  image text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products_select_all"
  on public.products for select
  using (true);

create policy "products_insert_all"
  on public.products for insert
  with check (true);

create policy "products_update_all"
  on public.products for update
  using (true)
  with check (true);

create policy "products_delete_all"
  on public.products for delete
  using (true);