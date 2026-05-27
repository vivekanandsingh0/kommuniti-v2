-- KO Reads Phase 2 — run after koreads_phase1_schema.sql

-- Creative challenges: extend task categories
alter table koreads_tasks drop constraint if exists koreads_tasks_task_category_check;
alter table koreads_tasks add constraint koreads_tasks_task_category_check
  check (task_category in (
    'title', 'tagline', 'cover_idea', 'dialogue', 'paragraph', 'plot_direction',
    'lore', 'character_names', 'research', 'beta_read', 'alternate_scene', 'other'
  ));

alter table koreads_tasks add column if not exists is_challenge boolean not null default false;
alter table koreads_tasks add column if not exists challenge_ends_at timestamptz;

-- Version timeline / activity log
create table if not exists koreads_timeline_events (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references koreads_books(id) on delete cascade,
  chapter_id uuid references koreads_chapters(id) on delete set null,
  event_type text not null check (event_type in (
    'chapter_published', 'chapter_updated', 'contribution_accepted',
    'task_rewarded', 'poll_opened', 'poll_closed', 'milestone', 'behind_story'
  )),
  title text not null,
  description text,
  impact_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Decision polls
create table if not exists koreads_polls (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references koreads_books(id) on delete cascade,
  question text not null,
  poll_type text not null default 'other'
    check (poll_type in ('cover_choice', 'plot_direction', 'pacing', 'ending', 'other')),
  options jsonb not null default '[]',
  status text not null default 'open' check (status in ('open', 'closed')),
  ends_at timestamptz,
  winning_option_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists koreads_poll_votes (
  poll_id uuid not null references koreads_polls(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  option_id text not null,
  created_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);

-- Fan theories
create table if not exists koreads_fan_theories (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references koreads_books(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  status text not null default 'active' check (status in ('active', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists koreads_theory_upvotes (
  theory_id uuid not null references koreads_fan_theories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (theory_id, user_id)
);

-- Behind the story posts
create table if not exists koreads_behind_story (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references koreads_books(id) on delete cascade,
  author_id uuid not null references koreads_authors(id) on delete cascade,
  title text not null,
  body text not null,
  post_type text not null default 'process'
    check (post_type in ('process', 'deleted_scene', 'research_journey', 'other')),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Story circles
create table if not exists koreads_story_circles (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references koreads_books(id) on delete cascade,
  name text not null,
  description text not null default '',
  circle_type text not null default 'beta'
    check (circle_type in ('beta', 'lore', 'editing', 'general')),
  is_invite_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists koreads_circle_members (
  circle_id uuid not null references koreads_story_circles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'moderator')),
  joined_at timestamptz not null default now(),
  primary key (circle_id, user_id)
);

create table if not exists koreads_circle_posts (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references koreads_story_circles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- RLS
alter table koreads_timeline_events enable row level security;
alter table koreads_polls enable row level security;
alter table koreads_poll_votes enable row level security;
alter table koreads_fan_theories enable row level security;
alter table koreads_theory_upvotes enable row level security;
alter table koreads_behind_story enable row level security;
alter table koreads_story_circles enable row level security;
alter table koreads_circle_members enable row level security;
alter table koreads_circle_posts enable row level security;

drop policy if exists "koreads_timeline_public_read" on koreads_timeline_events;
create policy "koreads_timeline_public_read" on koreads_timeline_events for select using (
  exists (select 1 from koreads_books b where b.id = book_id and b.status = 'published')
);

drop policy if exists "koreads_polls_public_read" on koreads_polls;
create policy "koreads_polls_public_read" on koreads_polls for select using (
  exists (select 1 from koreads_books b where b.id = book_id and b.status = 'published')
);

drop policy if exists "koreads_poll_votes_user" on koreads_poll_votes;
create policy "koreads_poll_votes_user" on koreads_poll_votes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "koreads_poll_votes_read" on koreads_poll_votes;
create policy "koreads_poll_votes_read" on koreads_poll_votes for select using (true);

drop policy if exists "koreads_theories_public_read" on koreads_fan_theories;
create policy "koreads_theories_public_read" on koreads_fan_theories for select using (
  status = 'active' and exists (select 1 from koreads_books b where b.id = book_id and b.status = 'published')
);

drop policy if exists "koreads_theories_user_insert" on koreads_fan_theories;
create policy "koreads_theories_user_insert" on koreads_fan_theories for insert with check (auth.uid() = user_id);

drop policy if exists "koreads_theory_upvotes_user" on koreads_theory_upvotes;
create policy "koreads_theory_upvotes_user" on koreads_theory_upvotes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "koreads_theory_upvotes_read" on koreads_theory_upvotes;
create policy "koreads_theory_upvotes_read" on koreads_theory_upvotes for select using (true);

drop policy if exists "koreads_behind_story_public_read" on koreads_behind_story;
create policy "koreads_behind_story_public_read" on koreads_behind_story for select using (
  is_published = true and exists (select 1 from koreads_books b where b.id = book_id and b.status = 'published')
);

drop policy if exists "koreads_circles_public_read" on koreads_story_circles;
create policy "koreads_circles_public_read" on koreads_story_circles for select using (
  exists (select 1 from koreads_books b where b.id = book_id and b.status = 'published')
);

drop policy if exists "koreads_circle_members_user" on koreads_circle_members;
create policy "koreads_circle_members_user" on koreads_circle_members for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "koreads_circle_members_read" on koreads_circle_members;
create policy "koreads_circle_members_read" on koreads_circle_members for select using (true);

drop policy if exists "koreads_circle_posts_read" on koreads_circle_posts;
create policy "koreads_circle_posts_read" on koreads_circle_posts for select using (
  exists (
    select 1 from koreads_story_circles c
    join koreads_books b on b.id = c.book_id
    where c.id = circle_id and b.status = 'published'
  )
);

drop policy if exists "koreads_circle_posts_insert" on koreads_circle_posts;
create policy "koreads_circle_posts_insert" on koreads_circle_posts for insert with check (
  auth.uid() = user_id
  and exists (select 1 from koreads_circle_members m where m.circle_id = koreads_circle_posts.circle_id and m.user_id = auth.uid())
);
