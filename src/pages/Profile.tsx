import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LogOut, ArrowLeft, Trophy, Zap, Map, Coins, Wallet, Flame } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchUserContributions, fetchUserFollowedBooks, fetchUserTaskSubmissions } from "@/lib/koreads";
import { computeReaderBadges } from "@/lib/koreads-phase2";
import { ReaderBadge } from "@/types/koreads";
import { KoreadsContribution, KoreadsTaskSubmission } from "@/types/koreads";

const Profile = () => {
  const { user, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [koreadsContributions, setKoreadsContributions] = useState<KoreadsContribution[]>([]);
  const [koreadsSubmissions, setKoreadsSubmissions] = useState<KoreadsTaskSubmission[]>([]);
  const [followedBooks, setFollowedBooks] = useState<any[]>([]);
  const [badges, setBadges] = useState<ReaderBadge[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      refreshProfile();
      Promise.all([
        fetchUserContributions(user.id),
        fetchUserTaskSubmissions(user.id),
        fetchUserFollowedBooks(user.id),
        computeReaderBadges(user.id),
      ]).then(([contribRes, subsRes, followsRes, badgeList]) => {
        setKoreadsContributions(contribRes.contributions);
        setKoreadsSubmissions(subsRes.submissions);
        setFollowedBooks(followsRes.follows);
        setBadges(badgeList);
      });
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1828] flex items-center justify-center">
        <div className="text-[#C9A84C] animate-pulse uppercase tracking-[4px] text-[10px]">
          Verifying Member Session...
        </div>
      </div>
    );
  }

  if (!user) return null;

  const kssDimensions = [
    { label: "Gathering Consistency", score: 0, max: 100, color: "#C9A84C" },
    { label: "Member Diversity", score: 0, max: 150, color: "#6BBFB5" },
    { label: "KOKO Store Listings", score: 0, max: 80, color: "#FF6B35" },
    { label: "Kreate Impact", score: 0, max: 150, color: "#C77DFF" },
    { label: "Konnect Sessions", score: 0, max: 100, color: "#4895EF" },
    { label: "Kommute Events", score: 0, max: 100, color: "#6BBFB5" },
    { label: "Role Rotation", score: 0, max: 80, color: "#AAFF00" },
    { label: "Stories & Transparency", score: 0, max: 80, color: "#C9A84C" },
  ];

  const impactStats = [
    { label: "This Month Earnings", value: "₹0", color: "#4CAF50" },
    { label: "Deliveries Done", value: "0", color: "#6BBFB5" },
    { label: "Issues Solved", value: "0", color: "#E63946" },
    {
      label: "KO Reads Activity",
      value: (koreadsContributions.length + koreadsSubmissions.length).toString(),
      color: "#C77DFF",
    },
  ];

  const achievements: any[] = [];

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5]">
      {/* Profile Header Dashboard */}
      <section className="pt-24 pb-12 px-6 lg:px-12 bg-gradient-to-br from-[#0A1F12] to-[#0B1828] border-b border-[rgba(76,175,80,0.2)]">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
            
            {/* Avatar & Level */}
            <div className="relative flex-shrink-0">
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center text-5xl border-[4px] border-[rgba(201,168,76,0.4)]"
                style={{ background: "linear-gradient(135deg, #6BBFB5, #4895EF)" }}
              >
                👨‍🚀
              </div>
              <div className="absolute -bottom-2 right-0 bg-[#C9A84C] text-[#0B1828] px-3 py-1 font-bold text-xs border-2 border-[#0B1828]">
                LVL 0
              </div>
            </div>

            {/* Name & Quick Stats */}
            <div className="flex-1 text-center lg:text-left">
              <h1 
                style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }}
                className="text-4xl mb-2"
              >
                {user?.user_metadata?.full_name?.toUpperCase() || user?.email?.split('@')[0].toUpperCase() || "COMMUNITY MEMBER"}
              </h1>
              <p className="text-[rgba(240,232,213,0.5)] mb-6 flex items-center justify-center lg:justify-start gap-2">
                <span className="text-[#6BBFB5]">🌀 Mankulam Kore Zero</span> • Branch Level • Koordinator
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] rounded-full px-4 py-2 flex items-center gap-2">
                  <span className="text-xl">🪙</span>
                  <span className="font-bold text-[#C9A84C]">{user?.profile?.ko_coins || 0}</span>
                </div>
                <div className="bg-[rgba(76,175,80,0.15)] border border-[#4CAF50] rounded-full px-4 py-2 flex items-center gap-2 text-[#4CAF50]">
                  <span className="font-bold text-lg">₹0</span>
                  <span className="text-[10px] opacity-70 uppercase tracking-widest">withdrawable</span>
                </div>
                <div className="bg-[rgba(230,57,70,0.1)] border border-[rgba(230,57,70,0.4)] rounded-full px-4 py-2 flex items-center gap-2 text-[#E63946]">
                  <Flame size={18} />
                  <span className="font-bold">0 weeks</span>
                </div>
              </div>
            </div>

            {/* KSS Score Ring */}
            <div className="text-center flex-shrink-0">
              <div className="w-32 h-32 rounded-full border-[6px] border-[rgba(201,168,76,0.1)] border-t-[#C9A84C] flex flex-col items-center justify-center relative">
                <div 
                  style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }}
                  className="text-4xl text-[#F0E8D5]"
                >
                  0
                </div>
                <div className="text-[9px] uppercase tracking-widest text-[#C9A84C] mt-1">KSS Score</div>
              </div>
              <div className="mt-4 text-[10px] uppercase tracking-[2px] text-[#C9A84C]">Branch Kore</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-12 bg-[#0B1828]">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* KSS Dimensions */}
            <div>
              <h3 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.4)] mb-8">
                Your KSS Dimensions — Kore Strength Score
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {kssDimensions.map((dim) => (
                  <div key={dim.label} className="bg-[rgba(240,232,213,0.03)] border border-[rgba(201,168,76,0.1)] p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs">{dim.label}</span>
                      <span className="font-mono text-xs" style={{ color: dim.color }}>{dim.score}/{dim.max}</span>
                    </div>
                    <div className="h-[3px] bg-[rgba(240,232,213,0.05)] overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(dim.score / dim.max) * 100}%` }}
                        className="h-full"
                        style={{ backgroundColor: dim.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings & Achievements */}
            <div className="space-y-12">
              {/* Earnings Grid */}
              <div>
                <h3 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.4)] mb-8">
                  Earnings & Impact
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {impactStats.map((stat) => (
                    <div key={stat.label} className="bg-[rgba(240,232,213,0.03)] border border-[rgba(240,232,213,0.05)] p-6 text-center">
                      <div 
                        style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: stat.color }}
                        className="text-2xl mb-1"
                      >
                        {stat.value}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-[rgba(240,232,213,0.5)]">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.4)] mb-8">
                  Recent Achievements
                </h3>
                <div className="flex flex-wrap gap-4">
                  {achievements.map((ach) => (
                    <div key={ach.title} className="flex items-center gap-4 bg-[rgba(240,232,213,0.03)] border border-[rgba(201,168,76,0.15)] p-4 pr-6">
                      <span className="text-3xl">{ach.icon}</span>
                      <div>
                        <div className="text-[12px] font-bold" style={{ color: ach.color }}>{ach.title}</div>
                        <div className="text-[10px] text-[rgba(240,232,213,0.4)]">{ach.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 bg-[rgba(240,232,213,0.025)] border border-[rgba(199,125,255,0.16)] p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-[11px] uppercase tracking-[3px] text-[#C77DFF] mb-2">
                  KO Reads Contributions
                </h3>
                <p className="text-sm text-[rgba(240,232,213,0.45)]">
                  Track suggestions you sent to authors and rewards earned from valuable notes.
                </p>
              </div>
              <button
                onClick={() => navigate("/koreads")}
                className="border border-[#C77DFF]/30 text-[#C77DFF] px-4 py-2 text-[10px] uppercase tracking-[2px]"
              >
                Read & Contribute
              </button>
            </div>

            <div className="space-y-3">
              {koreadsContributions.slice(0, 5).map((item) => (
                <div key={item.id} className="border border-white/5 bg-[#0B1828]/60 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="font-bold text-sm">
                      {item.book?.title || "KO Reads Book"} · {item.chapter?.title || "Chapter"}
                    </div>
                    <span className="text-[10px] uppercase tracking-[2px] text-[#C77DFF]">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-[rgba(240,232,213,0.5)] line-clamp-2">
                    “{item.selected_text}”
                  </p>
                  {item.ko_coins_rewarded > 0 && (
                    <div className="mt-2 text-[10px] uppercase tracking-[2px] text-[#C9A84C]">
                      Rewarded {item.ko_coins_rewarded} KO Coins
                    </div>
                  )}
                </div>
              ))}
              {koreadsContributions.length === 0 && koreadsSubmissions.length === 0 && (
                <div className="border border-dashed border-[rgba(199,125,255,0.2)] p-6 text-sm text-[rgba(240,232,213,0.4)]">
                  No KO Reads contributions yet. Highlight text inside a chapter or complete an open bounty.
                </div>
              )}
            </div>

            {koreadsSubmissions.length > 0 && (
              <div className="mt-8">
                <h4 className="text-[10px] uppercase tracking-[2px] text-[#C9A84C] mb-4">Bounty submissions</h4>
                <div className="space-y-3">
                  {koreadsSubmissions.slice(0, 5).map((item) => (
                    <div key={item.id} className="border border-white/5 bg-[#0B1828]/60 p-4">
                      <div className="flex justify-between gap-2 mb-1">
                        <span className="font-bold text-sm">{item.task?.title}</span>
                        <span className="text-[10px] uppercase tracking-[2px] text-[#C77DFF]">{item.status}</span>
                      </div>
                      <p className="text-xs text-[rgba(240,232,213,0.45)]">
                        {(item.task as any)?.book?.title}
                      </p>
                      {item.ko_coins_rewarded > 0 && (
                        <div className="mt-2 text-[10px] uppercase tracking-[2px] text-[#C9A84C]">
                          Rewarded {item.ko_coins_rewarded} KO Coins
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {followedBooks.length > 0 && (
              <div className="mt-8">
                <h4 className="text-[10px] uppercase tracking-[2px] text-[#6BBFB5] mb-4">Followed books</h4>
                <div className="flex flex-wrap gap-3">
                  {followedBooks.map((f: { book_id: string; book?: { id: string; title: string } }) => (
                    <Link
                      key={f.book_id}
                      to={`/koreads/books/${f.book?.id || f.book_id}`}
                      className="border border-[#6BBFB5]/30 px-3 py-2 text-sm hover:border-[#6BBFB5]"
                    >
                      {f.book?.title || "Book"}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {badges.length > 0 && (
              <div className="mt-8">
                <h4 className="text-[10px] uppercase tracking-[2px] text-[#C77DFF] mb-4">Reader reputation</h4>
                <div className="flex flex-wrap gap-2">
                  {badges.map((b) => (
                    <span
                      key={b.id}
                      title={b.description}
                      className={`text-[10px] uppercase tracking-[1.5px] px-3 py-2 border ${
                        b.earned
                          ? "border-[#C9A84C]/50 text-[#C9A84C] bg-[#C9A84C]/10"
                          : "border-white/10 text-[rgba(240,232,213,0.25)]"
                      }`}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 border border-[rgba(199,125,255,0.12)] p-5 bg-[#0B1828]/40">
              <p className="text-sm text-[rgba(240,232,213,0.55)] leading-relaxed">
                Interested in publishing on KO Reads? Contact the Kommuniti team — author profiles are
                created by admin after review.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-20 pt-12 border-t border-[rgba(201,168,76,0.1)] flex flex-col sm:flex-row gap-6 justify-between items-center">
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] hover:text-[#F0E8D5] transition-colors"
            >
              <ArrowLeft size={16} /> Back to Hub
            </button>
            <div className="flex gap-4">
               <button 
                className="bg-[#C9A84C] text-[#0B1828] font-bold px-8 py-3 text-[11px] tracking-[2px] uppercase hover:brightness-110"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                KO Passport PDF
              </button>
              <button 
                onClick={handleLogout}
                className="border border-[#E63946] text-[#E63946] font-bold px-8 py-3 text-[11px] tracking-[2px] uppercase hover:bg-[rgba(230,57,70,0.1)]"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
