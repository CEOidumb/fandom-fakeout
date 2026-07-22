-- Run this once in Supabase Dashboard > SQL Editor.
-- It adds the shared game data used by every client and enables instant room updates.

alter table public.rooms
  add column if not exists player_roles jsonb not null default '[]'::jsonb;

alter table public.rooms
  add column if not exists votes jsonb not null default '{}'::jsonb;

alter table public.rooms
  add column if not exists selected_category text not null default 'video-games';

alter table public.rooms
  add column if not exists selected_subcategory text not null default 'valorant';

alter table public.rooms
  add column if not exists selection_mode text not null default 'catalog';

alter table public.rooms
  add column if not exists custom_category text not null default '';

alter table public.rooms
  add column if not exists custom_topic text not null default '';

alter table public.rooms
  add column if not exists word_source text not null default 'ai';

alter table public.rooms
  add column if not exists ai_difficulty text not null default 'medium';

alter table public.rooms
  add column if not exists hint_mode text not null default 'hint';

alter table public.rooms
  add column if not exists show_category boolean not null default true;

alter table public.rooms
  add column if not exists timer_mode text not null default 'timed';

alter table public.rooms
  add column if not exists phase_ends_at timestamptz;

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

-- Increment one target's total inside PostgreSQL so simultaneous devices cannot
-- overwrite each other's votes.
create or replace function public.cast_room_vote(
  p_room_code varchar,
  p_target_name text
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  updated_votes jsonb;
begin
  update public.rooms
  set votes = jsonb_set(
    coalesce(votes, '{}'::jsonb),
    array[p_target_name],
    to_jsonb(coalesce((votes ->> p_target_name)::integer, 0) + 1),
    true
  )
  where room_code = p_room_code
  returning votes into updated_votes;

  return updated_votes;
end;
$$;

grant execute on function public.cast_room_vote(varchar, text) to anon, authenticated;

-- Makes UPDATE events include the complete previous row. The client does not
-- depend on it for routing, but it makes Realtime payloads easier to inspect.
alter table public.rooms replica identity full;

-- Add rooms to the Supabase Realtime publication only when it is not there yet.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rooms'
  ) then
    alter publication supabase_realtime add table public.rooms;
  end if;
end
$$;
