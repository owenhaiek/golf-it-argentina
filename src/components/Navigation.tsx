
import { NavLink } from "react-router-dom";
import { Flag, Plus, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <nav className="bg-background/95 backdrop-blur-sm border-t border-border/5">
        <ul className="flex items-center justify-between max-w-xl mx-auto px-4">
          <NavItem to="/" icon={<Flag className="transition-colors" size={20} />} label="Home" />
          <NavItem 
            to="/add-round" 
            icon={<Plus className="transition-colors" size={22} />} 
            label="Add"
            className="text-primary" 
          />
          <NavItem to="/profile" icon={<User className="transition-colors" size={20} />} label="Profile" />
          <NavItem to="/settings" icon={<Settings className="transition-colors" size={20} />} label="Settings" />
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
}: { 
  to: string; 
  icon: React.ReactNode;
  label: string;
  className?: string;
}) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center gap-0.5 py-2 px-3 transition-all duration-200",
          isActive 
            ? "text-primary" 
            : "text-muted-foreground hover:text-primary/80",
          className
        )
      }
      aria-label={label}
    >
      {icon}
      <span className="text-[10px] font-medium tracking-wider uppercase">{label}</span>
    </NavLink>
  </li>
);
