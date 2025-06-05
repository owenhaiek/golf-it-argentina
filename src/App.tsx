
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import Course from "./pages/Course";
import AddRound from "./pages/AddRound";
import Auth from "./pages/Auth";
import Search from "./pages/Search";
import SearchUsers from "./pages/SearchUsers";
import CoursesMap from "./pages/CoursesMap";
import AdminGolfCourseManager from "./pages/AdminGolfCourseManager";
import CourseManagerAuth from "./pages/CourseManagerAuth";
import CourseDashboard from "./pages/CourseDashboard";
import AddGolfCourses from "./pages/AddGolfCourses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/course-manager-auth" element={<CourseManagerAuth />} />
                <Route path="/course-dashboard" element={<CourseDashboard />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="home" element={<Home />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="user/:id" element={<UserProfile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="course/:id" element={<Course />} />
                  <Route path="add-round" element={<AddRound />} />
                  <Route path="search" element={<Search />} />
                  <Route path="search-users" element={<SearchUsers />} />
                  <Route path="courses-map" element={<CoursesMap />} />
                  <Route path="admin" element={<AdminGolfCourseManager />} />
                  <Route path="add-golf-courses" element={<AddGolfCourses />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
