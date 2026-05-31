import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Shield, 
  Search, 
  Filter, 
  MoreVertical, 
  CircleDot, 
  Coins,
  ArrowLeft,
  Settings,
  LayoutDashboard,
  RefreshCcw,
  Mail,
  Calendar,
  Clock,
  MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { adminDb } from "@/lib/admin-db";
import AdminSidebar from "@/components/admin/AdminSidebar";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchRealUsers = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await adminDb
        .from("profiles")
        .select("id, full_name, ko_coins, is_admin, is_approved_volunteer")
        .order("full_name", { ascending: true });
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error.message);
      toast.error("Failed to fetch members: " + error.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRealUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalKoCoins = users.reduce((sum, user) => sum + (Number(user.ko_coins) || 0), 0);

  const stats = [
    { label: "Real Members", value: users.length.toString(), trend: "Live", icon: <Users size={20} />, color: "#C9A84C" },
    { label: "Active Kores", value: "0", trend: "Pending", icon: <CircleDot size={20} />, color: "#6BBFB5" },
    {
      label: "KO Coins",
      value: totalKoCoins.toLocaleString(),
      trend: "In circulation",
      icon: <Coins size={20} />,
      color: "#FF6B35",
    },
    { label: "System Status", value: "Healthy", trend: "100%", icon: <Shield size={20} />, color: "#E63946" },
  ];

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5] flex">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }} className="text-3xl mb-2">User Directory</h1>
            <p className="text-[rgba(240,232,213,0.4)] text-sm tracking-wide">Member profiles from Kommuniti (run admin_security.sql for access).</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={fetchRealUsers}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-[rgba(240,232,213,0.05)] border border-[rgba(201,168,76,0.2)] text-[10px] tracking-[2px] uppercase px-4 py-2 hover:bg-[rgba(201,168,76,0.1)] transition-all disabled:opacity-50"
            >
              <RefreshCcw size={14} className={isRefreshing ? "animate-spin" : ""} />
              Refresh Data
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[rgba(240,232,213,0.03)] border border-[rgba(201,168,76,0.1)] p-6 rounded-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[rgba(240,232,213,0.05)] rounded-sm" style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <span className="text-[10px] text-[#4CAF50] font-bold tracking-widest">{stat.trend}</span>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{stat.value}</div>
              <div className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* User Management Section */}
        <div className="bg-[rgba(240,232,213,0.02)] border border-[rgba(201,168,76,0.1)] rounded-sm">
          <div className="p-6 border-b border-[rgba(201,168,76,0.1)]">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(240,232,213,0.3)]" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or User ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[rgba(240,232,213,0.03)] border border-[rgba(201,168,76,0.1)] rounded-sm py-3 pl-10 pr-4 text-sm focus:border-[#C9A84C] outline-none transition-all"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-[rgba(240,232,213,0.3)]">
                <RefreshCcw size={40} className="mx-auto mb-4 animate-spin" />
                <p className="uppercase tracking-[3px] text-xs">Loading member profiles...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[rgba(201,168,76,0.1)] bg-[rgba(240,232,213,0.01)]">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] font-bold">Member Information</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] font-bold">Created At</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] font-bold">KO Coins</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] font-bold">Roles</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(201,168,76,0.05)]">
                  {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className="hover:bg-[rgba(240,232,213,0.01)] transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#0B1828] border border-[rgba(201,168,76,0.3)] flex items-center justify-center text-xs font-bold text-[#F0E8D5]">
                            {user.full_name?.charAt(0).toUpperCase() || user.id.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold flex items-center gap-2">
                              {user.full_name || `Member ${user.id.substring(0, 8)}`}
                              {user.is_admin && <Shield size={12} className="text-[#C9A84C]" title="Admin" />}
                            </div>
                            <div className="text-[9px] text-[rgba(240,232,213,0.4)] font-mono tracking-tight uppercase">
                              ID: {user.id.substring(0, 18)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-[rgba(240,232,213,0.6)]">
                          <Calendar size={12} />{" "}
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-[rgba(240,232,213,0.6)]">
                          <Coins size={12} /> {user.ko_coins ?? 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {user.is_admin && (
                            <span className="text-[10px] uppercase tracking-wider text-[#C9A84C]">Admin</span>
                          )}
                          {user.is_approved_volunteer && (
                            <span className="text-[10px] uppercase tracking-wider text-[#6BBFB5]">Volunteer</span>
                          )}
                          {!user.is_admin && !user.is_approved_volunteer && (
                            <span className="text-[10px] uppercase tracking-wider text-[rgba(240,232,213,0.4)]">Member</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[10px] uppercase tracking-widest text-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                          View Details →
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-[rgba(240,232,213,0.2)]">
                        <Mail size={40} className="mx-auto mb-4" />
                        <p className="uppercase tracking-[3px] text-xs">No matching members found in Auth Directory</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="p-6 border-t border-[rgba(201,168,76,0.1)] flex justify-between items-center">
            <p className="text-[10px] text-[rgba(240,232,213,0.4)] uppercase tracking-widest">
              Live member profiles • {filteredUsers.length} listed
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-1 border border-[rgba(201,168,76,0.1)] text-[10px] uppercase tracking-widest opacity-50 cursor-not-allowed">Export CSV</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
