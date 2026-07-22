alter table public.rooms
  add column if not exists phase_ends_at timestamptz;
