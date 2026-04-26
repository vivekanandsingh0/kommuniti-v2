import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

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

  const fetchProfile = async (currentUser: User) => {
    try {
      console.log("AuthContext: Fetching profile for", currentUser.id);
      
      // Use a race to prevent hanging if the table doesn't exist or network is slow
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 3000)
      );

      const result: any = await Promise.race([profilePromise, timeoutPromise]);
      
      if (result.error) {
        console.warn("AuthContext: Profile fetch returned error:", result.error.message);
        return null;
      }
      return result.data;
    } catch (e) {
      console.error("AuthContext: Profile fetch failed or timed out:", e);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchProfile(user);
      setUser({ ...user, profile });
    }
  };

  useEffect(() => {
    console.log("AuthContext: Initializing...");
    
    // 1. Initial Session Fetch
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("AuthContext: Session retrieved:", session ? "Active" : "None");
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setUser({ ...session.user, profile });
      }
      setLoading(false);
    });

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthContext: Auth State Change Event:", event);
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setUser({ ...session.user, profile });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
