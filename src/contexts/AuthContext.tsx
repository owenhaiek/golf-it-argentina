
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  signOut: async () => {} 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    try {
      console.log("Starting signOut process");
      
      // Clear local storage first
      localStorage.clear();
      sessionStorage.clear();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Supabase signOut error:', error);
      }
      
      console.log("SignOut completed, redirecting to auth");
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error during signOut process:', error);
      window.location.href = '/auth';
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session with better error handling
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        console.log('Initial session retrieved:', session?.user?.id || 'No session');
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener with improved handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;
      
      // Handle different auth events
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("User successfully signed in:", session.user.email);
        setUser(session.user);
        setLoading(false);
        
        // For OAuth flows, ensure we're on the correct page
        if (window.location.pathname === '/' || window.location.pathname === '/auth') {
          console.log("OAuth signin detected, redirecting to home");
          window.location.href = '/home';
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setUser(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log("Token refreshed for user:", session.user.email);
        setUser(session.user);
        setLoading(false);
      } else {
        // For other events, just update the user state
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
