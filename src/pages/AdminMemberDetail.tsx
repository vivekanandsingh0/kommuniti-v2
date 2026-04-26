import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Shield, 
  Mail, 
  Calendar, 
  Clock, 
  Fingerprint, 
  Globe, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Activity,
  History,
  Lock,
  UserCheck,
  Coins
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { toast } from "sonner";

const AdminMemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(id!);
        if (authError) throw authError;
        
        // Try fetching profile, but don't fail if it doesn't exist yet
        let profile = null;
        try {
          const { data: profileData } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', id!)
            .single();
          profile = profileData;
        } catch (e) {
          console.log("Profile not found or table doesn't exist yet");
        }

        setUser({ ...authData.user, profile });
      } catch (error: any) {
        console.error("Error fetching user detail:", error.message);
        toast.error("Failed to load member details: " + error.message);
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1828] flex items-center justify-center">
        <div className="text-center">
          <Activity className="animate-spin text-[#C9A84C] mx-auto mb-4" size={48} />
          <p className="text-[10px] uppercase tracking-[4px] text-[#C9A84C]">Retrieving Member Payload...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5] flex flex-col">
      {/* Top Header */}
      <header className="p-6 border-b border-[rgba(201,168,76,0.1)] flex items-center justify-between sticky top-0 bg-[#0B1828] z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-[rgba(201,168,76,0.1)] rounded-full transition-colors text-[rgba(240,232,213,0.4)] hover:text-[#C9A84C]"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="text-[10px] uppercase tracking-[3px] text-[rgba(240,232,213,0.4)] mb-1">Member Directory / Detail View</div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }} className="text-xl">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </h1>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button className="bg-[rgba(230,57,70,0.1)] border border-[#E63946]/30 text-[#E63946] text-[10px] font-bold uppercase tracking-widest px-6 py-2 hover:bg-[#E63946] hover:text-[#F0E8D5] transition-all">
            Deactivate Account
          </button>
        </div>
      </header>

      <div className="flex-1 p-6 lg:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Essential Profile */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-[rgba(240,232,213,0.02)] border border-[rgba(201,168,76,0.1)] p-8 text-center rounded-sm">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#0B1828] border-2 border-[rgba(201,168,76,0.4)] mx-auto mb-6 flex items-center justify-center text-4xl font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold mb-2">{user.user_metadata?.full_name || "Name Not Set"}</h2>
                <div className="text-xs text-[rgba(240,232,213,0.4)] mb-6 truncate px-4">{user.email}</div>
                
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.email_confirmed_at ? 'bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/30' : 'bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/30'}`}>
                  {user.email_confirmed_at ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {user.email_confirmed_at ? 'Email Verified' : 'Email Pending'}
                </div>
              </div>

              {/* Security Metrics */}
              <div className="bg-[rgba(240,232,213,0.02)] border border-[rgba(201,168,76,0.1)] p-8 space-y-6">
                <h3 className="text-[10px] uppercase tracking-[3px] text-[rgba(240,232,213,0.3)] mb-4">Security Snapshot</h3>
                <div className="flex items-center justify-between py-3 border-b border-[rgba(201,168,76,0.05)]">
                  <div className="flex items-center gap-3 text-xs text-[rgba(240,232,213,0.6)]">
                    <History size={16} /> 2FA Status
                  </div>
                  <span className="text-[10px] font-bold text-[#E63946] uppercase">Disabled</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[rgba(201,168,76,0.05)]">
                  <div className="flex items-center gap-3 text-xs text-[rgba(240,232,213,0.6)]">
                    <Lock size={16} /> Password Reset
                  </div>
                  <span className="text-[10px] font-bold text-[#6BBFB5] uppercase tracking-widest">N/A</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 text-xs text-[rgba(240,232,213,0.6)]">
                    <UserCheck size={16} /> KYC Verification
                  </div>
                  <span className="text-[10px] font-bold text-[rgba(240,232,213,0.2)] uppercase">Not Started</span>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Intelligence */}
            <div className="lg:col-span-8 space-y-8">
              {/* Identity & Metadata */}
              <div className="bg-[rgba(240,232,213,0.02)] border border-[rgba(201,168,76,0.1)] rounded-sm overflow-hidden">
                <div className="bg-[rgba(240,232,213,0.01)] px-8 py-4 border-b border-[rgba(201,168,76,0.1)] flex items-center gap-3">
                  <Fingerprint size={18} className="text-[#C9A84C]" />
                  <span className="text-[11px] font-bold uppercase tracking-[2px]">System Metadata</span>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-[rgba(240,232,213,0.3)]">Internal User ID</div>
                    <div className="text-sm font-mono text-[#C9A84C]">{user.id}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-[rgba(240,232,213,0.3)]">Authentication Provider</div>
                    <div className="text-sm font-mono text-[#F0E8D5] flex items-center gap-2 capitalize">
                      <Globe size={14} className="text-[#4895EF]" /> {user.app_metadata.provider || "Email"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-[rgba(240,232,213,0.3)]">Creation Date (UTC)</div>
                    <div className="text-sm font-mono text-[#F0E8D5] flex items-center gap-2">
                      <Calendar size={14} className="text-[rgba(240,232,213,0.4)]" /> {new Date(user.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-[rgba(240,232,213,0.3)]">Last Activity Detected</div>
                    <div className="text-sm font-mono text-[#F0E8D5] flex items-center gap-2">
                      <Clock size={14} className="text-[rgba(240,232,213,0.4)]" /> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "First access pending"}
                    </div>
                  </div>
                </div>
              </div>

              {/* App Specific Stats & Coin Management */}
              <div className="bg-[rgba(240,232,213,0.02)] border border-[rgba(201,168,76,0.1)] rounded-sm overflow-hidden">
                <div className="bg-[rgba(240,232,213,0.01)] px-8 py-4 border-b border-[rgba(201,168,76,0.1)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Coins size={18} className="text-[#AAFF00]" />
                    <span className="text-[11px] font-bold uppercase tracking-[2px]">Economic Standing</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-[#AAFF00] font-bold">Live Balance</span>
                </div>
                <div className="p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
                    <div className="text-center md:text-left">
                      <div className="text-[10px] uppercase tracking-widest text-[rgba(240,232,213,0.3)] mb-2">Total KO Coins</div>
                      <div className="text-5xl font-bold text-[#AAFF00]" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {user.profile?.ko_coins || 0}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={async () => {
                          try {
                            const current = user.profile?.ko_coins || 0;
                            const { error } = await supabaseAdmin
                              .from('profiles')
                              .upsert({ id: user.id, ko_coins: current + 100 });
                            if (error) throw error;
                            toast.success("+100 Coins Minted");
                            // Re-fetch logic or local state update
                            setUser({ ...user, profile: { ...user.profile, ko_coins: current + 100 } });
                          } catch (e) {
                            toast.error("Database table 'profiles' not found. Please run the SQL from the plan first.");
                          }
                        }}
                        className="bg-[rgba(170,255,0,0.1)] border border-[#AAFF00]/30 text-[#AAFF00] text-[10px] font-bold uppercase tracking-widest px-4 py-3 hover:bg-[#AAFF00] hover:text-[#0B1828] transition-all"
                      >
                        + Mint 100 KO
                      </button>
                      <button 
                         onClick={async () => {
                          try {
                            const current = user.profile?.ko_coins || 0;
                            if (current < 100) return toast.error("Insufficient balance");
                            const { error } = await supabaseAdmin
                              .from('profiles')
                              .upsert({ id: user.id, ko_coins: current - 100 });
                            if (error) throw error;
                            toast.success("-100 Coins Burned");
                            setUser({ ...user, profile: { ...user.profile, ko_coins: current - 100 } });
                          } catch (e) {
                            toast.error("Database table 'profiles' not found.");
                          }
                        }}
                        className="bg-[rgba(230,57,70,0.1)] border border-[#E63946]/30 text-[#E63946] text-[10px] font-bold uppercase tracking-widest px-4 py-3 hover:bg-[#E63946] hover:text-[#F0E8D5] transition-all"
                      >
                        - Burn 100 KO
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[rgba(201,168,76,0.05)]">
                    {[
                      { label: "Kores Led", value: "0", icon: <Globe size={14} />, color: "#C9A84C" },
                      { label: "Konnects Attended", value: "0", icon: <Calendar size={14} />, color: "#4CAF50" },
                      { label: "Current Wallet", value: "₹0", icon: <Smartphone size={14} />, color: "#4895EF" }
                    ].map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className="text-xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="text-[9px] uppercase tracking-widest text-[rgba(240,232,213,0.3)]">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Raw User Data Preview */}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMemberDetail;
