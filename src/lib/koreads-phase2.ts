import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { fetchBookCredits } from "@/lib/koreads";
import {
  BookMilestones,
  ContributorCredit,
  KoreadsBehindStory,
  KoreadsCirclePost,
  KoreadsFanTheory,
  KoreadsPoll,
  KoreadsStoryCircle,
  KoreadsTask,
  KoreadsTimelineEvent,
  PollOption,
  ReaderBadge,
} from "@/types/koreads";

async function profileNameMap(userIds: string[]) {
  const unique = [...new Set(userIds.filter(Boolean))];
  const map = new Map<string, string>();
  if (!unique.length) return map;

  const { data: profileRows } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name")
    .in("id", unique);

  (profileRows ?? []).forEach((row: { id: string; full_name?: string }) => {
    const name = row.full_name?.trim();
    if (name) map.set(row.id, name);
  });

  const missing = unique.filter((id) => !map.has(id));
  await Promise.all(
    missing.map(async (id) => {
      const { data } = await supabaseAdmin.auth.admin.getUserById(id);
      if (!data?.user) return;
      const meta = data.user.user_metadata as { full_name?: string; name?: string };
      const name = meta?.full_name?.trim() || meta?.name?.trim() || data.user.email?.split("@")[0];
      if (name) map.set(id, name);
    })
  );
  return map;
}

export async function logTimelineEvent(payload: {
  book_id: string;
  chapter_id?: string | null;
  event_type: KoreadsTimelineEvent["event_type"];
  title: string;
  description?: string;
  impact_count?: number;
}) {
  return supabaseAdmin.from("koreads_timeline_events").insert({
    book_id: payload.book_id,
    chapter_id: payload.chapter_id ?? null,
    event_type: payload.event_type,
    title: payload.title,
    description: payload.description ?? null,
    impact_count: payload.impact_count ?? 0,
  });
}

export async function fetchBookTimeline(bookId: string) {
  const { data, error } = await supabase
    .from("koreads_timeline_events")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false })
    .limit(50);
  return { events: (data as KoreadsTimelineEvent[] | null) ?? [], error };
}

export async function fetchFullBookCredits(bookId: string) {
  const credits = await fetchBookCredits(bookId);
  const pinned = credits.filter((c) => c.is_pinned);
  const rest = credits.filter((c) => !c.is_pinned);
  return { pinned, contributors: rest, all: credits };
}

export async function fetchOpenChallenges(limit = 6) {
  const { data, error } = await supabase
    .from("koreads_tasks")
    .select("*, book:koreads_books(id, title, cover_color, author:koreads_authors(name, pen_name))")
    .eq("status", "open")
    .eq("is_challenge", true)
    .order("challenge_ends_at", { ascending: true, nullsFirst: false })
    .limit(limit);

  return { tasks: (data as KoreadsTask[] | null) ?? [], error };
}

export async function fetchBookPollsForAuthor(bookId: string) {
  const { data, error } = await supabaseAdmin
    .from("koreads_polls")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });

  const polls = ((data as KoreadsPoll[] | null) ?? []).map((p) => ({
    ...p,
    options: (p.options as PollOption[]) ?? [],
  }));

  if (!polls.length) return { polls: [], error };

  const pollIds = polls.map((p) => p.id);
  const { data: votes } = await supabaseAdmin
    .from("koreads_poll_votes")
    .select("poll_id, option_id")
    .in("poll_id", pollIds);

  const voteList = votes ?? [];
  return {
    polls: polls.map((poll) => {
      const pollVotes = voteList.filter((v) => v.poll_id === poll.id);
      const vote_counts: Record<string, number> = {};
      poll.options.forEach((o) => {
        vote_counts[o.id] = pollVotes.filter((v) => v.option_id === o.id).length;
      });
      return { ...poll, vote_counts };
    }),
    error,
  };
}

