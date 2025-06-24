
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  session: null,
  loading: true, 
  signOut: async () => {} 
});

// Smart cleanup that preserves active OAuth sessions
const smartCleanupAuthState = (preserveActive = false) => {
  if (preserveActive) {
    // Only clean up if there's no active session being processed
    setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          performCleanup();
        }
      });
    }, 1000);
  } else {
    performCleanup();
  }
};

const performCleanup = () => {
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Enhanced sign out function
  const signOut = async () => {
    try {
      console.log("Starting signOut process");
      
      // Clean up auth state
      performCleanup();
      
      // Attempt global sign out
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Supabase signOut error:', error);
      }
      
      console.log("SignOut completed, navigating to auth");
      
      // Use React Router navigation instead of hard redirect
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Error during signOut process:', error);
      navigate('/auth', { replace: true });
    }
  };

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const initializeAuth = async () => {
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          
          if (!mounted) return;
          
          if (event === 'SIGNED_IN' && session) {
            console.log('User signed in successfully');
            setSession(session);
            setUser(session.user);
            setLoading(false);
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            smartCleanupAuthState();
            setSession(null);
            setUser(null);
            setLoading(false);
          } else if (event === 'TOKEN_REFRESHED' && session) {
            console.log('Token refreshed');
            setSession(session);
            setUser(session.user);
          } else {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          }
        });

        // THEN check for existing session with retry logic
        const checkSession = async () => {
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('Error getting session:', error);
              if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying session check (${retryCount}/${maxRetries})`);
                setTimeout(checkSession, 1000 * retryCount);
                return;
              }
              smartCleanupAuthState();
            }
            
            if (mounted) {
              console.log('Initial session check:', session?.user?.id || 'No session');
              setSession(session);
              setUser(session?.user ?? null);
              setLoading(false);
            }
          } catch (error) {
            console.error('Session check error:', error);
            if (mounted) {
              setLoading(false);
            }
          }
        };

        await checkSession();

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
