import { useCallback, useEffect, useState } from "react";
import { BookOpen, Coins, Plus, RefreshCcw, Save, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { updateContributionResponse, updateTaskSubmissionResponse } from "@/lib/koreads";
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

type Tab = "authors" | "books" | "chapters" | "tasks" | "contributions" | "rewards";

const inputClass =
  "w-full bg-[rgba(240,232,213,0.04)] border border-[rgba(201,168,76,0.12)] p-3 outline-none focus:border-[#C77DFF]";
const labelClass = "block text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-2";

const AdminKoreads = () => {
  const [tab, setTab] = useState<Tab>("authors");
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<KoreadsAuthor[]>([]);
  const [books, setBooks] = useState<KoreadsBook[]>([]);
  const [chapters, setChapters] = useState<KoreadsChapter[]>([]);
  const [contributions, setContributions] = useState<KoreadsContribution[]>([]);
  const [tasks, setTasks] = useState<KoreadsTask[]>([]);
  const [taskSubmissions, setTaskSubmissions] = useState<KoreadsTaskSubmission[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [authorForm, setAuthorForm] = useState<Partial<KoreadsAuthor>>({
    name: "",
    pen_name: "",
    bio: "",
    spotlight_quote: "",
    is_spotlight: false,
    is_active: true,
  });
  const [bookForm, setBookForm] = useState<Partial<KoreadsBook>>({
    title: "",
    author_id: "",
    cover_color: KOREADS_COVER_COLORS[0],
    status: "draft",
    is_featured: false,
    is_spotlight: false,
    is_new: true,
    is_open_for_contribution: true,
  });
  const [selectedBookId, setSelectedBookId] = useState("");
  const [activeChapter, setActiveChapter] = useState<Partial<KoreadsChapter> | null>(null);
  const [activeContribution, setActiveContribution] = useState<KoreadsContribution | null>(null);
  const [activeTaskSubmission, setActiveTaskSubmission] = useState<KoreadsTaskSubmission | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<KoreadsTask>>({
    task_category: "other",
    title: "",
    description: "",
    reward_ko_coins: 25,
    status: "open",
    book_id: "",
  });
  const [adminResponse, setAdminResponse] = useState("");
  const [rewardAmount, setRewardAmount] = useState(50);
  const [authorGrant, setAuthorGrant] = useState({ authorId: "", amount: 100, reason: "KO Reads author grant" });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [authorsRes, booksRes, chaptersRes, contributionsRes, tasksRes, usersRes] = await Promise.all([
        supabaseAdmin.from("koreads_authors").select("*").order("updated_at", { ascending: false }),
        supabaseAdmin.from("koreads_books").select("*, author:koreads_authors(*)").order("updated_at", { ascending: false }),
        supabaseAdmin.from("koreads_chapters").select("*").order("chapter_number", { ascending: true }),
        supabaseAdmin
          .from("koreads_contributions")
          .select("*, book:koreads_books(title, cover_color), chapter:koreads_chapters(title, chapter_number)")
          .order("created_at", { ascending: false }),
        supabaseAdmin.from("koreads_tasks").select("*, book:koreads_books(title)").order("created_at", { ascending: false }),
        supabaseAdmin.auth.admin.listUsers(),
      ]);

      const taskIds = ((tasksRes.data as KoreadsTask[]) || []).map((t) => t.id);
      const submissionsRes =
        taskIds.length > 0
          ? await supabaseAdmin
              .from("koreads_task_submissions")
              .select("*, task:koreads_tasks(title, task_category, book:koreads_books(title))")
              .in("task_id", taskIds)
              .order("created_at", { ascending: false })
          : { data: [], error: null };

      if (authorsRes.error?.code === "PGRST205") {
        toast.error("Run supabase/koreads_schema.sql in Supabase SQL Editor first.");
        return;
      }
      if (authorsRes.error) throw authorsRes.error;
      if (booksRes.error) throw booksRes.error;
      if (chaptersRes.error) throw chaptersRes.error;
      if (contributionsRes.error) throw contributionsRes.error;
      if (usersRes.error) throw usersRes.error;

      setAuthors((authorsRes.data as KoreadsAuthor[]) || []);
      setBooks((booksRes.data as KoreadsBook[]) || []);
      setChapters((chaptersRes.data as KoreadsChapter[]) || []);
      setContributions((contributionsRes.data as KoreadsContribution[]) || []);
      setTasks((tasksRes.data as KoreadsTask[]) || []);
      setTaskSubmissions((submissionsRes.data as KoreadsTaskSubmission[]) || []);
      setUsers(usersRes.data.users || []);
      if (!selectedBookId && booksRes.data?.[0]) setSelectedBookId(booksRes.data[0].id);
    } catch (error: any) {
      toast.error(error.message || "Failed to load KO Reads admin data");
    } finally {
      setLoading(false);
    }
  }, [selectedBookId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const resetAuthor = () =>
    setAuthorForm({ name: "", pen_name: "", bio: "", spotlight_quote: "", is_spotlight: false, is_active: true });

  const saveAuthor = async () => {
    if (!authorForm.name?.trim()) {
      toast.error("Author name is required");
      return;
    }
    const payload = {
      user_id: authorForm.user_id || null,
      name: authorForm.name,
      pen_name: authorForm.pen_name || null,
      bio: authorForm.bio || null,
      avatar_url: authorForm.avatar_url || null,
      spotlight_quote: authorForm.spotlight_quote || null,
      is_spotlight: !!authorForm.is_spotlight,
      is_active: authorForm.is_active !== false,
      updated_at: new Date().toISOString(),
    };

    const query = authorForm.id
      ? supabaseAdmin.from("koreads_authors").update(payload).eq("id", authorForm.id)
      : supabaseAdmin.from("koreads_authors").insert(payload);

    const { error } = await query;
    if (error) toast.error(error.message);
    else {
      toast.success(authorForm.id ? "Author updated" : "Author created");
      resetAuthor();
      await loadAll();
    }
  };

  const saveBook = async () => {
    if (!bookForm.title?.trim() || !bookForm.author_id) {
      toast.error("Book title and author are required");
      return;
    }
    const payload = {
      author_id: bookForm.author_id,
      title: bookForm.title,
      subtitle: bookForm.subtitle || null,
      description: bookForm.description || null,
      tagline: bookForm.tagline || null,
      genre: bookForm.genre || null,
      cover_color: bookForm.cover_color || KOREADS_COVER_COLORS[0],
      status: bookForm.status || "draft",
      is_featured: !!bookForm.is_featured,
      is_spotlight: !!bookForm.is_spotlight,
      is_new: !!bookForm.is_new,
      is_open_for_contribution: bookForm.is_open_for_contribution !== false,
      visibility: bookForm.visibility || "public",
      tags: bookForm.tags || [],
      published_at:
        bookForm.status === "published" ? bookForm.published_at || new Date().toISOString() : bookForm.published_at || null,
      updated_at: new Date().toISOString(),
    };

    const query = bookForm.id
      ? supabaseAdmin.from("koreads_books").update(payload).eq("id", bookForm.id)
      : supabaseAdmin.from("koreads_books").insert(payload);

    const { error } = await query;
    if (error) toast.error(error.message);
    else {
      toast.success(bookForm.id ? "Book updated" : "Book created");
      setBookForm({
        title: "",
        author_id: "",
        cover_color: KOREADS_COVER_COLORS[0],
        status: "draft",
        is_featured: false,
        is_spotlight: false,
        is_new: true,
        is_open_for_contribution: true,
      });
      await loadAll();
    }
  };

  const saveChapter = async () => {
    if (!activeChapter || !selectedBookId) return;
    const payload = {
      book_id: selectedBookId,
      chapter_number: activeChapter.chapter_number || 1,
      title: activeChapter.title || "Untitled Chapter",
      content: activeChapter.content || "",
      is_published: !!activeChapter.is_published,
      updated_at: new Date().toISOString(),
    };

    const query = activeChapter.id
      ? supabaseAdmin.from("koreads_chapters").update(payload).eq("id", activeChapter.id)
      : supabaseAdmin.from("koreads_chapters").insert(payload);

    const { error } = await query;
    if (error) toast.error(error.message);
    else {
      toast.success(activeChapter.id ? "Chapter updated" : "Chapter created");
      setActiveChapter(null);
      await loadAll();
    }
  };

  const deleteChapter = async (chapterId: string) => {
    if (!confirm("Delete this chapter?")) return;
    const { error } = await supabaseAdmin.from("koreads_chapters").delete().eq("id", chapterId);
    if (error) toast.error(error.message);
    else {
      toast.success("Chapter deleted");
      await loadAll();
    }
  };

  const saveTask = async () => {
    if (!taskForm.title?.trim() || !taskForm.book_id) {
      toast.error("Task title and book are required");
      return;
    }
    const payload = {
      book_id: taskForm.book_id,
      chapter_id: taskForm.chapter_id || null,
      task_category: taskForm.task_category || "other",
      title: taskForm.title,
      description: taskForm.description || "",
      reference_text: taskForm.reference_text || null,
      reward_ko_coins: taskForm.reward_ko_coins ?? 25,
      status: taskForm.status || "open",
      updated_at: new Date().toISOString(),
    };
    const query = taskForm.id
      ? supabaseAdmin.from("koreads_tasks").update(payload).eq("id", taskForm.id)
      : supabaseAdmin.from("koreads_tasks").insert(payload);
    const { error } = await query;
    if (error) toast.error(error.message);
    else {
      toast.success(taskForm.id ? "Task updated" : "Task created");
      setTaskForm({ task_category: "other", title: "", description: "", reward_ko_coins: 25, status: "open", book_id: selectedBookId });
      await loadAll();
    }
  };

  const respondTaskSubmission = async (status: KoreadsContributionStatus) => {
    if (!activeTaskSubmission) return;
    const { error } = await updateTaskSubmissionResponse({
      submissionId: activeTaskSubmission.id,
      status,
      authorResponse: adminResponse || null,
      rewardAmount: status === "valuable" || status === "accepted" ? rewardAmount : 0,
      actorUserId: null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Submission updated");
      setActiveTaskSubmission(null);
      setAdminResponse("");
      await loadAll();
    }
  };

  const respondContribution = async (status: KoreadsContributionStatus) => {
    if (!activeContribution) return;
    const { error } = await updateContributionResponse({
      contributionId: activeContribution.id,
      status,
      authorResponse: adminResponse || null,
      rewardAmount: status === "valuable" ? rewardAmount : 0,
      actorUserId: null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Contribution updated");
      setActiveContribution(null);
      setAdminResponse("");
      await loadAll();
    }
  };

  const grantAuthorCoins = async () => {
    const author = authors.find((item) => item.id === authorGrant.authorId);
    if (!author?.user_id) {
      toast.error("Select an author linked to a user account");
      return;
    }

    const profileRes = await supabaseAdmin.from("profiles").select("ko_coins").eq("id", author.user_id).maybeSingle();
    const currentCoins = profileRes.data?.ko_coins ?? 0;
    const amount = Math.max(1, Number(authorGrant.amount || 0));

    const updateRes = await supabaseAdmin
      .from("profiles")
      .update({ ko_coins: currentCoins + amount })
      .eq("id", author.user_id);
    if (updateRes.error) {
      toast.error(updateRes.error.message);
      return;
    }

    await supabaseAdmin.from("ko_coin_transactions").insert({
      recipient_user_id: author.user_id,
      actor_user_id: null,
      author_id: author.id,
      contribution_id: null,
      amount,
      reason: authorGrant.reason,
      source: "koreads_author_grant",
    });

    toast.success("Author KO Coins granted");
    setAuthorGrant({ authorId: "", amount: 100, reason: "KO Reads author grant" });
  };

  const selectedBookChapters = chapters.filter((chapter) => chapter.book_id === selectedBookId);

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5] flex">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between gap-5 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              KO Reads CMS
            </h1>
            <p className="text-sm text-[rgba(240,232,213,0.45)]">
              Manage authors, books, chapters, contribution review, curation, and KO coin rewards.
            </p>
          </div>
          <button
            onClick={loadAll}
            className="h-fit flex items-center gap-2 border border-[rgba(201,168,76,0.2)] px-4 py-2 text-[10px] uppercase tracking-[2px]"
          >
            <RefreshCcw size={14} /> Refresh
          </button>
        </header>

        <div className="grid md:grid-cols-6 gap-3 mb-8">
          {[
            ["authors", "Authors", Users],
            ["books", "Books", BookOpen],
            ["chapters", "Chapters", BookOpen],
            ["tasks", "Tasks", Coins],
            ["contributions", "Contributions", Save],
            ["rewards", "Rewards", Coins],
          ].map(([id, label, Icon]) => (
            <button
              key={id as string}
              onClick={() => setTab(id as Tab)}
              className={`flex items-center justify-center gap-2 px-4 py-3 text-[10px] uppercase tracking-[2px] border ${
                tab === id
                  ? "border-[#C77DFF] bg-[#C77DFF]/10 text-[#C77DFF]"
                  : "border-white/10 text-[rgba(240,232,213,0.45)]"
              }`}
            >
              <Icon size={14} /> {label as string}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-20 text-center text-[rgba(240,232,213,0.35)] uppercase tracking-[3px] text-xs">
            Loading KO Reads data...
          </div>
        ) : (
          <>
            {tab === "authors" && (
              <div className="grid lg:grid-cols-[0.38fr_0.62fr] gap-8">
                <section className="bg-[rgba(240,232,213,0.025)] border border-white/10 p-6 space-y-4">
                  <h2 className="font-bold text-xl">{authorForm.id ? "Edit Author" : "Create Author"}</h2>
                  <div>
                    <label className={labelClass}>Linked user</label>
                    <select className={inputClass} value={authorForm.user_id || ""} onChange={(e) => setAuthorForm({ ...authorForm, user_id: e.target.value || null })}>
                      <option value="">No linked user</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Author name</label>
                    <input className={inputClass} value={authorForm.name || ""} onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Pen name</label>
                    <input className={inputClass} value={authorForm.pen_name || ""} onChange={(e) => setAuthorForm({ ...authorForm, pen_name: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Bio</label>
                    <textarea className={`${inputClass} min-h-[100px]`} value={authorForm.bio || ""} onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Spotlight quote</label>
                    <textarea className={`${inputClass} min-h-[80px]`} value={authorForm.spotlight_quote || ""} onChange={(e) => setAuthorForm({ ...authorForm, spotlight_quote: e.target.value })} />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!authorForm.is_spotlight} onChange={(e) => setAuthorForm({ ...authorForm, is_spotlight: e.target.checked })} />
                    Show in author spotlight
                  </label>
                  <button onClick={saveAuthor} className="w-full bg-[#C77DFF] text-[#0B1828] py-3 text-[10px] uppercase tracking-[2px] font-bold flex items-center justify-center gap-2">
                    <Save size={14} /> Save Author
                  </button>
                </section>
                <section className="space-y-3">
                  {authors.map((author) => (
                    <button
                      key={author.id}
                      onClick={() => setAuthorForm(author)}
                      className="w-full text-left bg-[rgba(240,232,213,0.025)] border border-white/10 hover:border-[#C77DFF]/50 p-4"
                    >
                      <div className="font-bold">{author.pen_name || author.name}</div>
                      <div className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.35)]">
                        {author.is_spotlight ? "Spotlight" : "Standard"} · {author.user_id ? "linked" : "not linked"}
                      </div>
                    </button>
                  ))}
                </section>
              </div>
            )}

            {tab === "books" && (
              <div className="grid lg:grid-cols-[0.42fr_0.58fr] gap-8">
                <section className="bg-[rgba(240,232,213,0.025)] border border-white/10 p-6 space-y-4">
                  <h2 className="font-bold text-xl">{bookForm.id ? "Edit Book" : "Create Book"}</h2>
                  <div>
                    <label className={labelClass}>Author</label>
                    <select className={inputClass} value={bookForm.author_id || ""} onChange={(e) => setBookForm({ ...bookForm, author_id: e.target.value })}>
                      <option value="">Select author</option>
                      {authors.map((author) => (
                        <option key={author.id} value={author.id}>
                          {author.pen_name || author.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Title</label>
                    <input className={inputClass} value={bookForm.title || ""} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Tagline</label>
                    <input className={inputClass} value={bookForm.tagline || ""} onChange={(e) => setBookForm({ ...bookForm, tagline: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea className={`${inputClass} min-h-[110px]`} value={bookForm.description || ""} onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Genre</label>
                      <input className={inputClass} value={bookForm.genre || ""} onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelClass}>Status</label>
                      <select className={inputClass} value={bookForm.status || "draft"} onChange={(e) => setBookForm({ ...bookForm, status: e.target.value as KoreadsBook["status"] })}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Cover color</label>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {KOREADS_COVER_COLORS.map((color) => (
                        <button key={color} type="button" onClick={() => setBookForm({ ...bookForm, cover_color: color })} className="w-8 h-8 border-2" style={{ background: color, borderColor: bookForm.cover_color === color ? "#F0E8D5" : "transparent" }} />
                      ))}
                    </div>
                    <input className={inputClass} value={bookForm.cover_color || ""} onChange={(e) => setBookForm({ ...bookForm, cover_color: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Visibility</label>
                    <select className={inputClass} value={bookForm.visibility || "public"} onChange={(e) => setBookForm({ ...bookForm, visibility: e.target.value as KoreadsBook["visibility"] })}>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="invite_only">Invite only</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Tags (comma-separated)</label>
                    <input
                      className={inputClass}
                      value={(bookForm.tags || []).join(", ")}
                      onChange={(e) =>
                        setBookForm({
                          ...bookForm,
                          tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                        })
                      }
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    {[
                      ["is_featured", "Featured"],
                      ["is_spotlight", "Spotlight"],
                      ["is_new", "New"],
                      ["is_open_for_contribution", "Open for contribution"],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2">
                        <input type="checkbox" checked={!!bookForm[key as keyof KoreadsBook]} onChange={(e) => setBookForm({ ...bookForm, [key]: e.target.checked })} />
                        {label}
                      </label>
                    ))}
                  </div>
                  <button onClick={saveBook} className="w-full bg-[#C77DFF] text-[#0B1828] py-3 text-[10px] uppercase tracking-[2px] font-bold flex items-center justify-center gap-2">
                    <Save size={14} /> Save Book
                  </button>
                </section>
                <section className="space-y-3">
                  {books.map((book) => (
                    <button key={book.id} onClick={() => setBookForm(book)} className="w-full text-left bg-[rgba(240,232,213,0.025)] border border-white/10 hover:border-[#C77DFF]/50 p-4">
                      <div className="flex gap-3">
                        <div className="w-3 shrink-0" style={{ background: book.cover_color }} />
                        <div>
                          <div className="font-bold">{book.title}</div>
                          <div className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.35)]">
                            {book.status} · {book.author?.pen_name || book.author?.name}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </section>
              </div>
            )}

            {tab === "chapters" && (
              <div className="grid lg:grid-cols-[0.32fr_0.68fr] gap-8">
                <section>
                  <label className={labelClass}>Book</label>
                  <select className={`${inputClass} mb-4`} value={selectedBookId} onChange={(e) => setSelectedBookId(e.target.value)}>
                    {books.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => setActiveChapter({ book_id: selectedBookId, chapter_number: selectedBookChapters.length + 1, title: `Chapter ${selectedBookChapters.length + 1}`, content: EMPTY_CHAPTER_CONTENT, is_published: false })} className="mb-4 w-full border border-[#C77DFF]/30 text-[#C77DFF] py-3 text-[10px] uppercase tracking-[2px] flex items-center justify-center gap-2">
                    <Plus size={14} /> Add Chapter
                  </button>
                  <div className="space-y-2">
                    {selectedBookChapters.map((chapter) => (
                      <button key={chapter.id} onClick={() => setActiveChapter(chapter)} className="w-full text-left bg-[rgba(240,232,213,0.025)] border border-white/10 p-3">
                        <div className="text-[9px] uppercase tracking-[2px] text-[#C9A84C]">Chapter {chapter.chapter_number}</div>
                        <div className="font-bold text-sm">{chapter.title}</div>
                      </button>
                    ))}
                  </div>
                </section>
                {activeChapter && (
                  <section className="bg-[rgba(240,232,213,0.025)] border border-white/10 p-6">
                    <div className="flex justify-between mb-5">
                      <h2 className="font-bold text-xl">Chapter Editor</h2>
                      {activeChapter.id && (
                        <button onClick={() => deleteChapter(activeChapter.id!)} className="text-[#E63946]">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className={labelClass}>Number</label>
                        <input type="number" className={inputClass} value={activeChapter.chapter_number || 1} onChange={(e) => setActiveChapter({ ...activeChapter, chapter_number: Number(e.target.value) })} />
                      </div>
                      <label className="flex items-end gap-2 pb-3 text-sm">
                        <input type="checkbox" checked={!!activeChapter.is_published} onChange={(e) => setActiveChapter({ ...activeChapter, is_published: e.target.checked })} />
                        Published
                      </label>
                    </div>
                    <div className="mb-4">
                      <label className={labelClass}>Title</label>
                      <input className={inputClass} value={activeChapter.title || ""} onChange={(e) => setActiveChapter({ ...activeChapter, title: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelClass}>Content</label>
                      <textarea className={`${inputClass} min-h-[520px] leading-7`} value={activeChapter.content || ""} onChange={(e) => setActiveChapter({ ...activeChapter, content: e.target.value })} />
                    </div>
                    <button onClick={saveChapter} className="mt-5 w-full bg-[#C9A84C] text-[#0B1828] py-3 text-[10px] uppercase tracking-[2px] font-bold flex items-center justify-center gap-2">
                      <Save size={14} /> Save Chapter
                    </button>
                  </section>
                )}
              </div>
            )}

            {tab === "tasks" && (
              <div className="grid lg:grid-cols-[0.4fr_0.6fr] gap-8">
                <section className="bg-[rgba(240,232,213,0.025)] border border-white/10 p-6 space-y-4">
                  <h2 className="font-bold text-xl">{taskForm.id ? "Edit Task" : "Create Task"}</h2>
                  <div>
                    <label className={labelClass}>Book</label>
                    <select className={inputClass} value={taskForm.book_id || selectedBookId} onChange={(e) => setTaskForm({ ...taskForm, book_id: e.target.value })}>
                      <option value="">Select book</option>
                      {books.map((book) => (
                        <option key={book.id} value={book.id}>{book.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Category</label>
                    <select className={inputClass} value={taskForm.task_category || "other"} onChange={(e) => setTaskForm({ ...taskForm, task_category: e.target.value as KoreadsTaskCategory })}>
                      {(Object.keys(TASK_CATEGORY_LABELS) as KoreadsTaskCategory[]).map((c) => (
                        <option key={c} value={c}>{TASK_CATEGORY_LABELS[c]}</option>
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
                  <button onClick={saveTask} className="w-full bg-[#C77DFF] text-[#0B1828] py-3 text-[10px] uppercase tracking-[2px] font-bold">
                    Save Task
                  </button>
                </section>
                <section className="space-y-3">
                  {tasks.map((task) => (
                    <button key={task.id} onClick={() => setTaskForm({ ...task, book_id: task.book_id })} className="w-full text-left border border-white/10 p-4 hover:border-[#C77DFF]/50">
                      <div className="text-[9px] uppercase text-[#C77DFF]">{TASK_CATEGORY_LABELS[task.task_category]}</div>
                      <div className="font-bold">{task.title}</div>
                      <div className="text-[10px] text-[rgba(240,232,213,0.35)]">{task.book?.title} · {task.status}</div>
                    </button>
                  ))}
                </section>
              </div>
            )}

            {tab === "contributions" && (
              <section className="space-y-8">
                <div>
                  <h3 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.45)] mb-4">Inline contributions</h3>
                {contributions.map((item) => (
                  <div key={item.id} className="bg-[rgba(240,232,213,0.025)] border border-white/10 p-5">
                    <div className="flex justify-between gap-4 mb-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-[2px] text-[#C9A84C]">
                          {item.book?.title} · Chapter {item.chapter?.chapter_number}
                        </div>
                        <div className="font-bold">{item.chapter?.title}</div>
                      </div>
                      <span className="text-[10px] uppercase tracking-[2px] text-[#C77DFF]">{item.status}</span>
                    </div>
                    <blockquote className="border-l-2 border-[#C77DFF] pl-3 text-sm text-[rgba(240,232,213,0.65)] mb-3">
                      {item.selected_text}
                    </blockquote>
                    <p className="text-sm text-[rgba(240,232,213,0.55)] mb-4">{item.comment}</p>
                    <button onClick={() => { setActiveContribution(item); setAdminResponse(item.author_response || ""); setRewardAmount(item.ko_coins_rewarded || 50); }} className="text-[10px] uppercase tracking-[2px] text-[#C77DFF]">
                      Moderate / reward
                    </button>
                  </div>
                ))}
                </div>
                <div>
                  <h3 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.45)] mb-4">Bounty submissions</h3>
                  {taskSubmissions.map((item) => (
                    <div key={item.id} className="bg-[rgba(240,232,213,0.025)] border border-white/10 p-5 mb-4">
                      <div className="text-[10px] uppercase tracking-[2px] text-[#C9A84C] mb-1">
                        {(item.task as any)?.book?.title} · {item.task?.title}
                      </div>
                      <p className="text-sm text-[rgba(240,232,213,0.55)] mb-4">{item.body}</p>
                      <button
                        onClick={() => {
                          setActiveTaskSubmission(item);
                          setAdminResponse(item.author_response || "");
                          setRewardAmount(item.ko_coins_rewarded || 50);
                        }}
                        className="text-[10px] uppercase tracking-[2px] text-[#C77DFF]"
                      >
                        Moderate · {item.status}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tab === "rewards" && (
              <section className="max-w-xl bg-[rgba(240,232,213,0.025)] border border-white/10 p-6 space-y-4">
                <h2 className="font-bold text-xl">Grant KO Coins To Author</h2>
                <div>
                  <label className={labelClass}>Author</label>
                  <select className={inputClass} value={authorGrant.authorId} onChange={(e) => setAuthorGrant({ ...authorGrant, authorId: e.target.value })}>
                    <option value="">Select linked author</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.pen_name || author.name} {author.user_id ? "" : "(not linked)"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Amount</label>
                  <input type="number" className={inputClass} value={authorGrant.amount} onChange={(e) => setAuthorGrant({ ...authorGrant, amount: Number(e.target.value) })} />
                </div>
                <div>
                  <label className={labelClass}>Reason</label>
                  <input className={inputClass} value={authorGrant.reason} onChange={(e) => setAuthorGrant({ ...authorGrant, reason: e.target.value })} />
                </div>
                <button onClick={grantAuthorCoins} className="w-full bg-[#C9A84C] text-[#0B1828] py-3 text-[10px] uppercase tracking-[2px] font-bold flex items-center justify-center gap-2">
                  <Coins size={14} /> Grant Coins
                </button>
              </section>
            )}
          </>
        )}
      </main>

      {activeTaskSubmission && (
        <div className="fixed inset-0 bg-black/70 z-[120] flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-[#0B1828] border border-[#C77DFF]/40 p-6">
            <h3 className="text-xl font-bold mb-4">Moderate Bounty Submission</h3>
            <textarea value={adminResponse} onChange={(e) => setAdminResponse(e.target.value)} className={`${inputClass} min-h-[120px] mb-4`} />
            <input type="number" value={rewardAmount} onChange={(e) => setRewardAmount(Number(e.target.value))} className={`${inputClass} mb-5`} />
            <div className="grid sm:grid-cols-4 gap-2">
              <button onClick={() => respondTaskSubmission("accepted")} className="bg-[#6BBFB5] text-[#0B1828] py-3 text-[10px] uppercase font-bold">Accept</button>
              <button onClick={() => respondTaskSubmission("valuable")} className="bg-[#C9A84C] text-[#0B1828] py-3 text-[10px] uppercase font-bold">Valuable</button>
              <button onClick={() => respondTaskSubmission("rejected")} className="bg-[#E63946] text-white py-3 text-[10px] uppercase font-bold">Reject</button>
              <button onClick={() => setActiveTaskSubmission(null)} className="border border-white/10 py-3 text-[10px] uppercase">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {activeContribution && (
        <div className="fixed inset-0 bg-black/70 z-[120] flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-[#0B1828] border border-[#C77DFF]/40 p-6">
            <h3 className="text-xl font-bold mb-4">Moderate Contribution</h3>
            <textarea value={adminResponse} onChange={(e) => setAdminResponse(e.target.value)} className={`${inputClass} min-h-[120px] mb-4`} placeholder="Response visible to contributor" />
            <label className={labelClass}>Reward if valuable</label>
            <input type="number" value={rewardAmount} onChange={(e) => setRewardAmount(Number(e.target.value))} className={`${inputClass} mb-5`} />
            <div className="grid sm:grid-cols-4 gap-2">
              <button onClick={() => respondContribution("accepted")} className="bg-[#6BBFB5] text-[#0B1828] py-3 text-[10px] uppercase tracking-[2px] font-bold">Accept</button>
              <button onClick={() => respondContribution("valuable")} className="bg-[#C9A84C] text-[#0B1828] py-3 text-[10px] uppercase tracking-[2px] font-bold">Valuable</button>
              <button onClick={() => respondContribution("rejected")} className="bg-[#E63946] text-white py-3 text-[10px] uppercase tracking-[2px] font-bold">Reject</button>
              <button onClick={() => setActiveContribution(null)} className="border border-white/10 py-3 text-[10px] uppercase tracking-[2px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKoreads;

