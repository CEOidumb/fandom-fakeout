alter table public.rooms
  add column if not exists hint_mode text not null default 'hint',
  add column if not exists show_category boolean not null default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_hint_mode_check'
      and conrelid = 'public.rooms'::regclass
  ) then
    alter table public.rooms
      add constraint rooms_hint_mode_check
      check (hint_mode in ('hint', 'none'));
  end if;
end
$$;
