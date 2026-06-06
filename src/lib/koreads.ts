import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logTimelineEvent } from "@/lib/koreads-phase2";
import {
  ContributorCredit,
  KoreadsAuthor,
  KoreadsBook,
  KoreadsChapter,
  KoreadsContribution,
  KoreadsContributionStatus,
  KoreadsTask,
  KoreadsTaskSubmission,
  TASK_CATEGORY_LABELS,
} from "@/types/koreads";

function displayNameFromAuthUser(user: {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; name?: string };
}) {
  const meta = user.user_metadata;
  const fromMeta = meta?.full_name?.trim() || meta?.name?.trim();
  if (fromMeta) return fromMeta;
  if (user.email) return user.email.split("@")[0];
  return `Reader ${user.id.slice(0, 6)}`;
}

async function profileNameMap(userIds: string[]) {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (!unique.length) return new Map<string, string>();

  const map = new Map<string, string>();

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
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(id);
      if (error || !data?.user) return;
      map.set(id, displayNameFromAuthUser(data.user));
    })
  );

  return map;
}

export async function fetchPublishedBooks() {
  const { data, error } = await supabase
    .from("koreads_books")
    .select("*, author:koreads_authors(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  return { books: (data as KoreadsBook[] | null) ?? [], error };
}

export async function fetchSpotlightAuthors() {
  const { data, error } = await supabase
    .from("koreads_authors")
    .select("*")
    .eq("is_active", true)
    .eq("is_spotlight", true)
    .order("updated_at", { ascending: false })
    .limit(4);

  return { authors: (data as KoreadsAuthor[] | null) ?? [], error };
}

export async function fetchOpenTasks(limit = 12) {
  const { data, error } = await supabase
    .from("koreads_tasks")
    .select("*, book:koreads_books(id, title, cover_color, tagline, author:koreads_authors(name, pen_name))")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);

  return { tasks: (data as KoreadsTask[] | null) ?? [], error };
}

export async function fetchBookWithChapters(bookId: string) {
  const [bookRes, chaptersRes] = await Promise.all([
    supabase
      .from("koreads_books")
      .select("*, author:koreads_authors(*)")
      .eq("id", bookId)
      .eq("status", "published")
      .maybeSingle(),
    supabase
      .from("koreads_chapters")
      .select("*")
      .eq("book_id", bookId)
      .eq("is_published", true)
      .order("chapter_number", { ascending: true }),
  ]);

  return {
    book: (bookRes.data as KoreadsBook | null) ?? null,
    chapters: (chaptersRes.data as KoreadsChapter[] | null) ?? [],
    error: bookRes.error || chaptersRes.error,
  };
}

export async function fetchBookHub(bookId: string) {
  const [bookRes, chaptersRes, tasksRes, followsRes] = await Promise.all([
    supabase
      .from("koreads_books")
      .select("*, author:koreads_authors(*)")
      .eq("id", bookId)
      .eq("status", "published")
      .maybeSingle(),
    supabase
      .from("koreads_chapters")
      .select("*")
      .eq("book_id", bookId)
      .eq("is_published", true)
      .order("chapter_number", { ascending: true }),
    supabase
      .from("koreads_tasks")
      .select("*")
      .eq("book_id", bookId)
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    supabase.from("koreads_book_follows").select("user_id", { count: "exact", head: true }).eq("book_id", bookId),
  ]);

  const book = bookRes.data as KoreadsBook | null;
  if (book) {
    book.follower_count = followsRes.count ?? 0;
    book.open_task_count = ((tasksRes.data as KoreadsTask[] | null) ?? []).length;
  }

  const credits = book ? await fetchBookCredits(bookId) : [];

  return {
    book,
    chapters: (chaptersRes.data as KoreadsChapter[] | null) ?? [],
    tasks: (tasksRes.data as KoreadsTask[] | null) ?? [],
    credits,
    error: bookRes.error || chaptersRes.error || tasksRes.error,
  };
}

