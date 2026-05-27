export type KoreadsBookStatus = "draft" | "published" | "archived";
export type KoreadsBookVisibility = "private" | "invite_only" | "public";
export type KoreadsContributionStatus = "pending" | "accepted" | "rejected" | "valuable";
export type KoreadsTaskStatus = "open" | "closed" | "archived";
export type KoreadsTaskCategory =
  | "title"
  | "tagline"
  | "cover_idea"
  | "dialogue"
  | "paragraph"
  | "plot_direction"
  | "lore"
  | "character_names"
  | "research"
  | "beta_read"
  | "alternate_scene"
  | "other";

export const TASK_CATEGORY_LABELS: Record<KoreadsTaskCategory, string> = {
  title: "Title",
  tagline: "Tagline",
  cover_idea: "Cover idea",
  dialogue: "Dialogue",
  paragraph: "Paragraph",
  plot_direction: "Plot direction",
  lore: "Lore",
  character_names: "Character names",
  research: "Research",
  beta_read: "Beta read",
  alternate_scene: "Alternate scene",
  other: "Other",
};

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
  cover_image_url?: string | null;
  status: KoreadsBookStatus;
  visibility?: KoreadsBookVisibility;
  tags?: string[] | null;
  is_featured: boolean;
  is_spotlight: boolean;
  is_new: boolean;
  is_open_for_contribution: boolean;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
  author?: KoreadsAuthor;
  follower_count?: number;
  open_task_count?: number;
}

export interface KoreadsChapter {
  id: string;
  book_id: string;
  chapter_number: number;
  title: string;
  content: string;
  is_published: boolean;
  visibility?: string;
  is_open_for_inline_contribution?: boolean;
  scheduled_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface KoreadsTask {
  id: string;
  book_id: string;
  chapter_id: string | null;
  task_category: KoreadsTaskCategory;
  title: string;
  description: string;
  reference_text: string | null;
  reward_ko_coins: number;
  deadline: string | null;
  contributor_limit: number | null;
  status: KoreadsTaskStatus;
  is_challenge?: boolean;
  challenge_ends_at?: string | null;
  created_at?: string;
  updated_at?: string;
  book?: KoreadsBook;
  chapter?: KoreadsChapter;
}

export type KoreadsTimelineEventType =
  | "chapter_published"
  | "chapter_updated"
  | "contribution_accepted"
  | "task_rewarded"
  | "poll_opened"
  | "poll_closed"
  | "milestone"
  | "behind_story";

export interface KoreadsTimelineEvent {
  id: string;
  book_id: string;
  chapter_id: string | null;
  event_type: KoreadsTimelineEventType;
  title: string;
  description: string | null;
  impact_count: number;
  created_at?: string;
}

export interface PollOption {
  id: string;
  label: string;
  description?: string;
}

export interface KoreadsPoll {
  id: string;
  book_id: string;
  question: string;
  poll_type: string;
  options: PollOption[];
  status: "open" | "closed";
  ends_at: string | null;
  winning_option_id: string | null;
  created_at?: string;
  vote_counts?: Record<string, number>;
  user_vote_option_id?: string | null;
}

export interface KoreadsFanTheory {
  id: string;
  book_id: string;
  user_id: string;
  title: string;
  body: string;
  status: string;
  created_at?: string;
  upvote_count?: number;
  user_has_upvoted?: boolean;
  display_name?: string;
}

export interface KoreadsBehindStory {
  id: string;
  book_id: string;
  author_id: string;
  title: string;
  body: string;
  post_type: "process" | "deleted_scene" | "research_journey" | "other";
  is_published: boolean;
  created_at?: string;
}

export interface KoreadsStoryCircle {
  id: string;
  book_id: string;
  name: string;
  description: string;
  circle_type: "beta" | "lore" | "editing" | "general";
  is_invite_only: boolean;
  member_count?: number;
  is_member?: boolean;
}

export interface KoreadsCirclePost {
  id: string;
  circle_id: string;
  user_id: string;
  body: string;
  created_at?: string;
  display_name?: string;
}

export interface ReaderBadge {
  id: string;
  label: string;
  description: string;
  earned: boolean;
}

export interface BookMilestones {
  follower_count: number;
  contributor_count: number;
  chapter_count: number;
  open_task_count: number;
  theory_count: number;
  poll_count: number;
}

export interface KoreadsTaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  body: string;
  status: KoreadsContributionStatus;
  author_response: string | null;
  is_valuable: boolean;
  is_pinned_credit: boolean;
  ko_coins_rewarded: number;
  credit_label: string | null;
  reviewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  task?: KoreadsTask;
  profile?: { full_name?: string; username?: string };
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
  is_pinned_credit?: boolean;
  credit_label?: string | null;
  ko_coins_rewarded: number;
  created_at?: string;
  updated_at?: string;
  responded_at?: string | null;
  book?: KoreadsBook;
  chapter?: KoreadsChapter;
  profile?: { full_name?: string; username?: string };
}

export interface ContributorCredit {
  user_id: string;
  display_name: string;
  credit_label: string;
  is_pinned: boolean;
  source: "inline" | "task";
}

export interface KoreadsBookFollow {
  book_id: string;
  user_id: string;
  created_at?: string;
  book?: KoreadsBook;
}

export interface KoCoinTransaction {
  id: string;
  recipient_user_id: string;
  actor_user_id: string | null;
  author_id: string | null;
  contribution_id: string | null;
  task_submission_id?: string | null;
  amount: number;
  reason: string;
  source: "koreads_contribution" | "koreads_task_submission" | "koreads_author_grant" | "manual_admin";
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

export const EMPTY_BOOK = {
  title: "Untitled Book",
  tagline: "",
  description: "",
  genre: "",
  cover_color: KOREADS_COVER_COLORS[0],
  status: "draft" as KoreadsBookStatus,
  visibility: "public" as KoreadsBookVisibility,
  is_featured: false,
  is_spotlight: false,
  is_new: true,
  is_open_for_contribution: true,
};