export function topVotedOptionId(poll: KoreadsPoll & { vote_counts?: Record<string, number> }): string | undefined {
  if (!poll.vote_counts || !poll.options.length) return poll.options[0]?.id;
  let best = poll.options[0].id;
  let bestCount = poll.vote_counts[best] ?? 0;
  for (const opt of poll.options) {
    const count = poll.vote_counts[opt.id] ?? 0;
    if (count > bestCount) {
      best = opt.id;
      bestCount = count;
    }
  }
  return best;
}

export async function maybeLogBookMilestones(bookId: string, milestones: BookMilestones) {
  const checks = [
    { count: milestones.follower_count, threshold: 10, title: "10 readers following this book" },
    { count: milestones.contributor_count, threshold: 5, title: "5 contributors shaped this draft" },
    { count: milestones.contributor_count, threshold: 25, title: "25 contributors — the story belongs to many" },
  ];

  for (const check of checks) {
    if (check.count >= check.threshold) {
      const { data: existing } = await supabaseAdmin
        .from("koreads_timeline_events")
        .select("id")
        .eq("book_id", bookId)
        .eq("event_type", "milestone")
        .eq("title", check.title)
        .maybeSingle();

      if (!existing) {
        await logTimelineEvent({
          book_id: bookId,
          event_type: "milestone",
          title: check.title,
          description: `${check.count} and counting — this book is growing with its community.`,
          impact_count: check.count,
        });
      }
    }
  }
}

export async function fetchBookPolls(bookId: string, userId?: string) {
  const { data, error } = await supabase
    .from("koreads_polls")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });

  const polls = ((data as KoreadsPoll[] | null) ?? []).map((p) => ({
    ...p,
    options: (p.options as PollOption[]) ?? [],
  }));

  if (!polls.length) return { polls: [], error };

  const pollIds = polls.map((p) => p.id);
  const { data: votes } = await supabase.from("koreads_poll_votes").select("poll_id, option_id, user_id").in("poll_id", pollIds);

  const voteList = votes ?? [];
  return {
    polls: polls.map((poll) => {
      const pollVotes = voteList.filter((v) => v.poll_id === poll.id);
      const vote_counts: Record<string, number> = {};
      poll.options.forEach((o) => {
        vote_counts[o.id] = pollVotes.filter((v) => v.option_id === o.id).length;
      });
      const userVote = userId ? pollVotes.find((v) => v.user_id === userId) : null;
      return {
        ...poll,
        vote_counts,
        user_vote_option_id: userVote?.option_id ?? null,
      };
    }),
    error,
  };
}

export async function castPollVote(pollId: string, userId: string, optionId: string) {
  return supabase.from("koreads_poll_votes").upsert(
    { poll_id: pollId, user_id: userId, option_id: optionId },
    { onConflict: "poll_id,user_id" }
  );
}

