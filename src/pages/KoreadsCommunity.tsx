import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lightbulb, Users, Vote } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { fetchBookWithChapters } from "@/lib/koreads";
import {
  castPollVote,
  fetchBehindStory,
  fetchBookCircles,
  fetchBookPolls,
  fetchBookTheories,
  fetchCirclePosts,
  joinCircle,
  postToCircle,
  submitFanTheory,
  toggleTheoryUpvote,
} from "@/lib/koreads-phase2";
import { KoreadsBehindStory, KoreadsBook, KoreadsFanTheory, KoreadsPoll, KoreadsStoryCircle } from "@/types/koreads";

type Tab = "polls" | "theories" | "circles" | "behind";

const KoreadsCommunity = () => {
  const { bookId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tab = (searchParams.get("tab") as Tab) || "polls";

  const [book, setBook] = useState<KoreadsBook | null>(null);
  const [polls, setPolls] = useState<KoreadsPoll[]>([]);
  const [theories, setTheories] = useState<KoreadsFanTheory[]>([]);
  const [circles, setCircles] = useState<KoreadsStoryCircle[]>([]);
  const [behind, setBehind] = useState<KoreadsBehindStory[]>([]);
  const [activeCircle, setActiveCircle] = useState<KoreadsStoryCircle | null>(null);
  const [circlePosts, setCirclePosts] = useState<{ id: string; body: string; display_name?: string; created_at?: string }[]>([]);
  const [theoryTitle, setTheoryTitle] = useState("");
  const [theoryBody, setTheoryBody] = useState("");
  const [postBody, setPostBody] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!bookId) return;
    setLoading(true);
    const { book: b } = await fetchBookWithChapters(bookId);
    setBook(b);
    const [pollRes, theoryRes, circleRes, behindRes] = await Promise.all([
      fetchBookPolls(bookId, user?.id),
      fetchBookTheories(bookId, user?.id),
      fetchBookCircles(bookId, user?.id),
      fetchBehindStory(bookId),
    ]);
    setPolls(pollRes.polls);
    setTheories(theoryRes.theories);
    setCircles(circleRes.circles);
    setBehind(behindRes.posts);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [bookId, user?.id]);

  useEffect(() => {
    if (activeCircle) {
      fetchCirclePosts(activeCircle.id).then(({ posts }) => setCirclePosts(posts));
    }
  }, [activeCircle?.id]);

  const setTab = (t: Tab) => navigate(`/koreads/books/${bookId}/community?tab=${t}`);

  const vote = async (pollId: string, optionId: string) => {
    if (!user) {
      navigate(`/auth?redirect=/koreads/books/${bookId}/community?tab=polls`);
      return;
    }
    const { error } = await castPollVote(pollId, user.id, optionId);
    if (error) toast.error(error.message);
    else {
      toast.success("Vote recorded");
      await load();
    }
  };

  const submitTheory = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate(`/auth?redirect=/koreads/books/${bookId}/community?tab=theories`);
      return;
    }
    if (!bookId) return;
    const { error } = await submitFanTheory(bookId, user.id, theoryTitle, theoryBody);
    if (error) toast.error(error.message);
    else {
      toast.success("Theory posted");
      setTheoryTitle("");
      setTheoryBody("");
      await load();
    }
  };

  const upvote = async (theory: KoreadsFanTheory) => {
    if (!user) {
      navigate(`/auth`);
      return;
    }
    await toggleTheoryUpvote(theory.id, user.id, !!theory.user_has_upvoted);
    await load();
  };

  const handleJoinCircle = async (circle: KoreadsStoryCircle) => {
    if (!user) {
      navigate(`/auth`);
      return;
    }
    const { error } = await joinCircle(circle.id, user.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Joined circle");
      await load();
      setActiveCircle({ ...circle, is_member: true });
    }
  };

  const sendCirclePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !activeCircle || !postBody.trim()) return;
    const { error } = await postToCircle(activeCircle.id, user.id, postBody.trim());
    if (error) toast.error(error.message);
    else {
      setPostBody("");
      const { posts } = await fetchCirclePosts(activeCircle.id);
      setCirclePosts(posts);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#C77DFF] flex items-center justify-center uppercase tracking-[4px] text-xs">
        Loading community...
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "polls", label: "Polls" },
    { id: "theories", label: "Fan theories" },
    { id: "circles", label: "Story circles" },
    { id: "behind", label: "Behind the story" },
  ];

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5]">
      <Navbar />
      <main className="pt-[72px] container mx-auto px-6 lg:px-12 py-12 max-w-4xl">
        <Link
          to={`/koreads/books/${bookId}`}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-8"
        >
          <ArrowLeft size={14} /> Back to {book?.title}
        </Link>

        <h1 className="text-3xl font-extrabold mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
          Community space
        </h1>

        <div className="flex flex-wrap gap-2 mb-10">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-[10px] uppercase tracking-[2px] border ${
                tab === t.id ? "border-[#C77DFF] bg-[#C77DFF]/10 text-[#C77DFF]" : "border-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "polls" && (
          <div className="space-y-6">
            {polls.map((poll) => (
              <div key={poll.id} className="border border-[rgba(199,125,255,0.2)] p-6">
                <div className="flex items-center gap-2 text-[#C77DFF] mb-3">
                  <Vote size={16} />
                  <span className="text-[10px] uppercase tracking-[2px]">{poll.poll_type.replace("_", " ")}</span>
                  <span className="text-[10px] text-[rgba(240,232,213,0.4)]">{poll.status}</span>
                </div>
                <h3 className="font-bold text-xl mb-4">{poll.question}</h3>
                {poll.status === "closed" && poll.winning_option_id && (
                  <p className="text-sm text-[#C9A84C] mb-4">
                    Community decision:{" "}
                    <strong>{poll.options.find((o) => o.id === poll.winning_option_id)?.label}</strong>
                  </p>
                )}
                <div className="space-y-2">
                  {poll.options.map((opt) => {
                    const count = poll.vote_counts?.[opt.id] ?? 0;
                    const total = Object.values(poll.vote_counts ?? {}).reduce((a, b) => a + b, 0) || 1;
                    const pct = Math.round((count / total) * 100);
                    const isUserVote = poll.user_vote_option_id === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={poll.status !== "open"}
                        onClick={() => vote(poll.id, opt.id)}
                        className={`w-full text-left p-4 border transition-all ${
                          isUserVote ? "border-[#C9A84C] bg-[#C9A84C]/10" : "border-white/10 hover:border-[#C77DFF]/40"
                        }`}
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">{opt.label}</span>
                          <span className="text-[10px] text-[#C9A84C]">{pct}%</span>
                        </div>
                        {opt.description && <p className="text-sm text-[rgba(240,232,213,0.5)]">{opt.description}</p>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {polls.length === 0 && <p className="text-[rgba(240,232,213,0.45)]">No polls yet. The author may open one soon.</p>}
          </div>
        )}

        {tab === "theories" && (
          <div>
            <form onSubmit={submitTheory} className="border border-white/10 p-6 mb-8">
              <div className="flex items-center gap-2 text-[#C77DFF] mb-4">
                <Lightbulb size={18} />
                <span className="text-[10px] uppercase tracking-[2px]">Share a fan theory</span>
              </div>
              <input
                className="w-full bg-[rgba(240,232,213,0.04)] border border-white/10 p-3 mb-3"
                placeholder="Theory title"
                value={theoryTitle}
                onChange={(e) => setTheoryTitle(e.target.value)}
              />
              <textarea
                className="w-full min-h-[100px] bg-[rgba(240,232,213,0.04)] border border-white/10 p-3 mb-3"
                placeholder="What do you think is really going on?"
                value={theoryBody}
                onChange={(e) => setTheoryBody(e.target.value)}
              />
              <button type="submit" className="bg-[#C77DFF] text-[#0B1828] px-6 py-2 text-[10px] uppercase font-bold">
                Post theory
              </button>
            </form>
            <div className="space-y-4">
              {theories.map((t) => (
                <div key={t.id} className="border border-white/10 p-5">
                  <h3 className="font-bold text-lg">{t.title}</h3>
                  <p className="text-sm text-[rgba(240,232,213,0.6)] mt-2 leading-relaxed">{t.body}</p>
                  <div className="flex justify-between mt-4 text-[10px] uppercase tracking-[2px]">
                    <span>{t.display_name}</span>
                    <button type="button" onClick={() => upvote(t)} className="text-[#C9A84C]">
                      {t.user_has_upvoted ? "Upvoted" : "Upvote"} · {t.upvote_count}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "circles" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              {circles.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCircle(c)}
                  className={`w-full text-left p-4 border ${
                    activeCircle?.id === c.id ? "border-[#C77DFF] bg-[#C77DFF]/10" : "border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 text-[#6BBFB5] mb-1">
                    <Users size={14} />
                    <span className="text-[9px] uppercase">{c.circle_type}</span>
                  </div>
                  <div className="font-bold">{c.name}</div>
                  <p className="text-xs text-[rgba(240,232,213,0.45)] mt-1">{c.member_count} members</p>
                </button>
              ))}
              {circles.length === 0 && <p className="text-[rgba(240,232,213,0.45)]">No story circles yet.</p>}
            </div>
            {activeCircle && (
              <div className="border border-white/10 p-6">
                <h3 className="font-bold text-xl mb-2">{activeCircle.name}</h3>
                <p className="text-sm text-[rgba(240,232,213,0.5)] mb-4">{activeCircle.description}</p>
                {!activeCircle.is_member ? (
                  <button
                    type="button"
                    onClick={() => handleJoinCircle(activeCircle)}
                    className="mb-6 bg-[#6BBFB5] text-[#0B1828] px-4 py-2 text-[10px] uppercase font-bold"
                  >
                    Join circle
                  </button>
                ) : (
                  <form onSubmit={sendCirclePost} className="mb-6">
                    <textarea
                      value={postBody}
                      onChange={(e) => setPostBody(e.target.value)}
                      className="w-full min-h-[80px] bg-[rgba(240,232,213,0.04)] border border-white/10 p-3 mb-2"
                      placeholder="Post to the circle..."
                    />
                    <button type="submit" className="text-[10px] uppercase text-[#C77DFF] font-bold">
                      Send
                    </button>
                  </form>
                )}
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {circlePosts.map((p) => (
                    <div key={p.id} className="bg-[#060D16] p-3 text-sm">
                      <div className="text-[9px] uppercase text-[#C9A84C] mb-1">{p.display_name}</div>
                      {p.body}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "behind" && (
          <div className="space-y-6">
            {behind.map((post) => (
              <article key={post.id} className="border border-[rgba(201,168,76,0.15)] p-6">
                <div className="text-[9px] uppercase tracking-[2px] text-[#C9A84C] mb-2">{post.post_type.replace("_", " ")}</div>
                <h3 className="font-bold text-xl mb-3">{post.title}</h3>
                <p className="text-[rgba(240,232,213,0.62)] leading-relaxed whitespace-pre-wrap">{post.body}</p>
              </article>
            ))}
            {behind.length === 0 && (
              <p className="text-[rgba(240,232,213,0.45)]">The author has not shared behind-the-story posts yet.</p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default KoreadsCommunity;
