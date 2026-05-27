import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Coins, Highlighter, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { fetchChapterReader, submitContribution } from "@/lib/koreads";
import { KoreadsBook, KoreadsChapter, KoreadsTask, TASK_CATEGORY_LABELS } from "@/types/koreads";

interface SelectionState {
  text: string;
  start: number | null;
  end: number | null;
}

const KoreadsReader = () => {
  const { bookId, chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<KoreadsBook | null>(null);
  const [chapter, setChapter] = useState<KoreadsChapter | null>(null);
  const [chapters, setChapters] = useState<KoreadsChapter[]>([]);
  const [openTasks, setOpenTasks] = useState<KoreadsTask[]>([]);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!bookId || !chapterId) return;
    const load = async () => {
      const { book: nextBook, chapter: nextChapter, chapters: nextChapters, openTasks: tasks } =
        await fetchChapterReader(bookId, chapterId);
      setBook(nextBook);
      setChapter(nextChapter);
      setChapters(nextChapters);
      setOpenTasks(tasks ?? []);
      setSelection(null);
      setComment("");
    };
    load();
  }, [bookId, chapterId]);

  const inlineOpen = chapter?.is_open_for_inline_contribution !== false;

  const captureSelection = () => {
    if (!inlineOpen) return;
    const currentSelection = window.getSelection();
    const text = currentSelection?.toString().trim();
    if (!text || !chapter || !contentRef.current) return;

    const content = chapter.content;
    const start = content.indexOf(text);
    setSelection({
      text,
      start: start >= 0 ? start : null,
      end: start >= 0 ? start + text.length : null,
    });
  };

  const handleSubmit = async () => {
    if (!selection || !chapter || !book) return;
    if (!user) {
      toast.error("Please sign in to contribute to KO Reads.");
      navigate("/auth");
      return;
    }
    if (!comment.trim()) {
      toast.error("Add your contribution before submitting.");
      return;
    }

    setSubmitting(true);
    const { error } = await submitContribution({
      book_id: book.id,
      chapter_id: chapter.id,
      user_id: user.id,
      selected_text: selection.text,
      selection_start: selection.start,
      selection_end: selection.end,
      comment: comment.trim(),
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Contribution submitted to the author.");
    setSelection(null);
    setComment("");
    window.getSelection()?.removeAllRanges();
  };

  if (!book || !chapter) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#C77DFF] flex items-center justify-center uppercase tracking-[4px] text-xs">
        Loading chapter...
      </div>
    );
  }

  const currentIndex = chapters.findIndex((item) => item.id === chapter.id);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5]">
      <Navbar />
      <main className="pt-[72px]">
        <div className="container mx-auto px-6 lg:px-12 py-10">
          <button
            type="button"
            onClick={() => navigate(`/koreads/books/${book.id}`)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] hover:text-[#F0E8D5] mb-8"
          >
            <ArrowLeft size={14} /> Back to book
          </button>

          <div className="grid lg:grid-cols-[0.72fr_0.28fr] gap-10 items-start">
            <article className="bg-[#F0E8D5] text-[#182334] p-6 sm:p-10 lg:p-14 shadow-2xl">
              <div className="text-[10px] uppercase tracking-[3px] text-[#7A6B45] mb-4">
                {book.title} · Chapter {chapter.chapter_number}
              </div>
              <h1
                className="text-3xl md:text-5xl font-extrabold leading-tight mb-10 text-[#0B1828]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {chapter.title}
              </h1>

              <div
                ref={contentRef}
                onMouseUp={inlineOpen ? captureSelection : undefined}
                onTouchEnd={inlineOpen ? captureSelection : undefined}
                className={`prose prose-lg max-w-none leading-8 whitespace-pre-wrap ${inlineOpen ? "select-text" : "select-none"}`}
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px" }}
              >
                {chapter.content}
              </div>
            </article>

            <aside className="sticky top-24 space-y-5">
              {openTasks.length > 0 && (
                <div className="bg-[rgba(240,232,213,0.025)] border border-[rgba(201,168,76,0.12)] p-5">
                  <div className="flex items-center gap-2 text-[#C9A84C] mb-3">
                    <Coins size={16} />
                    <span className="text-[10px] uppercase tracking-[2px] font-bold">Open bounties</span>
                  </div>
                  <div className="space-y-2">
                    {openTasks.map((task) => (
                      <Link
                        key={task.id}
                        to={`/koreads/books/${book.id}/tasks/${task.id}`}
                        className="block text-sm hover:text-[#C9A84C] transition-colors"
                      >
                        {TASK_CATEGORY_LABELS[task.task_category]}: {task.title}
                      </Link>
                    ))}
                  </div>
                  <Link
                    to={`/koreads/books/${book.id}`}
                    className="mt-3 inline-block text-[10px] uppercase tracking-[2px] text-[#C77DFF]"
                  >
                    All bounties on this book
                  </Link>
                </div>
              )}

              <div className="bg-[rgba(240,232,213,0.035)] border border-[rgba(199,125,255,0.18)] p-5">
                <div className="flex items-center gap-2 text-[#C77DFF] mb-3">
                  <Highlighter size={18} />
                  <h2 className="text-[11px] uppercase tracking-[2px] font-bold">Contribute</h2>
                </div>
                <p className="text-sm text-[rgba(240,232,213,0.56)] leading-relaxed">
                  {inlineOpen
                    ? "Highlight a sentence or paragraph in the chapter. Add a useful note, question, correction, or example for the author."
                    : "Inline contributions are closed for this chapter. Check open bounties on the book hub."}
                </p>
              </div>

              {selection && inlineOpen && (
                <div className="bg-[#060D16] border border-[#C77DFF]/40 p-5">
                  <div className="text-[10px] uppercase tracking-[2px] text-[#C77DFF] mb-3">
                    Selected text
                  </div>
                  <blockquote className="text-sm text-[rgba(240,232,213,0.72)] border-l-2 border-[#C77DFF] pl-3 mb-4 leading-relaxed">
                    {selection.text}
                  </blockquote>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What should the author consider here?"
                    className="w-full min-h-[120px] bg-[rgba(240,232,213,0.04)] border border-[rgba(240,232,213,0.1)] p-3 text-sm outline-none focus:border-[#C77DFF]"
                  />
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="mt-3 w-full bg-[#C77DFF] text-[#0B1828] py-3 text-[10px] uppercase tracking-[2px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send size={14} /> Submit Contribution
                  </button>
                </div>
              )}

              <div className="bg-[rgba(240,232,213,0.025)] border border-white/5 p-5">
                <div className="flex items-center gap-2 mb-4 text-[rgba(240,232,213,0.45)]">
                  <BookOpen size={16} />
                  <span className="text-[10px] uppercase tracking-[2px]">Chapter navigation</span>
                </div>
                <div className="space-y-2">
                  {prevChapter && (
                    <Link
                      to={`/koreads/books/${book.id}/chapters/${prevChapter.id}`}
                      className="block text-sm text-[#C9A84C] hover:underline"
                    >
                      Previous: {prevChapter.title}
                    </Link>
                  )}
                  {nextChapter && (
                    <Link
                      to={`/koreads/books/${book.id}/chapters/${nextChapter.id}`}
                      className="block text-sm text-[#C9A84C] hover:underline"
                    >
                      Next: {nextChapter.title}
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[rgba(240,232,213,0.38)]">
                <MessageSquare size={14} /> Contributions appear as pending in your profile,
                author dashboard, and admin panel.
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KoreadsReader;

