import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { KonnectEvent } from "@/types/konnect";
import { 
  Coins, 
  Hammer, 
  Sprout, 
  Scissors, 
  Leaf, 
  Palette, 
  Smartphone, 
  Trees, 
  Calendar 
} from "lucide-react";

export function getEventIcon(iconStr: string) {
  const norm = (iconStr || "").trim();
  switch (norm) {
    case "🏗️":
      return Hammer;
    case "🌾":
    case "🌱":
      return Sprout;
    case "💰":
      return Coins;
    case "🧵":
      return Scissors;
    case "🌿":
      return Leaf;
    case "🏺":
      return Palette;
    case "📱":
      return Smartphone;
    case "🎋":
      return Trees;
    case "📅":
      return Calendar;
    default:
      return Calendar;
  }
}

export function EventTile({ session, compact }: { session: KonnectEvent; compact?: boolean }) {
  const Icon = getEventIcon(session.icon);
  
  return (
    <Link to={`/konnect/events/${session.id}`} className="block w-full">
      <motion.div
        whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}
        whileTap={{ scale: 0.98 }}
        className="konnect-event-tile text-left w-full h-full"
        style={{
          background: session.tile_color,
          color: "#fff",
          minHeight: compact ? "120px" : "140px",
          padding: "16px",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "10px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              opacity: 0.8,
              display: "block",
            }}
          >
            {session.month_label}
          </span>
        </div>

        <span
          aria-hidden
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: compact ? "48px" : "56px",
            lineHeight: 0.9,
            letterSpacing: "-3px",
            color: "rgba(0, 0, 0, 0.15)",
            position: "absolute",
            top: "8px",
            right: "12px",
          }}
        >
          {session.day_label}
        </span>

        <div>
          <div
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "10px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              opacity: 0.85,
              marginBottom: "4px",
            }}
          >
            {session.category}
          </div>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              color: "#fff",
            }}
          >
            {session.title}
          </div>
          {session.ko_coins_earned != null && (
            <p className="text-[9px] mt-1 opacity-80 flex items-center gap-1">
              <Coins size={10} className="text-[#C9A84C]" />
              <span>Earn {session.ko_coins_earned} KO</span>
            </p>
          )}
          <p className="text-[9px] mt-2 opacity-70 uppercase tracking-wider">View & RSVP →</p>
        </div>

        <span
          aria-hidden
          style={{
            position: "absolute",
            right: "16px",
            bottom: "16px",
            opacity: 0.22,
          }}
        >
          <Icon size={26} />
        </span>
      </motion.div>
    </Link>
  );
}
