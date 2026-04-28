import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const navLinks = [
  { label: "KOMMUTE", href: "/kommute", color: "#6BBFB5", icon: "🗺️" },
  { label: "KONNECT", href: "/konnect", color: "#FF6B35", icon: "🎓" },
  { label: "KREATE", href: "/kreate", color: "#AAFF00", icon: "⚡" },
  { label: "Kores", href: "/kores", color: "rgba(240, 232, 213, 0.5)", icon: null },
  { label: "About", href: "/about", color: "rgba(240, 232, 213, 0.5)", icon: null },
];

import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[100]"
        style={{
          background: "#0B1828",
          borderBottom: "1px solid rgba(201, 168, 76, 0.2)",
          backdropFilter: "blur(12px)",
          height: "72px"
        }}
      >
        <div 
          className="flex items-center w-full h-full"
          style={{ 
            padding: "0 20px",
            gap: "15px"
          }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 no-underline">
            <span className="text-[16px] sm:text-[20px]">🌻</span>
            <span 
                style={{ 
                  fontFamily: "'Syne', sans-serif", 
                  fontWeight: 800, 
                  letterSpacing: "-0.5px", 
                  lineHeight: 1,
                  color: "#F0E8D5"
                }}
                className="text-[16px] sm:text-[20px]"
            >
              Kommu<span style={{ color: "#F5C842" }}>ni</span><span style={{ color: "#E63946" }}>t</span>i
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center justify-center flex-1" style={{ gap: "32px" }}>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="hover:opacity-80 transition-all no-underline flex items-center gap-1.5"
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: link.color
                }}
              >
                {link.icon && <span style={{ fontSize: "16px" }}>{link.icon}</span>}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side elements (Desktop) */}
          <div className="hidden md:flex items-center" style={{ gap: "12px" }}>
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
                  color: "#C9A84C"
                }}
              >
                🪙 {user.profile?.ko_coins || 0}
              </div>
            )}
            <button 
              onClick={() => user ? navigate("/profile") : navigate("/auth")}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: user ? "linear-gradient(135deg, #FF6B35, #AAFF00)" : "linear-gradient(135deg, #6BBFB5, #4895EF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(201, 168, 76, 0.4)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="hover:scale-105 active:scale-95"
            >
               {user ? "👨‍🚀" : "👤"}
            </button>
            <a 
              href="#app" 
              className="no-underline"
              style={{
                background: "#C9A84C",
                color: "#0B1828",
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                padding: "8px 16px"
              }}
            >
              Get App
            </a>
          </div>

          {/* Mobile Toggle & Profile */}
          <div className="flex lg:hidden items-center ml-auto gap-3">
             <button 
                onClick={() => user ? navigate("/profile") : navigate("/auth")}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: user ? "linear-gradient(135deg, #FF6B35, #AAFF00)" : "linear-gradient(135deg, #6BBFB5, #4895EF)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid rgba(201, 168, 76, 0.4)",
                  cursor: "pointer"
                }}
              >
                {user ? "👨‍🚀" : "👤"}
             </button>
             <button
                className="text-[#F0E8D5] p-2"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] lg:hidden"
            style={{ 
              background: "#0B1828",
              paddingTop: "72px"
            }}
          >
            <div className="flex flex-col h-full p-6 overflow-y-auto">
              <div className="mb-8">
                  <div 
                    style={{ 
                      fontSize: "9px", 
                      letterSpacing: "3px", 
                      textTransform: "uppercase", 
                      color: "#C9A84C",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "24px"
                    }}
                  >
                    <span style={{ width: "24px", height: "1px", background: "#C9A84C" }}></span>
                    Navigation
                  </div>
                  <div className="flex flex-col gap-5">
                    {navLinks.map((link) => (
                    <Link
                        key={link.label}
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 no-underline py-1 transition-all active:opacity-60"
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: "15px",
                          fontWeight: 700,
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          color: link.color.includes("rgba") ? "#F0E8D5" : link.color
                        }}
                    >
                        {link.icon && <span style={{ fontSize: "18px" }}>{link.icon}</span>}
                        {link.label}
                    </Link>
                    ))}
                  </div>
              </div>
              
              <div className="mt-auto pt-8 border-t border-[rgba(201,168,76,0.1)]">
                  {user ? (
                    <Link 
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between mb-8 no-underline"
                    >
                        <div>
                            <p 
                              style={{ 
                                fontSize: "8px", 
                                letterSpacing: "2px", 
                                textTransform: "uppercase", 
                                color: "rgba(201, 168, 76, 0.5)",
                                fontFamily: "'Rajdhani', sans-serif",
                                marginBottom: "4px"
                              }}
                            >
                              Your Wallet
                            </p>
                            <div className="text-2xl font-bold text-[#C9A84C]" style={{ fontFamily: "'Space Mono', monospace" }}>
                                🪙 {user.profile?.ko_coins || 0}
                            </div>
                        </div>
                        <div 
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #FF6B35, #AAFF00)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                            border: "2px solid rgba(201, 168, 76, 0.4)"
                          }}
                        >
                           👨‍🚀
                        </div>
                    </Link>
                  ) : (
                    <Link 
                      to="/auth"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-4 mb-8 no-underline"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center text-xl">👤</div>
                      <div>
                        <div className="text-sm font-bold text-[#F0E8D5]">Guest Mode</div>
                        <div className="text-[10px] text-[#C9A84C] uppercase tracking-wider">Sign in to earn KO Coins</div>
                      </div>
                    </Link>
                  )}
                  
                  <div className="flex justify-center pb-12">
                    <a 
                      href="#app" 
                      onClick={() => setMobileOpen(false)} 
                      className="no-underline transition-all active:scale-95"
                      style={{
                        background: "#C9A84C",
                        color: "#0B1828",
                        fontFamily: "'Rajdhani', sans-serif",
                        fontWeight: 700,
                        fontSize: "12px",
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        padding: "10px 24px",
                        textAlign: "center"
                      }}
                    >
                        App ↓
                    </a>
                  </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
