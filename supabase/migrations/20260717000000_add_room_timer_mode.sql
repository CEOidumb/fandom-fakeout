alter table public.rooms
  add column if not exists timer_mode text not null default 'timed';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_timer_mode_check'
      and conrelid = 'public.rooms'::regclass
  ) then
    alter table public.rooms
      add constraint rooms_timer_mode_check
      check (timer_mode in ('timed', 'untimed'));
  end if;
end
$$;
