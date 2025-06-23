
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
    let authStateChangeHandled = false;

    // Enhanced session checking with retry logic
    const checkSession = async (retries = 3) => {
      try {
        console.log('Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (retries > 0) {
            console.log(`Retrying session check... (${retries} attempts left)`);
            setTimeout(() => checkSession(retries - 1), 500);
            return;
          }
          cleanupAuthState();
        }
        
        if (mounted && !authStateChangeHandled) {
          console.log('Initial session check:', session?.user?.id || 'No session');
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in session check:', error);
        if (mounted && !authStateChangeHandled) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener with improved handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;
      
      authStateChangeHandled = true;
      
      // Always update user state immediately
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Handle different auth events
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("User successfully signed in");
        // Store a flag to indicate successful login
        localStorage.setItem('golfit_auth_success', 'true');
      }
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        cleanupAuthState();
        localStorage.removeItem('golfit_auth_success');
      }
      
      if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
      }
    });

    // Check for existing session
    checkSession();

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
