import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate(redirectTo.startsWith("/") ? redirectTo : "/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        toast.success("Check your email for confirmation!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1828] relative flex items-center justify-center p-6">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 168, 76, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 168, 76, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div 
          className="bg-[#0B1828] border border-[rgba(201,168,76,0.2)] p-8 sm:p-12 shadow-2xl rounded-sm"
        >
          {/* Logo */}
          <div className="flex items-center justify-center mb-10 cursor-pointer" onClick={() => navigate("/")}>
            <img src="/kommuniti-new-logo.png" alt="Kommuniti Logo" className="h-10 w-auto object-contain" />
          </div>

          <h2 
            style={{ 
              fontFamily: "'Syne', sans-serif", 
              fontWeight: 700, 
              fontSize: "20px", 
              color: "#C9A84C",
              textAlign: "center",
              marginBottom: "32px",
              textTransform: "uppercase",
              letterSpacing: "2px"
            }}
          >
            {isLogin ? "Sign In" : "Join the Kommuniti"}
          </h2>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden"
              >
                <label 
                  style={{ 
                    fontSize: "10px", 
                    letterSpacing: "2px", 
                    textTransform: "uppercase", 
                    color: "rgba(240, 232, 213, 0.4)",
                    display: "block",
                    marginBottom: "8px"
                  }}
                >
                  Full Name
                </label>
                <input 
                  type="text"
                  required={!isLogin}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent border-b border-[rgba(201,168,76,0.2)] text-[#F0E8D5] py-2 focus:border-[#C9A84C] outline-none transition-colors mb-2"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                />
              </motion.div>
            )}

            <div>
              <label 
                style={{ 
                  fontSize: "10px", 
                  letterSpacing: "2px", 
                  textTransform: "uppercase", 
                  color: "rgba(240, 232, 213, 0.4)",
                  display: "block",
                  marginBottom: "8px"
                }}
              >
                Email Address
              </label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-[rgba(201,168,76,0.2)] text-[#F0E8D5] py-2 focus:border-[#C9A84C] outline-none transition-colors"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              />
            </div>

            <div>
              <label 
                style={{ 
                  fontSize: "10px", 
                  letterSpacing: "2px", 
                  textTransform: "uppercase", 
                  color: "rgba(240, 232, 213, 0.4)",
                  display: "block",
                  marginBottom: "8px"
                }}
              >
                Password
              </label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-[rgba(201,168,76,0.2)] text-[#F0E8D5] py-2 focus:border-[#C9A84C] outline-none transition-colors"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              />
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-[#C9A84C] text-[#0B1828] font-bold py-4 text-[12px] tracking-[2px] uppercase transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              {loading ? "Processing..." : isLogin ? "Access Gateway →" : "Initiate Onboarding →"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              style={{ 
                fontSize: "11px", 
                color: "rgba(240, 232, 213, 0.4)",
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: "1px"
              }}
              className="hover:text-[#C9A84C] transition-colors"
            >
              {isLogin ? "DON'T HAVE AN ACCOUNT? JOIN US" : "ALREADY A MEMBER? SIGN IN"}
            </button>
          </div>
        </div>

        {/* Home Link */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate("/")}
            style={{ 
              fontSize: "10px", 
              color: "rgba(240, 232, 213, 0.3)",
              textTransform: "uppercase",
              letterSpacing: "2px"
            }}
            className="hover:text-[#F0E8D5] transition-colors"
          >
            ← Back to Homepage
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
