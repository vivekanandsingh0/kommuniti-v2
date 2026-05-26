import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { fetchAuthorForUser } from "@/lib/koreads";
import {
  EMPTY_CHAPTER_CONTENT,
  KOREADS_COVER_COLORS,
  KoreadsAuthor,
  KoreadsBook,
  KoreadsChapter,
} from "@/types/koreads";

const inputClass =
  "w-full bg-[rgba(240,232,213,0.04)] border border-white/10 p-3 outline-none focus:border-[#C77DFF]";
const labelClass = "block text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-2";

const AuthorBookDetail = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [author, setAuthor] = useState<KoreadsAuthor | null>(null);
  const [book, setBook] = useState<KoreadsBook | null>(null);
  const [chapters, setChapters] = useState<KoreadsChapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<KoreadsChapter | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user || !bookId) return;
    setLoading(true);
    const authorRes = await fetchAuthorForUser(user.id);
    setAuthor(authorRes.author);
    if (!authorRes.author) {
      setLoading(false);
      return;
    }

    const [bookRes, chaptersRes] = await Promise.all([
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
    ]);

    setBook((bookRes.data as KoreadsBook | null) ?? null);
    const nextChapters = (chaptersRes.data as KoreadsChapter[] | null) ?? [];
    setChapters(nextChapters);
    setActiveChapter(nextChapters[0] ?? null);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (user) load();
  }, [user, authLoading, bookId]);

  const saveBook = async () => {
    if (!book) return;
    const { error } = await supabaseAdmin
      .from("koreads_books")
      .update({
        title: book.title,
        subtitle: book.subtitle,
        description: book.description,
        tagline: book.tagline,
        genre: book.genre,
        cover_color: book.cover_color,
        status: book.status,
        is_featured: book.is_featured,
        is_spotlight: book.is_spotlight,
        is_new: book.is_new,
        is_open_for_contribution: book.is_open_for_contribution,
        published_at: book.status === "published" ? book.published_at || new Date().toISOString() : book.published_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", book.id)
      .eq("author_id", author?.id);

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
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeChapter.id);

    if (error) toast.error(error.message);
    else {
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
        <div className="flex justify-between gap-4 mb-8">
          <Link to="/author" className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.45)]">
            <ArrowLeft size={14} /> Author Desk
          </Link>
          <Link to={`/koreads/books/${book.id}`} className="text-[10px] uppercase tracking-[2px] text-[#C77DFF]">
            View public page
          </Link>
        </div>

        <div className="grid lg:grid-cols-[0.38fr_0.62fr] gap-8">
          <section className="space-y-6">
            <div className="bg-[rgba(240,232,213,0.025)] border border-[rgba(199,125,255,0.16)] p-6">
              <h1 className="text-xl font-bold mb-5" style={{ fontFamily: "'Syne', sans-serif" }}>
                Book Settings
              </h1>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Title</label>
                  <input className={inputClass} value={book.title} onChange={(e) => setBook({ ...book, title: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Subtitle</label>
                  <input className={inputClass} value={book.subtitle || ""} onChange={(e) => setBook({ ...book, subtitle: e.target.value || null })} />
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
                  <label className={labelClass}>Status</label>
                  <select className={inputClass} value={book.status} onChange={(e) => setBook({ ...book, status: e.target.value as KoreadsBook["status"] })}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Cover Color</label>
                  <div className="flex flex-wrap gap-2 mb-2">
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
                  <input className={inputClass} value={book.cover_color} onChange={(e) => setBook({ ...book, cover_color: e.target.value })} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={book.is_open_for_contribution} onChange={(e) => setBook({ ...book, is_open_for_contribution: e.target.checked })} />
                  Open for contribution
                </label>
              </div>
              <button onClick={saveBook} className="mt-6 w-full bg-[#C77DFF] text-[#0B1828] py-3 text-[10px] uppercase tracking-[2px] font-bold flex items-center justify-center gap-2">
                <Save size={14} /> Save Book
              </button>
            </div>
          </section>

          <section className="grid md:grid-cols-[0.32fr_0.68fr] gap-5">
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
                    className={`w-full text-left p-3 border transition-all ${
                      activeChapter?.id === chapter.id
                        ? "border-[#C77DFF] bg-[#C77DFF]/10"
                        : "border-white/5 bg-[rgba(240,232,213,0.02)]"
                    }`}
                  >
                    <div className="text-[9px] uppercase tracking-[2px] text-[#C9A84C]">
                      Chapter {chapter.chapter_number}
                    </div>
                    <div className="font-bold text-sm">{chapter.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {activeChapter && (
              <div className="bg-[rgba(240,232,213,0.025)] border border-[rgba(199,125,255,0.16)] p-6">
                <div className="flex justify-between gap-4 mb-5">
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Chapter Editor
                  </h2>
                  <button onClick={deleteChapter} className="text-[#E63946]">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>Number</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={activeChapter.chapter_number}
                      onChange={(e) => setActiveChapter({ ...activeChapter, chapter_number: Number(e.target.value) })}
                    />
                  </div>
                  <label className="flex items-end gap-2 pb-3 text-sm">
                    <input
                      type="checkbox"
                      checked={activeChapter.is_published}
                      onChange={(e) => setActiveChapter({ ...activeChapter, is_published: e.target.checked })}
                    />
                    Published
                  </label>
                </div>
                <div className="mb-4">
                  <label className={labelClass}>Chapter Title</label>
                  <input className={inputClass} value={activeChapter.title} onChange={(e) => setActiveChapter({ ...activeChapter, title: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Content</label>
                  <textarea
                    className={`${inputClass} min-h-[520px] leading-7`}
                    value={activeChapter.content}
                    onChange={(e) => setActiveChapter({ ...activeChapter, content: e.target.value })}
                  />
                </div>
                <button onClick={saveChapter} className="mt-5 w-full bg-[#C9A84C] text-[#0B1828] py-3 text-[10px] uppercase tracking-[2px] font-bold flex items-center justify-center gap-2">
                  <Save size={14} /> Save Chapter
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AuthorBookDetail;

