-- KO Reads Phase 1 — run after koreads_schema.sql

alter table koreads_books add column if not exists visibility text not null default 'public'
  check (visibility in ('private', 'invite_only', 'public'));
alter table koreads_books add column if not exists tags text[] default '{}';
alter table koreads_books add column if not exists cover_image_url text;

alter table koreads_chapters add column if not exists visibility text not null default 'public'
  check (visibility in ('private', 'public'));
alter table koreads_chapters add column if not exists is_open_for_inline_contribution boolean not null default true;
alter table koreads_chapters add column if not exists scheduled_at timestamptz;

create table if not exists koreads_tasks (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references koreads_books(id) on delete cascade,
  chapter_id uuid references koreads_chapters(id) on delete set null,
  task_category text not null default 'other'
    check (task_category in (
      'title', 'tagline', 'cover_idea', 'dialogue', 'paragraph', 'plot_direction',
      'lore', 'character_names', 'research', 'beta_read', 'other'
    )),
  title text not null,
  description text not null default '',
  reference_text text,
  reward_ko_coins int not null default 25 check (reward_ko_coins >= 0),
  deadline timestamptz,
  contributor_limit int,
  status text not null default 'open' check (status in ('open', 'closed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists koreads_task_submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references koreads_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'valuable')),
  author_response text,
  is_valuable boolean not null default false,
  is_pinned_credit boolean not null default false,
  ko_coins_rewarded int not null default 0,
  credit_label text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table koreads_contributions add column if not exists is_pinned_credit boolean not null default false;
alter table koreads_contributions add column if not exists credit_label text;

create table if not exists koreads_book_follows (
  book_id uuid not null references koreads_books(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (book_id, user_id)
);

alter table ko_coin_transactions drop constraint if exists ko_coin_transactions_source_check;
alter table ko_coin_transactions add constraint ko_coin_transactions_source_check
  check (source in ('koreads_contribution', 'koreads_task_submission', 'koreads_author_grant', 'manual_admin'));

alter table ko_coin_transactions add column if not exists task_submission_id uuid references koreads_task_submissions(id) on delete set null;

alter table koreads_tasks enable row level security;
alter table koreads_task_submissions enable row level security;
alter table koreads_book_follows enable row level security;

drop policy if exists "koreads_tasks_public_read" on koreads_tasks;
create policy "koreads_tasks_public_read" on koreads_tasks for select using (
  status = 'open'
  and exists (
    select 1 from koreads_books b
    where b.id = koreads_tasks.book_id
    and b.status = 'published'
    and coalesce(b.visibility, 'public') = 'public'
  )
);

drop policy if exists "koreads_task_submissions_user_insert" on koreads_task_submissions;
create policy "koreads_task_submissions_user_insert" on koreads_task_submissions for insert
  with check (auth.uid() = user_id);

drop policy if exists "koreads_task_submissions_user_read" on koreads_task_submissions;
create policy "koreads_task_submissions_user_read" on koreads_task_submissions for select using (
  auth.uid() = user_id
  or exists (
    select 1 from koreads_tasks t
    join koreads_books b on b.id = t.book_id
    join koreads_authors a on a.id = b.author_id
    where t.id = koreads_task_submissions.task_id and a.user_id = auth.uid()
  )
);

drop policy if exists "koreads_book_follows_user_manage" on koreads_book_follows;
create policy "koreads_book_follows_user_manage" on koreads_book_follows for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "koreads_book_follows_public_read" on koreads_book_follows;
create policy "koreads_book_follows_public_read" on koreads_book_follows for select using (true);

-- Seed sample bounty tasks for demo book
insert into koreads_tasks (book_id, task_category, title, description, reward_ko_coins, status)
select
  b.id,
  'tagline',
  'Suggest a sharper tagline',
  'The book needs a one-line hook that makes curious readers stop scrolling. Propose 1–3 tagline options and a sentence on why each works.',
  40,
  'open'
from koreads_books b
where b.title = 'Margins of the Common'
and not exists (select 1 from koreads_tasks where book_id = b.id limit 1);

insert into koreads_tasks (book_id, task_category, title, description, reward_ko_coins, status)
select
  b.id,
  'research',
  'Find a real community example',
  'Share one documented example of a neighborhood rebuilding trust through small repeatable acts. Include source link or citation.',
  60,
  'open'
from koreads_books b
where b.title = 'Margins of the Common'
and (select count(*) from koreads_tasks where book_id = b.id) < 2;
