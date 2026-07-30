alter table public.rooms
  add column if not exists random_categories jsonb not null default '[]'::jsonb;
