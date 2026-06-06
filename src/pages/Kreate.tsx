import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  MapPin, 
  Shield, 
  Zap, 
  TrendingUp, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Check,
  Plus,
  X,
  Copy,
  Info,
  Landmark,
  Coins,
  ShoppingCart,
  Map,
  Sprout
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { MapGeoService } from "@/utils/map-geo-service";

const getKreateIcon = (iconStr: string) => {
  const norm = (iconStr || "").trim();
  switch (norm) {
    case "🗓":
      return Calendar;
    case "🏛":
      return Landmark;
    case "📍":
      return MapPin;
    case "💰":
      return Coins;
    case "🛒":
      return ShoppingCart;
    default:
      return Info;
  }
};

const Kreate = () => {
  const { profile, user } = useAuth();
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [charCounts, setCharCounts] = useState({ name: 0, desc: 0 });
  const [selectedDay, setSelectedDay] = useState("Fri");
  const [invitees, setInvitees] = useState<any[]>([]);

  // Form State
  const [koreName, setKoreName] = useState("");
  const [koreDescription, setKoreDescription] = useState("");
  const [koreCharter, setKoreCharter] = useState("");

  // Map Configuration (Dynamic from DB)
  const [mapConfig, setMapConfig] = useState({
    lat: 9.9658,
    lng: 76.2421,
    radius: 10
  });

  const { cols: COLS, rows: ROWS } = MapGeoService.calculateGridBounds(mapConfig.radius);
  const gridCells = Array.from({ length: COLS * ROWS }, (_, i) => 0);

  // Auto-fill founder as first member
  useEffect(() => {
    if (profile) {
      setInvitees([{
        name: profile.full_name || profile.username || "You",
        initials: (profile.full_name || profile.username || "U").substring(0,2).toUpperCase(),
        status: "FOUNDER · SEED MEMBER",
        color: "linear-gradient(135deg, #6BBFB5, #4895EF)",
        id: user?.id
      }]);
    }
  }, [profile, user]);

  const [newMember, setNewMember] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const wizardRef = useRef<HTMLDivElement>(null); 

  const [mapOverrides, setMapOverrides] = useState<any>({});
  const [loadingMap, setLoadingMap] = useState(true);

  // Fetch all live map data on mount
  useEffect(() => {
    const fetchLiveMap = async () => {
      try {
        // 1. Fetch Map Config
        const { data: config } = await supabase
          .from('map_config')
          .select('*')
          .eq('city_name', 'Fort Kochi')
          .maybeSingle();
        
        if (config) {
          setMapConfig({
            lat: config.center_lat,
            lng: config.center_lng,
            radius: config.radius_km
          });
        }

        // 2. Fetch Overrides
        const { data, error } = await supabaseAdmin
          .from('map_zones')
          .select('*');
        
        if (data) {
          const overrides: any = {};
          data.forEach(z => {
            overrides[z.zone_index] = z;
          });
          setMapOverrides(overrides);
        }
      } catch (e) {
        console.error("Map Sync failure:", e);
      } finally {
        setLoadingMap(false);
      }
    };
    fetchLiveMap();
  }, []);

  // AUTO-LOCATE USER
  useEffect(() => {
    if (!loadingMap && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const index = MapGeoService.getGridIndex(
          latitude, 
          longitude, 
          COLS, 
          ROWS, 
          { lat: mapConfig.lat, lng: mapConfig.lng }
        );
        
        if (index !== null) {
          setSelectedCell(index);
          toast.success("Current zone identified!", {
            description: "We've highlighted your 1km community block."
          });
        }
      }, (err) => {
        console.warn("Location access denied or unavailable.");
      });
    }
  }, [loadingMap, COLS, ROWS, mapConfig.lat, mapConfig.lng]);

  const getCellClass = (idx: number, baseV: number) => {
    const override = mapOverrides[idx];
    const v = override ? override.status : baseV;
    
    switch(v) {
      case 1: return "bg-[#4895EF]/10 border border-[#4895EF]/20"; 
      case 4: return "bg-[#C9A84C] border border-[#F5C842] shadow-[0_0_12px_rgba(201,168,76,0.5)] pulse-gold"; 
      case 5: return "bg-[#4895EF] border border-[#4895EF]/80 shadow-[0_0_8px_rgba(72,149,239,0.4)]"; 
      case 6: return "bg-[#6BBFB5] border border-[#6BBFB5]/80 shadow-[0_0_10px_rgba(107,191,181,0.5)]"; 
      case 8: return "bg-[#E63946] border border-[#E63946]/80 animate-pulse"; 
      case 9: return "bg-[#4CAF50] border border-[#4CAF50]/80"; 
      default: return "bg-[#F0E8D5]/10 border border-[#F0E8D5]/10 hover:bg-[#C9A84C]/20 hover:border-[#C9A84C]/40 transition-all cursor-pointer hover:scale-110 z-10 hover:shadow-[0_0_15px_rgba(201,168,76,0.3)]"; 
    }
  };

  const [zoneStats, setZoneStats] = useState({
    population: 1200,
    potential: 800,
    existingKores: 0
  });

  const selectZone = async (idx: number, baseV: number) => {
    setSelectedCell(idx);
    setIsWizardOpen(true);
    setCurrentStep(1); // Reset to step 1 on every new selection
    
    // USE PRE-FETCHED LIVE DATA (Single Source of Truth)
    const override = mapOverrides[idx];
    
    if (override) {
      setZoneStats({
        population: override.population_estimate || 1200,
        potential: override.kss_potential || 800,
        existingKores: override.status === 4 || override.status === 6 ? 1 : 0
      });
    } else {
      // Use algorithmic baseline for undiscovered zones
      const baselinePop = 1000 + (idx % 20) * 40;
      const baselinePot = 600 + (idx % 15) * 20;
      setZoneStats({
        population: baselinePop,
        potential: baselinePot,
        existingKores: 0
      });
    }

    setTimeout(() => {
      wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const [koreForm, setKoreForm] = useState({
    name: "",
    focus: "Community commerce & KOKO Store",
    desc: "", // This maps to 'description'
    charter: "",
    gatheringDay: "Fri",
    startTime: "18:00",
    address: ""
  });

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // FINAL SUBMISSION: FOUND MY KORE
      if (!user) {
        toast.error("Authentication required!", {
          description: "Please sign in to found a Kore and claim your zone."
        });
        navigate("/auth");
        return;
      }
      
      if (!koreForm.name) return toast.error("Your Kore needs a name!");
      if (selectedCell === null) return;
      
      setLoading(true);
      try {
        // 1. Create the Kore
        const { data: newKore, error: koreError } = await supabase
          .from('kores')
          .insert({
            name: koreForm.name,
            description: koreForm.desc,
            gathering_day: koreForm.gatheringDay,
            charter: koreForm.charter,
            zone_index: selectedCell,
            founder_id: user?.id
          })
          .select()
          .single();

        if (koreError) throw koreError;

        // 2. Add Founder as first member
        const { error: memberError } = await supabase
          .from('kore_members')
          .insert({
            kore_id: newKore.id,
            profile_id: user?.id,
            role: 'founder'
          });

        if (memberError) throw memberError;

        // 3. Update Map Status to Root (4)
        const { error: zoneError } = await supabaseAdmin
          .from('map_zones')
          .upsert({
            zone_index: selectedCell,
            city_name: 'Fort Kochi',
            status: 4,
            population_estimate: 1200, 
            kss_potential: 800
          }, { onConflict: 'zone_index' });

        if (zoneError) throw zoneError;

        setIsSuccess(true);
        toast.success("Congratulations! Your Kore is officially born.");
      } catch (err: any) {
        console.error("Founding failed:", err);
        toast.error("Founding failed: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const addInvitee = () => {
    if (!newMember) return;
    setInvitees([...invitees, { 
      name: newMember, 
      initials: newMember.substring(0, 2).toUpperCase(), 
      status: "Invited · Awaiting response", 
      color: "linear-gradient(135deg, #C77DFF, #4895EF)", 
      pending: true 
    }]);
    setNewMember("");
  };

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5] selection:bg-[#C9A84C] selection:text-[#0B1828]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
        {/* Animated Background Grids */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, #C9A84C 39px, #C9A84C 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #C9A84C 39px, #C9A84C 40px)`, backgroundSize: '40px 40px' }} 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,rgba(201,168,76,0.08)_0%,transparent_70%)] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-4xl"
        >
          <div className="flex items-center justify-center gap-4 text-[#AAFF00] text-[10px] uppercase tracking-[4px] mb-8">
            <div className="w-12 h-[1px] bg-[#AAFF00]" />
            The Movement Starts Here · One Zone at a Time
            <div className="w-12 h-[1px] bg-[#AAFF00]" />
          </div>

          <h1 className="text-[clamp(52px,10vw,120px)] font-[800] leading-[0.85] tracking-[-0.04em] mb-10" style={{ fontFamily: "'Syne', sans-serif" }}>
            <span className="opacity-40">Your zone</span><br />
            <span className="text-[#C9A84C]">is grey.</span><br />
            <span>Fix that.</span>
          </h1>

          <p className="text-[#F0E8D5]/60 text-lg md:text-xl italic max-w-2xl mx-auto mb-12 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Every grey pixel on this map is a neighbourhood that hasn't found its Kore yet. 
            Communities that could be earning together, solving problems together, governing themselves — but aren't. Yet.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-20">
            <a href="#create" className="bg-[#C9A84C] text-[#0B1828] px-10 py-5 font-bold text-sm tracking-[2px] uppercase hover:bg-[#F5C842] transition-all hover:-translate-y-1 shadow-[0_12px_32px_rgba(201,168,76,0.2)]">
              Claim Your Zone →
            </a>
            <a href="#what-is-kore" className="border-2 border-[#C9A84C]/40 text-[#C9A84C] px-10 py-5 font-bold text-sm tracking-[2px] uppercase hover:border-[#C9A84C] transition-all hover:-translate-y-1">
              What is a Kore?
            </a>
          </div>

          {/* Counter Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 border border-[#C9A84C]/15 bg-[#0B1828]/50 backdrop-blur-sm">
            {[
              { label: "Kores Active", value: "0", color: "#AAFF00" },
              { label: "Zones in Kerala", value: "25,254" },
              { label: "Still Grey", value: "25,209" },
              { label: "Earned This Month", value: "₹0" }
            ].map((stat, i) => (
              <div key={i} className="p-6 border-r border-[#C9A84C]/10 last:border-0 text-center">
                <div className="text-3xl font-extrabold text-[#C9A84C] mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {stat.color && <span className="inline-block w-2 h-2 rounded-full bg-[#AAFF00] mr-2 animate-pulse" />}
                  {stat.value}
                </div>
                <div className="text-[9px] uppercase tracking-[2px] text-[#F0E8D5]/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Map + Wizard Section */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto" id="create">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 text-[#C9A84C] text-[10px] uppercase tracking-[3px] mb-4">
            <div className="w-8 h-[1px] bg-[#C9A84C]" />
            Choose Your Zone
            <div className="w-8 h-[1px] bg-[#C9A84C]" />
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Click any grey cell<br />to light it up.
          </h2>
          <p className="text-[#F0E8D5]/60 max-w-xl mx-auto text-sm leading-relaxed">
            This is the Fort Kochi map. 51 zones, 102 initial Kore slots. Every click you make is real — it starts the process of claiming a zone for your community.
          </p>
        </div>

        {/* The Pixel Map Container */}
        <div className="bg-[#060D16] border border-[#C9A84C]/20 p-8 mb-8 relative">
          <div className="flex justify-between items-center mb-6 text-[9px] uppercase tracking-widest text-[#C9A84C]/60">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse" />
              Fort Kochi · 5km Radius · Live Map
            </div>
            <span>51 playable L6 zones · 0 Kores founded</span>
          </div>

          <div 
            className="grid gap-[3px]"
            style={{ 
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` 
            }}
          >
            {gridCells.map((v, i) => (
              <div 
                key={i} 
                onClick={() => selectZone(i, v)}
                className={`aspect-square rounded-[2px] ${getCellClass(i, v)} ${selectedCell === i ? 'ring-4 ring-[#C9A84C] scale-125 z-50 bg-[#C9A84C]! border-2 border-[#F5C842]!' : ''}`}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { color: "#F0E8D520", label: "Available Zone" },
              { color: "#C9A84C", label: "Root Kore" },
              { color: "#6BBFB5", label: "Canopy Kore" },
              { color: "#4895EF40", label: "Water / Backwater" },
              { color: "#E63946", label: "Active Issue" },
              { color: "#4CAF50", label: "Solved" }
            ].map((leg, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] uppercase tracking-wider text-[#F0E8D5]/40">
                <div className="w-3 h-3 rounded-[1px]" style={{ backgroundColor: leg.color, border: '1px solid rgba(240,232,213,0.1)' }} />
                {leg.label}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Panel */}
        <AnimatePresence>
          {isWizardOpen && selectedCell !== null && (
            <motion.div 
              key={`wizard-${selectedCell}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#12243A] border border-[#C9A84C]/40 border-t-4 border-t-[#C9A84C] overflow-hidden"
            >
              {(() => {
                const effectiveStatus = mapOverrides[selectedCell]?.status ?? gridCells[selectedCell];
                const isAvailable = effectiveStatus === 0;
                return (
                  <div className="wizard-content">
                    {!isSuccess ? (
                      <div className="p-8 md:p-12">
                        {isAvailable ? (
                          <div className="flex border-b border-[#C9A84C]/10 mb-12">
                        {["Name Your Kore", "Set Gathering", "Write Charter", "Invite Members"].map((step, i) => (
                          <button 
                            key={i}
                            className={`flex-1 pb-4 text-[10px] uppercase tracking-widest transition-all ${currentStep === i + 1 ? 'text-[#F0E8D5] border-b-2 border-b-[#C9A84C]' : 'text-[#F0E8D5]/30 hover:text-[#F0E8D5]/60'}`}
                            onClick={() => setCurrentStep(i + 1)}
                          >
                            <div className={`w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center font-bold ${currentStep >= i + 1 ? 'bg-[#C9A84C] text-[#0B1828]' : 'bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C]'}`}>
                              {i + 1}
                            </div>
                            <span className="hidden md:inline">{step}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-6 mb-12 pb-6 border-b border-[#C9A84C]/10">
                        <div className="w-16 h-16 bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center text-3xl">
                          {effectiveStatus === 4 ? "👑" : effectiveStatus === 6 ? "🍃" : effectiveStatus === 2 ? "💧" : "🔍"}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-[#F0E8D5] tracking-tight">Zone Insights.</h3>
                          <p className="text-[#C9A84C] text-[10px] uppercase tracking-[3px] font-bold">
                            {effectiveStatus === 4 ? "Root Kore Territory" : 
                             effectiveStatus === 6 ? "Canopy Kore Active" : 
                             effectiveStatus === 2 ? "Protected Water Body" : 
                             effectiveStatus === 8 ? "Active Community Issue" : "Special Zone"}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Step Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7">
                      {isAvailable ? (
                        <>
                          {currentStep === 1 && (
                            <div className="space-y-8">
                              <h3 className="text-2xl font-bold mb-6">Claim your territory.</h3>
                              <div className="space-y-6">
                                <div>
                                  <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">Your Kore Name</label>
                                  <input 
                                    type="text" 
                                    value={koreForm.name}
                                    onChange={(e) => setKoreForm({...koreForm, name: e.target.value})}
                                    placeholder="e.g. Fort Kochi Heritage Kore" 
                                    className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none focus:border-[#C9A84C] transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">What will your Kore focus on?</label>
                                  <select 
                                    value={koreForm.focus}
                                    onChange={(e) => setKoreForm({...koreForm, focus: e.target.value})}
                                    className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none focus:border-[#C9A84C] transition-all cursor-pointer"
                                  >
                                    <option>Community commerce & KOKO Store</option>
                                    <option>Civic action & issue tagging</option>
                                    <option>Heritage & culture preservation</option>
                                    <option>Sustainable living & agriculture</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">Kore Description (shown publicly)</label>
                                  <textarea 
                                    value={koreForm.desc}
                                    onChange={(e) => setKoreForm({...koreForm, desc: e.target.value})}
                                    placeholder="Tell people what your Kore is about..." 
                                    className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none focus:border-[#C9A84C] transition-all min-h-[120px]"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
      
                          {currentStep === 2 && (
                            <div className="space-y-8">
                              <h3 className="text-2xl font-bold mb-6">Weekly Pulse.</h3>
                              <div className="space-y-8">
                                <div>
                                  <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-6">Choose Gathering Day</label>
                                  <div className="grid grid-cols-7 gap-2">
                                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                                      <button 
                                        key={day}
                                        onClick={() => setKoreForm({...koreForm, gatheringDay: day})}
                                        className={`py-3 text-[10px] font-bold uppercase transition-all ${koreForm.gatheringDay === day ? 'bg-[#C9A84C] text-[#0B1828]' : 'bg-[#0B1828]/30 border border-[#C9A84C]/20 text-[#F0E8D5]/40 hover:border-[#C9A84C]/60 hover:text-[#F0E8D5]'}`}
                                      >
                                        {day}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">Start Time</label>
                                    <input 
                                      type="time" 
                                      value={koreForm.startTime}
                                      onChange={(e) => setKoreForm({...koreForm, startTime: e.target.value})}
                                      className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none" 
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">Duration</label>
                                    <select className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none">
                                      <option>60 minutes</option>
                                      <option defaultValue="2 hours">2 hours</option>
                                      <option>Half day</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">Gathering Point Address</label>
                                  <input 
                                    type="text" 
                                    value={koreForm.address}
                                    onChange={(e) => setKoreForm({...koreForm, address: e.target.value})}
                                    placeholder="e.g. Princess Street, Fort Kochi" 
                                    className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none" 
                                  />
                                  <p className="text-[10px] text-[#F0E8D5]/40 mt-3">Your meeting location (250m L7 zone). You'll pin this on the map in the app.</p>
                                </div>
                              </div>
                            </div>
                          )}
    
                          {currentStep === 3 && (
                            <div className="space-y-8">
                              <h3 className="text-2xl font-bold mb-6">Founding Charter.</h3>
                              <div className="space-y-6">
                                <div>
                                  <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">Our Community Stands For</label>
                                  <textarea 
                                    value={koreForm.charter}
                                    onChange={(e) => setKoreForm({...koreForm, charter: e.target.value})}
                                    placeholder="We believe that our neighbourhood deserves better..." 
                                    className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none min-h-[140px]"
                                  />
                                </div>
                                <div className="space-y-3">
                                  <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">We Commit To (3 principles)</label>
                                  <p className="text-[10px] text-[#F0E8D5]/40 italic mb-2">Include these in your main charter above.</p>
                                  <input type="text" placeholder="Principle 1: e.g. Show up. Every week." className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none opacity-50 cursor-not-allowed" disabled />
                                  <input type="text" placeholder="Principle 2: e.g. Tag and solve — no issue goes unnamed." className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none opacity-50 cursor-not-allowed" disabled />
                                  <input type="text" placeholder="Principle 3: e.g. Earnings shared equitably." className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none opacity-50 cursor-not-allowed" disabled />
                                </div>
                              </div>
                            </div>
                          )}
    
                          {currentStep === 4 && (
                            <div className="space-y-8">
                              <h3 className="text-2xl font-bold mb-6">Founding Circle.</h3>
                              <div className="space-y-6">
                                <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/30 p-6 flex items-center justify-between gap-4">
                                  <div className="text-[11px] font-mono text-[#F0E8D5]/60 truncate">
                                    thekommuniti.org/join/{koreForm.name.toLowerCase().replace(/\s+/g, '-') || 'your-kore'}?ref=founder
                                  </div>
                                  <button 
                                    onClick={() => {
                                      const url = `thekommuniti.org/join/${koreForm.name.toLowerCase().replace(/\s+/g, '-') || 'your-kore'}?ref=founder`;
                                      navigator.clipboard.writeText(url);
                                      toast.success("Invite link copied!");
                                    }}
                                    className="flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] px-4 py-2 text-[10px] font-bold uppercase hover:bg-[#C9A84C] hover:text-[#0B1828] transition-all"
                                  >
                                    <Copy size={12} /> Copy
                                  </button>
                                </div>
                                
                                <div className="space-y-3">
                                  <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">Members Invited</label>
                                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {invitees.map((inv, i) => (
                                      <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={i} 
                                        className="flex items-center gap-4 bg-[#0B1828]/30 border border-[#C9A84C]/10 p-3"
                                      >
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: inv.color }}>
                                          {inv.initials}
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-sm font-bold">{inv.name}</div>
                                          <div className={`text-[10px] uppercase tracking-wide ${inv.pending ? 'text-[#C9A84C]' : 'text-[#4CAF50]'}`}>{inv.status}</div>
                                        </div>
                                        {i > 0 && (
                                          <button 
                                            onClick={() => setInvitees(invitees.filter((_, idx) => idx !== i))}
                                            className="text-[#F0E8D5]/20 hover:text-[#E63946] p-2 transition-colors"
                                          >
                                            <X size={16} />
                                          </button>
                                        )}
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
    
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={newMember}
                                    onChange={(e) => setNewMember(e.target.value)}
                                    placeholder="Phone number or username..." 
                                    className="flex-1 bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-sm outline-none focus:border-[#C9A84C]"
                                  />
                                  <button 
                                    onClick={async () => {
                                      if (!newMember) return;
                                      setLoading(true);
                                      try {
                                        const { data, error } = await supabase
                                          .from('profiles')
                                          .select('*')
                                          .or(`username.eq.${newMember},phone_number.eq.${newMember}`)
                                          .maybeSingle();
                                        
                                        if (data) {
                                          if (invitees.find(m => m.name === (data.full_name || data.username))) {
                                            toast.error("Already in circle");
                                          } else {
                                            setInvitees([...invitees, {
                                              name: data.full_name || data.username,
                                              initials: (data.full_name || data.username).substring(0,2).toUpperCase(),
                                              status: "INVITED · AWAITING RESPONSE",
                                              color: `linear-gradient(135deg, ${['#FF6B35', '#4895EF', '#6BBFB5'][Math.floor(Math.random()*3)]}, #C9A84C)`,
                                              pending: true
                                            }]);
                                            setNewMember("");
                                            toast.success("Member found and invited!");
                                          }
                                        } else {
                                          toast.error("User not found on Kommuniti");
                                        }
                                      } catch (e) {
                                        toast.error("Search failed");
                                      } finally {
                                        setLoading(false);
                                      }
                                    }}
                                    className="bg-[#C9A84C] text-[#0B1828] px-6 font-bold text-[10px] uppercase tracking-widest hover:brightness-110 flex items-center gap-2"
                                  >
                                    {loading ? '...' : <Plus size={14} />} Invite
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                          <div className="space-y-6">
                            <h4 className="text-[10px] uppercase tracking-[3px] text-[#C9A84C] font-bold">Community Profile</h4>
                            <div className="p-8 bg-[#0B1828]/40 border border-[#C9A84C]/10 rounded-2xl">
                              <p className="text-[#F0E8D5]/70 leading-relaxed italic">
                                {effectiveStatus === 4 ? "This zone is currently the Root of a growing community. It serves as the administrative and cultural anchor for the surrounding L6 zones." : 
                                 effectiveStatus === 2 ? "This zone contains protected water bodies. Development is restricted to preserve the natural ecosystem and backwater heritage." : 
                                 effectiveStatus === 8 ? "An active issue has been tagged in this zone. The community is currently coordinating resources to resolve it." : 
                                 "This zone is an active part of the Fort Kochi ecosystem, with ongoing community operations and shared governance."}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-[#0B1828]/40 border border-[#C9A84C]/10 rounded-xl flex flex-col justify-between">
                              <div className="text-[9px] uppercase tracking-[2px] text-[#F0E8D5]/40 mb-4">Activity Level</div>
                              <div className="text-xl font-bold text-[#6BBFB5]">High · Weekly</div>
                            </div>
                            <div className="p-6 bg-[#0B1828]/40 border border-[#C9A84C]/10 rounded-xl flex flex-col justify-between">
                              <div className="text-[9px] uppercase tracking-[2px] text-[#F0E8D5]/40 mb-4">Governance</div>
                              <div className="text-xl font-bold text-[#4895EF]">Shared L7</div>
                            </div>
                          </div>

                          <button className="w-full py-4 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] font-bold text-[11px] uppercase tracking-[2px] hover:bg-[#C9A84C] hover:text-[#0B1828] transition-all">
                            View Full Community Details
                          </button>
                        </div>
                      )}
                    </div>


                    {/* Sidebar Info */}
                    <div className="lg:col-span-5">
                      <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 p-8 sticky top-32">
                        {currentStep === 1 ? (
                          <>
                            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-8">
                              <div className="w-8 h-[1px] bg-[#C9A84C]" />
                              Zone Stats
                            </div>

                            {selectedCell !== null && (() => {
                              const cellGeo = MapGeoService.getLatLngForCell(selectedCell, COLS, ROWS, { lat: mapConfig.lat, lng: mapConfig.lng });
                              return (
                                <div className="mb-8 p-4 bg-[#0B1828]/60 border border-[#C9A84C]/20 flex justify-between items-center">
                                  <div>
                                    <p className="text-[8px] uppercase tracking-widest text-white/30 mb-1">Center GPS</p>
                                    <div className="text-[11px] font-mono text-[#C9A84C]">
                                      {cellGeo.lat.toFixed(4)}, {cellGeo.lng.toFixed(4)}
                                    </div>
                                  </div>
                                  <div className="text-[10px] font-bold text-[#F0E8D5]/40 uppercase tracking-widest">
                                    L6 Zone
                                  </div>
                                </div>
                              );
                            })()}

                            <div className="w-24 h-24 bg-[#C9A84C] border-2 border-[#F5C842] shadow-[0_0_30px_rgba(201,168,76,0.3)] mx-auto mb-8 flex items-center justify-center text-[#0B1828]">
                              <Map size={48} />
                            </div>
                            <div className="space-y-6">
                              {[
                                { l: "Available Slots", v: "2 / 2 available" },
                                { l: "Existing Kores", v: zoneStats.existingKores > 0 ? `${zoneStats.existingKores} founded` : "None — you would be FIRST", color: zoneStats.existingKores > 0 ? "#F0E8D5" : "#AAFF00" },
                                { l: "Zone Population", v: `~${zoneStats.population.toLocaleString()} residents` },
                                { l: "KSS Potential", v: `${zoneStats.potential}+ (${zoneStats.potential >= 800 ? 'Forest' : zoneStats.potential >= 600 ? 'Canopy' : 'Branch'})`, color: "#C9A84C" }
                              ].map((s, i) => (
                                <div key={i} className="pb-4 border-b border-[#C9A84C]/10 last:border-0">
                                  <div className="text-[9px] uppercase tracking-[2px] text-[#F0E8D5]/40 mb-1">{s.l}</div>
                                  <div className="text-lg font-bold" style={{ color: s.color || '#F0E8D5' }}>{s.v}</div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-8 p-4 bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[10px] leading-relaxed text-[#F0E8D5]/60 italic">
                              Being the <strong className="text-[#F0E8D5]">first Kore</strong> in a zone earns you permanent Pioneer status and 2× KSS bonus for your first 90 days.
                            </div>
                          </>
                        ) : currentStep === 2 ? (
                          <>
                            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-8">
                              <div className="w-8 h-[1px] bg-[#C9A84C]" />
                              Why Gathering Matters
                            </div>
                            <div className="space-y-8">
                              {[
                                { val: "+10", label: "Physical gathering", desc: "10 KSS points per week. The backbone of your Kore's strength score.", color: "#C9A84C" },
                                { val: "+4", label: "Online check-in", desc: "4 KSS points. Valid when travelling or abroad — keeps your streak alive.", color: "#4895EF" },
                                { val: "+5", label: "Async contribution", desc: "5 Global Reach points. Tag issues remotely, they count for your home Kore.", color: "#6BBFB5" }
                              ].map((m, i) => (
                                <div key={i} className="flex gap-4">
                                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center font-bold text-xs" style={{ background: m.color, color: i === 0 ? '#0B1828' : '#fff' }}>
                                    {m.val}
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold mb-1">{m.label}</div>
                                    <div className="text-[11px] text-[#F0E8D5]/50 leading-relaxed">{m.desc}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="space-y-6">
                            <h4 className="text-sm font-bold text-[#C9A84C] uppercase tracking-widest flex items-center gap-2">
                              <Info size={16} /> Pro Tip
                            </h4>
                            <p className="text-[13px] leading-relaxed text-[#F0E8D5]/70 italic">
                              "The most successful Kores are those that start with a clear, shared purpose. Don't worry about being perfect — just be authentic and consistent."
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Wizard Nav */}
                  {isAvailable && (
                    <div className="mt-12 pt-8 border-t border-[#C9A84C]/10 flex justify-between items-center">
                      <button 
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className={`text-[10px] uppercase tracking-[2px] text-[#F0E8D5]/40 hover:text-[#F0E8D5] transition-all flex items-center gap-2 ${currentStep === 1 ? 'invisible' : ''}`}
                      >
                        <ArrowLeft size={14} /> Back
                      </button>
                      <div className="text-[9px] uppercase tracking-[3px] text-[#F0E8D5]/20">Step {currentStep} of 4</div>
                      <button 
                        onClick={handleNext}
                        className="bg-[#C9A84C] text-[#0B1828] px-10 py-4 font-bold text-[11px] uppercase tracking-[2px] hover:brightness-110 transition-all flex items-center gap-2"
                      >
                        {currentStep === 4 ? 'Found My Kore' : 'Continue'} <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-20 text-center space-y-8">
                  <motion.div 
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="w-24 h-24 bg-[#C9A84C] border-2 border-[#F5C842] shadow-[0_0_50px_rgba(201,168,76,0.5)] mx-auto flex items-center justify-center text-[#0B1828]"
                  >
                    <Sprout size={48} />
                  </motion.div>
                  <h2 className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Your Kore is born.</h2>
                  <p className="text-[#F0E8D5]/60 max-w-lg mx-auto leading-relaxed">
                    Your zone just lit up on the KoKo map. Share your invite link, get 4 more members to join, and you'll be a Seed Kore — earning KO Coins and KSS points from Week 1.
                  </p>
                  <div className="flex justify-center gap-6 pt-6">
                    <button onClick={() => navigate("/profile")} className="bg-[#C9A84C] text-[#0B1828] px-8 py-4 font-bold text-xs uppercase tracking-[2px]">
                      Go to My Kore Dashboard
                    </button>
                    <button onClick={() => navigate("/")} className="border border-[#C9A84C]/30 text-[#C9A84C] px-8 py-4 font-bold text-xs uppercase tracking-[2px]">
                      Back to Hub
                    </button>
                  </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
          </AnimatePresence>
      </section>

      {/* What is a Kore Section */}
      <section className="py-32 px-6 md:px-12 bg-[#0B1828]" id="what-is-kore">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 mb-24">
            <div className="flex-1">
              <div className="flex items-center gap-4 text-[#6BBFB5] text-[10px] uppercase tracking-[4px] mb-8">
                <div className="w-12 h-[1px] bg-[#6BBFB5]" />
                What is a Kore?
              </div>
              <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.9] mb-10" style={{ fontFamily: "'Syne', sans-serif" }}>
                A Kore is your<br />neighbourhood<br />
                <span className="text-[#C9A84C] italic font-[400]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>as it should be.</span>
              </h2>
              <p className="text-[#F0E8D5]/60 text-lg leading-relaxed max-w-xl">
                Not a WhatsApp group. Not a resident association. Not a NGO. A Kore is a community of 5–20 people who gather weekly, act together, earn together, and govern their 1km² zone of the world.
              </p>
            </div>

            <div className="flex-1">
              {/* Anatomy Visual */}
              <div className="bg-[#060D16] border border-[#C9A84C]/15 p-6 md:p-8 mb-6">
                <div className="text-[8px] uppercase tracking-[2px] text-[#C9A84C] mb-6">Anatomy of a Kore Zone</div>
                
                <div className="grid grid-cols-9 gap-[3px] mb-6">
                  {/* Top row */}
                  {[...Array(9)].map((_, i) => (
                    <div key={`t-${i}`} className={`aspect-square rounded-[1px] ${i === 3 ? 'bg-[#E63946] animate-pulse' : 'bg-[#F0E8D5]/5 border border-[#F0E8D5]/10'}`} />
                  ))}
                  
                  {/* Middle Section with Spanned Box */}
                  <div className="aspect-square bg-[#F0E8D5]/5 border border-[#F0E8D5]/10" />
                  <div className="col-span-7 row-span-5 bg-[#C9A84C]/5 border-2 border-[#C9A84C]/30 flex flex-col items-center justify-center p-6 text-center">
                    <div className="text-3xl mb-3">🌀</div>
                    <div className="text-sm font-bold text-[#C9A84C] mb-1">Kore Gathering Point</div>
                    <div className="text-[10px] text-[#F0E8D5]/40 leading-tight">L7 zone · 250m radius<br />Where the Kore meets weekly</div>
                  </div>
                  <div className="aspect-square bg-[#F0E8D5]/5 border border-[#F0E8D5]/10" />
                  
                  {[...Array(8)].map((_, i) => (
                    <div key={`m-${i}`} className="aspect-square bg-[#F0E8D5]/5 border border-[#F0E8D5]/10" />
                  ))}
                  
                  {/* Bottom Area */}
                  <div className="aspect-square bg-[#F0E8D5]/5 border border-[#F0E8D5]/10" />
                  <div className="aspect-square bg-[#4895EF]/15" />
                  <div className="aspect-square bg-[#4CAF50]" />
                  {[...Array(6)].map((_, i) => (
                    <div key={`b-${i}`} className="aspect-square bg-[#F0E8D5]/5 border border-[#F0E8D5]/10" />
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 text-[9.5px] text-[#F0E8D5]/40">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-[#E63946] rounded-[1px]" /> Issue tagged</span>
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-[#4CAF50] rounded-[1px]" /> Issue solved</span>
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-[#C9A84C]/10 border border-[#C9A84C]/40 rounded-[1px]" /> Gathering point</span>
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-[#4895EF]/15 rounded-[1px]" /> Water body</span>
                </div>
              </div>

              {/* DigiPin Info Box */}
              <div className="bg-[#12243A] border border-[#C9A84C]/12 p-6">
                <div className="text-[8px] uppercase tracking-[2px] text-[#6BBFB5] mb-4">Powered by DigiPin</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <div className="text-[#C9A84C] font-bold text-[11px] mb-1 uppercase tracking-wider">L6 = Kore Territory</div>
                    <div className="text-[11px] text-[#F0E8D5]/40">~1km × 1km zone</div>
                  </div>
                  <div>
                    <div className="text-[#6BBFB5] font-bold text-[11px] mb-1 uppercase tracking-wider">L7 = Gathering Point</div>
                    <div className="text-[11px] text-[#F0E8D5]/40">250m radius</div>
                  </div>
                  <div>
                    <div className="text-[#4895EF] font-bold text-[11px] mb-1 uppercase tracking-wider">L9 = Issue Tag</div>
                    <div className="text-[11px] text-[#F0E8D5]/40">15m precision</div>
                  </div>
                  <div>
                    <div className="text-[#FF6B35] font-bold text-[11px] mb-1 uppercase tracking-wider">L8 = Store Address</div>
                    <div className="text-[11px] text-[#F0E8D5]/40">60m precision</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="flex flex-col gap-4">
              {[
                { icon: "🗓", title: "Weekly Gatherings — The Heartbeat", desc: "Every Kore meets once a week at its L7 gathering point. Physical, online, or hybrid. Missing gathering = losing KSS points. Consistent gathering = the foundation of everything that follows — KO Coins, KOKO Store, campaigns.", color: "#C9A84C" },
                { icon: "🏛", title: "6 Rotating Roles — Democratic Governance", desc: "Koordinator · Kreator · Keeper · Kare Lead · Kronicler · Konnector. Every 6 months, roles rotate. No permanent leaders. Everyone leads. Everyone serves.", color: "#6BBFB5" },
                { icon: "📍", title: "Issue Tagging — Your Zone, Your Responsibility", desc: "Members photograph civic problems — waste, water, roads, power. Every tag is pinned to a DigiPin L9 cell on the map. 3 co-tags = Heating. 10+ = Campaign. Campaign solved = permanent green pixel.", color: "#E63946" },
                { icon: "💰", title: "Real Earnings — Not Points, Not Badges", desc: "KO Coins earned through gathering, tagging, and deliveries are real money — withdrawable via UPI to your bank account. Your Kore's KSS score determines your minting rate.", color: "#4CAF50" },
                { icon: "🛒", title: "KOKO Store — Your Kore's Marketplace", desc: "Every Kore member can list products and services on the KOKO Store — artisan goods, organic produce, skills, experiences. Sellers earn 75–80% of every sale.", color: "#4895EF" }
              ].map((f, i) => {
                const IconComponent = getKreateIcon(f.icon);
                return (
                  <div key={i} className="bg-[#12243A] border border-[#C9A84C]/12 p-6 flex gap-6 hover:bg-[#C9A84C]/[0.03] transition-all" style={{ borderLeft: `3px solid ${f.color}` }}>
                    <div className="mt-1 shrink-0" style={{ color: f.color }}>
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold mb-2 uppercase tracking-wide">{f.title}</h4>
                      <p className="text-[11.5px] text-[#F0E8D5]/50 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Tier System Section */}

      {/* Tier System Section */}
      <section className="py-32 px-6 bg-[#0D1E30] border-y border-[#C9A84C]/15">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="flex items-center justify-center gap-4 text-[#FF6B35] text-[10px] uppercase tracking-[4px] mb-8">
              <div className="w-12 h-[1px] bg-[#FF6B35]" />
              The Game Mechanics
              <div className="w-12 h-[1px] bg-[#FF6B35]" />
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>
              Grow your Kore.<br />Light up your zone.
            </h2>
            <p className="text-[#F0E8D5]/60 text-lg max-w-xl mx-auto">
              Your Kore earns a KSS score every week. As your score grows, your zone changes colour on the map — and so do your earnings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 border border-[#C9A84C]/15">
            {[
              { name: "Seed", range: "0 – 199 KSS", color: "#F0E8D560", earns: "20 KO / day" },
              { name: "Root", range: "200 – 399 KSS", color: "#C9A84C", earns: "50 KO / day", active: true },
              { name: "Branch", range: "400 – 599 KSS", color: "#4895EF", earns: "100 KO / day" },
              { name: "Canopy", range: "600 – 799 KSS", color: "#6BBFB5", earns: "200 KO / day" },
              { name: "Forest", range: "800+ KSS", color: "#FF6B35", earns: "500 KO / day" }
            ].map((t, i) => (
              <div key={i} className="p-8 border-r border-[#C9A84C]/10 last:border-0 hover:bg-[#C9A84C]/[0.03] transition-all relative overflow-hidden group">
                <div className="w-10 h-10 rounded-[3px] mb-6 transition-transform group-hover:scale-110" style={{ backgroundColor: t.color, boxShadow: `0 0 20px ${t.color}40` }} />
                <h4 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{t.name}</h4>
                <div className="text-[9px] uppercase tracking-widest mb-8" style={{ color: t.color }}>{t.range}</div>
                
                <div className="space-y-4 mb-8">
                  {["Zone Visibility", "KOKO Store Access", "Role Rotation", "City View Rank"].map((u, j) => (
                    <div key={j} className="flex gap-2 text-[10px] text-[#F0E8D5]/50 leading-tight">
                      <ArrowRight size={10} className="mt-0.5 flex-shrink-0" style={{ color: t.color }} />
                      {u}
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-[#C9A84C]/10">
                  <div className="text-[8px] uppercase tracking-widest text-[#F0E8D5]/30 mb-2">Earnings / Day</div>
                  <div className="text-xl font-bold text-[#4CAF50]">{t.earns}</div>
                </div>
                
                <div className="absolute bottom-0 left-0 w-full h-[3px]" style={{ backgroundColor: t.color }} />
              </div>
            ))}
          </div>

          {/* KSS Progression Track */}
          <div className="mt-16 bg-[#060D16] border border-[#C9A84C]/12 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="text-[10px] uppercase tracking-[3px] text-[#C9A84C]">KSS Progression Track</div>
              <div className="text-[11px] text-[#F0E8D5]/40 italic">11 dimensions · Calculated weekly · Visible to all</div>
            </div>

            <div className="relative h-2 bg-[#F0E8D5]/5 flex mb-6">
              <div className="h-full w-[20%] bg-[#F0E8D5]/20" />
              <div className="h-full w-[20%] bg-[#C9A84C]" />
              <div className="h-full w-[20%] bg-[#4895EF]" />
              <div className="h-full w-[20%] bg-[#6BBFB5]" />
              <div className="h-full w-[20%] bg-[#FF6B35]" />
              
              {/* Progress Dot */}
              <div className="absolute top-1/2 left-[15%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#C9A84C] bg-[#0B1828] shadow-[0_0_15px_rgba(201,168,76,0.5)] animate-pulse" />
            </div>

            <div className="flex justify-between text-[9px] uppercase tracking-widest text-[#F0E8D5]/30 mb-10 font-mono">
              <span>0 — Seed</span>
              <span>200 — Root</span>
              <span>400 — Branch</span>
              <span>600 — Canopy</span>
              <span>800 — Forest</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pt-8 border-t border-[#C9A84C]/10">
              {[
                { l: "Gathering Consistency", v: "Max 100 pts/month" },
                { l: "Member Diversity", v: "Max 150 pts/month" },
                { l: "KOKO Store Listings", v: "Max 80 pts/month" },
                { l: "Global Reach (NEW)", v: "Max 80 pts/month" }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-[11px] font-bold text-[#F0E8D5] mb-2 uppercase tracking-wide">{stat.l}</div>
                  <div className="text-[10px] text-[#F0E8D5]/40">{stat.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Table */}
      <section className="py-32 px-6 bg-[#060D16]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="flex items-center gap-4 text-[#4CAF50] text-[10px] uppercase tracking-[4px] mb-8">
                <div className="w-12 h-[1px] bg-[#4CAF50]" />
                The Economics
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>
                What a Kore<br />actually earns.
              </h2>
              <p className="text-[#F0E8D5]/60 mb-12">
                Based on real data from community commerce models. Actual earnings depend on your KSS tier and activity level.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 p-6">
                  <div className="text-3xl font-bold text-[#C9A84C] mb-1">18×</div>
                  <div className="text-[9px] uppercase tracking-[2px] text-[#F0E8D5]/40">LTV:CAC Ratio</div>
                </div>
                <div className="bg-[#4CAF50]/5 border border-[#4CAF50]/20 p-6">
                  <div className="text-3xl font-bold text-[#4CAF50] mb-1">21d</div>
                  <div className="text-[9px] uppercase tracking-[2px] text-[#F0E8D5]/40">Payback Period</div>
                </div>
              </div>
            </div>

            <div className="border border-[#C9A84C]/20 overflow-hidden">
               <div className="grid grid-cols-4 bg-[#C9A84C]/10 border-b-2 border-[#C9A84C]/30 text-[9px] uppercase tracking-widest font-bold text-[#C9A84C]">
                <div className="p-4">Member Type</div>
                <div className="p-4">₹ Cash</div>
                <div className="p-4">KO Coins</div>
                <div className="p-4 text-[#4CAF50]">Total Value</div>
               </div>
               {[
                { type: "Casual Witness", cash: "₹0", coins: "800", total: "₹320" },
                { type: "Weekend Runner", cash: "₹600", coins: "600", total: "₹840" },
                { type: "Active Player", cash: "₹1,800", coins: "2,000", total: "₹2,600" },
                { type: "Kore Leader", cash: "₹3,500", coins: "5,000", total: "₹5,500" },
                { type: "Kore Koordinator", cash: "₹5,000", coins: "8,000", total: "₹8,200" }
               ].map((row, i) => (
                <div key={i} className="grid grid-cols-4 border-b border-[#C9A84C]/10 hover:bg-[#C9A84C]/[0.03] transition-colors text-[11px]">
                  <div className="p-4 font-bold">{row.type}</div>
                  <div className="p-4 text-[#F0E8D5]/60">{row.cash}</div>
                  <div className="p-4 text-[#F0E8D5]/60">{row.coins}</div>
                  <div className="p-4 text-[#4CAF50] font-bold font-mono">{row.total}</div>
                </div>
               ))}
               <div className="p-4 bg-[#0B1828] text-[9px] text-[#F0E8D5]/30 leading-relaxed">
                  Monthly figures. KO Coin value calculated at ₹0.40/coin. UPI withdrawal available from Day 1.
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(201,168,76,0.1)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-4 text-[#C9A84C] text-[10px] uppercase tracking-[4px] mb-8">
            <div className="w-12 h-[1px] bg-[#C9A84C]" />
            One Last Thing
            <div className="w-12 h-[1px] bg-[#C9A84C]" />
          </div>
          <h2 className="text-6xl md:text-9xl font-extrabold tracking-tighter leading-[0.85] mb-12" style={{ fontFamily: "'Syne', sans-serif" }}>
            The grey map<br />is not a feature.<br />It's a <span className="text-[#C9A84C] italic font-[400]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>question.</span>
          </h2>
          <p className="text-2xl text-[#F0E8D5]/60 italic mb-16" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            What kind of neighbourhood do you want to live in? Grey — or gold?
          </p>
          <a href="#create" className="inline-block bg-[#C9A84C] text-[#0B1828] px-12 py-6 font-bold text-lg tracking-[2px] uppercase hover:bg-[#F5C842] transition-all hover:scale-105 shadow-[0_20px_50px_rgba(201,168,76,0.3)]">
            Claim Your Zone. It's Free. →
          </a>
          <div className="mt-12 text-[11px] text-[#F0E8D5]/30">
            No payment required to found a Kore. App download required for full game access.
          </div>
        </div>
      </section>

      <Footer />

      {/* Global CSS for some effects */}
      <style>{`
        .grid-cols-26 {
          grid-template-columns: repeat(26, minmax(0, 1fr));
        }
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 4px rgba(201,168,76,0.4); }
          50% { box-shadow: 0 0 12px rgba(201,168,76,0.7); }
        }
        .pulse-gold {
          animation: pulse-gold 2.5s infinite;
        }
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px);
          mix-blend-mode: multiply;
        }
      `}</style>
    </div>
  );
};

export default Kreate;