export async function fetchBookCredits(bookId: string): Promise<ContributorCredit[]> {
  const tasksForBook = await supabaseAdmin.from("koreads_tasks").select("id").eq("book_id", bookId);
  const taskIds = (tasksForBook.data ?? []).map((t: { id: string }) => t.id);

  const inlineRes = await supabaseAdmin
    .from("koreads_contributions")
    .select("user_id, credit_label, is_pinned_credit, status")
    .eq("book_id", bookId)
    .in("status", ["accepted", "valuable"]);

  const taskRes =
    taskIds.length > 0
      ? await supabaseAdmin
          .from("koreads_task_submissions")
          .select("user_id, credit_label, is_pinned_credit, status, task:koreads_tasks(task_category)")
          .in("task_id", taskIds)
          .in("status", ["accepted", "valuable"])
      : { data: [] };

  const userIds = [
    ...((inlineRes.data ?? []) as { user_id: string }[]).map((r) => r.user_id),
    ...((taskRes.data ?? []) as { user_id: string }[]).map((r) => r.user_id),
  ];
  const names = await profileNameMap(userIds);

  const credits: ContributorCredit[] = [];

  ((inlineRes.data ?? []) as Array<{
    user_id: string;
    credit_label: string | null;
    is_pinned_credit: boolean;
  }>).forEach((row) => {
    credits.push({
      user_id: row.user_id,
      display_name: names.get(row.user_id) ?? `Reader ${row.user_id.slice(0, 6)}`,
      credit_label: row.credit_label || "Inline contribution",
      is_pinned: row.is_pinned_credit,
      source: "inline",
    });
  });

  ((taskRes.data ?? []) as Array<{
    user_id: string;
    credit_label: string | null;
    is_pinned_credit: boolean;
    task?: { task_category: string };
  }>).forEach((row) => {
    const cat = row.task?.task_category as keyof typeof TASK_CATEGORY_LABELS | undefined;
    credits.push({
      user_id: row.user_id,
      display_name: names.get(row.user_id) ?? `Reader ${row.user_id.slice(0, 6)}`,
      credit_label:
        row.credit_label ||
        (cat && TASK_CATEGORY_LABELS[cat] ? TASK_CATEGORY_LABELS[cat] : "Bounty contribution"),
      is_pinned: row.is_pinned_credit,
      source: "task",
    });
  });

  const deduped = new Map<string, ContributorCredit>();
  credits.forEach((c) => {
    const existing = deduped.get(c.user_id);
    if (!existing || c.is_pinned) deduped.set(c.user_id, c);
  });

  return [...deduped.values()].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));
}

export async function fetchTaskDetail(bookId: string, taskId: string) {
  const { data, error } = await supabase
    .from("koreads_tasks")
    .select("*, book:koreads_books(*, author:koreads_authors(*)), chapter:koreads_chapters(id, title, chapter_number)")
    .eq("id", taskId)
    .eq("book_id", bookId)
    .maybeSingle();

  return { task: (data as KoreadsTask | null) ?? null, error };
}

export async function fetchUserTaskSubmission(taskId: string, userId: string) {
  const { data, error } = await supabase
    .from("koreads_task_submissions")
    .select("*")
    .eq("task_id", taskId)
    .eq("user_id", userId)
    .maybeSingle();

  return { submission: (data as KoreadsTaskSubmission | null) ?? null, error };
}

export async function submitTaskSubmission(payload: {
  task_id: string;
  user_id: string;
  body: string;
}) {
  return supabase.from("koreads_task_submissions").insert({
    ...payload,
    status: "pending",
    is_valuable: false,
    ko_coins_rewarded: 0,
  });
}

