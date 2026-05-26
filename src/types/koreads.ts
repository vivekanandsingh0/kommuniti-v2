export type KoreadsBookStatus = "draft" | "published" | "archived";
export type KoreadsContributionStatus = "pending" | "accepted" | "rejected" | "valuable";

export interface KoreadsAuthor {
  id: string;
  user_id: string | null;
  name: string;
  pen_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  spotlight_quote: string | null;
  is_spotlight: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface KoreadsBook {
  id: string;
  author_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  tagline: string | null;
  genre: string | null;
  cover_color: string;
  status: KoreadsBookStatus;
  is_featured: boolean;
  is_spotlight: boolean;
  is_new: boolean;
  is_open_for_contribution: boolean;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
  author?: KoreadsAuthor;
  chapter_count?: number;
  contribution_count?: number;
}

export interface KoreadsChapter {
  id: string;
  book_id: string;
  chapter_number: number;
  title: string;
  content: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface KoreadsContribution {
  id: string;
  book_id: string;
  chapter_id: string;
  user_id: string;
  selected_text: string;
  selection_start: number | null;
  selection_end: number | null;
  comment: string;
  status: KoreadsContributionStatus;
  author_response: string | null;
  is_valuable: boolean;
  ko_coins_rewarded: number;
  created_at?: string;
  updated_at?: string;
  responded_at?: string | null;
  book?: KoreadsBook;
  chapter?: KoreadsChapter;
}

export interface KoCoinTransaction {
  id: string;
  recipient_user_id: string;
  actor_user_id: string | null;
  author_id: string | null;
  contribution_id: string | null;
  amount: number;
  reason: string;
  source: "koreads_contribution" | "koreads_author_grant" | "manual_admin";
  created_at?: string;
}

export const KOREADS_COVER_COLORS = [
  "#C77DFF",
  "#C9A84C",
  "#6BBFB5",
  "#4895EF",
  "#FF6B35",
  "#8B9A2A",
] as const;

export const EMPTY_CHAPTER_CONTENT = `Start writing the chapter here.

Keep paragraphs separated by blank lines. Readers will be able to highlight specific text and suggest improvements, sources, questions, or additions.`;

