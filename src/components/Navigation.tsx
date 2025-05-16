
import { NavLink, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Home,
  Book,
  FileUp,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Flag,
  Map,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Navigation = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Implement logout when AuthContext is updated
    navigate('/login');
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30 pb-safe">
      <div className="container flex justify-around items-center h-16 px-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-2 ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`
          }
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </NavLink>

        <NavLink
          to="/courses-map"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-2 ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`
          }
        >
          <Map className="h-5 w-5" />
          <span className="text-xs mt-1">Map</span>
        </NavLink>

        {user && (
          <NavLink
            to="/reservations"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <Book className="h-5 w-5" />
            <span className="text-xs mt-1">Reservations</span>
          </NavLink>
        )}

        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" onInteractOutside={closeDropdown}>
            {user ? (
              <>
                <DropdownMenuLabel>
                  {user?.user_metadata?.full_name || "User"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { navigate('/profile'); closeDropdown(); }}>
                  <User className="mr-2 h-4 w-4" />
                  {t("profile", "profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate('/settings'); closeDropdown(); }}>
                  <Settings className="mr-2 h-4 w-4" />
                  {t("common", "settings")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate('/help'); closeDropdown(); }}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  {t("common", "help")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate('/import-courses'); closeDropdown(); }}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Import Courses
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("auth", "logout")}
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => { navigate('/login'); closeDropdown(); }}>
                  Login
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate('/register'); closeDropdown(); }}>
                  Register
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navigation;
