alter table public.rooms
  add column if not exists selection_mode text not null default 'catalog',
  add column if not exists custom_category text not null default '',
  add column if not exists custom_topic text not null default '',
  add column if not exists word_source text not null default 'ai',
  add column if not exists ai_difficulty text not null default 'medium';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_selection_mode_check'
      and conrelid = 'public.rooms'::regclass
  ) then
    alter table public.rooms
      add constraint rooms_selection_mode_check
      check (selection_mode in ('catalog', 'random', 'custom'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_word_source_check'
      and conrelid = 'public.rooms'::regclass
  ) then
    alter table public.rooms
      add constraint rooms_word_source_check
      check (word_source in ('ai', 'built-in'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_ai_difficulty_check'
      and conrelid = 'public.rooms'::regclass
  ) then
    alter table public.rooms
      add constraint rooms_ai_difficulty_check
      check (ai_difficulty in ('easy', 'medium', 'hard'));
  end if;
end
$$;
