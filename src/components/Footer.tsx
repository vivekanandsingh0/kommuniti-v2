const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Pixel divider bar */}
        <div className="flex gap-[2px] py-6">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="h-[3px] flex-1"
              style={{
                backgroundColor:
                  i % 4 === 0
                    ? "hsl(var(--primary) / 0.4)"
                    : i % 7 === 0
                      ? "hsl(var(--accent) / 0.3)"
                      : "hsl(var(--foreground) / 0.05)",
              }}
            />
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-10 py-10">
          {/* Brand */}
          <div>
            <p className="font-pixel text-[10px] text-primary mb-4 tracking-wider">KOMMUNITI</p>
            <p className="text-sm text-foreground/30 leading-relaxed">
              A global community of the people, by the people, for the people. Decentralised. International. Non-partisan.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="font-pixel text-[8px] text-foreground/50 mb-4 tracking-wider">LINKS</p>
            <div className="space-y-3">
              {[
                { label: "About Us", href: "#about" },
                { label: "Programs", href: "#programs" },
                { label: "KO Reads", href: "#koreads" },
                { label: "KOKO Store", href: "#" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-foreground/30 hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="font-pixel text-[8px] text-foreground/50 mb-4 tracking-wider">CONNECT</p>
            <div className="space-y-3">
              {[
                { label: "Instagram", href: "https://www.instagram.com/thekommuniti" },
                { label: "LinkedIn", href: "https://www.linkedin.com/company/kommuniti144" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-foreground/30 hover:text-accent transition-colors"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-pixel text-[7px] text-foreground/20 tracking-wider">
            © 2026 KOMMUNITI. ALL RIGHTS RESERVED.
          </p>
          <p className="text-xs text-foreground/15">
            Built with ♥ for the kommuniti
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
