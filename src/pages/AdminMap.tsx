import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  MapPin, 
  Shield, 
  Zap, 
  TrendingUp, 
  ArrowLeft,
  Save,
  Database,
  Upload,
  Globe,
  Plus,
  Trash2,
  Info,
  RefreshCcw,
  CircleDot
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { MapGeoService } from "@/utils/map-geo-service";

const AdminMap = () => {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [activeCity, setActiveCity] = useState("Fort Kochi");
  const [loading, setLoading] = useState(false);
  const [zoneData, setZoneData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Map Configuration (Dynamic)
  const [mapConfig, setMapConfig] = useState({
    lat: 9.9658,
    lng: 76.2421,
    radius: 10 // km
  });

  const { cols: COLS, rows: ROWS } = MapGeoService.calculateGridBounds(mapConfig.radius);
  
  // Local State for the selected cell
  const [editStats, setEditStats] = useState({
    population: 1200,
    potential: 800,
    digipin: "",
    status: 0,
    lat: 0,
    lng: 0
  });

  // Base map data (Calculated Grid)
  const gridCells = Array.from({ length: COLS * ROWS }, (_, i) => 0);

  useEffect(() => {
    // Fetch live map config first
    const fetchConfig = async () => {
      const { data, error } = await supabaseAdmin
        .from('map_config')
        .select('*')
        .eq('city_name', activeCity)
        .maybeSingle();
      
      if (data) {
        setMapConfig({
          lat: data.center_lat,
          lng: data.center_lng,
          radius: data.radius_km
        });
      }
    };

    // Fetch all overrides from DB for this city
    const fetchOverrides = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabaseAdmin
                .from('map_zones')
                .select('*')
                .eq('city_name', activeCity);
            
            if (data) {
                const map: any = {};
                data.forEach((z: any) => {
                    map[z.zone_index] = z;
                });
                setZoneData(map);
            }
        } catch (e) {
            console.error("Error fetching map overrides");
        } finally {
            setLoading(false);
        }
    };
    fetchConfig();
    fetchOverrides();
  }, [activeCity]);

  const handleDeploy = async () => {
    setLoading(true);
    try {
      const { error } = await supabaseAdmin
        .from('map_config')
        .upsert({
          city_name: activeCity,
          center_lat: mapConfig.lat,
          center_lng: mapConfig.lng,
          radius_km: mapConfig.radius,
          is_active: true
        }, { onConflict: 'city_name' });
      
      if (error) throw error;
      toast.success("Live Map Deployed! Syncing to user Kreate hub...");
    } catch (e: any) {
      toast.error("Deployment failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (idx: number, v: number) => {
    setSelectedCell(idx);
    const existing = zoneData[idx];
    const cellGeo = MapGeoService.getLatLngForCell(idx, COLS, ROWS, { lat: mapConfig.lat, lng: mapConfig.lng });
    
    setEditStats({
      population: existing?.population_estimate || 1200,
      potential: existing?.kss_potential || 800,
      digipin: existing?.digipin_code || MapGeoService.generateDigiPin(cellGeo.lat, cellGeo.lng),
      status: existing?.status || v,
      lat: cellGeo.lat,
      lng: cellGeo.lng
    });
  };

  const downloadSampleCSV = () => {
    const headers = ["zone_index", "digipin_code", "population_estimate", "kss_potential", "city_name", "status"];
    const rows = [
      ["50", "KOCHI-L6-50", "1450", "850", "Fort Kochi", "0"],
      ["51", "KOCHI-L6-51", "1200", "600", "Fort Kochi", "1"],
      ["52", "KOCHI-L6-52", "2100", "950", "Fort Kochi", "4"]
    ];
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "kommuniti_map_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Template downloaded!");
  };

  const handleCSVUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const rows = lines.slice(1).filter((l: string) => l.trim() !== "");
      
      setLoading(true);
      try {
        const payload = rows.map((row: string) => {
          const values = row.split(',');
          return {
            zone_index: parseInt(values[0]),
            digipin_code: values[1],
            population_estimate: parseInt(values[2]),
            kss_potential: parseInt(values[3]),
            city_name: values[4] || activeCity,
            status: parseInt(values[5] || "0")
          };
        });

        const { error } = await supabaseAdmin
          .from('map_zones')
          .upsert(payload, { onConflict: 'zone_index' });

        if (error) throw error;
        toast.success(`Successfully imported ${payload.length} zones!`);
        window.location.reload(); 
      } catch (err: any) {
        toast.error("Import failed: Check CSV format. " + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (selectedCell === null) return;
    setIsSaving(true);
    
    try {
        const { error } = await supabaseAdmin
            .from('map_zones')
            .upsert({
                zone_index: selectedCell,
                city_name: activeCity,
                population_estimate: editStats.population,
                kss_potential: editStats.potential,
                digipin_code: editStats.digipin,
                status: editStats.status
            }, { onConflict: 'zone_index' });

        if (error) throw error;
        
        setZoneData({
            ...zoneData,
            [selectedCell]: { ...editStats, zone_index: selectedCell }
        });
        toast.success(`Zone ${selectedCell} updated successfully!`);
    } catch (e: any) {
        toast.error("Save failed: " + (e.message || "Unknown error"));
    } finally {
        setIsSaving(false);
    }
  };

  const getCellClass = (idx: number, baseV: number) => {
    const override = zoneData[idx];
    const v = override ? override.status : baseV;
    
    const isSelected = selectedCell === idx;
    const selectionRing = isSelected ? 'ring-2 ring-white scale-110 z-50' : '';

    switch(v) {
      case 1: return `bg-[#4895EF]/10 border border-[#4895EF]/20 ${selectionRing}`; 
      case 4: return `bg-[#C9A84C] border border-[#F5C842] shadow-[0_0_8px_rgba(201,168,76,0.3)] ${selectionRing}`; 
      default: return `bg-[#F0E8D5]/5 border border-[#F0E8D5]/10 hover:bg-[#C9A84C]/20 cursor-pointer ${selectionRing}`; 
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5] flex flex-col lg:flex-row">
      <aside className="w-full lg:w-80 border-r border-[rgba(201,168,76,0.15)] p-8 flex flex-col bg-[#060D16]">
        <div className="flex items-center gap-3 mb-10">
          <button onClick={() => navigate("/admin")} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-[#C9A84C]" />
          </button>
          <h1 className="text-xl font-extrabold uppercase tracking-widest" style={{ fontFamily: "'Syne', sans-serif" }}>
            Map <span className="text-[#C9A84C]">Manager</span>
          </h1>
        </div>

        <nav className="mb-10 space-y-1">
          <button 
            onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-[rgba(240,232,213,0.3)] hover:bg-white/5 hover:text-[#F0E8D5] transition-all"
          >
            <Users size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Real-time Users</span>
          </button>
          <button 
            onClick={() => navigate("/admin/map")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-sm bg-[rgba(201,168,76,0.1)] text-[#C9A84C] transition-all"
          >
            <MapPin size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Map Intelligence</span>
          </button>
          <button 
            onClick={() => navigate("/admin/kores")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-[rgba(240,232,213,0.3)] hover:bg-white/5 hover:text-[#F0E8D5] transition-all"
          >
            <CircleDot size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Kore Oversight</span>
          </button>
        </nav>

        <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="p-6 bg-[#C9A84C]/5 border border-[#C9A84C]/10 rounded-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <Globe size={14} className="text-[#C9A84C]" /> Grid Deployment
            </h3>
            <div className="space-y-4">
               <div>
                  <label className="text-[9px] uppercase tracking-widest text-white/40 mb-2 block">Center Anchor (GPS)</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={mapConfig.lat}
                      onChange={(e) => setMapConfig({...mapConfig, lat: parseFloat(e.target.value)})}
                      className="w-1/2 bg-[#0B1828] border border-white/10 p-2 text-xs outline-none" 
                      step="0.0001"
                    />
                    <input 
                      type="number" 
                      value={mapConfig.lng}
                      onChange={(e) => setMapConfig({...mapConfig, lng: parseFloat(e.target.value)})}
                      className="w-1/2 bg-[#0B1828] border border-white/10 p-2 text-xs outline-none" 
                      step="0.0001"
                    />
                  </div>
               </div>
               <div>
                  <label className="text-[9px] uppercase tracking-widest text-white/40 mb-2 block">Radius (km)</label>
                  <input 
                    type="number" 
                    value={mapConfig.radius}
                    onChange={(e) => setMapConfig({...mapConfig, radius: parseInt(e.target.value) || 1})}
                    className="w-full bg-[#0B1828] border border-white/10 p-2 text-xs outline-none" 
                  />
               </div>
               <div className="pt-2">
                  <div className="flex justify-between text-[10px] text-white/60 mb-2">
                    <span>Generated Grid:</span>
                    <span className="text-[#C9A84C] font-bold">{COLS}x{ROWS}</span>
                  </div>
                  <p className="text-[9px] text-white/20 italic">Each cell is an L6 (1km x 1km) zone.</p>
               </div>
               <button 
                 onClick={handleDeploy}
                 disabled={loading}
                 className="w-full mt-4 flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0B1828] py-3 text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
               >
                 {loading ? <RefreshCcw size={12} className="animate-spin" /> : <Globe size={12} />}
                 Deploy Live Map
               </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[3px] text-[#C9A84C] block mb-3">Active City</label>
            <select 
              value={activeCity}
              onChange={(e) => setActiveCity(e.target.value)}
              className="w-full bg-[#0B1828] border border-[#C9A84C]/20 p-3 text-sm outline-none focus:border-[#C9A84C]"
            >
              <option>Fort Kochi</option>
              <option>Kochi Core</option>
              <option disabled>Mankulam (Soon)</option>
            </select>
          </div>

          <div className="p-6 bg-[#C9A84C]/5 border border-[#C9A84C]/10 rounded-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <Database size={14} className="text-[#C9A84C]" /> Database Sync
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] uppercase tracking-tighter">
                <span className="text-white/40">Customized Zones</span>
                <span className="text-[#C9A84C] font-bold">{Object.keys(zoneData).length}</span>
              </div>
            </div>
            
            <div className="mt-8 space-y-3">
              <input 
                type="file" 
                id="csv-upload" 
                className="hidden" 
                accept=".csv"
                onChange={handleCSVUpload}
              />
              <button 
                onClick={() => document.getElementById('csv-upload')?.click()}
                className="w-full flex items-center justify-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#C9A84C] hover:text-[#0B1828] transition-all"
              >
                <Upload size={12} /> Bulk Import CSV
              </button>
              <button 
                onClick={downloadSampleCSV}
                className="w-full flex items-center justify-center gap-2 border border-white/10 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-white/40"
              >
                <Info size={12} /> Download Template
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Map View */}
      <main className="flex-1 p-8 lg:p-12 overflow-x-hidden flex flex-col">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Live Grid Oversight</h2>
            <p className="text-sm text-white/40 italic">Click any cell on the grid to modify its live community metadata.</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" /> Live Stream
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 flex-1">
          {/* The Interactive Grid */}
          <div className="xl:col-span-8 bg-[#060D16] border border-[#C9A84C]/20 p-6 relative overflow-x-auto">
            <div 
              className="grid gap-[2px] min-w-[800px]"
              style={{ 
                gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` 
              }}
            >
              {gridCells.map((v, i) => (
                <div 
                  key={i} 
                  onClick={() => handleCellClick(i, v)}
                  className={`aspect-square rounded-[1px] transition-all ${getCellClass(i, v)}`}
                  title={`Index: ${i}`}
                />
              ))}
            </div>
          </div>

          {/* Cell Editor Sidebar */}
          <div className="xl:col-span-4">
            <AnimatePresence mode="wait">
              {selectedCell !== null ? (
                <motion.div 
                  key={selectedCell}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-[#12243A] border border-[#C9A84C]/30 p-8 sticky top-8"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Zone #{selectedCell}</h3>
                      <p className="text-[10px] uppercase tracking-[2px] text-[#C9A84C]">Metadata Editor</p>
                    </div>
                    <div className="p-3 bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-xl">
                      📍
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 bg-[#0B1828] p-4 border border-white/5">
                        <div>
                          <label className="block text-[8px] uppercase tracking-[3px] text-white/30 mb-1">Latitude</label>
                          <div className="text-xs font-mono text-[#C9A84C]">{editStats.lat.toFixed(4)}</div>
                        </div>
                        <div>
                          <label className="block text-[8px] uppercase tracking-[3px] text-white/30 mb-1">Longitude</label>
                          <div className="text-xs font-mono text-[#C9A84C]">{editStats.lng.toFixed(4)}</div>
                        </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-[3px] text-white/40 mb-2">Population Estimate</label>
                      <input 
                        type="number" 
                        value={editStats.population || 0}
                        onChange={(e) => setEditStats({...editStats, population: parseInt(e.target.value) || 0})}
                        className="w-full bg-[#0B1828] border border-[#C9A84C]/20 p-3 text-[#F0E8D5] outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-[3px] text-white/40 mb-2">KSS Potential (Seed-Forest)</label>
                      <input 
                        type="number" 
                        value={editStats.potential || 0}
                        onChange={(e) => setEditStats({...editStats, potential: parseInt(e.target.value) || 0})}
                        className="w-full bg-[#0B1828] border border-[#C9A84C]/20 p-3 text-[#F0E8D5] outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-[3px] text-white/40 mb-2">DigiPin L6 Code</label>
                      <input 
                        type="text" 
                        value={editStats.digipin}
                        onChange={(e) => setEditStats({...editStats, digipin: e.target.value})}
                        className="w-full bg-[#0B1828] border border-[#C9A84C]/20 p-3 text-[#F0E8D5] outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-[3px] text-white/40 mb-2">Manual Override Status</label>
                      <select 
                        value={editStats.status}
                        onChange={(e) => setEditStats({...editStats, status: parseInt(e.target.value)})}
                        className="w-full bg-[#0B1828] border border-[#C9A84C]/20 p-3 text-[#F0E8D5] outline-none focus:border-[#C9A84C]"
                      >
                        <option value={0}>Available Zone (Grey)</option>
                        <option value={1}>Water / Backwater (Blue)</option>
                        <option value={4}>Root Kore (Gold)</option>
                        <option value={8}>Active Issue (Red)</option>
                      </select>
                    </div>

                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full bg-[#C9A84C] text-[#0B1828] py-4 font-bold text-xs uppercase tracking-[3px] flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
                      Update Database Slot
                    </button>
                    
                    <p className="text-[9px] text-center text-white/20 italic leading-relaxed">
                      All changes are live and will reflect instantly for founders in the Kreate Hub.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] border border-dashed border-white/10 flex flex-col items-center justify-center p-12 text-center">
                  <div className="text-4xl opacity-20 mb-6">🖱</div>
                  <h4 className="text-sm font-bold uppercase tracking-[2px] opacity-40">Select a cell to manage</h4>
                  <p className="text-[11px] text-white/20 mt-2">Every pixel represents a 1km² community zone.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <style>{`
        .grid-cols-26 {
          grid-template-columns: repeat(26, minmax(0, 1fr));
        }
      `}</style>
    </div>
  );
};

export default AdminMap;
