
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

// Helper function to clean up auth tokens to prevent auth limbo states
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Enhanced sign out function with better error handling and cleanup
  const signOut = async () => {
    try {
      console.log("Starting signOut process");
      
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out with better error handling
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Supabase signOut error:', error);
        // Even if signOut fails, we should still redirect since we've cleaned up local state
      }
      
      console.log("SignOut completed, redirecting to auth");
      
      // Force page reload for a clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error during signOut process:', error);
      // Still redirect even if there's an error
      window.location.href = '/auth';
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;
      
      // Always update user state
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Clean up on sign out
      if (event === 'SIGNED_OUT') {
        cleanupAuthState();
      }
      
      // Handle successful sign in from OAuth
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("User successfully signed in via OAuth");
        // Don't redirect here, let the Auth page handle it
      }
    });

    // THEN check for existing session
    const checkInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          cleanupAuthState();
        }
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in initial session check:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    checkInitialSession();

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
