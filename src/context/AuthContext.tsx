import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: (User & { profile?: any }) | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<(User & { profile?: any }) | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const profileFetchGen = useRef(0);

  const fetchAdminFlag = useCallback(async (userId: string, profile: { is_admin?: boolean } | null) => {
    if (profile && typeof profile.is_admin === "boolean") {
      return profile.is_admin;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) return !!data.is_admin;
    return false;
  }, []);

  const fetchProfile = useCallback(async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, ko_coins, is_admin, is_approved_volunteer")
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

  const ensureProfile = useCallback(async (currentUser: User) => {
    let profile = await fetchProfile(currentUser);
    if (profile) return profile;

    const fullName =
      (currentUser.user_metadata?.full_name as string | undefined) ||
      currentUser.email?.split("@")[0] ||
      "Member";

    const { error } = await supabase.from("profiles").insert({
      id: currentUser.id,
      full_name: fullName,
    });

    if (error && !/duplicate|unique|409/i.test(error.message)) {
      console.warn("AuthContext: Could not create profile row:", error.message);
      return null;
    }

    return fetchProfile(currentUser);
  }, [fetchProfile]);

  const applySessionUser = useCallback(
    async (sessionUser: User | undefined | null) => {
      if (!sessionUser) {
        setUser(null);
        setIsAdmin(false);
        return;
      }

      const gen = ++profileFetchGen.current;
      const profile = await ensureProfile(sessionUser);
      const admin = await fetchAdminFlag(sessionUser.id, profile);
      if (gen !== profileFetchGen.current) return;

      setUser({ ...sessionUser, profile });
      setIsAdmin(admin);
    },
    [ensureProfile, fetchAdminFlag]
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
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
