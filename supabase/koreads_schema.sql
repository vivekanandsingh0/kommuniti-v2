-- KO Reads CMS and contribution workflow
-- Run once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists koreads_authors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  pen_name text,
  bio text,
  avatar_url text,
  spotlight_quote text,
  is_spotlight boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists koreads_books (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references koreads_authors(id) on delete cascade,
  title text not null,
  subtitle text,
  description text,
  tagline text,
  genre text,
  cover_color text not null default '#C77DFF',
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  is_spotlight boolean not null default false,
  is_new boolean not null default false,
  is_open_for_contribution boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists koreads_chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references koreads_books(id) on delete cascade,
  chapter_number int not null default 1,
  title text not null,
  content text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, chapter_number)
);

create table if not exists koreads_contributions (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references koreads_books(id) on delete cascade,
  chapter_id uuid not null references koreads_chapters(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  selected_text text not null,
  selection_start int,
  selection_end int,
  comment text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'valuable')),
  author_response text,
  is_valuable boolean not null default false,
  ko_coins_rewarded int not null default 0,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ko_coin_transactions (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  author_id uuid references koreads_authors(id) on delete set null,
  contribution_id uuid references koreads_contributions(id) on delete set null,
  amount int not null check (amount > 0),
  reason text not null,
  source text not null default 'manual_admin'
    check (source in ('koreads_contribution', 'koreads_author_grant', 'manual_admin')),
  created_at timestamptz not null default now()
);

alter table koreads_authors enable row level security;
alter table koreads_books enable row level security;
alter table koreads_chapters enable row level security;
alter table koreads_contributions enable row level security;
alter table ko_coin_transactions enable row level security;

drop policy if exists "koreads_authors_public_read" on koreads_authors;
create policy "koreads_authors_public_read"
  on koreads_authors for select
  using (is_active = true);

drop policy if exists "koreads_books_public_read" on koreads_books;
create policy "koreads_books_public_read"
  on koreads_books for select
  using (status = 'published');

drop policy if exists "koreads_chapters_public_read" on koreads_chapters;
create policy "koreads_chapters_public_read"
  on koreads_chapters for select
  using (
    is_published = true
    and exists (
      select 1 from koreads_books b
      where b.id = koreads_chapters.book_id
      and b.status = 'published'
    )
  );

drop policy if exists "koreads_contributions_user_insert" on koreads_contributions;
create policy "koreads_contributions_user_insert"
  on koreads_contributions for insert
  with check (auth.uid() = user_id);

drop policy if exists "koreads_contributions_user_read" on koreads_contributions;
create policy "koreads_contributions_user_read"
  on koreads_contributions for select
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from koreads_chapters c
      join koreads_books b on b.id = c.book_id
      join koreads_authors a on a.id = b.author_id
      where c.id = koreads_contributions.chapter_id
      and a.user_id = auth.uid()
    )
  );

drop policy if exists "ko_coin_transactions_user_read" on ko_coin_transactions;
create policy "ko_coin_transactions_user_read"
  on ko_coin_transactions for select
  using (auth.uid() = recipient_user_id or auth.uid() = actor_user_id);

insert into koreads_authors (
  name, pen_name, bio, spotlight_quote, is_spotlight
)
select
  'Ananya Rao',
  'Ananya Rao',
  'A researcher-writer exploring community economies, ecology, and the everyday systems that hold neighborhoods together.',
  'A book becomes stronger when thoughtful readers leave traces in the margins.',
  true
where not exists (select 1 from koreads_authors limit 1);

insert into koreads_books (
  author_id, title, subtitle, description, tagline, genre, cover_color,
  status, is_featured, is_spotlight, is_new, is_open_for_contribution, published_at
)
select
  a.id,
  'Margins of the Common',
  'Notes on people, place, and shared futures',
  'An unreleased book about how communities rebuild trust through small, repeatable acts of care.',
  'Read the draft. Question the frame. Shape the final book.',
  'Community Futures',
  '#C77DFF',
  'published',
  true,
  true,
  true,
  true,
  now()
from koreads_authors a
where a.name = 'Ananya Rao'
and not exists (select 1 from koreads_books limit 1);

insert into koreads_chapters (book_id, chapter_number, title, content, is_published)
select
  b.id,
  1,
  'The First Margin',
  'Every community has a page that is already written and a margin that is still open. The written page contains the official story: institutions, meetings, plans, and promises. The margin contains the quieter truth: who showed up, who was heard, who carried the work, and who was left waiting outside the room.

KO Reads begins in that margin. It treats readers not as passive consumers, but as people who can notice what an author misses. A useful contribution may be a correction, a question, a missing reference, a lived example, or a disagreement that makes the work more honest.

The goal is not to crowdsource noise. The goal is to build a slower, more generous form of public thinking where authors retain voice and readers earn recognition for sharpening the work.',
  true
from koreads_books b
where b.title = 'Margins of the Common'
and not exists (select 1 from koreads_chapters limit 1);

