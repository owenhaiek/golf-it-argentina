
import { NavLink } from "react-router-dom";
import { Flag, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 px-6 py-6 flex justify-center pointer-events-none">
      <nav className="bg-primary rounded-[30px] shadow-lg pointer-events-auto w-full max-w-xl">
        <ul className="flex items-center justify-between h-14 px-4">
          <NavItem to="/" icon={<Flag size={20} />} label="Home" />
          <NavItem 
            to="/add-round" 
            icon={<Plus size={24} />} 
            label="Add"
            activeClassName="bg-white text-primary"
            className="bg-accent text-primary rounded-full p-3 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 active:scale-95" 
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
          "flex items-center justify-center transition-all duration-300 ease-in-out px-8 py-3",
          className || "rounded-full min-w-[4rem] relative overflow-hidden",
          isActive 
            ? (activeClassName || "text-white after:absolute after:inset-0 after:bg-white after:opacity-20 after:rounded-full") 
            : "text-white/70 hover:text-white hover:bg-primary-light hover:rounded-full"
        )
      }
      aria-label={label}
    >
      {icon}
    </NavLink>
  </li>
);
