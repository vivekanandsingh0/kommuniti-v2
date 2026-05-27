import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  fetchAuthorForUser,
  updateContributionResponse,
  updateTaskSubmissionResponse,
} from "@/lib/koreads";
import {
  closePollAdmin,
  createBehindStoryAdmin,
  createCircleAdmin,
  createPollAdmin,
  fetchBookMilestones,
  fetchBookPollsForAuthor,
  logTimelineEvent,
  maybeLogBookMilestones,
  topVotedOptionId,
} from "@/lib/koreads-phase2";
import { BookMilestones, KoreadsPoll, PollOption } from "@/types/koreads";
import {
  EMPTY_CHAPTER_CONTENT,
  KOREADS_COVER_COLORS,
  KoreadsAuthor,
  KoreadsBook,
  KoreadsChapter,
  KoreadsContribution,
  KoreadsContributionStatus,
  KoreadsTask,
  KoreadsTaskCategory,
  KoreadsTaskSubmission,
  TASK_CATEGORY_LABELS,
} from "@/types/koreads";

type Tab = "overview" | "chapters" | "tasks" | "contributions" | "community";

const inputClass =
  "w-full bg-[rgba(240,232,213,0.04)] border border-white/10 p-3 outline-none focus:border-[#C77DFF]";
const labelClass = "block text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-2";

const TASK_CATEGORIES = Object.keys(TASK_CATEGORY_LABELS) as KoreadsTaskCategory[];

