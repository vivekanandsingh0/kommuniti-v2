import { motion } from "framer-motion";

const Footer = () => {
  const platformLinks = [
    { label: "🗺️ Kommute", color: "#6BBFB5" },
    { label: "🎓 Konnect", color: "#FF6B35" },
    { label: "⚡ Kreate", color: "#AAFF00" },
    { label: "📖 KO Reads", color: "#C77DFF" },
    { label: "🛒 KO Store", color: "#C9A84C" },
  ];

  const communityLinks = [
    "Find a Kore",
    "Start a Kore",
    "Kore Directory",
    "Founding 50",
    "KO Passport",
  ];

  const companyLinks = [
    "About Kommuniti",
    "For Investors",
    "NGO Partners",
    "Press & Media",
    "Contact Us",
  ];

  const legalLinks = [
    "Privacy Policy",
    "Terms of Service",
    "Cookie Policy",
    "Grievance Officer",
  ];

  return (
    <footer className="bg-[#0B1828] pt-16 pb-8 border-t border-[rgba(201,168,76,0.1)]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[28px]">🌻</span>
              <span 
                style={{ 
                  fontFamily: "'Syne', sans-serif", 
                  fontWeight: 800, 
                  fontSize: "22px",
                  color: "#F0E8D5",
                  lineHeight: 1
                }}
              >
                Kommu<span style={{ color: "#F5C842" }}>ni</span><span style={{ color: "#E63946" }}>t</span>i
              </span>
            </div>
            <div 
              style={{ 
                fontFamily: "'Cormorant Garamond', serif", 
                fontStyle: "italic", 
                fontSize: "16px", 
                color: "rgba(240, 232, 213, 0.6)", 
                marginBottom: "16px" 
              }}
            >
              A Feeling of Home.
            </div>
            <p 
              style={{ 
                fontSize: "12px", 
                color: "rgba(240, 232, 213, 0.5)", 
                lineHeight: 1.8, 
                maxWidth: "320px",
                marginBottom: "24px"
              }}
            >
              Building resilient communities through commerce, creativity, and collective action. Based in Kerala, rooted everywhere.
            </p>
            <a 
              href="#app" 
              className="inline-block no-underline transition-all hover:brightness-110 active:scale-95"
              style={{
                background: "#C9A84C",
                color: "#0B1828",
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                padding: "10px 20px",
              }}
            >
              Get the App →
            </a>
          </div>

          {/* Platform */}
          <div>
            <h4 
              style={{ 
                fontSize: "9px", 
                letterSpacing: "2px", 
                textTransform: "uppercase", 
                color: "rgba(240, 232, 213, 0.4)", 
                marginBottom: "20px" 
              }}
            >
              Platform
            </h4>
            <ul className="list-none p-0 m-0 space-y-3">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href="#" 
                    style={{ color: link.color }}
                    className="text-[13px] no-underline hover:opacity-80 transition-opacity"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 
              style={{ 
                fontSize: "9px", 
                letterSpacing: "2px", 
                textTransform: "uppercase", 
                color: "rgba(240, 232, 213, 0.4)", 
                marginBottom: "20px" 
              }}
            >
              Community
            </h4>
            <ul className="list-none p-0 m-0 space-y-3">
              {communityLinks.map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-[13px] text-[rgba(240,232,213,0.6)] no-underline hover:text-[#C9A84C] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 
              style={{ 
                fontSize: "9px", 
                letterSpacing: "2px", 
                textTransform: "uppercase", 
                color: "rgba(240, 232, 213, 0.4)", 
                marginBottom: "20px" 
              }}
            >
              Company
            </h4>
            <ul className="list-none p-0 m-0 space-y-3">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-[13px] text-[rgba(240,232,213,0.6)] no-underline hover:text-[#C9A84C] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[rgba(201,168,76,0.1)] flex flex-col lg:flex-row justify-between items-center gap-6">
          <div 
            style={{ 
              fontSize: "11px", 
              color: "rgba(240, 232, 213, 0.35)", 
              textAlign: "center" 
            }}
          >
            © 2026 Kommuniti Private Limited · Registered in Kerala, India · CIN: U74999KL2026PTC083000
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <a 
                key={link} 
                href="#" 
                className="text-[11px] text-[rgba(240,232,213,0.4)] no-underline hover:text-[#F0E8D5] transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
