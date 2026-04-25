import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "KOMMUTE", href: "#programs", color: "#6BBFB5", icon: "🗺️" },
  { label: "KONNECT", href: "#about", color: "#FF6B35", icon: "🎓" },
  { label: "KREATE", href: "#koreads", color: "#AAFF00", icon: "⚡" },
  { label: "Kores", href: "#kores", color: "rgba(240, 232, 213, 0.5)", icon: null },
  { label: "About", href: "#about-section", color: "rgba(240, 232, 213, 0.5)", icon: null },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center"
      style={{
        background: "rgba(11, 24, 40, 0.98)",
        borderBottom: "1px solid rgba(201, 168, 76, 0.2)",
        padding: "14px 28px",
        gap: "20px",
        backdropFilter: "blur(12px)",
        height: "72px"
      }}
    >
      {/* Logo */}
      <a href="#" className="flex items-center gap-2 transition-transform hover:scale-[1.02] no-underline">
        <span style={{ fontSize: "20px" }}>🌻</span>
        <span 
          className="hidden sm:block" 
            style={{ 
              fontFamily: "'Syne', sans-serif", 
              fontWeight: 800, 
              fontSize: "20px", 
              letterSpacing: "-0.5px", 
              lineHeight: 1,
              color: "#F0E8D5"
            }}
        >
          Kommu<span style={{ color: "#F5C842" }}>ni</span><span style={{ color: "#E63946" }}>t</span>i
        </span>
      </a>

      {/* Desktop Links */}
      <div className="hidden lg:flex items-center justify-center flex-1" style={{ gap: "32px" }}>
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
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
          </a>
        ))}
      </div>

      {/* Right side elements */}
      <div className="hidden md:flex items-center" style={{ gap: "12px" }}>
        {/* KO Coin Badge */}
        <div 
          style={{
            background: "rgba(201, 168, 76, 0.15)",
            border: "1.5px solid #C9A84C",
            borderRadius: "24px",
            padding: "6px 14px 6px 8px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: "15px",
            color: "#C9A84C"
          }}
        >
          <div 
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #FFE066, #C9A84C)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px"
            }}
          >
            🪙
          </div>
          840
        </div>

        {/* User Avatar */}
        <div 
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6BBFB5, #4895EF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            border: "2px solid rgba(201, 168, 76, 0.4)",
            cursor: "pointer"
          }}
        >
           👤
        </div>

        {/* CTA Button */}
        <a 
          href="#app" 
          className="hover:brightness-110 transition-all no-underline"
          style={{
            background: "#C9A84C",
            color: "#0B1828",
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: "11px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            padding: "8px 16px"
          }}
        >
          Get the App
        </a>
      </div>

      {/* Mobile Toggle */}
      <div className="flex lg:hidden items-center ml-auto">
         <button
            className="text-[#F0E8D5] hover:text-[#C9A84C] transition-colors p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 top-[72px] bg-navy/98 backdrop-blur-2xl z-40 border-t border-gold/10"
            style={{ background: "rgba(11, 24, 40, 0.98)" }}
          >
            <div className="flex flex-col h-full py-10 px-8 space-y-8 overflow-y-auto">
              <div className="space-y-6">
                  <p className="text-[10px] tracking-[0.3em] text-[#C9A84C] opacity-50 uppercase" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Navigation</p>
                  {navLinks.map((link) => (
                  <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block transition-colors py-2 tracking-tight uppercase no-underline"
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: "30px",
                        fontWeight: 800,
                        color: link.color.includes("rgba") ? "#F0E8D5" : link.color
                      }}
                  >
                      {link.label}
                  </a>
                  ))}
              </div>
              
              <div className="pt-8 border-t border-gold/10 space-y-8">
                  <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                          <p className="text-[10px] tracking-[0.3em] text-[#C9A84C] opacity-50 uppercase" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Account</p>
                          <div className="text-2xl font-bold text-[#C9A84C] flex items-center gap-2" style={{ fontFamily: "'Space Mono', monospace" }}>
                              🪙 840 <span className="text-xs uppercase tracking-widest ml-2" style={{ fontFamily: "'Rajdhani', sans-serif", color: "rgba(201, 168, 76, 0.6)" }}>Coins Earned</span>
                          </div>
                      </div>
                      <div 
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #6BBFB5, #4895EF)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          border: "2px solid rgba(201, 168, 76, 0.4)"
                        }}
                      >
                         👤
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                      <a 
                        href="#app" 
                        onClick={() => setMobileOpen(false)} 
                        className="w-full text-center no-underline"
                        style={{
                          background: "#C9A84C",
                          color: "#0B1828",
                          fontFamily: "'Rajdhani', sans-serif",
                          fontWeight: 700,
                          fontSize: "14px",
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          padding: "18px"
                        }}
                      >
                          Get the App ↓
                      </a>
                  </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

