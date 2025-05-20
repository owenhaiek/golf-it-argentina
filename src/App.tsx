
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
import AdminGolfCourseManager from "./pages/AdminGolfCourseManager";
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

// Handle fullscreen and browser UI hiding - REMOVED viewport meta tag manipulation
const useHideBrowserUI = () => {
  useEffect(() => {
    const hideUI = () => {
      if (document.documentElement.scrollTop === 0) {
        window.scrollTo(0, 1);
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

// Special admin route that only allows access with a specific admin email
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Check if user exists and has the admin email
  // You can replace this with a more robust admin checking mechanism later
  const adminEmails = ["owenhaiek11@gmail.com"];
  
  if (!user || !adminEmails.includes(user.email || "")) {
    return <Navigate to="/" />;
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
                </Route>
                
                {/* Updated route for admin golf course management */}
                <Route path="/admin/course-edit" element={
                  <AdminRoute>
                    <AdminGolfCourseManager />
                  </AdminRoute>
                } />
                
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
