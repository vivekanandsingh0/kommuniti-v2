import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: (User & { profile?: any }) | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<(User & { profile?: any }) | null>(null);
  const [loading, setLoading] = useState(true);
  const profileFetchGen = useRef(0);

  const fetchProfile = useCallback(async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        console.warn("AuthContext: Profile fetch returned error:", error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.error("AuthContext: Critical profile fetch failure:", e);
      return null;
    }
  }, []);

  const applySessionUser = useCallback(
    async (sessionUser: User | undefined | null) => {
      if (!sessionUser) {
        setUser(null);
        return;
      }

      const gen = ++profileFetchGen.current;
      const profile = await fetchProfile(sessionUser);
      if (gen !== profileFetchGen.current) return;

      setUser({ ...sessionUser, profile });
    },
    [fetchProfile]
  );

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await applySessionUser(session.user);
    }
  }, [applySessionUser]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      await applySessionUser(session?.user ?? null);
      if (mounted) setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;

      // Defer Supabase calls so they don't run inside the auth lock callback.
      setTimeout(async () => {
        if (!mounted) return;
        await applySessionUser(session?.user ?? null);
        if (mounted) setLoading(false);
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applySessionUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