const AuthorBookDetail = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [author, setAuthor] = useState<KoreadsAuthor | null>(null);
  const [book, setBook] = useState<KoreadsBook | null>(null);
  const [chapters, setChapters] = useState<KoreadsChapter[]>([]);
  const [tasks, setTasks] = useState<KoreadsTask[]>([]);
  const [contributions, setContributions] = useState<KoreadsContribution[]>([]);
  const [taskSubmissions, setTaskSubmissions] = useState<KoreadsTaskSubmission[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [activeChapter, setActiveChapter] = useState<KoreadsChapter | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<KoreadsTask>>({
    task_category: "other",
    title: "",
    description: "",
    reward_ko_coins: 25,
    status: "open",
  });
  const [reviewTarget, setReviewTarget] = useState<
    | { type: "inline"; item: KoreadsContribution }
    | { type: "task"; item: KoreadsTaskSubmission }
    | null
  >(null);
  const [authorResponse, setAuthorResponse] = useState("");
  const [rewardAmount, setRewardAmount] = useState(25);
  const [creditLabel, setCreditLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<BookMilestones | null>(null);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState("Option A, Option B");
  const [behindTitle, setBehindTitle] = useState("");
  const [behindBody, setBehindBody] = useState("");
  const [circleName, setCircleName] = useState("");
  const [circleDesc, setCircleDesc] = useState("");
  const [authorPolls, setAuthorPolls] = useState<KoreadsPoll[]>([]);
  const [pollType, setPollType] = useState("plot_direction");
  const [behindPostType, setBehindPostType] = useState("process");
  const [pollWinnerPick, setPollWinnerPick] = useState<Record<string, string>>({});

  const load = async () => {
    if (!user || !bookId) return;
    setLoading(true);
    const authorRes = await fetchAuthorForUser(user.id);
    setAuthor(authorRes.author);
    if (!authorRes.author) {
      setLoading(false);
      return;
    }

    const [bookRes, chaptersRes, tasksRes, contributionsRes] = await Promise.all([
      supabaseAdmin
        .from("koreads_books")
        .select("*, author:koreads_authors(*)")
        .eq("id", bookId)
        .eq("author_id", authorRes.author.id)
        .maybeSingle(),
      supabaseAdmin
        .from("koreads_chapters")
        .select("*")
        .eq("book_id", bookId)
        .order("chapter_number", { ascending: true }),
      supabaseAdmin.from("koreads_tasks").select("*").eq("book_id", bookId).order("created_at", { ascending: false }),
      supabaseAdmin
        .from("koreads_contributions")
        .select("*, chapter:koreads_chapters(title, chapter_number)")
        .eq("book_id", bookId)
        .order("created_at", { ascending: false }),
    ]);

    const nextBook = (bookRes.data as KoreadsBook | null) ?? null;
    setBook(nextBook);
    const nextChapters = (chaptersRes.data as KoreadsChapter[] | null) ?? [];
    setChapters(nextChapters);
    setActiveChapter((prev) => prev ?? nextChapters[0] ?? null);
    const nextTasks = (tasksRes.data as KoreadsTask[] | null) ?? [];
    setTasks(nextTasks);

    const taskIds = nextTasks.map((t) => t.id);
    const submissionsRes =
      taskIds.length > 0
        ? await supabaseAdmin
            .from("koreads_task_submissions")
            .select("*, task:koreads_tasks(title, task_category)")
            .in("task_id", taskIds)
            .order("created_at", { ascending: false })
        : { data: [] };

    setContributions((contributionsRes.data as KoreadsContribution[] | null) ?? []);
    setTaskSubmissions((submissionsRes.data as KoreadsTaskSubmission[] | null) ?? []);
    if (bookId) {
      const m = await fetchBookMilestones(bookId);
      setMilestones(m);
      await maybeLogBookMilestones(bookId, m);
      const { polls } = await fetchBookPollsForAuthor(bookId);
      setAuthorPolls(polls);
      const picks: Record<string, string> = {};
      polls.forEach((p) => {
        if (p.status === "open") {
          const top = topVotedOptionId(p);
          if (top) picks[p.id] = top;
        }
      });
      setPollWinnerPick(picks);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (user) load();
  }, [user, authLoading, bookId]);

  const saveBook = async () => {
    if (!book || !author) return;
    const { error } = await supabaseAdmin
      .from("koreads_books")
      .update({
        title: book.title,
        subtitle: book.subtitle,
        description: book.description,
        tagline: book.tagline,
        genre: book.genre,
        cover_color: book.cover_color,
        visibility: book.visibility || "public",
        tags: book.tags || [],
        status: book.status,
        is_featured: book.is_featured,
        is_spotlight: book.is_spotlight,
        is_new: book.is_new,
        is_open_for_contribution: book.is_open_for_contribution,
        published_at: book.status === "published" ? book.published_at || new Date().toISOString() : book.published_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", book.id)
      .eq("author_id", author.id);

    if (error) toast.error(error.message);
    else toast.success("Book saved");
  };

  const saveChapter = async () => {
    if (!activeChapter) return;
    const { error } = await supabaseAdmin
      .from("koreads_chapters")
      .update({
        chapter_number: activeChapter.chapter_number,
        title: activeChapter.title,
        content: activeChapter.content,
        is_published: activeChapter.is_published,
        is_open_for_inline_contribution: activeChapter.is_open_for_inline_contribution !== false,
        scheduled_at: activeChapter.scheduled_at || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeChapter.id);

    if (error) toast.error(error.message);
    else {
      if (book) {
        await logTimelineEvent({
          book_id: book.id,
          chapter_id: activeChapter.id,
          event_type: activeChapter.is_published ? "chapter_published" : "chapter_updated",
          title: activeChapter.is_published
            ? `Chapter ${activeChapter.chapter_number} published`
            : `Chapter ${activeChapter.chapter_number} updated`,
          description: activeChapter.title,
        });
      }
      toast.success("Chapter saved");
      await load();
    }
  };

  const addChapter = async () => {
    if (!book) return;
    const { error } = await supabaseAdmin.from("koreads_chapters").insert({
      book_id: book.id,
      chapter_number: chapters.length + 1,
      title: `Chapter ${chapters.length + 1}`,
      content: EMPTY_CHAPTER_CONTENT,
      is_published: false,
      is_open_for_inline_contribution: true,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Chapter added");
      await load();
    }
  };

  const deleteChapter = async () => {
    if (!activeChapter || !confirm("Delete this chapter?")) return;
    const { error } = await supabaseAdmin.from("koreads_chapters").delete().eq("id", activeChapter.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Chapter deleted");
      await load();
    }
  };

  const saveTask = async () => {
    if (!book || !taskForm.title?.trim()) {
      toast.error("Task title is required");
      return;
    }
    const payload = {
      book_id: book.id,
      chapter_id: taskForm.chapter_id || null,
      task_category: taskForm.task_category || "other",
      title: taskForm.title,
      description: taskForm.description || "",
      reference_text: taskForm.reference_text || null,
      reward_ko_coins: taskForm.reward_ko_coins ?? 25,
      deadline: taskForm.deadline || null,
      status: taskForm.status || "open",
      is_challenge: !!taskForm.is_challenge,
      challenge_ends_at: taskForm.challenge_ends_at || null,
      updated_at: new Date().toISOString(),
    };

    const query = taskForm.id
      ? supabaseAdmin.from("koreads_tasks").update(payload).eq("id", taskForm.id)
      : supabaseAdmin.from("koreads_tasks").insert(payload);

    const { error } = await query;
    if (error) toast.error(error.message);
    else {
      toast.success(taskForm.id ? "Task updated" : "Task created");
      setTaskForm({ task_category: "other", title: "", description: "", reward_ko_coins: 25, status: "open" });
      await load();
    }
  };

  const respond = async (status: KoreadsContributionStatus) => {
    if (!reviewTarget || !user) return;
    const reward = status === "valuable" ? Math.max(0, rewardAmount || 0) : 0;

    if (reviewTarget.type === "inline") {
      const { error } = await updateContributionResponse({
        contributionId: reviewTarget.item.id,
        status,
        authorResponse: authorResponse || null,
        rewardAmount: reward,
        actorUserId: user.id,
        creditLabel: creditLabel || null,
        isPinnedCredit: status === "accepted" || status === "valuable",
      });
      if (error) toast.error(error.message);
    } else {
      const { error } = await updateTaskSubmissionResponse({
        submissionId: reviewTarget.item.id,
        status,
        authorResponse: authorResponse || null,
        rewardAmount: reward,
        actorUserId: user.id,
        creditLabel: creditLabel || null,
        isPinnedCredit: status === "accepted" || status === "valuable",
      });
      if (error) toast.error(error.message);
    }

    toast.success("Updated");
    setReviewTarget(null);
    setAuthorResponse("");
    await load();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#C77DFF] flex items-center justify-center uppercase tracking-[4px] text-xs">
        Loading book desk...
      </div>
    );
  }

  if (!author || !book) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5]">
        <Navbar />
        <main className="pt-[72px] container mx-auto px-6 lg:px-12 py-16">
          <p className="text-[rgba(240,232,213,0.55)]">Book not found or not assigned to you.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5]">
      <Navbar />
      <main className="pt-[72px] container mx-auto px-6 lg:px-12 py-10">
        <div className="flex justify-between gap-4 mb-6">
          <Link to="/author" className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.45)]">
            <ArrowLeft size={14} /> Author Desk
          </Link>
          <Link to={`/koreads/books/${book.id}`} className="text-[10px] uppercase tracking-[2px] text-[#C77DFF]">
            View public page
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
          {book.title}
        </h1>

        <div className="flex flex-wrap gap-2 mb-8">
          {(["overview", "chapters", "tasks", "contributions", "community"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-[10px] uppercase tracking-[2px] border ${
                tab === t ? "border-[#C77DFF] bg-[#C77DFF]/10 text-[#C77DFF]" : "border-white/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="max-w-xl space-y-4">
            {milestones && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  ["Followers", milestones.follower_count],
                  ["Contributors", milestones.contributor_count],
                  ["Chapters", milestones.chapter_count],
                  ["Open bounties", milestones.open_task_count],
                  ["Theories", milestones.theory_count],
                  ["Polls", milestones.poll_count],
                ].map(([label, val]) => (
                  <div key={label as string} className="border border-white/10 p-3 text-center">
                    <div className="text-xl font-bold">{val as number}</div>
                    <div className="text-[9px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)]">{label as string}</div>
                  </div>
                ))}
              </div>
            )}
          <div className="space-y-4 bg-[rgba(240,232,213,0.025)] border border-[rgba(199,125,255,0.16)] p-6">
            <div>
              <label className={labelClass}>Title</label>
              <input className={inputClass} value={book.title} onChange={(e) => setBook({ ...book, title: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Tagline</label>
              <input className={inputClass} value={book.tagline || ""} onChange={(e) => setBook({ ...book, tagline: e.target.value || null })} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea className={`${inputClass} min-h-[100px]`} value={book.description || ""} onChange={(e) => setBook({ ...book, description: e.target.value || null })} />
            </div>
            <div>
              <label className={labelClass}>Genre</label>
              <input className={inputClass} value={book.genre || ""} onChange={(e) => setBook({ ...book, genre: e.target.value || null })} />
            </div>
            <div>
              <label className={labelClass}>Visibility</label>
              <select className={inputClass} value={book.visibility || "public"} onChange={(e) => setBook({ ...book, visibility: e.target.value as KoreadsBook["visibility"] })}>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="invite_only">Invite only</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={book.status} onChange={(e) => setBook({ ...book, status: e.target.value as KoreadsBook["status"] })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Tags (comma-separated)</label>
              <input
                className={inputClass}
                value={(book.tags || []).join(", ")}
                onChange={(e) =>
                  setBook({
                    ...book,
                    tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                  })
                }
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {KOREADS_COVER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBook({ ...book, cover_color: color })}
                  className="w-8 h-8 border-2"
                  style={{ background: color, borderColor: book.cover_color === color ? "#F0E8D5" : "transparent" }}
                />
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={book.is_open_for_contribution} onChange={(e) => setBook({ ...book, is_open_for_contribution: e.target.checked })} />
              Open for contribution
            </label>
            <button onClick={saveBook} className="w-full bg-[#C77DFF] text-[#0B1828] py-3 text-[10px] uppercase tracking-[2px] font-bold flex items-center justify-center gap-2">
              <Save size={14} /> Save Book
            </button>
          </div>
          </div>
        )}

        {tab === "chapters" && (
          <div className="grid md:grid-cols-[0.32fr_0.68fr] gap-5">
            <div>
              <button onClick={addChapter} className="mb-3 w-full border border-[#C77DFF]/30 text-[#C77DFF] py-3 text-[10px] uppercase tracking-[2px] flex items-center justify-center gap-2">
                <Plus size={14} /> Add Chapter
              </button>
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => setActiveChapter(chapter)}
                    className={`w-full text-left p-3 border ${activeChapter?.id === chapter.id ? "border-[#C77DFF] bg-[#C77DFF]/10" : "border-white/5"}`}
                  >
                    Ch. {chapter.chapter_number}: {chapter.title}
                  </button>
                ))}
              </div>
            </div>
            {activeChapter && (
              <div className="bg-[rgba(240,232,213,0.025)] border border-[rgba(199,125,255,0.16)] p-6">
                <div className="flex justify-between mb-4">
                  <h2 className="font-bold text-xl">Chapter Editor</h2>
                  <button onClick={deleteChapter} className="text-[#E63946]">
                    <Trash2 size={18} />
                  </button>
                </div>
                <input className={`${inputClass} mb-3`} value={activeChapter.title} onChange={(e) => setActiveChapter({ ...activeChapter, title: e.target.value })} />
                <label className="flex items-center gap-2 text-sm mb-2">
                  <input type="checkbox" checked={activeChapter.is_published} onChange={(e) => setActiveChapter({ ...activeChapter, is_published: e.target.checked })} />
                  Published
                </label>
                <label className="flex items-center gap-2 text-sm mb-4">
                  <input
                    type="checkbox"
                    checked={activeChapter.is_open_for_inline_contribution !== false}
                    onChange={(e) => setActiveChapter({ ...activeChapter, is_open_for_inline_contribution: e.target.checked })}
                  />
                  Open for inline highlight contributions
                </label>
                <div className="mb-4">
                  <label className={labelClass}>Scheduled publish (optional)</label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={activeChapter.scheduled_at ? activeChapter.scheduled_at.slice(0, 16) : ""}
                    onChange={(e) =>
                      setActiveChapter({
                        ...activeChapter,
                        scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                  />
                </div>
                <textarea
                  className={`${inputClass} min-h-[400px] leading-7`}
                  value={activeChapter.content}
                  onChange={(e) => setActiveChapter({ ...activeChapter, content: e.target.value })}
                />
                <button onClick={saveChapter} className="mt-4 w-full bg-[#C9A84C] text-[#0B1828] py-3 text-[10px] uppercase tracking-[2px] font-bold">
                  Save Chapter
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "tasks" && (
          <div className="grid lg:grid-cols-[0.4fr_0.6fr] gap-8">
            <div className="bg-[rgba(240,232,213,0.025)] border border-[rgba(199,125,255,0.16)] p-6 space-y-4">
              <h2 className="font-bold">{taskForm.id ? "Edit bounty" : "New bounty task"}</h2>
              <div>
                <label className={labelClass}>Category</label>
                <select className={inputClass} value={taskForm.task_category} onChange={(e) => setTaskForm({ ...taskForm, task_category: e.target.value as KoreadsTaskCategory })}>
                  {TASK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {TASK_CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Title</label>
                <input className={inputClass} value={taskForm.title || ""} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea className={`${inputClass} min-h-[100px]`} value={taskForm.description || ""} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>KO Coin bounty</label>
                <input type="number" className={inputClass} value={taskForm.reward_ko_coins ?? 25} onChange={(e) => setTaskForm({ ...taskForm, reward_ko_coins: Number(e.target.value) })} />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select className={inputClass} value={taskForm.status || "open"} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as KoreadsTask["status"] })}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm mb-2">
                <input type="checkbox" checked={!!taskForm.is_challenge} onChange={(e) => setTaskForm({ ...taskForm, is_challenge: e.target.checked })} />
                Creative challenge (timed)
              </label>
              {taskForm.is_challenge && (
                <div className="mb-4">
                  <label className={labelClass}>Challenge ends</label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={taskForm.challenge_ends_at ? taskForm.challenge_ends_at.slice(0, 16) : ""}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        challenge_ends_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                  />
                </div>
              )}
              <button onClick={saveTask} className="w-full bg-[#C9A84C] text-[#0B1828] py-3 text-[10px] uppercase tracking-[2px] font-bold">
                Save Task
              </button>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setTaskForm(task)}
                  className="w-full text-left border border-white/10 p-4 hover:border-[#C77DFF]/50"
                >
                  <div className="text-[9px] uppercase tracking-[2px] text-[#C77DFF]">{TASK_CATEGORY_LABELS[task.task_category]}</div>
                  <div className="font-bold">{task.title}</div>
                  <div className="text-[10px] text-[rgba(240,232,213,0.4)] mt-1">
                    {task.status} · {task.reward_ko_coins} KO Coins
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "community" && author && book && (
          <div className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-[rgba(240,232,213,0.025)] border border-white/10 p-5 space-y-3">
              <h3 className="font-bold">Open a poll</h3>
              <select className={inputClass} value={pollType} onChange={(e) => setPollType(e.target.value)}>
                <option value="cover_choice">Cover choice</option>
                <option value="plot_direction">Plot direction</option>
                <option value="pacing">Pacing</option>
                <option value="ending">Ending</option>
                <option value="other">Other</option>
              </select>
              <input className={inputClass} placeholder="Question" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} />
              <input className={inputClass} placeholder="Options (comma-separated)" value={pollOptions} onChange={(e) => setPollOptions(e.target.value)} />
              <button
                type="button"
                onClick={async () => {
                  const opts: PollOption[] = pollOptions.split(",").map((s, i) => ({
                    id: `opt_${i}`,
                    label: s.trim(),
                  }));
                  const { error } = await createPollAdmin({
                    book_id: book.id,
                    question: pollQuestion,
                    poll_type: pollType,
                    options: opts,
                  });
                  if (error) toast.error(error.message);
                  else {
                    toast.success("Poll created");
                    setPollQuestion("");
                    await load();
                  }
                }}
                className="w-full bg-[#C77DFF] text-[#0B1828] py-2 text-[10px] uppercase font-bold"
              >
                Create poll
              </button>
            </div>
            <div className="bg-[rgba(240,232,213,0.025)] border border-white/10 p-5 space-y-3">
              <h3 className="font-bold">Behind the story</h3>
              <select className={inputClass} value={behindPostType} onChange={(e) => setBehindPostType(e.target.value)}>
                <option value="process">Writing process</option>
                <option value="deleted_scene">Deleted scene</option>
                <option value="research_journey">Research journey</option>
                <option value="other">Other</option>
              </select>
              <input className={inputClass} placeholder="Title" value={behindTitle} onChange={(e) => setBehindTitle(e.target.value)} />
              <textarea className={`${inputClass} min-h-[80px]`} placeholder="Body" value={behindBody} onChange={(e) => setBehindBody(e.target.value)} />
              <button
                type="button"
                onClick={async () => {
                  const { error } = await createBehindStoryAdmin({
                    book_id: book.id,
                    author_id: author.id,
                    title: behindTitle,
                    body: behindBody,
                    post_type: behindPostType,
                  });
                  if (error) toast.error(error.message);
                  else {
                    toast.success("Post published");
                    setBehindTitle("");
                    setBehindBody("");
                  }
                }}
                className="w-full bg-[#C9A84C] text-[#0B1828] py-2 text-[10px] uppercase font-bold"
              >
                Publish post
              </button>
            </div>
            <div className="bg-[rgba(240,232,213,0.025)] border border-white/10 p-5 space-y-3">
              <h3 className="font-bold">Story circle</h3>
              <input className={inputClass} placeholder="Circle name" value={circleName} onChange={(e) => setCircleName(e.target.value)} />
              <textarea className={`${inputClass} min-h-[60px]`} placeholder="Description" value={circleDesc} onChange={(e) => setCircleDesc(e.target.value)} />
              <button
                type="button"
                onClick={async () => {
                  const { error } = await createCircleAdmin({
                    book_id: book.id,
                    name: circleName,
                    description: circleDesc,
                    circle_type: "beta",
                  });
                  if (error) toast.error(error.message);
                  else {
                    toast.success("Circle created");
                    setCircleName("");
                    setCircleDesc("");
                  }
                }}
                className="w-full border border-[#6BBFB5] text-[#6BBFB5] py-2 text-[10px] uppercase font-bold"
              >
                Create circle
              </button>
            </div>
          </div>
          {authorPolls.length > 0 && (
            <div>
              <h3 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.45)] mb-4">Manage polls</h3>
              <div className="space-y-3">
                {authorPolls.map((poll) => (
                  <div key={poll.id} className="border border-white/10 p-4 flex flex-wrap justify-between gap-3 items-center">
                    <div>
                      <div className="font-bold">{poll.question}</div>
                      <div className="text-[10px] uppercase text-[rgba(240,232,213,0.4)]">{poll.status}</div>
                    </div>
                    {poll.status === "open" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          className={`${inputClass} w-auto min-w-[180px]`}
                          value={pollWinnerPick[poll.id] ?? topVotedOptionId(poll) ?? ""}
                          onChange={(e) =>
                            setPollWinnerPick((prev) => ({ ...prev, [poll.id]: e.target.value }))
                          }
                        >
                          {poll.options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                              {poll.vote_counts ? ` (${poll.vote_counts[opt.id] ?? 0} votes)` : ""}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={async () => {
                            const winner =
                              pollWinnerPick[poll.id] ?? topVotedOptionId(poll) ?? poll.options[0]?.id;
                            const { error } = await closePollAdmin(poll.id, book.id, winner);
                            if (error) toast.error(error.message);
                            else {
                              toast.success("Poll closed");
                              await load();
                            }
                          }}
                          className="text-[10px] uppercase tracking-[2px] text-[#C9A84C] border border-[#C9A84C]/30 px-3 py-2"
                        >
                          Close poll
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        )}

        {tab === "contributions" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.45)] mb-4">Inline contributions</h3>
              {contributions.map((item) => (
                <div key={item.id} className="border border-white/10 p-4 mb-3">
                  <div className="text-[10px] text-[#C9A84C] mb-1">Ch. {item.chapter?.chapter_number}</div>
                  <blockquote className="text-sm border-l-2 border-[#C77DFF] pl-3 mb-2">{item.selected_text}</blockquote>
                  <p className="text-sm text-[rgba(240,232,213,0.55)]">{item.comment}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewTarget({ type: "inline", item });
                      setAuthorResponse(item.author_response || "");
                      setRewardAmount(item.ko_coins_rewarded || 25);
                    }}
                    className="mt-3 text-[10px] uppercase tracking-[2px] text-[#C77DFF]"
                  >
                    Review · {item.status}
                  </button>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.45)] mb-4">Bounty submissions</h3>
              {taskSubmissions.map((item) => (
                <div key={item.id} className="border border-white/10 p-4 mb-3">
                  <div className="text-[10px] text-[#C9A84C] mb-1">{item.task?.title}</div>
                  <p className="text-sm">{item.body}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewTarget({ type: "task", item });
                      setAuthorResponse(item.author_response || "");
                      setRewardAmount(item.ko_coins_rewarded || item.task?.reward_ko_coins || 25);
                    }}
                    className="mt-3 text-[10px] uppercase tracking-[2px] text-[#C77DFF]"
                  >
                    Review · {item.status}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {reviewTarget && (
        <div className="fixed inset-0 bg-black/70 z-[120] flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-[#0B1828] border border-[#C77DFF]/40 p-6">
            <h3 className="text-xl font-bold mb-4">Review contribution</h3>
            <textarea
              value={authorResponse}
              onChange={(e) => setAuthorResponse(e.target.value)}
              placeholder="Response to contributor..."
              className="w-full min-h-[100px] bg-[rgba(240,232,213,0.04)] border border-white/10 p-3 mb-4"
            />
            <input
              value={creditLabel}
              onChange={(e) => setCreditLabel(e.target.value)}
              placeholder="Credit label (e.g. Research contributor)"
              className="w-full bg-[rgba(240,232,213,0.04)] border border-white/10 p-3 mb-4"
            />
            <input
              type="number"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(Number(e.target.value))}
              className="w-full bg-[rgba(240,232,213,0.04)] border border-white/10 p-3 mb-5"
            />
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => respond("accepted")} className="bg-[#6BBFB5] text-[#0B1828] py-2 text-[10px] uppercase font-bold">
                Accept
              </button>
              <button onClick={() => respond("valuable")} className="bg-[#C9A84C] text-[#0B1828] py-2 text-[10px] uppercase font-bold">
                Valuable
              </button>
              <button onClick={() => respond("rejected")} className="bg-[#E63946] text-white py-2 text-[10px] uppercase font-bold">
                Reject
              </button>
              <button onClick={() => setReviewTarget(null)} className="border border-white/10 py-2 text-[10px] uppercase">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorBookDetail;