export async function isFollowingBook(bookId: string, userId: string) {
  const { data } = await supabase
    .from("koreads_book_follows")
    .select("book_id")
    .eq("book_id", bookId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

export async function toggleBookFollow(bookId: string, userId: string) {
  const following = await isFollowingBook(bookId, userId);
  if (following) {
    return supabase.from("koreads_book_follows").delete().eq("book_id", bookId).eq("user_id", userId);
  }
  return supabase.from("koreads_book_follows").insert({ book_id: bookId, user_id: userId });
}

export async function fetchUserFollowedBooks(userId: string) {
  const { data, error } = await supabase
    .from("koreads_book_follows")
    .select("*, book:koreads_books(id, title, cover_color, tagline, author:koreads_authors(name, pen_name))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { follows: data ?? [], error };
}

export async function fetchUserTaskSubmissions(userId: string) {
  const { data, error } = await supabase
    .from("koreads_task_submissions")
    .select("*, task:koreads_tasks(title, task_category, reward_ko_coins, book:koreads_books(id, title, cover_color))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { submissions: (data as KoreadsTaskSubmission[] | null) ?? [], error };
}

export async function fetchChapterReader(bookId: string, chapterId: string) {
  const [bookRes, chapterRes, chaptersRes, tasksRes] = await Promise.all([
    supabase
      .from("koreads_books")
      .select("*, author:koreads_authors(*)")
      .eq("id", bookId)
      .eq("status", "published")
      .maybeSingle(),
    supabase
      .from("koreads_chapters")
      .select("*")
      .eq("id", chapterId)
      .eq("book_id", bookId)
      .eq("is_published", true)
      .maybeSingle(),
    supabase
      .from("koreads_chapters")
      .select("id, book_id, chapter_number, title, content, is_published, is_open_for_inline_contribution")
      .eq("book_id", bookId)
      .eq("is_published", true)
      .order("chapter_number", { ascending: true }),
    supabase
      .from("koreads_tasks")
      .select("id, title, task_category, reward_ko_coins")
      .eq("book_id", bookId)
      .eq("status", "open")
      .limit(5),
  ]);

  return {
    book: (bookRes.data as KoreadsBook | null) ?? null,
    chapter: (chapterRes.data as KoreadsChapter | null) ?? null,
    chapters: (chaptersRes.data as KoreadsChapter[] | null) ?? [],
    openTasks: (tasksRes.data as KoreadsTask[] | null) ?? [],
    error: bookRes.error || chapterRes.error || chaptersRes.error,
  };
}

export async function submitContribution(payload: {
  book_id: string;
  chapter_id: string;
  user_id: string;
  selected_text: string;
  selection_start: number | null;
  selection_end: number | null;
  comment: string;
}) {
  return supabase.from("koreads_contributions").insert({
    ...payload,
    status: "pending",
    is_valuable: false,
    ko_coins_rewarded: 0,
  });
}

export async function fetchUserContributions(userId: string) {
  const { data, error } = await supabase
    .from("koreads_contributions")
    .select("*, book:koreads_books(title, cover_color), chapter:koreads_chapters(title, chapter_number)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { contributions: (data as KoreadsContribution[] | null) ?? [], error };
}

export async function fetchAuthorForUser(userId: string) {
  const { data, error } = await supabase
    .from("koreads_authors")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  return { author: (data as KoreadsAuthor | null) ?? null, error };
}

export async function createAuthorBook(
  authorId: string,
  payload: {
    title: string;
    tagline?: string;
    description?: string;
    genre?: string;
    cover_color?: string;
  }
) {
  return supabaseAdmin
    .from("koreads_books")
    .insert({
      author_id: authorId,
      title: payload.title || "Untitled Book",
      tagline: payload.tagline || null,
      description: payload.description || null,
      genre: payload.genre || null,
      cover_color: payload.cover_color || "#C77DFF",
      status: "draft",
      visibility: "public",
      is_featured: false,
      is_spotlight: false,
      is_new: true,
      is_open_for_contribution: true,
    })
    .select()
    .single();
}

export async function fetchAuthorWorkspace(authorId: string) {
  const booksRes = await supabaseAdmin
    .from("koreads_books")
    .select("*, author:koreads_authors(*)")
    .eq("author_id", authorId)
    .order("updated_at", { ascending: false });

  const bookIds = ((booksRes.data as KoreadsBook[] | null) ?? []).map((book) => book.id);

  const [contributionsRes, tasksRes, submissionsRes] = await Promise.all([
    bookIds.length > 0
      ? supabaseAdmin
          .from("koreads_contributions")
          .select("*, book:koreads_books(title, author_id, cover_color), chapter:koreads_chapters(title, chapter_number)")
          .in("book_id", bookIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    bookIds.length > 0
      ? supabaseAdmin.from("koreads_tasks").select("*").in("book_id", bookIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    bookIds.length > 0
      ? supabaseAdmin
          .from("koreads_task_submissions")
          .select("*, task:koreads_tasks(title, task_category, book_id, book:koreads_books(title, cover_color))")
          .in(
            "task_id",
            (
              await supabaseAdmin.from("koreads_tasks").select("id").in("book_id", bookIds)
            ).data?.map((t: { id: string }) => t.id) ?? []
          )
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  return {
    books: (booksRes.data as KoreadsBook[] | null) ?? [],
    contributions: (contributionsRes.data as KoreadsContribution[] | null) ?? [],
    tasks: (tasksRes.data as KoreadsTask[] | null) ?? [],
    taskSubmissions: (submissionsRes.data as KoreadsTaskSubmission[] | null) ?? [],
    error: booksRes.error || contributionsRes.error || tasksRes.error || submissionsRes.error,
  };
}

export async function updateContributionResponse(payload: {
  contributionId: string;
  status: KoreadsContributionStatus;
  authorResponse: string | null;
  rewardAmount: number;
  actorUserId: string | null;
  creditLabel?: string | null;
  isPinnedCredit?: boolean;
}) {
  const update = {
    status: payload.status,
    author_response: payload.authorResponse,
    is_valuable: payload.status === "valuable",
    ko_coins_rewarded: payload.rewardAmount,
    credit_label: payload.creditLabel ?? null,
    is_pinned_credit: payload.isPinnedCredit ?? false,
    responded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: contribution, error: contributionError } = await supabaseAdmin
    .from("koreads_contributions")
    .select("*, book:koreads_books(author_id)")
    .eq("id", payload.contributionId)
    .maybeSingle();

  if (contributionError || !contribution) {
    return { error: contributionError ?? new Error("Contribution not found") };
  }

  const { error } = await supabaseAdmin
    .from("koreads_contributions")
    .update(update)
    .eq("id", payload.contributionId);

  if (error) return { error };

  if (payload.rewardAmount > 0) {
    const profileRes = await supabaseAdmin
      .from("profiles")
      .select("ko_coins")
      .eq("id", contribution.user_id)
      .maybeSingle();

    const currentCoins = profileRes.data?.ko_coins ?? 0;

    await supabaseAdmin
      .from("profiles")
      .update({ ko_coins: currentCoins + payload.rewardAmount })
      .eq("id", contribution.user_id);

    await supabaseAdmin.from("ko_coin_transactions").insert({
      recipient_user_id: contribution.user_id,
      actor_user_id: payload.actorUserId,
      author_id: contribution.book?.author_id ?? null,
      contribution_id: payload.contributionId,
      amount: payload.rewardAmount,
      reason: "KO Reads valuable contribution reward",
      source: "koreads_contribution",
    });
  }

  if (payload.status === "accepted" || payload.status === "valuable") {
    await logTimelineEvent({
      book_id: contribution.book_id,
      chapter_id: contribution.chapter_id,
      event_type: "contribution_accepted",
      title: "A reader's note was woven into the draft",
      description: payload.creditLabel || "Inline contribution accepted",
      impact_count: 1,
    });
  }

  return { error: null };
}

export async function updateTaskSubmissionResponse(payload: {
  submissionId: string;
  status: KoreadsContributionStatus;
  authorResponse: string | null;
  rewardAmount: number;
  actorUserId: string | null;
  creditLabel?: string | null;
  isPinnedCredit?: boolean;
}) {
  const update = {
    status: payload.status,
    author_response: payload.authorResponse,
    is_valuable: payload.status === "valuable",
    ko_coins_rewarded: payload.rewardAmount,
    credit_label: payload.creditLabel ?? null,
    is_pinned_credit: payload.isPinnedCredit ?? false,
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: submission, error: fetchError } = await supabaseAdmin
    .from("koreads_task_submissions")
    .select("*, task:koreads_tasks(reward_ko_coins, book_id, book:koreads_books(author_id))")
    .eq("id", payload.submissionId)
    .maybeSingle();

  if (fetchError || !submission) {
    return { error: fetchError ?? new Error("Submission not found") };
  }

  const { error } = await supabaseAdmin
    .from("koreads_task_submissions")
    .update(update)
    .eq("id", payload.submissionId);

  if (error) return { error };

  const coins =
    payload.rewardAmount > 0
      ? payload.rewardAmount
      : payload.status === "valuable" || payload.status === "accepted"
        ? submission.task?.reward_ko_coins ?? 0
        : 0;

  if (coins > 0 && (payload.status === "valuable" || payload.status === "accepted")) {
    const profileRes = await supabaseAdmin
      .from("profiles")
      .select("ko_coins")
      .eq("id", submission.user_id)
      .maybeSingle();

    const currentCoins = profileRes.data?.ko_coins ?? 0;
    const finalAmount = payload.rewardAmount > 0 ? payload.rewardAmount : coins;

    await supabaseAdmin
      .from("koreads_task_submissions")
      .update({ ko_coins_rewarded: finalAmount })
      .eq("id", payload.submissionId);

    await supabaseAdmin
      .from("profiles")
      .update({ ko_coins: currentCoins + finalAmount })
      .eq("id", submission.user_id);

    await supabaseAdmin.from("ko_coin_transactions").insert({
      recipient_user_id: submission.user_id,
      actor_user_id: payload.actorUserId,
      author_id: submission.task?.book?.author_id ?? null,
      task_submission_id: payload.submissionId,
      amount: finalAmount,
      reason: "KO Reads bounty task reward",
      source: "koreads_task_submission",
    });
  }

  if (payload.status === "accepted" || payload.status === "valuable") {
    const bookId = submission.task?.book_id;
    if (bookId) {
      await logTimelineEvent({
        book_id: bookId,
        event_type: "task_rewarded",
        title: "A bounty contribution was accepted",
        description: payload.creditLabel || "Community shaping reward",
        impact_count: 1,
      });
    }
  }

  return { error: null };
}

export async function uploadBookCoverImage(file: File, bookId: string) {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be less than 5MB");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `cover-${Date.now()}.${fileExt}`;
  const filePath = `${bookId}/${fileName}`;

  const { error } = await supabase.storage
    .from("book-covers")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("book-covers")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
