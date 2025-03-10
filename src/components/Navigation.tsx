
import { NavLink } from "react-router-dom";
import { Flag, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 py-6 flex justify-center pointer-events-none">
      <nav className="bg-primary rounded-full shadow-lg pointer-events-auto">
        <ul className="flex items-center h-14 px-3">
          <NavItem to="/" icon={<Flag size={20} />} label="Home" />
          <NavItem 
            to="/add-round" 
            icon={<Plus size={24} />} 
            label="Add"
            className="mx-1 bg-white text-primary rounded-full p-3 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 active:scale-95" 
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
  className = ""
}: { 
  to: string; 
  icon: React.ReactNode;
  label: string;
  className?: string;
}) => (
  <li className="px-2">
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-center transition-all duration-300 ease-in-out",
          className || "p-3 rounded-full min-w-[3rem] relative overflow-hidden",
          isActive 
            ? (className ? "" : "text-white after:absolute after:inset-0 after:bg-white after:opacity-20 after:rounded-full") 
            : "text-white/70 hover:text-white"
        )
      }
      aria-label={label}
    >
      {icon}
    </NavLink>
  </li>
);
