import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchBookWithChapters } from "@/lib/koreads";
import { KoreadsBook as KoreadsBookType, KoreadsChapter } from "@/types/koreads";

const KoreadsBook = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<KoreadsBookType | null>(null);
  const [chapters, setChapters] = useState<KoreadsChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookId) return;
    const load = async () => {
      setLoading(true);
      const { book: nextBook, chapters: nextChapters } = await fetchBookWithChapters(bookId);
      setBook(nextBook);
      setChapters(nextChapters);
      setLoading(false);
    };
    load();
  }, [bookId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#C77DFF] flex items-center justify-center uppercase tracking-[4px] text-xs">
        Opening manuscript...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-6 text-[rgba(240,232,213,0.55)]">This book is not published yet.</p>
          <button onClick={() => navigate("/koreads")} className="text-[#C77DFF] uppercase tracking-widest text-xs">
            Back to KO Reads
          </button>
        </div>
      </div>
    );
  }

  const firstChapter = chapters[0];

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5]">
      <Navbar />
      <main className="pt-[72px]">
        <section className="container mx-auto px-6 lg:px-12 py-12 lg:py-16">
          <button
            type="button"
            onClick={() => navigate("/koreads")}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] hover:text-[#F0E8D5] mb-10"
          >
            <ArrowLeft size={14} /> KO Reads Library
          </button>

          <div className="grid lg:grid-cols-[0.42fr_0.58fr] gap-12 items-start">
            <div
              className="min-h-[480px] border border-white/10 shadow-2xl relative overflow-hidden p-8 flex flex-col justify-end"
              style={{
                background: `linear-gradient(145deg, ${book.cover_color}, #060D16 78%)`,
              }}
            >
              <div className="absolute inset-y-0 left-10 w-px bg-white/15" />
              <div className="relative">
                <div className="text-[10px] uppercase tracking-[3px] text-white/50 mb-5">
                  {book.genre || "KO Reads Draft"}
                </div>
                <h1
                  className="text-4xl md:text-5xl font-extrabold leading-none"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {book.title}
                </h1>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[3px] text-[#C77DFF] mb-4">
                Public manuscript
              </div>
              <h2
                className="text-4xl md:text-6xl font-extrabold leading-[0.94] tracking-[-0.04em] mb-5"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {book.title}
              </h2>
              {book.subtitle && <p className="text-xl text-[#C9A84C] mb-5">{book.subtitle}</p>}
              <p className="text-[rgba(240,232,213,0.62)] leading-relaxed max-w-2xl mb-7">
                {book.description || book.tagline || "A KO Reads public draft open for thoughtful contribution."}
              </p>

              <div className="bg-[rgba(240,232,213,0.03)] border border-[rgba(199,125,255,0.16)] p-5 mb-8">
                <div className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.38)] mb-2">
                  Author
                </div>
                <div className="font-bold text-lg">{book.author?.pen_name || book.author?.name}</div>
                {book.author?.bio && (
                  <p className="text-sm text-[rgba(240,232,213,0.5)] mt-2 leading-relaxed">{book.author.bio}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-10">
                {firstChapter && (
                  <Link
                    to={`/koreads/books/${book.id}/chapters/${firstChapter.id}`}
                    className="bg-[#C77DFF] text-[#0B1828] px-6 py-3 text-[11px] uppercase tracking-[2px] font-bold flex items-center gap-2"
                  >
                    Start Chapter 1 <ArrowRight size={14} />
                  </Link>
                )}
                <span className="border border-[#6BBFB5]/30 text-[#6BBFB5] px-4 py-3 text-[10px] uppercase tracking-[2px]">
                  {book.is_open_for_contribution ? "Open for contribution" : "Reading only"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#060D16] border-y border-[rgba(199,125,255,0.12)]">
          <div className="container mx-auto px-6 lg:px-12 py-14">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen size={18} className="text-[#C77DFF]" />
              <h3 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.45)]">
                Chapters
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  to={`/koreads/books/${book.id}/chapters/${chapter.id}`}
                  className="group bg-[rgba(240,232,213,0.025)] border border-white/5 hover:border-[#C77DFF]/50 p-5 transition-all"
                >
                  <div className="text-[10px] uppercase tracking-[2px] text-[#C9A84C] mb-2">
                    Chapter {chapter.chapter_number}
                  </div>
                  <div className="font-bold text-xl group-hover:text-[#C77DFF] transition-colors">
                    {chapter.title}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-[rgba(240,232,213,0.4)]">
                    <MessageSquare size={14} />
                    Highlight text inside this chapter to contribute
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default KoreadsBook;