export async function fetchBookTheories(bookId: string, userId?: string) {
  const { data, error } = await supabase
    .from("koreads_fan_theories")
    .select("*")
    .eq("book_id", bookId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const theories = (data as KoreadsFanTheory[] | null) ?? [];
  if (!theories.length) return { theories: [], error };

  const theoryIds = theories.map((t) => t.id);
  const { data: upvotes } = await supabase.from("koreads_theory_upvotes").select("theory_id, user_id").in("theory_id", theoryIds);

  const names = await profileNameMap(theories.map((t) => t.user_id));
  return {
    theories: theories.map((t) => ({
      ...t,
      display_name: names.get(t.user_id) ?? `Reader ${t.user_id.slice(0, 6)}`,
      upvote_count: (upvotes ?? []).filter((u) => u.theory_id === t.id).length,
      user_has_upvoted: userId ? (upvotes ?? []).some((u) => u.theory_id === t.id && u.user_id === userId) : false,
    })),
    error,
  };
}

export async function submitFanTheory(bookId: string, userId: string, title: string, body: string) {
  return supabase.from("koreads_fan_theories").insert({ book_id: bookId, user_id: userId, title, body });
}

export async function toggleTheoryUpvote(theoryId: string, userId: string, hasUpvoted: boolean) {
  if (hasUpvoted) {
    return supabase.from("koreads_theory_upvotes").delete().eq("theory_id", theoryId).eq("user_id", userId);
  }
  return supabase.from("koreads_theory_upvotes").insert({ theory_id: theoryId, user_id: userId });
}

export async function fetchBehindStory(bookId: string) {
  const { data, error } = await supabase
    .from("koreads_behind_story")
    .select("*, author:koreads_authors(name, pen_name)")
    .eq("book_id", bookId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  return { posts: (data as KoreadsBehindStory[] | null) ?? [], error };
}

export async function fetchBookCircles(bookId: string, userId?: string) {
  const { data, error } = await supabase.from("koreads_story_circles").select("*").eq("book_id", bookId).order("created_at", { ascending: false });
  const circles = (data as KoreadsStoryCircle[] | null) ?? [];
  if (!circles.length) return { circles: [], error };

  const circleIds = circles.map((c) => c.id);
  const { data: members } = await supabase.from("koreads_circle_members").select("circle_id, user_id").in("circle_id", circleIds);

  return {
    circles: circles.map((c) => ({
      ...c,
      member_count: (members ?? []).filter((m) => m.circle_id === c.id).length,
      is_member: userId ? (members ?? []).some((m) => m.circle_id === c.id && m.user_id === userId) : false,
    })),
    error,
  };
}

export async function joinCircle(circleId: string, userId: string) {
  return supabase.from("koreads_circle_members").insert({ circle_id: circleId, user_id: userId, role: "member" });
}

export async function fetchCirclePosts(circleId: string) {
  const { data, error } = await supabase
    .from("koreads_circle_posts")
    .select("*")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false })
    .limit(50);

  const posts = (data as KoreadsCirclePost[] | null) ?? [];
  const names = await profileNameMap(posts.map((p) => p.user_id));
  return {
    posts: posts.map((p) => ({
      ...p,
      display_name: names.get(p.user_id) ?? `Reader ${p.user_id.slice(0, 6)}`,
    })),
    error,
  };
}

export async function postToCircle(circleId: string, userId: string, body: string) {
  return supabase.from("koreads_circle_posts").insert({ circle_id: circleId, user_id: userId, body });
}

