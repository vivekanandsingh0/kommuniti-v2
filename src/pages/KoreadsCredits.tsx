import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchBookWithChapters } from "@/lib/koreads";
import { fetchFullBookCredits } from "@/lib/koreads-phase2";
import { ContributorCredit, KoreadsBook } from "@/types/koreads";

const KoreadsCredits = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState<KoreadsBook | null>(null);
  const [pinned, setPinned] = useState<ContributorCredit[]>([]);
  const [contributors, setContributors] = useState<ContributorCredit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookId) return;
    (async () => {
      setLoading(true);
      const { book: b } = await fetchBookWithChapters(bookId);
      setBook(b);
      const credits = await fetchFullBookCredits(bookId);
      setPinned(credits.pinned);
      setContributors(credits.contributors);
      setLoading(false);
    })();
  }, [bookId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#C77DFF] flex items-center justify-center uppercase tracking-[4px] text-xs">
        Loading credits...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5]">
      <Navbar />
      <main className="pt-[72px] container mx-auto px-6 lg:px-12 py-12 max-w-4xl">
        <Link
          to={`/koreads/books/${bookId}`}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-8"
        >
          <ArrowLeft size={14} /> Back to {book?.title || "book"}
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <Award className="text-[#C9A84C]" size={28} />
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>
            People who shaped this book
          </h1>
        </div>
        <p className="text-[rgba(240,232,213,0.55)] mb-10 leading-relaxed">
          Every name here left a trace the author chose to keep. This is the community edition of the manuscript.
        </p>

        {pinned.length > 0 && (
          <section className="mb-12">
            <h2 className="text-[11px] uppercase tracking-[3px] text-[#C9A84C] mb-5">Top shapers</h2>
            <div className="space-y-4">
              {pinned.map((c) => (
                <div key={c.user_id} className="border border-[#C9A84C]/40 bg-[#C9A84C]/5 p-6">
                  <div className="text-xl font-bold">{c.display_name}</div>
                  <div className="text-[10px] uppercase tracking-[2px] text-[#C77DFF] mt-2">{c.credit_label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.45)] mb-5">All contributors</h2>
          {contributors.length + pinned.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[...pinned, ...contributors].map((c) => (
                <div key={`${c.user_id}-${c.credit_label}`} className="border border-white/10 p-5 bg-[rgba(240,232,213,0.02)]">
                  <div className="font-bold">{c.display_name}</div>
                  <div className="text-[10px] uppercase tracking-[2px] text-[#C77DFF] mt-1">{c.credit_label}</div>
                  <div className="text-[9px] text-[rgba(240,232,213,0.35)] mt-2">{c.source === "task" ? "Bounty" : "Inline"}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[rgba(240,232,213,0.45)]">No credited contributors yet. Be the first to shape this story.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default KoreadsCredits;
