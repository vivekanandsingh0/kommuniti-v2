import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  CircleDot, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar,
  Clock,
  ArrowLeft,
  LayoutDashboard,
  MapPin,
  Settings,
  RefreshCcw,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabaseAdmin } from "@/lib/supabase-admin";
import AdminSidebar from "@/components/admin/AdminSidebar";

const AdminKores = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [kores, setKores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchKores = async (retryCount = 0) => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('kores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // If it's a lock error, wait 500ms and retry once
        if (error.message?.includes("lock") && retryCount < 2) {
          setTimeout(() => fetchKores(retryCount + 1), 500);
          return;
        }
        throw error;
      }
      setKores(data || []);
    } catch (error: any) {
      console.error("Error fetching kores:", error.message);
      toast.error("Fetch failed: " + error.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKores();
  }, []);

  const filteredKores = kores.filter(kore => 
    kore.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    kore.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5] flex">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }} className="text-3xl mb-2">Kore Oversight</h1>
            <p className="text-[rgba(240,232,213,0.4)] text-sm tracking-wide">Managing all active community cells across the Kochi Grid.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={fetchKores}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-[rgba(240,232,213,0.05)] border border-[rgba(201,168,76,0.2)] text-[10px] tracking-[2px] uppercase px-4 py-2 hover:bg-[rgba(201,168,76,0.1)] transition-all disabled:opacity-50"
            >
              <RefreshCcw size={14} className={isRefreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-[rgba(240,232,213,0.03)] border border-[rgba(201,168,76,0.1)] p-6 rounded-sm">
             <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-[#C9A84C]/10 text-[#C9A84C]">
                 <CircleDot size={20} />
               </div>
               <span className="text-[10px] text-[#4CAF50] font-bold tracking-widest">LIVE</span>
             </div>
             <div className="text-2xl font-bold mb-1">{kores.length}</div>
             <div className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)]">Active Kores</div>
          </div>
        </div>

        {/* Kores List */}
        <div className="bg-[rgba(240,232,213,0.02)] border border-[rgba(201,168,76,0.1)] rounded-sm">
          <div className="p-6 border-b border-[rgba(201,168,76,0.1)]">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(240,232,213,0.3)]" size={18} />
              <input 
                type="text" 
                placeholder="Search Kores by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[rgba(240,232,213,0.03)] border border-[rgba(201,168,76,0.1)] rounded-sm py-3 pl-10 pr-4 text-sm focus:border-[#C9A84C] outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[rgba(201,168,76,0.1)] bg-[rgba(240,232,213,0.01)]">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] font-bold">Kore Name</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] font-bold">Founder</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] font-bold">Zone Index</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] font-bold">Founding Date</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(201,168,76,0.05)]">
                {filteredKores.map((kore) => (
                  <tr key={kore.id} className="hover:bg-[rgba(240,232,213,0.01)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#C9A84C] border border-[#F5C842] flex items-center justify-center text-xs font-bold text-[#0B1828]">
                          {kore.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold">{kore.name}</div>
                          <div className="text-[9px] text-[#C9A84C] uppercase tracking-widest">{kore.status} KORE</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-[rgba(240,232,213,0.6)] font-mono">
                        {kore.founder_id?.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-mono text-[rgba(240,232,213,0.4)]">
                        Cell #{kore.zone_index}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-[rgba(240,232,213,0.6)]">
                        <Calendar size={12} /> {new Date(kore.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 text-[rgba(240,232,213,0.3)] hover:text-[#F0E8D5]">
                         <MoreVertical size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminKores;
