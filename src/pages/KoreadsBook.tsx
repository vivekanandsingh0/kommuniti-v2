import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Coins, Heart, MessageSquare, Users } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  fetchBookHub,
  isFollowingBook,
  toggleBookFollow,
} from "@/lib/koreads";
import {
  ContributorCredit,
  KoreadsBook as KoreadsBookType,
  KoreadsChapter,
  KoreadsTask,
  TASK_CATEGORY_LABELS,
} from "@/types/koreads";

const KoreadsBook = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<KoreadsBookType | null>(null);
  const [chapters, setChapters] = useState<KoreadsChapter[]>([]);
  const [tasks, setTasks] = useState<KoreadsTask[]>([]);
  const [credits, setCredits] = useState<ContributorCredit[]>([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!bookId) return;
    setLoading(true);
    const hub = await fetchBookHub(bookId);
    setBook(hub.book);
    setChapters(hub.chapters);
    setTasks(hub.tasks);
    setCredits(hub.credits);
    if (user) {
      setFollowing(await isFollowingBook(bookId, user.id));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [bookId, user?.id]);

  const handleFollow = async () => {
    if (!user) {
      navigate(`/auth?redirect=/koreads/books/${bookId}`);
      return;
    }
    if (!bookId) return;
    const { error } = await toggleBookFollow(bookId, user.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setFollowing(!following);
    toast.success(following ? "Unfollowed book" : "Following this book");
    await load();
  };

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
  const contributorCount = credits.length;

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
                  {book.genre || "KO Reads Draft"} · Unreleased
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
                Book workspace
              </div>
              <h2
                className="text-4xl md:text-6xl font-extrabold leading-[0.94] tracking-[-0.04em] mb-5"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {book.title}
              </h2>
              {book.subtitle && <p className="text-xl text-[#C9A84C] mb-5">{book.subtitle}</p>}
              {book.tagline && (
                <p className="text-lg text-[rgba(240,232,213,0.7)] mb-5 italic">{book.tagline}</p>
              )}
              <p className="text-[rgba(240,232,213,0.62)] leading-relaxed max-w-2xl mb-6">
                {book.description || "A KO Reads public draft open for thoughtful contribution."}
              </p>

              <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-6">
                <span className="flex items-center gap-1">
                  <Users size={14} /> {book.follower_count ?? 0} followers
                </span>
                <span>{contributorCount} contributors</span>
                <span>{tasks.length} open bounties</span>
              </div>

              <div className="bg-[rgba(240,232,213,0.03)] border border-[rgba(199,125,255,0.16)] p-5 mb-8">
                <div className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.38)] mb-2">
                  Author
                </div>
                <div className="font-bold text-lg">{book.author?.pen_name || book.author?.name}</div>
                {book.author?.bio && (
                  <p className="text-sm text-[rgba(240,232,213,0.5)] mt-2 leading-relaxed">{book.author.bio}</p>
                )}
              </div>

              {book.tags && book.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {book.tags.map((tag) => (
                    <span key={tag} className="text-[9px] uppercase tracking-[1.5px] border border-white/10 px-2 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 mb-4">
                {firstChapter && (
                  <Link
                    to={`/koreads/books/${book.id}/chapters/${firstChapter.id}`}
                    className="bg-[#C77DFF] text-[#0B1828] px-6 py-3 text-[11px] uppercase tracking-[2px] font-bold flex items-center gap-2"
                  >
                    Start reading <ArrowRight size={14} />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleFollow}
                  className={`border px-6 py-3 text-[11px] uppercase tracking-[2px] font-bold flex items-center gap-2 ${
                    following
                      ? "border-[#C77DFF] text-[#C77DFF] bg-[#C77DFF]/10"
                      : "border-white/20 text-[#F0E8D5] hover:border-[#C77DFF]/50"
                  }`}
                >
                  <Heart size={14} fill={following ? "currentColor" : "none"} />
                  {following ? "Following" : "Follow this book"}
                </button>
                {book.is_open_for_contribution && (
                  <span className="border border-[#6BBFB5]/30 text-[#6BBFB5] px-4 py-3 text-[10px] uppercase tracking-[2px]">
                    Open for shaping
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {tasks.length > 0 && (
          <section className="bg-[#060D16] border-y border-[rgba(199,125,255,0.12)]">
            <div className="container mx-auto px-6 lg:px-12 py-14">
              <div className="flex items-center gap-3 mb-8">
                <Coins size={18} className="text-[#C9A84C]" />
                <h3 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.45)]">
                  Open bounties
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {tasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/koreads/books/${book.id}/tasks/${task.id}`}
                    className="group bg-[rgba(240,232,213,0.025)] border border-[rgba(201,168,76,0.12)] hover:border-[#C9A84C]/50 p-5 transition-all"
                  >
                    <div className="flex justify-between gap-2 mb-2">
                      <span className="text-[9px] uppercase tracking-[2px] text-[#C77DFF]">
                        {TASK_CATEGORY_LABELS[task.task_category]}
                      </span>
                      <span className="text-[9px] uppercase tracking-[2px] text-[#C9A84C]">
                        {task.reward_ko_coins} KO Coins
                      </span>
                    </div>
                    <div className="font-bold text-lg group-hover:text-[#C9A84C] transition-colors">{task.title}</div>
                    <p className="mt-2 text-sm text-[rgba(240,232,213,0.5)] line-clamp-2">{task.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="container mx-auto px-6 lg:px-12 py-14">
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
                <div className="font-bold text-xl group-hover:text-[#C77DFF] transition-colors">{chapter.title}</div>
                <div className="mt-4 flex items-center gap-2 text-xs text-[rgba(240,232,213,0.4)]">
                  <MessageSquare size={14} />
                  {chapter.is_open_for_inline_contribution !== false
                    ? "Highlight text to contribute"
                    : "Reading only"}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {credits.length > 0 && (
          <section className="bg-[#060D16] border-t border-[rgba(199,125,255,0.12)]">
            <div className="container mx-auto px-6 lg:px-12 py-14">
              <h3 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.45)] mb-8">
                People who shaped this book
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {credits.map((credit) => (
                  <div
                    key={credit.user_id}
                    className={`p-4 border ${
                      credit.is_pinned
                        ? "border-[#C9A84C]/40 bg-[#C9A84C]/5"
                        : "border-white/5 bg-[rgba(240,232,213,0.02)]"
                    }`}
                  >
                    <div className="font-bold">{credit.display_name}</div>
                    <div className="text-[10px] uppercase tracking-[2px] text-[#C77DFF] mt-1">
                      {credit.credit_label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default KoreadsBook;
