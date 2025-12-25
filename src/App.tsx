import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { AuthGuard } from "./components/AuthGuard";
import { AdminGuard } from "./components/security/AdminGuard";
import { Layout } from "./components/Layout";
import { initializeRevenueCat } from "./services/revenueCat";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import Notifications from "./pages/Notifications";
import UserProfile from "./pages/UserProfile";
import Course from "./pages/Course";
import AddRound from "./pages/AddRound";
import CreateTournament from "./pages/CreateTournament";
import CreateMatch from "./pages/CreateMatch";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import ProfileSetup from "./pages/ProfileSetup";
import Settings from "./pages/Settings";
import CoursesMap from "./pages/CoursesMap";
import NotFound from "./pages/NotFound";
import CourseManagerAuth from "./pages/CourseManagerAuth";
import CourseDashboard from "./pages/CourseDashboard";
import AdminCourseEdit from "./pages/AdminCourseEdit";
import AdminCourseEditList from "./pages/AdminCourseEditList";
import AdminPendingManagers from "./pages/AdminPendingManagers";
import Subscription from "./pages/Subscription";

const queryClient = new QueryClient();

function App() {
  // Initialize RevenueCat for native mobile platforms
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
                <Route path="/course-manager-auth" element={<CourseManagerAuth />} />
                <Route path="/admin/course-edit/:id" element={
                  <AdminGuard>
                    <AdminCourseEdit />
                  </AdminGuard>
                } />
                <Route path="/admin/course-edit-list" element={
                  <AdminGuard>
                    <AdminCourseEditList />
                  </AdminGuard>
                } />
                <Route path="/admin/pending-managers" element={
                  <AdminGuard>
                    <AdminPendingManagers />
                  </AdminGuard>
                } />
                <Route path="/course-dashboard/:courseId" element={<CourseDashboard />} />
                <Route path="/*" element={
                  <AuthGuard>
                    <Routes>
                      {/* Map is the homepage - fullscreen without Layout */}
                      <Route path="/home" element={<CoursesMap />} />
                      
                      {/* Other pages use Layout wrapper */}
                      <Route element={<Layout />}>
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/friends" element={<Friends />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/user/:userId" element={<UserProfile />} />
                        <Route path="/course/:id" element={<Course />} />
                        <Route path="/add-round" element={<AddRound />} />
                        <Route path="/create-tournament" element={<CreateTournament />} />
                        <Route path="/create-match" element={<CreateMatch />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/subscription" element={<Subscription />} />
                      </Route>
                    </Routes>
                  </AuthGuard>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </DarkModeProvider>
    </QueryClientProvider>
  );
}

export default App;
