
import { NavLink } from "react-router-dom";
import { Flag, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <nav className="bg-white/95 backdrop-blur-md shadow-md border-t border-muted/20 mx-auto w-full">
        <ul className="flex items-center justify-between h-16 max-w-xl mx-auto px-6">
          <NavItem to="/" icon={<Flag size={20} />} label="Home" />
          <NavItem 
            to="/add-round" 
            icon={<Plus size={22} />} 
            label="Add"
            activeClassName="text-primary"
            className="bg-primary text-white rounded-full p-3 shadow-md transition-all duration-300 hover:bg-primary-hover active:scale-95" 
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
  <li className="flex flex-col items-center">
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center gap-1 transition-all duration-200 ease-in-out p-2",
          className || "relative overflow-hidden min-w-[3rem]",
          isActive 
            ? (activeClassName || "text-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full") 
            : "text-muted-foreground hover:text-primary/80"
        )
      }
      aria-label={label}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </NavLink>
  </li>
);
