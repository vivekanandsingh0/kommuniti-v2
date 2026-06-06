import { useState, useEffect } from "react";
import { Menu, X, Coins, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { COMING_SOON_NAV_LINKS, LIVE_LAUNCH_LINKS } from "@/config/comingSoonPages";
import { useAuth } from "@/context/AuthContext";

const SoonBadge = () => (
  <span className="text-[7px] tracking-[1px] uppercase font-bold px-1 py-0.5 border border-current opacity-60 ml-1 align-middle">
    Soon
  </span>
);

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const linkStyle = (color: string, live = true) => ({
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: live ? "13px" : "12px",
    fontWeight: live ? 700 : 600,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    color,
    opacity: live ? 1 : 0.55,
  });

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[100]"
        style={{
          background: "#0B1828",
          borderBottom: "1px solid rgba(201, 168, 76, 0.2)",
          backdropFilter: "blur(12px)",
          height: "72px",
        }}
      >
        <div className="flex items-center w-full h-full px-5 gap-3">
          <Link to="/" className="flex items-center no-underline shrink-0">
            <img src="/kommuniti-new-logo.png" alt="Kommuniti Logo" className="h-8 sm:h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 gap-8">
            {LIVE_LAUNCH_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="hover:opacity-80 transition-all no-underline flex items-center gap-2"
                  style={linkStyle(link.color, true)}
                >
                  <Icon size={14} style={{ color: link.color }} />
                  {link.label.toUpperCase()}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3 ml-auto shrink-0">
            {user && (
              <div
                style={{
                  background: "rgba(201, 168, 76, 0.15)",
                  border: "1.5px solid #C9A84C",
                  borderRadius: "24px",
                  padding: "4px 12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#C9A84C",
                }}
              >
                <Coins size={14} /> {user.profile?.ko_coins || 0}
              </div>
            )}
            <button
              type="button"
              onClick={() => (user ? navigate("/profile") : navigate("/auth"))}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: user
                  ? "linear-gradient(135deg, #FF6B35, #AAFF00)"
                  : "linear-gradient(135deg, #6BBFB5, #4895EF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(201, 168, 76, 0.4)",
                cursor: "pointer",
                color: "#0B1828",
              }}
              className="hover:scale-105 active:scale-95 transition-transform"
            >
              <User size={16} />
            </button>
            <Link
              to="/volunteer"
              className="no-underline transition-all hover:brightness-110"
              style={{
                background: "#C9A84C",
                color: "#0B1828",
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                padding: "8px 14px",
              }}
            >
              Volunteer
            </Link>
          </div>

          <div className="flex lg:hidden items-center ml-auto gap-3">
            <button
              type="button"
              onClick={() => (user ? navigate("/profile") : navigate("/auth"))}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: user
                  ? "linear-gradient(135deg, #FF6B35, #AAFF00)"
                  : "linear-gradient(135deg, #6BBFB5, #4895EF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(201, 168, 76, 0.4)",
                cursor: "pointer",
                color: "#0B1828",
              }}
            >
              <User size={15} />
            </button>
            <button type="button" className="text-[#F0E8D5] p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] lg:hidden"
            style={{ background: "#0B1828", paddingTop: "72px" }}
          >
            <div className="flex flex-col h-full p-6 overflow-y-auto">
              <div className="mb-8">
                <div className="flex flex-col gap-5">
                  {LIVE_LAUNCH_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3.5 no-underline py-2 border-b border-[rgba(201,168,76,0.05)] last:border-b-0"
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: "18px",
                          fontWeight: 700,
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                          color: link.color,
                        }}
                      >
                        <Icon size={20} style={{ color: link.color }} />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-[rgba(201,168,76,0.1)] pb-12">
                {user ? (
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between mb-6 no-underline"
                  >
                    <div>
                      <p className="text-[8px] uppercase tracking-[2px] text-[rgba(201,168,76,0.5)] mb-1">
                        Your wallet
                      </p>
                      <div className="text-2xl font-bold text-[#C9A84C] flex items-center gap-1.5">
                        <Coins size={20} /> {user.profile?.ko_coins || 0}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF6B35] to-[#AAFF00] flex items-center justify-center border border-white/20">
                      <User size={20} className="text-[#0B1828]" />
                    </div>
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="block mb-6 text-[#C9A84C] text-sm font-bold no-underline"
                  >
                    Sign in →
                  </Link>
                )}
                <Link
                  to="/volunteer"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center no-underline w-full py-3 bg-[#C9A84C] text-[#0B1828] text-[11px] uppercase tracking-[2px] font-bold"
                >
                  Volunteer with us
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
