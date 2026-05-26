import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  KoreadsAuthor,
  KoreadsBook,
  KoreadsChapter,
  KoreadsContribution,
  KoreadsContributionStatus,
} from "@/types/koreads";

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

export async function fetchChapterReader(bookId: string, chapterId: string) {
  const [bookRes, chapterRes, chaptersRes] = await Promise.all([
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
      .select("id, book_id, chapter_number, title, content, is_published")
      .eq("book_id", bookId)
      .eq("is_published", true)
      .order("chapter_number", { ascending: true }),
  ]);

  return {
    book: (bookRes.data as KoreadsBook | null) ?? null,
    chapter: (chapterRes.data as KoreadsChapter | null) ?? null,
    chapters: (chaptersRes.data as KoreadsChapter[] | null) ?? [],
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

export async function fetchAuthorWorkspace(authorId: string) {
  const booksRes = await supabaseAdmin
    .from("koreads_books")
    .select("*, author:koreads_authors(*)")
    .eq("author_id", authorId)
    .order("updated_at", { ascending: false });

  const bookIds = ((booksRes.data as KoreadsBook[] | null) ?? []).map((book) => book.id);
  const contributionsRes =
    bookIds.length > 0
      ? await supabaseAdmin
          .from("koreads_contributions")
          .select("*, book:koreads_books(title, author_id, cover_color), chapter:koreads_chapters(title, chapter_number)")
          .in("book_id", bookIds)
          .order("created_at", { ascending: false })
      : { data: [], error: null };

  return {
    books: (booksRes.data as KoreadsBook[] | null) ?? [],
    contributions: (contributionsRes.data as KoreadsContribution[] | null) ?? [],
    error: booksRes.error || contributionsRes.error,
  };
}

export async function updateContributionResponse(payload: {
  contributionId: string;
  status: KoreadsContributionStatus;
  authorResponse: string | null;
  rewardAmount: number;
  actorUserId: string | null;
}) {
  const update = {
    status: payload.status,
    author_response: payload.authorResponse,
    is_valuable: payload.status === "valuable",
    ko_coins_rewarded: payload.rewardAmount,
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

  return { error: null };
}

