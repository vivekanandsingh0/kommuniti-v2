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
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Kreate = () => {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [charCounts, setCharCounts] = useState({ name: 0, desc: 0 });
  const [selectedDay, setSelectedDay] = useState("Fri");
  const [invitees, setInvitees] = useState([
    { name: "Priya Kumar", initials: "PK", status: "Joined · Seed Member", color: "linear-gradient(135deg, #6BBFB5, #4895EF)" },
    { name: "Arun Menon", initials: "AM", status: "Invited · Awaiting response", color: "linear-gradient(135deg, #FF6B35, #C9A84C)", pending: true }
  ]);
  const [newMember, setNewMember] = useState("");
  const navigate = useNavigate();
  const wizardRef = useRef<HTMLDivElement>(null);

  // Map Data Simulation
  const COLS = 26;
  const ROWS = 14;
  const mapData = [
    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,1,1,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
    [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
  ].flat();

  const getCellClass = (v: number) => {
    switch(v) {
      case 1: return "bg-[#4895EF]/10 border border-[#4895EF]/20"; // Water
      case 4: return "bg-[#C9A84C] border border-[#F5C842] shadow-[0_0_12px_rgba(201,168,76,0.5)] pulse-gold"; // Root
      case 5: return "bg-[#4895EF] border border-[#4895EF]/80 shadow-[0_0_8px_rgba(72,149,239,0.4)]"; // Branch
      case 6: return "bg-[#6BBFB5] border border-[#6BBFB5]/80 shadow-[0_0_10px_rgba(107,191,181,0.5)]"; // Canopy
      case 8: return "bg-[#E63946] border border-[#E63946]/80 animate-pulse"; // Issue
      case 9: return "bg-[#4CAF50] border border-[#4CAF50]/80"; // Solved
      default: return "bg-[#F0E8D5]/5 border border-[#F0E8D5]/10 hover:bg-[#C9A84C]/20 hover:border-[#C9A84C]/40 transition-all cursor-pointer hover:scale-110 z-10 hover:shadow-[0_0_15px_rgba(201,168,76,0.3)]"; // Grey
    }
  };

  const selectZone = (idx: number, v: number) => {
    if (v !== 0) return;
    setSelectedCell(idx);
    setIsWizardOpen(true);
    setTimeout(() => {
      wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
    else {
      setIsSuccess(true);
      toast.success("Kore Created Successfully!");
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

          <div className="grid grid-cols-26 gap-[3px]">
            {mapData.map((v, i) => (
              <div 
                key={i} 
                onClick={() => selectZone(i, v)}
                className={`aspect-square rounded-[2px] ${getCellClass(v)} ${selectedCell === i ? 'ring-4 ring-[#C9A84C] scale-125 z-50 bg-[#C9A84C]! border-2 border-[#F5C842]!' : ''}`}
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
          {isWizardOpen && (
            <motion.div 
              ref={wizardRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#12243A] border border-[#C9A84C]/40 border-t-4 border-t-[#C9A84C] overflow-hidden"
            >
              {!isSuccess ? (
                <div className="p-8 md:p-12">
                  {/* Wizard Tabs */}
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

                  {/* Step Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7">
                      {currentStep === 1 && (
                        <div className="space-y-8">
                          <h3 className="text-2xl font-bold mb-6">Claim your territory.</h3>
                          <div className="space-y-6">
                            <div>
                              <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">Your Kore Name</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Fort Kochi Heritage Kore" 
                                className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none focus:border-[#C9A84C] transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">What will your Kore focus on?</label>
                              <select className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none focus:border-[#C9A84C] transition-all cursor-pointer">
                                <option>Community commerce & KOKO Store</option>
                                <option>Civic action & issue tagging</option>
                                <option>Heritage & culture preservation</option>
                                <option>Sustainable living & agriculture</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">Kore Description (shown publicly)</label>
                              <textarea 
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
                                    onClick={() => setSelectedDay(day)}
                                    className={`py-3 text-[10px] font-bold uppercase transition-all ${selectedDay === day ? 'bg-[#C9A84C] text-[#0B1828]' : 'bg-[#0B1828]/30 border border-[#C9A84C]/20 text-[#F0E8D5]/40 hover:border-[#C9A84C]/60 hover:text-[#F0E8D5]'}`}
                                  >
                                    {day}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">Start Time</label>
                                <input type="time" defaultValue="18:00" className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none" />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">Duration</label>
                                <select className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none">
                                  <option>60 minutes</option>
                                  <option selected>2 hours</option>
                                  <option>Half day</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">Gathering Point Address</label>
                              <input type="text" placeholder="e.g. Princess Street, Fort Kochi" className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none" />
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
                                placeholder="We believe that our neighbourhood deserves better..." 
                                className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none min-h-[140px]"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">We Commit To (3 principles)</label>
                              <input type="text" placeholder="Principle 1: e.g. Show up. Every week." className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none" />
                              <input type="text" placeholder="Principle 2: e.g. Tag and solve — no issue goes unnamed." className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none" />
                              <input type="text" placeholder="Principle 3: e.g. Earnings shared equitably." className="w-full bg-[#0B1828]/50 border border-[#C9A84C]/20 p-4 text-[#F0E8D5] outline-none" />
                            </div>
                          </div>
                        </div>
                      )}

                      {currentStep === 4 && (
                        <div className="space-y-8">
                          <h3 className="text-2xl font-bold mb-6">Founding Circle.</h3>
                          <div className="space-y-6">
                            <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/30 p-6 flex items-center justify-between gap-4">
                              <div className="text-[11px] font-mono text-[#F0E8D5]/60 truncate">thekommuniti.org/join/kore/fort-kochi-heritage?ref=founder</div>
                              <button className="flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] px-4 py-2 text-[10px] font-bold uppercase hover:bg-[#C9A84C] hover:text-[#0B1828] transition-all">
                                <Copy size={12} /> Copy
                              </button>
                            </div>
                            
                            <div className="space-y-3">
                              <label className="block text-[10px] uppercase tracking-[3px] text-[#C9A84C] mb-3">Members Invited</label>
                              {invitees.map((inv, i) => (
                                <div key={i} className="flex items-center gap-4 bg-[#0B1828]/30 border border-[#C9A84C]/10 p-3">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: inv.color }}>
                                    {inv.initials}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-bold">{inv.name}</div>
                                    <div className={`text-[10px] uppercase tracking-wide ${inv.pending ? 'text-[#C9A84C]' : 'text-[#4CAF50]'}`}>{inv.status}</div>
                                  </div>
                                  <button className="text-[#F0E8D5]/20 hover:text-[#E63946] p-2">
                                    <X size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={newMember}
                                onChange={(e) => setNewMember(e.target.value)}
                                placeholder="Phone number or username..." 
                                className="flex-1 bg-[#0B1828]/50 border border-[#C9A84C]/20 p-3 text-sm outline-none"
                              />
                              <button onClick={addInvitee} className="bg-[#C9A84C] text-[#0B1828] px-6 font-bold text-[10px] uppercase tracking-widest hover:brightness-110">
                                + Invite
                              </button>
                            </div>
                          </div>
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
                            <div className="w-24 h-24 bg-[#C9A84C] border-2 border-[#F5C842] shadow-[0_0_30px_rgba(201,168,76,0.3)] mx-auto mb-8 flex items-center justify-center text-4xl">
                              🗺
                            </div>
                            <div className="space-y-6">
                              {[
                                { l: "Available Slots", v: "2 / 2 available" },
                                { l: "Existing Kores", v: "None — you would be FIRST", color: "#F0E8D5" },
                                { l: "Zone Population", v: "~1,400 residents" },
                                { l: "KSS Potential", v: "800+ (Forest)", color: "#C9A84C" }
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
                      {currentStep === 4 ? 'Found My Kore 🌱' : 'Continue'} <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-20 text-center space-y-8">
                  <motion.div 
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="w-24 h-24 bg-[#C9A84C] border-2 border-[#F5C842] shadow-[0_0_50px_rgba(201,168,76,0.5)] mx-auto"
                  />
                  <h2 className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Your Kore is born. 🌱</h2>
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
              ].map((f, i) => (
                <div key={i} className="bg-[#12243A] border border-[#C9A84C]/12 p-6 flex gap-6 hover:bg-[#C9A84C]/[0.03] transition-all" style={{ borderLeft: `3px solid ${f.color}` }}>
                  <div className="text-2xl mt-1">{f.icon}</div>
                  <div>
                    <h4 className="text-sm font-bold mb-2 uppercase tracking-wide">{f.title}</h4>
                    <p className="text-[11.5px] text-[#F0E8D5]/50 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
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
