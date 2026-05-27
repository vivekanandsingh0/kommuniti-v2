import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle2, Coins, MessageSquare, Plus, RefreshCcw, Star } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { createAuthorBook, fetchAuthorForUser, fetchAuthorWorkspace, updateContributionResponse } from "@/lib/koreads";
import { KoreadsAuthor, KoreadsBook, KoreadsContribution, KoreadsContributionStatus } from "@/types/koreads";

const AuthorDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [author, setAuthor] = useState<KoreadsAuthor | null>(null);
  const [books, setBooks] = useState<KoreadsBook[]>([]);
  const [contributions, setContributions] = useState<KoreadsContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeContribution, setActiveContribution] = useState<KoreadsContribution | null>(null);
  const [authorResponse, setAuthorResponse] = useState("");
  const [rewardAmount, setRewardAmount] = useState(25);
  const [showCreateBook, setShowCreateBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { author: nextAuthor } = await fetchAuthorForUser(user.id);
    setAuthor(nextAuthor);
    if (nextAuthor) {
      const workspace = await fetchAuthorWorkspace(nextAuthor.id);
      setBooks(workspace.books);
      setContributions(workspace.contributions);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (user) load();
  }, [user, authLoading]);

  const handleCreateBook = async () => {
    if (!author || !newBookTitle.trim()) {
      toast.error("Book title is required");
      return;
    }
    const { data, error } = await createAuthorBook(author.id, { title: newBookTitle.trim() });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Book created");
    setShowCreateBook(false);
    setNewBookTitle("");
    navigate(`/author/books/${data.id}`);
  };

  const respond = async (status: KoreadsContributionStatus) => {
    if (!activeContribution) return;
    const reward = status === "valuable" ? Math.max(0, rewardAmount || 0) : 0;
    const { error } = await updateContributionResponse({
      contributionId: activeContribution.id,
      status,
      authorResponse: authorResponse || null,
      rewardAmount: reward,
      actorUserId: user?.id ?? null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Contribution updated");
    setActiveContribution(null);
    setAuthorResponse("");
    await load();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#C77DFF] flex items-center justify-center uppercase tracking-[4px] text-xs">
        Loading author workspace...
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5]">
        <Navbar />
        <main className="pt-[72px] container mx-auto px-6 lg:px-12 py-16">
          <div className="max-w-xl border border-[rgba(201,168,76,0.16)] bg-[rgba(240,232,213,0.03)] p-8">
            <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
              Author access required
            </h1>
            <p className="text-[rgba(240,232,213,0.55)] leading-relaxed">
              Your account is not linked to a KO Reads author profile yet. An admin can create an
              author record and assign books to you from the KO Reads admin panel.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const pendingCount = contributions.filter((item) => item.status === "pending").length;
  const valuableCount = contributions.filter((item) => item.status === "valuable").length;

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5]">
      <Navbar />
      <main className="pt-[72px] container mx-auto px-6 lg:px-12 py-12">
        <header className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <div>
            <div className="text-[10px] uppercase tracking-[3px] text-[#C77DFF] mb-3">
              KO Reads Author Desk
            </div>
            <h1 className="text-4xl font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>
              {author.pen_name || author.name}
            </h1>
            <p className="text-[rgba(240,232,213,0.5)] mt-2 max-w-2xl">{author.bio}</p>
          </div>
          <button
            type="button"
            onClick={load}
            className="h-fit flex items-center gap-2 border border-[rgba(199,125,255,0.25)] text-[#C77DFF] px-4 py-2 text-[10px] uppercase tracking-[2px]"
          >
            <RefreshCcw size={14} /> Refresh
          </button>
        </header>

        <div className="grid md:grid-cols-4 gap-4 mb-10">
          {[
            [BookOpen, "Books", books.length],
            [MessageSquare, "Pending", pendingCount],
            [Star, "Valuable", valuableCount],
            [Coins, "Rewarded", contributions.reduce((sum, item) => sum + item.ko_coins_rewarded, 0)],
          ].map(([Icon, label, value]) => (
            <div key={label as string} className="bg-[rgba(240,232,213,0.03)] border border-white/5 p-5">
              <Icon className="text-[#C77DFF] mb-3" size={20} />
              <div className="text-2xl font-bold">{value as number}</div>
              <div className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.35)]">
                {label as string}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[0.42fr_0.58fr] gap-8">
          <section>
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.45)]">
                Your Books
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateBook(true)}
                className="flex items-center gap-1 border border-[#C77DFF]/40 text-[#C77DFF] px-3 py-2 text-[10px] uppercase tracking-[2px]"
              >
                <Plus size={14} /> New book
              </button>
            </div>
            <div className="space-y-3">
              {books.map((book) => (
                <Link
                  key={book.id}
                  to={`/author/books/${book.id}`}
                  className="block bg-[rgba(240,232,213,0.025)] border border-[rgba(201,168,76,0.1)] hover:border-[#C77DFF]/50 p-4"
                >
                  <div className="flex gap-4">
                    <div className="w-3 shrink-0" style={{ background: book.cover_color }} />
                    <div>
                      <div className="font-bold">{book.title}</div>
                      <div className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.35)] mt-1">
                        {book.status} · {book.is_open_for_contribution ? "open" : "closed"}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.45)] mb-5">
              Contribution Queue
            </h2>
            <div className="space-y-4">
              {contributions.map((item) => (
                <div
                  key={item.id}
                  className="bg-[rgba(240,232,213,0.025)] border border-[rgba(199,125,255,0.14)] p-5"
                >
                  <div className="flex justify-between gap-4 mb-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[2px] text-[#C9A84C]">
                        {item.book?.title} · Chapter {item.chapter?.chapter_number}
                      </div>
                      <div className="font-bold mt-1">{item.chapter?.title}</div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[2px] text-[#C77DFF]">
                      {item.status}
                    </span>
                  </div>
                  <blockquote className="border-l-2 border-[#C77DFF] pl-3 text-sm text-[rgba(240,232,213,0.65)] mb-3">
                    {item.selected_text}
                  </blockquote>
                  <p className="text-sm text-[rgba(240,232,213,0.56)] mb-4">{item.comment}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveContribution(item);
                      setAuthorResponse(item.author_response || "");
                      setRewardAmount(item.ko_coins_rewarded || 25);
                    }}
                    className="text-[10px] uppercase tracking-[2px] text-[#C77DFF] hover:underline"
                  >
                    Respond / reward
                  </button>
                </div>
              ))}
              {contributions.length === 0 && (
                <div className="border border-dashed border-[rgba(199,125,255,0.2)] p-8 text-[rgba(240,232,213,0.45)]">
                  No contributions yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {showCreateBook && (
        <div className="fixed inset-0 bg-black/70 z-[120] flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#0B1828] border border-[#C77DFF]/40 p-6">
            <h3 className="text-xl font-bold mb-4">Create new book</h3>
            <input
              value={newBookTitle}
              onChange={(e) => setNewBookTitle(e.target.value)}
              placeholder="Book title"
              className="w-full bg-[rgba(240,232,213,0.04)] border border-white/10 p-3 mb-4 outline-none focus:border-[#C77DFF]"
            />
            <div className="flex gap-2">
              <button onClick={handleCreateBook} className="flex-1 bg-[#C77DFF] text-[#0B1828] py-3 text-[10px] uppercase font-bold">
                Create
              </button>
              <button onClick={() => setShowCreateBook(false)} className="flex-1 border border-white/10 py-3 text-[10px] uppercase">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {activeContribution && (
        <div className="fixed inset-0 bg-black/70 z-[120] flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-[#0B1828] border border-[#C77DFF]/40 p-6">
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
              Respond to contribution
            </h3>
            <textarea
              value={authorResponse}
              onChange={(e) => setAuthorResponse(e.target.value)}
              placeholder="Write a response to the contributor..."
              className="w-full min-h-[120px] bg-[rgba(240,232,213,0.04)] border border-white/10 p-3 outline-none focus:border-[#C77DFF] mb-4"
            />
            <label className="block text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-2">
              KO Coins if marked valuable
            </label>
            <input
              type="number"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(Number(e.target.value))}
              className="w-full bg-[rgba(240,232,213,0.04)] border border-white/10 p-3 outline-none focus:border-[#C77DFF] mb-5"
            />
            <div className="grid sm:grid-cols-4 gap-2">
              <button onClick={() => respond("accepted")} className="bg-[#6BBFB5] text-[#0B1828] py-3 text-[10px] uppercase tracking-[2px] font-bold">
                Accept
              </button>
              <button onClick={() => respond("valuable")} className="bg-[#C9A84C] text-[#0B1828] py-3 text-[10px] uppercase tracking-[2px] font-bold">
                Valuable
              </button>
              <button onClick={() => respond("rejected")} className="bg-[#E63946] text-white py-3 text-[10px] uppercase tracking-[2px] font-bold">
                Reject
              </button>
              <button onClick={() => setActiveContribution(null)} className="border border-white/10 py-3 text-[10px] uppercase tracking-[2px]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorDashboard;

