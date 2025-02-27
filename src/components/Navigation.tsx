
import { NavLink } from "react-router-dom";
import { Home, Search, User } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-2 md:py-3">
      <div className="container max-w-lg mx-auto">
        <ul className="flex items-center justify-around">
          <NavItem to="/" icon={<Home size={24} />} label="Home" />
          <NavItem to="/search" icon={<Search size={24} />} label="Search" />
          <NavItem to="/profile" icon={<User size={24} />} label="Profile" />
        </ul>
      </div>
    </nav>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors
        ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary"}`
      }
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </NavLink>
  </li>
);
