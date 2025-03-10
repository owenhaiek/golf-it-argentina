
import { NavLink } from "react-router-dom";
import { Flag, BarChart, User, Route } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-2 md:py-3">
      <div className="container max-w-lg mx-auto">
        <ul className="flex items-center justify-around">
          <NavItem to="/" icon={<Flag size={24} />} label="Home" />
          <NavItem to="/add-round" icon={<BarChart size={24} />} label="Add Round" />
          <NavItem to="/profile" icon={<User size={24} />} label="Profile" />
          <NavItem to="/roadmap" icon={<Route size={24} />} label="Roadmap" />
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
        `flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ease-in-out
        ${isActive 
          ? "text-primary scale-105 transform" 
          : "text-muted-foreground hover:text-primary hover:scale-105 active:scale-95"
        }`
      }
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </NavLink>
  </li>
);
