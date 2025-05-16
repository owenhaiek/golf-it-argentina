import { NavLink } from "react-router-dom";
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
  Plus,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Flag,
  Map,
  FileUp,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface NavigationProps {
  isMobile: boolean;
  toggleSidebar: () => void;
}

const Navigation = ({ isMobile, toggleSidebar }: NavigationProps) => {
  const { user, logout } = useAuth();
  const { t, changeLanguage } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
      navigate('/login');
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <nav className="border-b bg-white/50 backdrop-blur">
      <div className="container flex items-center justify-between px-4 py-2">
        <NavLink to="/" className="flex items-center font-bold">
          <Flag className="mr-2 h-5 w-5 text-primary" />
          {t("common", "appName")}
        </NavLink>

        {/* Mobile Menu Button */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
          </Button>
        )}

        {/* Desktop Navigation and Dropdown */}
        {!isMobile && (
          <div className="flex items-center space-x-4">
            <ul className="flex items-center space-x-4">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground/80 hover:bg-muted"
                    }`
                  }
                >
                  <Home className="mr-2 h-4 w-4" />
                  {t("navigation", "home")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/courses-map"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground/80 hover:bg-muted"
                    }`
                  }
                >
                  <Map className="mr-2 h-4 w-4" />
                  {t("map", "golfCoursesMap")}
                </NavLink>
              </li>
              {user && (
                <li>
                  <NavLink
                    to="/reservations"
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-md text-sm ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground/80 hover:bg-muted"
                      }`
                    }
                  >
                    <Book className="mr-2 h-4 w-4" />
                    {t("reservations", "myReservations")}
                  </NavLink>
                </li>
              )}
            </ul>

            {/* Profile Dropdown */}
            {user ? (
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                      <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Open user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48" onInteractOutside={closeDropdown}>
                  <DropdownMenuLabel>{user?.user_metadata?.full_name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { navigate('/profile'); closeDropdown(); }}>
                    <User className="mr-2 h-4 w-4" />
                    {t("profile", "profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navigate('/settings'); closeDropdown(); }}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t("settings", "settings")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navigate('/help'); closeDropdown(); }}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    {t("common", "help")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <li>
                    <NavLink to="/import-courses" className={({ isActive }) => 
                      `flex items-center px-3 py-2 rounded-md text-sm ${
                        isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:bg-muted"
                      }`
                    }>
                      <FileUp className="mr-2 h-4 w-4" />
                      Importar Canchas
                    </NavLink>
                  </li>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("auth", "logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  {t("auth", "login")}
                </Button>
                <Button onClick={() => navigate('/register')}>{t("auth", "register")}</Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

interface MenuIconProps {
  className?: string;
}

function MenuIcon(props: MenuIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

export default Navigation;
