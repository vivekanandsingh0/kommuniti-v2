import { ArrowLeft, BookOpen, CircleDot, GraduationCap, Heart, MapPin, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/admin", label: "Real-time Users", icon: Users },
  { path: "/admin/map", label: "Map Intelligence", icon: MapPin },
  { path: "/admin/kores", label: "Kore Oversight", icon: CircleDot },
  { path: "/admin/konnect", label: "Konnect CMS", icon: GraduationCap },
  { path: "/admin/koreads", label: "KO Reads CMS", icon: BookOpen },
  { path: "/admin/about", label: "About CMS", icon: Heart },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 border-r border-[rgba(201,168,76,0.1)] hidden lg:flex flex-col p-6 sticky top-0 h-screen">
      <div className="flex flex-col gap-1 mb-12">
        <img src="/kommuniti-new-logo.png" alt="Kommuniti Logo" className="h-7 w-auto object-contain self-start" />
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }} className="text-[10px] tracking-[2px] text-[rgba(240,232,213,0.4)] uppercase mt-1">
          Admin Hub
        </span>
      </div>

      <nav className="space-y-2 flex-1">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all ${
                active
                  ? "bg-[rgba(201,168,76,0.1)] text-[#C9A84C]"
                  : "text-[rgba(240,232,213,0.3)] hover:bg-white/5 hover:text-[#F0E8D5]"
              }`}
            >
              <Icon size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => navigate("/")}
        className="mt-auto flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.3)] hover:text-[#F0E8D5] transition-colors"
      >
        <ArrowLeft size={14} /> Back to Site
      </button>
    </aside>
  );
};

export default AdminSidebar;
