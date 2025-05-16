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
import SearchUsers from "./pages/SearchUsers";
import UserProfile from "./pages/UserProfile";
import CoursesMap from "./pages/CoursesMap";
import ImportCourses from "./pages/ImportCourses";
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
      
      // Add viewport meta tag to hide browser UI
      const setViewport = () => {
        let metaTag = document.querySelector('meta[name="viewport"]');
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('name', 'viewport');
          document.head.appendChild(metaTag);
        }
        // Set the viewport meta with minimal-ui to hide browser chrome
        metaTag.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui, viewport-fit=cover');
        
        // Add apple-mobile-web-app-capable meta for iOS
        let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
        if (!appleMeta) {
          appleMeta = document.createElement('meta');
          appleMeta.setAttribute('name', 'apple-mobile-web-app-capable');
          appleMeta.setAttribute('content', 'yes');
          document.head.appendChild(appleMeta);
        }
        
        // Add apple-mobile-web-app-status-bar-style meta for iOS
        let statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (!statusBarMeta) {
          statusBarMeta = document.createElement('meta');
          statusBarMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
          statusBarMeta.setAttribute('content', 'black-translucent');
          document.head.appendChild(statusBarMeta);
        }
        
        // For Android
        let themeMeta = document.querySelector('meta[name="theme-color"]');
        if (!themeMeta) {
          themeMeta = document.createElement('meta');
          themeMeta.setAttribute('name', 'theme-color');
          themeMeta.setAttribute('content', '#000000');
          document.head.appendChild(themeMeta);
        }
      };
      
      setViewport();
      
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
          // Silently fail if we can't enter fullscreen
        });
      }
    };

    // Set correct viewport height for mobile
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

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
                  <Route path="/search-users" element={<SearchUsers />} />
                  <Route path="/user/:id" element={<UserProfile />} />
                  <Route path="/courses-map" element={<CoursesMap />} />
                  <Route path="/import-courses" element={<ImportCourses />} />
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
