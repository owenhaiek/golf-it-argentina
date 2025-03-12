
import { NavLink } from "react-router-dom";
import { Flag, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 pb-safe">
      <nav className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-muted/10 mx-auto max-w-xl">
        <ul className="flex items-center justify-between h-14 px-4">
          <NavItem to="/" icon={<Flag size={20} />} label="Home" />
          <NavItem 
            to="/add-round" 
            icon={<Plus size={24} />} 
            label="Add"
            activeClassName="bg-primary text-white"
            className="bg-accent text-primary rounded-full p-3 shadow-md hover:shadow-lg transition-all duration-300 -mt-6 hover:scale-105 active:scale-95" 
          />
          <NavItem to="/profile" icon={<User size={20} />} label="Profile" />
        </ul>
      </nav>
    </div>
  );
};

const NavItem = ({ 
  to, 
  icon, 
  label,
  className = "",
  activeClassName = ""
}: { 
  to: string; 
  icon: React.ReactNode;
  label: string;
  className?: string;
  activeClassName?: string;
}) => (
  <li className="px-4">
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-center transition-all duration-300 ease-in-out p-2",
          className || "rounded-xl min-w-[2.5rem] relative overflow-hidden",
          isActive 
            ? (activeClassName || "text-primary after:absolute after:inset-0 after:bg-primary/10 after:rounded-xl") 
            : "text-muted-foreground hover:text-primary"
        )
      }
      aria-label={label}
    >
      {icon}
    </NavLink>
  </li>
);
