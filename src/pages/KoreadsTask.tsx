import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Coins, Send } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  fetchTaskDetail,
  fetchUserTaskSubmission,
  submitTaskSubmission,
} from "@/lib/koreads";
import { KoreadsTask as KoreadsTaskType, KoreadsTaskSubmission, TASK_CATEGORY_LABELS } from "@/types/koreads";

const KoreadsTask = () => {
  const { bookId, taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<KoreadsTaskType | null>(null);
  const [existing, setExisting] = useState<KoreadsTaskSubmission | null>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!bookId || !taskId) return;
    const load = async () => {
      setLoading(true);
      const { task: nextTask } = await fetchTaskDetail(bookId, taskId);
      setTask(nextTask);
      if (user && nextTask) {
        const { submission } = await fetchUserTaskSubmission(taskId, user.id);
        setExisting(submission);
        if (submission) setBody(submission.body);
      }
      setLoading(false);
    };
    load();
  }, [bookId, taskId, user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate(`/auth?redirect=/koreads/books/${bookId}/tasks/${taskId}`);
      return;
    }
    if (!task || !body.trim()) {
      toast.error("Write your contribution first.");
      return;
    }
    if (existing) {
      toast.message("You already submitted on this bounty.");
      return;
    }
    setSubmitting(true);
    const { error } = await submitTaskSubmission({
      task_id: task.id,
      user_id: user.id,
      body: body.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Contribution submitted — the author will review it.");
    const { submission } = await fetchUserTaskSubmission(task.id, user.id);
    setExisting(submission);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#C77DFF] flex items-center justify-center uppercase tracking-[4px] text-xs">
        Loading bounty...
      </div>
    );
  }

  if (!task || !bookId) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5] flex items-center justify-center">
        <p className="text-[rgba(240,232,213,0.55)]">This bounty is not available.</p>
      </div>
    );
  }

  const categoryLabel = TASK_CATEGORY_LABELS[task.task_category] || task.task_category;
  const book = task.book;

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5]">
      <Navbar />
      <main className="pt-[72px] container mx-auto px-6 lg:px-12 py-12 max-w-3xl">
        <Link
          to={`/koreads/books/${bookId}`}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] hover:text-[#F0E8D5] mb-8"
        >
          <ArrowLeft size={14} /> Back to {book?.title || "book"}
        </Link>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-[9px] uppercase tracking-[2px] text-[#C77DFF] border border-[#C77DFF]/30 px-2 py-1">
            {categoryLabel}
          </span>
          <span className="text-[9px] uppercase tracking-[2px] text-[#C9A84C] border border-[#C9A84C]/30 px-2 py-1 flex items-center gap-1">
            <Coins size={12} /> Earn up to {task.reward_ko_coins} KO Coins
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
          {task.title}
        </h1>
        <p className="text-[rgba(240,232,213,0.62)] leading-relaxed mb-6">{task.description}</p>

        {task.reference_text && (
          <blockquote className="border-l-2 border-[#C77DFF] pl-4 text-sm text-[rgba(240,232,213,0.7)] mb-6 italic">
            {task.reference_text}
          </blockquote>
        )}

        {task.deadline && (
          <p className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-6">
            Deadline: {new Date(task.deadline).toLocaleDateString()}
          </p>
        )}

        {existing ? (
          <div className="bg-[rgba(240,232,213,0.03)] border border-[#6BBFB5]/30 p-6">
            <div className="text-[10px] uppercase tracking-[2px] text-[#6BBFB5] mb-2">Your submission</div>
            <p className="text-sm leading-relaxed mb-3">{existing.body}</p>
            <div className="text-[10px] uppercase tracking-[2px] text-[#C77DFF]">Status: {existing.status}</div>
            {existing.author_response && (
              <p className="mt-4 text-sm text-[rgba(240,232,213,0.6)] border-t border-white/10 pt-4">
                Author: {existing.author_response}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="bg-[rgba(240,232,213,0.03)] border border-[rgba(199,125,255,0.16)] p-6">
            <label className="block text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-2">
              Your contribution
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your idea, rewrite, research, or feedback..."
              className="w-full min-h-[200px] bg-[rgba(240,232,213,0.04)] border border-white/10 p-4 outline-none focus:border-[#C77DFF] leading-relaxed mb-4"
            />
            <button
              type="submit"
              disabled={submitting || task.status !== "open"}
              className="bg-[#C77DFF] text-[#0B1828] px-6 py-3 text-[11px] uppercase tracking-[2px] font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={14} /> {user ? "Submit contribution" : "Sign in to contribute"}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default KoreadsTask;
