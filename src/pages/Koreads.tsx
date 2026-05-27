import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Coins, Highlighter, Sparkles, Trophy, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchOpenTasks, fetchPublishedBooks, fetchSpotlightAuthors } from "@/lib/koreads";
import { KoreadsAuthor, KoreadsBook, KoreadsTask, TASK_CATEGORY_LABELS } from "@/types/koreads";
import { useAuth } from "@/context/AuthContext";

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="h-px w-8 bg-[#C77DFF]" />
    <span className="text-[10px] uppercase tracking-[3px] text-[#C77DFF] font-bold">
      {children}
    </span>
  </div>
);

const BookCard = ({ book, compact = false }: { book: KoreadsBook; compact?: boolean }) => (
  <Link
    to={`/koreads/books/${book.id}`}
    className={`group block bg-[rgba(240,232,213,0.025)] border border-[rgba(199,125,255,0.14)] hover:border-[#C77DFF]/60 transition-all ${
      compact ? "p-4" : "p-5"
    }`}
  >
    <div className="flex gap-4">
      <div
        className={`${compact ? "w-14 h-20" : "w-20 h-28"} shrink-0 border border-white/10 shadow-xl relative overflow-hidden`}
        style={{
          background: `linear-gradient(145deg, ${book.cover_color}, #0B1828 82%)`,
        }}
      >
        <div className="absolute inset-y-0 left-3 w-px bg-white/15" />
        <div className="absolute bottom-3 left-3 right-3 text-[7px] uppercase tracking-[1.5px] text-white/60">
          Draft
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] uppercase tracking-[2px] text-[#C9A84C]">
            {book.genre || "KO Reads"}
          </span>
          {book.is_open_for_contribution && (
            <span className="text-[8px] uppercase tracking-[1.5px] text-[#6BBFB5] border border-[#6BBFB5]/30 px-1.5 py-0.5">
              Open
            </span>
          )}
        </div>
        <h3
          className={`${compact ? "text-base" : "text-xl"} text-[#F0E8D5] font-bold leading-tight group-hover:text-[#C77DFF] transition-colors`}
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {book.title}
        </h3>
        {book.tagline && !compact && (
          <p className="mt-2 text-sm text-[rgba(240,232,213,0.52)] leading-relaxed">
            {book.tagline}
          </p>
        )}
        <p className="mt-3 text-xs text-[rgba(240,232,213,0.38)]">
          By {book.author?.pen_name || book.author?.name || "Kommuniti Author"}
        </p>
      </div>
    </div>
  </Link>
);

