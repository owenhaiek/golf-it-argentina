
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
import AddRound from "./pages/AddRound";
import AddReservation from "./pages/AddReservation";
import Auth from "./pages/Auth";
import SearchUsers from "./pages/SearchUsers";
import CoursesMap from "./pages/CoursesMap";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

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
                <Route path="/*" element={
                  <AuthGuard>
                    <Routes>
                      <Route element={<Layout />}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/add-round" element={<AddRound />} />
                        <Route path="/add-reservation" element={<AddReservation />} />
                        <Route path="/search-users" element={<SearchUsers />} />
                        <Route path="/courses-map" element={<CoursesMap />} />
                        <Route path="/settings" element={<Settings />} />
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
