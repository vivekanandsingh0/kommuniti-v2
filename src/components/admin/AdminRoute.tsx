import { Link, Navigate, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type AdminRouteProps = {
  children: React.ReactNode;
};

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading, isAdmin, refreshProfile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1828] flex items-center justify-center">
        <div className="text-[#C9A84C] animate-pulse uppercase tracking-[4px] text-[10px]">
          Verifying admin access...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5] flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <Shield className="mx-auto mb-4 text-[#E63946]" size={40} />
          <h1
            style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }}
            className="text-2xl mb-3"
          >
            Admin access required
          </h1>
          <p className="text-sm text-[rgba(240,232,213,0.5)] mb-4 leading-relaxed">
            You are signed in as <strong className="text-[#F0E8D5]">{user.email}</strong>, but this
            account is not marked as admin yet.
          </p>
          <p className="text-xs text-[rgba(240,232,213,0.35)] mb-6 leading-relaxed text-left bg-[rgba(240,232,213,0.03)] border border-[rgba(201,168,76,0.15)] p-4">
            In Supabase SQL Editor, run <code className="text-[#C9A84C]">admin_grant_by_email.sql</code>{" "}
            with this exact email, then click Refresh below or log out and back in.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => refreshProfile()}
              className="text-[10px] uppercase tracking-[2px] text-[#C9A84C] border border-[rgba(201,168,76,0.3)] px-5 py-2.5 hover:bg-[rgba(201,168,76,0.08)] transition-colors"
            >
              Refresh access
            </button>
            <Link
              to="/"
              className="inline-block text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.5)] border border-[rgba(240,232,213,0.15)] px-5 py-2.5 hover:bg-[rgba(240,232,213,0.05)] transition-colors"
            >
              Return home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
