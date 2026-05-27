import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, GitBranch } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchBookWithChapters } from "@/lib/koreads";
import { fetchBookTimeline } from "@/lib/koreads-phase2";
import { KoreadsBook, KoreadsTimelineEvent } from "@/types/koreads";

const EVENT_LABELS: Record<string, string> = {
  chapter_published: "Chapter drop",
  chapter_updated: "Chapter revised",
  contribution_accepted: "Community shaping",
  task_rewarded: "Bounty rewarded",
  poll_opened: "Poll opened",
  poll_closed: "Poll closed",
  milestone: "Milestone",
  behind_story: "Behind the story",
};

const KoreadsTimeline = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState<KoreadsBook | null>(null);
  const [events, setEvents] = useState<KoreadsTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookId) return;
    (async () => {
      setLoading(true);
      const { book: b } = await fetchBookWithChapters(bookId);
      setBook(b);
      const { events: ev } = await fetchBookTimeline(bookId);
      setEvents(ev);
      setLoading(false);
    })();
  }, [bookId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#C77DFF] flex items-center justify-center uppercase tracking-[4px] text-xs">
        Loading timeline...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5]">
      <Navbar />
      <main className="pt-[72px] container mx-auto px-6 lg:px-12 py-12 max-w-3xl">
        <Link
          to={`/koreads/books/${bookId}`}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-8"
        >
          <ArrowLeft size={14} /> Back to {book?.title || "book"}
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <GitBranch className="text-[#C77DFF]" size={28} />
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>
            How this book is evolving
          </h1>
        </div>
        <p className="text-[rgba(240,232,213,0.55)] mb-10">
          A living log of chapters, community impact, and decisions — proof the story is changing with its readers.
        </p>

        <div className="space-y-0 border-l border-[#C77DFF]/30 ml-3">
          {events.map((ev) => (
            <div key={ev.id} className="relative pl-8 pb-10">
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-[#C77DFF]" />
              <div className="text-[9px] uppercase tracking-[2px] text-[#C9A84C] mb-1">
                {EVENT_LABELS[ev.event_type] || ev.event_type}
              </div>
              <div className="font-bold text-lg">{ev.title}</div>
              {ev.description && (
                <p className="text-sm text-[rgba(240,232,213,0.55)] mt-2">{ev.description}</p>
              )}
              {ev.created_at && (
                <div className="text-[10px] text-[rgba(240,232,213,0.35)] mt-2">
                  {new Date(ev.created_at).toLocaleString()}
                </div>
              )}
            </div>
          ))}
          {events.length === 0 && (
            <p className="pl-8 text-[rgba(240,232,213,0.45)]">The evolution log will grow as chapters drop and contributions are accepted.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KoreadsTimeline;
