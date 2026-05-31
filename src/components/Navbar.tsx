import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
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
          <Link to="/" className="flex items-center gap-1.5 no-underline shrink-0">
            <span className="text-[16px] sm:text-[20px]">🌻</span>
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                lineHeight: 1,
                color: "#F0E8D5",
              }}
              className="text-[16px] sm:text-[20px]"
            >
              Kommu<span style={{ color: "#F5C842" }}>ni</span>
              <span style={{ color: "#E63946" }}>t</span>i
            </span>
          </Link>

          {/* Desktop — live first, then coming soon muted */}
          <div className="hidden xl:flex items-center justify-center flex-1 gap-5">
            {LIVE_LAUNCH_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="hover:opacity-80 transition-all no-underline flex items-center gap-1.5"
                style={linkStyle(link.color, true)}
              >
                <span style={{ fontSize: "15px" }}>{link.icon}</span>
                {link.label.toUpperCase()}
              </Link>
            ))}
            <span className="w-px h-4 bg-[rgba(201,168,76,0.2)] mx-1" aria-hidden />
            {COMING_SOON_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="hover:opacity-80 transition-all no-underline flex items-center"
                style={linkStyle(link.color, false)}
              >
                {link.label.toUpperCase()}
                <SoonBadge />
              </Link>
            ))}
          </div>

          {/* Tablet — live only (coming soon in mobile menu) */}
          <div className="hidden lg:flex xl:hidden items-center justify-center flex-1 gap-6">
            {LIVE_LAUNCH_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="hover:opacity-80 transition-all no-underline flex items-center gap-1"
                style={linkStyle(link.color, true)}
              >
                <span style={{ fontSize: "14px" }}>{link.icon}</span>
                {link.label.toUpperCase()}
              </Link>
            ))}
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
                🪙 {user.profile?.ko_coins || 0}
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
              }}
              className="hover:scale-105 active:scale-95 transition-transform"
            >
              {user ? "👨‍🚀" : "👤"}
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
              }}
            >
              {user ? "👨‍🚀" : "👤"}
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
                <p className="text-[9px] tracking-[3px] uppercase text-[#4CAF50] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />
                  Live now
                </p>
                <div className="flex flex-col gap-4">
                  {LIVE_LAUNCH_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 no-underline py-1"
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "16px",
                        fontWeight: 700,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        color: link.color,
                      }}
                    >
                      <span className="text-xl">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mb-8 pt-6 border-t border-[rgba(201,168,76,0.1)]">
                <p className="text-[9px] tracking-[3px] uppercase text-[rgba(240,232,213,0.35)] mb-4">
                  Coming soon
                </p>
                <div className="flex flex-col gap-3">
                  {COMING_SOON_NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 no-underline py-1 opacity-55"
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "14px",
                        fontWeight: 600,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        color: link.color,
                      }}
                    >
                      <span className="text-lg grayscale">{link.icon}</span>
                      {link.label}
                      <SoonBadge />
                    </Link>
                  ))}
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
                      <div className="text-2xl font-bold text-[#C9A84C]">🪙 {user.profile?.ko_coins || 0}</div>
                    </div>
                    <span className="text-2xl">👨‍🚀</span>
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
