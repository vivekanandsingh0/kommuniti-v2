import { Link } from "react-router-dom";
import { COMING_SOON_NAV_LINKS, LIVE_LAUNCH_LINKS } from "@/config/comingSoonPages";

const Footer = () => {
  const companyLinks = [
    { label: "For Investors", href: "/investors" },
    { label: "NGO Partners", href: "/partners" },
    { label: "Press & Media", href: "/press" },
    { label: "Contact Us", href: "/contact" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Grievance Officer", href: "/grievance" },
  ];

  return (
    <footer className="bg-[#0B1828] pt-16 pb-8 border-t border-[rgba(201,168,76,0.1)]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-6">
            <Link to="/" className="flex items-center mb-6 no-underline">
              <img src="/kommuniti-new-logo.png" alt="Kommuniti Logo" className="h-12 sm:h-16 w-auto object-contain" />
            </Link>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "16px",
                color: "rgba(240, 232, 213, 0.6)",
                marginBottom: "16px",
              }}
            >
              A Feeling of Home.
            </p>
            <p className="text-xs text-[rgba(240,232,213,0.5)] leading-relaxed max-w-xs mb-6">
              Active platforms: Konnect, KO Reads, About, and Volunteer. Empowering neighbourhoods into collective action.
            </p>
            <Link
              to="/konnect"
              className="inline-block no-underline transition-all hover:brightness-110"
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
              Explore Konnect →
            </Link>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-[9px] tracking-[2px] uppercase text-[#4CAF50] mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />
              Live now
            </h4>
            <ul className="list-none p-0 m-0 space-y-3">
              {LIVE_LAUNCH_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      style={{ color: link.color }}
                      className="text-[13px] no-underline hover:opacity-80 transition-opacity font-semibold flex items-center gap-1.5"
                    >
                      <Icon size={14} style={{ color: link.color }} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-[9px] tracking-[2px] uppercase text-[rgba(240,232,213,0.4)] mb-5">
              Company
            </h4>
            <ul className="list-none p-0 m-0 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[13px] text-[rgba(240,232,213,0.6)] no-underline hover:text-[#C9A84C] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[rgba(201,168,76,0.1)] flex flex-col lg:flex-row justify-between items-center gap-6">
          <p className="text-[11px] text-[rgba(240,232,213,0.35)] text-center">
            © 2026 Kommuniti Private Limited · Registered in Kerala, India · CIN: U74999KL2026PTC083000
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-[11px] text-[rgba(240,232,213,0.4)] no-underline hover:text-[#F0E8D5] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
