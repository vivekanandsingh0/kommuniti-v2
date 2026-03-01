import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "KOMMUTE", href: "#programs" },
  { label: "KONNECT", href: "#about" },
  { label: "KREATE", href: "#koreads" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="#" className="font-pixel text-primary text-[10px] sm:text-xs tracking-widest hover:text-primary/80 transition-colors">
            KOMMUNITI
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-pixel text-[9px] text-foreground/60 hover:text-primary transition-colors duration-300 tracking-wider"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <a href="#cta" className="font-pixel text-[8px] bg-accent text-accent-foreground px-5 py-2.5 border-2 border-accent hover:shadow-[0_0_15px_hsl(340,82%,52%,0.4)] transition-all">
              KONNECT
            </a>
            <a href="#about" className="font-pixel text-[8px] text-foreground/60 px-5 py-2.5 border-2 border-foreground/20 hover:border-primary hover:text-primary transition-all">
              EXPLORE
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-foreground/60 hover:text-primary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="py-6 space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block font-pixel text-[9px] text-foreground/60 hover:text-primary transition-colors py-2 tracking-wider"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex gap-3 pt-2">
                  <a href="#cta" onClick={() => setMobileOpen(false)} className="font-pixel text-[8px] bg-accent text-accent-foreground px-5 py-2.5 border-2 border-accent">
                    KONNECT
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
