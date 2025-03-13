
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useEffect } from "react";
import Home from "./pages/Home";
import AddRound from "./pages/AddRound";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Course from "./pages/Course";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

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

// Component to set meta tags for mobile view
const MetaTagsForMobile = () => {
  useEffect(() => {
    // Add meta tag to hide browser navigation on iOS
    const metaViewport = document.createElement('meta');
    metaViewport.name = 'viewport';
    metaViewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, height=device-height';
    document.head.appendChild(metaViewport);
    
    // Add meta tag for Apple Web App capable
    const metaApple = document.createElement('meta');
    metaApple.name = 'apple-mobile-web-app-capable';
    metaApple.content = 'yes';
    document.head.appendChild(metaApple);
    
    // Add meta tag for status bar style
    const metaStatusBar = document.createElement('meta');
    metaStatusBar.name = 'apple-mobile-web-app-status-bar-style';
    metaStatusBar.content = 'black-translucent';
    document.head.appendChild(metaStatusBar);
    
    // Additional meta tag for Android
    const metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    metaThemeColor.content = '#000000';
    document.head.appendChild(metaThemeColor);
    
    // Fix for iOS height calculation
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    
    return () => {
      document.head.removeChild(metaViewport);
      document.head.removeChild(metaApple);
      document.head.removeChild(metaStatusBar);
      document.head.removeChild(metaThemeColor);
      window.removeEventListener('resize', setAppHeight);
    };
  }, []);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <MetaTagsForMobile />
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

export default App;
