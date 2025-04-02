
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import AddRound from "./pages/AddRound";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Course from "./pages/Course";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";

// Create a client with updated configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Handle fullscreen and browser UI hiding
const useHideBrowserUI = () => {
  useEffect(() => {
    const hideUI = () => {
      if (document.documentElement.scrollTop === 0) {
        window.scrollTo(0, 1);
      }
      
      // Note: We no longer force fullscreen as this often fails
      // due to browser security restrictions requiring user gestures
    };

    // Set correct viewport height for mobile
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    // Add meta viewport tag to prevent user zooming and set proper scale
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(meta);
    
    // Add CSS to hide browser chrome on iOS/Safari
    const style = document.createElement('style');
    style.textContent = `
      html {
        height: -webkit-fill-available;
        overflow: hidden;
      }
      body {
        height: 100vh;
        height: -webkit-fill-available;
        overflow: auto;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);

    // Initial settings
    setAppHeight();
    setTimeout(hideUI, 100);

    // Setup event listeners
    window.addEventListener('resize', setAppHeight);
    window.addEventListener('resize', hideUI);
    window.addEventListener('orientationchange', () => {
      setTimeout(setAppHeight, 100);
      setTimeout(hideUI, 200);
    });
    document.addEventListener('touchstart', hideUI, { once: false });

    return () => {
      window.removeEventListener('resize', setAppHeight);
      window.removeEventListener('resize', hideUI);
      window.removeEventListener('orientationchange', setAppHeight);
      document.removeEventListener('touchstart', hideUI);
    };
  }, []);
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};

const App = () => {
  useHideBrowserUI();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<Home />} />
                  <Route path="/course/:id" element={<Course />} />
                  <Route path="/add-round" element={<AddRound />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