const Koreads = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<KoreadsBook[]>([]);
  const [authors, setAuthors] = useState<KoreadsAuthor[]>([]);
  const [openTasks, setOpenTasks] = useState<KoreadsTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [booksRes, authorsRes, tasksRes] = await Promise.all([
        fetchPublishedBooks(),
        fetchSpotlightAuthors(),
        fetchOpenTasks(12),
      ]);
      setBooks(booksRes.books);
      setAuthors(authorsRes.authors);
      setOpenTasks(tasksRes.tasks);
      setLoading(false);
    };
    load();
  }, []);

  const featuredBooks = useMemo(
    () => books.filter((book) => book.is_featured || book.is_spotlight).slice(0, 4),
    [books]
  );
  const newBooks = useMemo(() => books.filter((book) => book.is_new).slice(0, 5), [books]);
  const openBooks = useMemo(
    () => books.filter((book) => book.is_open_for_contribution).slice(0, 4),
    [books]
  );
  const booksSeekingContributors = useMemo(() => {
    const bookIdsWithTasks = new Set(openTasks.map((t) => t.book_id));
    return books
      .filter((b) => b.is_open_for_contribution || bookIdsWithTasks.has(b.id))
      .slice(0, 6);
  }, [books, openTasks]);
  const heroBook = featuredBooks[0] || books[0];

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5]">
      <Navbar />
      <main className="pt-[72px]">
        <section className="relative overflow-hidden border-b border-[rgba(199,125,255,0.16)]">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(199,125,255,0.18), transparent 28%), radial-gradient(circle at 70% 10%, rgba(201,168,76,0.12), transparent 24%)",
            }}
          />
          <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-24 relative">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-[10px] uppercase tracking-[4px] text-[#C77DFF] mb-5">
                  KO Reads · Public drafts · Living margins
                </div>
                <h1
                  className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[0.92] tracking-[-0.05em] mb-7"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Read unreleased ideas.
                  <br />
                  <span className="text-[#C77DFF]">Shape the final book.</span>
                </h1>
                <p className="max-w-2xl text-lg text-[rgba(240,232,213,0.62)] leading-relaxed mb-8">
                  A quiet public domain for Kommuniti authors to share drafts, and for curious
                  readers to leave useful comments in the margins. Valuable contributions can be
                  recognized, accepted, and rewarded with KO Coins.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="#open-bounties"
                    className="bg-[#C77DFF] text-[#0B1828] px-6 py-3 text-[11px] uppercase tracking-[2px] font-bold hover:brightness-110 transition-all"
                  >
                    See Open Bounties
                  </a>
                  <a
                    href="#featured-books"
                    className="border border-[rgba(199,125,255,0.3)] text-[#C77DFF] px-6 py-3 text-[11px] uppercase tracking-[2px] font-bold hover:bg-[#C77DFF]/10 transition-all"
                  >
                    Explore Books
                  </a>
                  <Link
                    to={user ? "/profile" : "/auth"}
                    className="border border-[rgba(201,168,76,0.3)] text-[#C9A84C] px-6 py-3 text-[11px] uppercase tracking-[2px] font-bold hover:bg-[#C9A84C]/10 transition-all"
                  >
                    Track Contributions
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="bg-[rgba(240,232,213,0.035)] border border-[rgba(199,125,255,0.18)] p-6 lg:p-8"
              >
                <div className="text-[10px] uppercase tracking-[3px] text-[rgba(240,232,213,0.4)] mb-5">
                  Featured Manuscript
                </div>
                {heroBook ? (
                  <BookCard book={heroBook} />
                ) : (
                  <div className="border border-dashed border-[rgba(240,232,213,0.14)] p-8 text-[rgba(240,232,213,0.45)]">
                    Publish your first KO Reads book from the admin panel to feature it here.
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3 mt-5 text-center">
                  {[
                    ["Drafts", books.length],
                    ["Authors", authors.length],
                    ["Open", openBooks.length],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-[#0B1828]/60 border border-white/5 p-3">
                      <div className="text-xl font-bold text-[#F0E8D5]">{value}</div>
                      <div className="text-[8px] uppercase tracking-[2px] text-[rgba(240,232,213,0.35)]">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="open-bounties" className="bg-[#060D16] border-y border-[rgba(199,125,255,0.12)]">
          <div className="container mx-auto px-6 lg:px-12 py-16">
            <SectionLabel>Open Bounties</SectionLabel>
            <p className="text-[rgba(240,232,213,0.58)] max-w-2xl mb-8 leading-relaxed">
              Earn KO Coins by helping shape unreleased books — titles, taglines, research, dialogue, and more.
            </p>
            {loading ? (
              <div className="text-[rgba(240,232,213,0.35)] uppercase tracking-[3px] text-xs">Loading bounties...</div>
            ) : openTasks.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {openTasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/koreads/books/${task.book_id}/tasks/${task.id}`}
                    className="group bg-[rgba(240,232,213,0.025)] border border-[rgba(201,168,76,0.12)] hover:border-[#C9A84C]/50 p-5 transition-all"
                  >
                    <div className="flex justify-between gap-2 mb-2">
                      <span className="text-[9px] uppercase tracking-[2px] text-[#C77DFF]">
                        {TASK_CATEGORY_LABELS[task.task_category]}
                      </span>
                      <span className="text-[9px] uppercase tracking-[2px] text-[#C9A84C] flex items-center gap-1">
                        <Coins size={12} /> {task.reward_ko_coins}
                      </span>
                    </div>
                    <div className="font-bold text-lg group-hover:text-[#C9A84C]">{task.title}</div>
                    <p className="text-xs text-[rgba(240,232,213,0.45)] mt-2">
                      {task.book?.title} · {task.book?.author?.pen_name || task.book?.author?.name}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-[rgba(201,168,76,0.2)] p-8 text-[rgba(240,232,213,0.45)]">
                Open bounties will appear when authors post tasks inside their books.
              </div>
            )}
          </div>
        </section>

        <section className="container mx-auto px-6 lg:px-12 py-16">
          <SectionLabel>Books Seeking Contributors</SectionLabel>
          {booksSeekingContributors.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-5">
              {booksSeekingContributors.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[rgba(199,125,255,0.2)] p-8 text-[rgba(240,232,213,0.45)]">
              No books open for contribution yet.
            </div>
          )}
        </section>

        <section id="featured-books" className="container mx-auto px-6 lg:px-12 py-16">
          <SectionLabel>Featured Books</SectionLabel>
          {loading ? (
            <div className="text-[rgba(240,232,213,0.35)] uppercase tracking-[3px] text-xs">
              Loading KO Reads...
            </div>
          ) : featuredBooks.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-5">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[rgba(199,125,255,0.2)] p-8 text-[rgba(240,232,213,0.45)]">
              No featured books yet. Admins can mark books as featured in KO Reads CMS.
            </div>
          )}
        </section>

        <section className="container mx-auto px-6 lg:px-12 pb-16">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8">
            <div>
              <SectionLabel>Authors Spotlight</SectionLabel>
              <div className="space-y-4">
                {(authors.length ? authors : []).map((author) => (
                  <div
                    key={author.id}
                    className="bg-[rgba(240,232,213,0.025)] border border-[rgba(201,168,76,0.12)] p-5"
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#C77DFF]/20 border border-[#C77DFF]/30 flex items-center justify-center font-bold">
                        {(author.pen_name || author.name).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#F0E8D5]">{author.pen_name || author.name}</h3>
                        <p className="text-sm text-[rgba(240,232,213,0.5)] mt-1 leading-relaxed">
                          {author.spotlight_quote || author.bio || "Writing inside KO Reads."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {!authors.length && (
                  <div className="border border-dashed border-[rgba(201,168,76,0.16)] p-6 text-sm text-[rgba(240,232,213,0.42)]">
                    Spotlight authors will appear once admins create and feature them.
                  </div>
                )}
              </div>
            </div>

            <div>
              <SectionLabel>Newly Added Books</SectionLabel>
              <div className="space-y-3">
                {(newBooks.length ? newBooks : books.slice(0, 5)).map((book) => (
                  <BookCard key={book.id} book={book} compact />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#060D16] border-y border-[rgba(199,125,255,0.12)]">
          <div className="container mx-auto px-6 lg:px-12 py-16">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-start">
              <div>
                <SectionLabel>Open For Contribution</SectionLabel>
                <h2
                  className="text-3xl md:text-4xl font-extrabold leading-tight mb-4"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Leave the kind of note an author remembers.
                </h2>
                <p className="text-[rgba(240,232,213,0.58)] leading-relaxed">
                  The best contributions are precise: a missing example, a sharper question, a
                  source, a contradiction, or a lived detail that makes the book more truthful.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {openBooks.map((book) => (
                  <BookCard key={book.id} book={book} compact />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 lg:px-12 py-16">
          <SectionLabel>How It Works</SectionLabel>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              [BookOpen, "Read", "Open a draft and follow the author’s chapter flow."],
              [Highlighter, "Contribute", "Highlight chapter text or complete a bounty task inside a book."],
              [Trophy, "Get Recognized", "Authors accept work, pin credits on the book hub, and reward KO Coins."],
            ].map(([Icon, title, copy]) => (
              <div key={title as string} className="bg-[rgba(240,232,213,0.025)] border border-white/5 p-6">
                <Icon className="text-[#C77DFF] mb-5" size={24} />
                <h3 className="font-bold text-lg mb-2">{title as string}</h3>
                <p className="text-sm text-[rgba(240,232,213,0.5)] leading-relaxed">{copy as string}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 lg:px-12 pb-20">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              [Sparkles, "Curiosity first", "Designed for discovery, not homework."],
              [Users, "Author-led", "Authors keep ownership of voice and decisions."],
              [Trophy, "Rewarded value", "Useful contributions can earn recognition and KO Coins."],
            ].map(([Icon, title, copy]) => (
              <div key={title as string} className="border border-[rgba(201,168,76,0.1)] p-5">
                <Icon size={18} className="text-[#C9A84C] mb-3" />
                <div className="font-bold mb-1">{title as string}</div>
                <p className="text-xs text-[rgba(240,232,213,0.45)]">{copy as string}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Koreads;

