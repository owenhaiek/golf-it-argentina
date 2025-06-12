
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthGuard } from "./components/AuthGuard";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Course from "./pages/Course";
import AddRound from "./pages/AddRound";
import AddReservation from "./pages/AddReservation";
import Auth from "./pages/Auth";
import SearchUsers from "./pages/SearchUsers";
import CoursesMap from "./pages/CoursesMap";
import Settings from "./pages/Settings";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import CourseManagerAuth from "./pages/CourseManagerAuth";
import CourseDashboard from "./pages/CourseDashboard";
import AdminGolfCourseManager from "./pages/AdminGolfCourseManager";
import AdminCourseEdit from "./pages/AdminCourseEdit";
import AdminCourseEditList from "./pages/AdminCourseEditList";
import AdminCsvUpload from "./pages/AdminCsvUpload";
import AdminPendingManagers from "./pages/AdminPendingManagers";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/course-manager-auth" element={<CourseManagerAuth />} />
                <Route path="/admin/golf-courses" element={<AdminGolfCourseManager />} />
                <Route path="/admin/course-edit/:id" element={<AdminCourseEdit />} />
                <Route path="/admin/course-edit-list" element={<AdminCourseEditList />} />
                <Route path="/admin/csv-upload" element={<AdminCsvUpload />} />
                <Route path="/admin/pending-managers" element={<AdminPendingManagers />} />
                <Route path="/course-dashboard/:courseId" element={<CourseDashboard />} />
                <Route path="/*" element={
                  <AuthGuard>
                    <Routes>
                      <Route element={<Layout />}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/user/:userId" element={<UserProfile />} />
                        <Route path="/course/:id" element={<Course />} />
                        <Route path="/add-round" element={<AddRound />} />
                        <Route path="/add-reservation" element={<AddReservation />} />
                        <Route path="/search-users" element={<SearchUsers />} />
                        <Route path="/courses-map" element={<CoursesMap />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/search" element={<Search />} />
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
    </QueryClientProvider>
  );
}

export default App;
