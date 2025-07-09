
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

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

  // Check if user needs to complete profile setup
  const checkProfileSetup = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', userId)
        .single();
      
      // If no profile or missing required fields, redirect to setup
      if (!profile || !profile.full_name || !profile.username) {
        window.location.href = '/profile-setup';
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      // If there's an error, assume they need to set up profile
      window.location.href = '/profile-setup';
    }
  };

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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check if user is on password reset page - if so, don't redirect
      const isPasswordReset = window.location.pathname === '/reset-password' || 
                              window.location.hash.includes('access_token') ||
                              window.location.hash.includes('type=recovery');
      
      // Check profile setup for new users - but NOT if they're doing password reset
      if (event === 'SIGNED_IN' && session?.user && !isPasswordReset) {
        setTimeout(() => {
          checkProfileSetup(session.user.id);
        }, 0);
      }
      
      // Clean up on sign out
      if (event === 'SIGNED_OUT') {
        cleanupAuthState();
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        cleanupAuthState();
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
