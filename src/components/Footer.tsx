const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12 px-4">
      {/* Pixel divider */}
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-1 mb-8">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1"
              style={{
                backgroundColor:
                  i % 3 === 0 ? "hsl(var(--primary))" : i % 5 === 0 ? "hsl(var(--accent))" : "transparent",
              }}
            />
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <p className="font-pixel text-xs text-primary mb-3">KOMMUNITI</p>
            <p className="text-sm text-secondary-foreground/70">
              A global community of the people, by the people, for the people.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="font-pixel text-[10px] text-secondary-foreground mb-3">LINKS</p>
            <div className="space-y-2">
              {["About Us", "Programs", "Koreads", "Contact"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="block text-sm text-secondary-foreground/70 hover:text-primary transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="font-pixel text-[10px] text-secondary-foreground mb-3">CONNECT</p>
            <div className="space-y-2">
              {["Instagram", "Twitter/X", "LinkedIn", "YouTube"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="block text-sm text-secondary-foreground/70 hover:text-accent transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-secondary-foreground/20 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-pixel text-[8px] text-secondary-foreground/50">
            © 2026 KOMMUNITI. ALL RIGHTS RESERVED.
          </p>
          <p className="text-xs text-secondary-foreground/40">
            Built with ♥ for the community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