export async function fetchNextChapterDrop(bookId: string) {
  const { data } = await supabase
    .from("koreads_chapters")
    .select("id, title, chapter_number, scheduled_at, is_published")
    .eq("book_id", bookId)
    .eq("is_published", false)
    .not("scheduled_at", "is", null)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function fetchBookMilestones(bookId: string): Promise<BookMilestones> {
  const [follows, credits, chapters, tasks, theories, polls] = await Promise.all([
    supabase.from("koreads_book_follows").select("user_id", { count: "exact", head: true }).eq("book_id", bookId),
    fetchBookCredits(bookId),
    supabase.from("koreads_chapters").select("id", { count: "exact", head: true }).eq("book_id", bookId).eq("is_published", true),
    supabase.from("koreads_tasks").select("id", { count: "exact", head: true }).eq("book_id", bookId).eq("status", "open"),
    supabase.from("koreads_fan_theories").select("id", { count: "exact", head: true }).eq("book_id", bookId).eq("status", "active"),
    supabase.from("koreads_polls").select("id", { count: "exact", head: true }).eq("book_id", bookId),
  ]);

  return {
    follower_count: follows.count ?? 0,
    contributor_count: credits.length,
    chapter_count: chapters.count ?? 0,
    open_task_count: tasks.count ?? 0,
    theory_count: theories.count ?? 0,
    poll_count: polls.count ?? 0,
  };
}

async function safeTableQuery<T>(query: PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  try {
    const result = await query;
    if (result.error && (result.error as { code?: string }).code === "PGRST205") return [];
    return result.data ?? [];
  } catch {
    return [];
  }
}

export async function computeReaderBadges(userId: string): Promise<ReaderBadge[]> {
  const [contribs, tasks, votes, theories] = await Promise.all([
    safeTableQuery(supabase.from("koreads_contributions").select("id, status").eq("user_id", userId)),
    safeTableQuery(supabase.from("koreads_task_submissions").select("id, status").eq("user_id", userId)),
    safeTableQuery(supabase.from("koreads_poll_votes").select("poll_id").eq("user_id", userId)),
    safeTableQuery(supabase.from("koreads_fan_theories").select("id").eq("user_id", userId)),
  ]);
  const accepted = [...contribs, ...tasks].filter((x) => x.status === "accepted" || x.status === "valuable").length;
  const valuable = [...contribs, ...tasks].filter((x) => x.status === "valuable").length;
  const total = contribs.length + tasks.length;
  const circleMember = await safeTableQuery(
    supabase.from("koreads_circle_members").select("circle_id").eq("user_id", userId)
  );

  return [
    { id: "first_note", label: "First Margin", description: "Left your first contribution", earned: total >= 1 },
    { id: "shaper", label: "Story Shaper", description: "5 accepted contributions", earned: accepted >= 5 },
    { id: "valuable", label: "Valuable Voice", description: "Marked valuable by an author", earned: valuable >= 1 },
    { id: "voter", label: "Decision Maker", description: "Voted in a community poll", earned: votes.length >= 1 },
    { id: "theorist", label: "Fan Theorist", description: "Posted a fan theory", earned: theories.length >= 1 },
    { id: "circle", label: "Inner Circle", description: "Joined a story circle", earned: circleMember.length >= 1 },
    { id: "dedicated", label: "Dedicated Reader", description: "10+ contributions across books", earned: total >= 10 },
  ];
}

// Author/admin CRUD via admin client
export async function createPollAdmin(payload: {
  book_id: string;
  question: string;
  poll_type: string;
  options: PollOption[];
  ends_at?: string | null;
}) {
  const { data, error } = await supabaseAdmin
    .from("koreads_polls")
    .insert({
      book_id: payload.book_id,
      question: payload.question,
      poll_type: payload.poll_type,
      options: payload.options,
      ends_at: payload.ends_at ?? null,
      status: "open",
    })
    .select()
    .single();
  if (!error && data) {
    await logTimelineEvent({
      book_id: payload.book_id,
      event_type: "poll_opened",
      title: "New community poll",
      description: payload.question,
    });
  }
  return { poll: data as KoreadsPoll | null, error };
}

export async function createBehindStoryAdmin(payload: {
  book_id: string;
  author_id: string;
  title: string;
  body: string;
  post_type: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("koreads_behind_story")
    .insert({ ...payload, is_published: true })
    .select()
    .single();
  if (!error && data) {
    await logTimelineEvent({
      book_id: payload.book_id,
      event_type: "behind_story",
      title: payload.title,
      description: "New behind-the-story post",
    });
  }
  return { post: data, error };
}

export async function createCircleAdmin(payload: {
  book_id: string;
  name: string;
  description: string;
  circle_type: string;
  is_invite_only?: boolean;
}) {
  const res = await supabaseAdmin.from("koreads_story_circles").insert(payload).select().single();
  if (!res.error && res.data) {
    await logTimelineEvent({
      book_id: payload.book_id,
      event_type: "milestone",
      title: `New story circle: ${payload.name}`,
      description: payload.description || "A smaller group for deeper shaping.",
    });
  }
  return res;
}

export async function closePollAdmin(pollId: string, bookId: string, winningOptionId?: string) {
  const { error } = await supabaseAdmin
    .from("koreads_polls")
    .update({ status: "closed", winning_option_id: winningOptionId ?? null, updated_at: new Date().toISOString() })
    .eq("id", pollId);
  if (!error) {
    await logTimelineEvent({
      book_id: bookId,
      event_type: "poll_closed",
      title: "Community poll closed",
      description: winningOptionId ? `Winning option selected` : undefined,
    });
  }
  return { error };
}
