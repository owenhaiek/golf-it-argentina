
import { NavLink } from "react-router-dom";
import { Flag, Plus, User } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-3">
      <div className="container max-w-lg mx-auto">
        <ul className="flex items-center justify-around">
          <NavItem to="/" icon={<Flag size={24} />} />
          <NavItem 
            to="/add-round" 
            icon={<Plus size={24} />} 
            className="bg-primary text-white rounded-full p-3 -mt-6 shadow-lg hover:bg-primary-hover transition-all duration-300 hover:scale-110 active:scale-95" 
          />
          <NavItem to="/profile" icon={<User size={24} />} />
        </ul>
      </div>
    </nav>
  );
};

const NavItem = ({ 
  to, 
  icon, 
  className = ""
}: { 
  to: string; 
  icon: React.ReactNode; 
  className?: string;
}) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-center transition-all duration-200 ease-in-out
        ${className || "p-3 rounded-full"}
        ${isActive 
          ? (className ? "" : "bg-primary/10 text-primary") 
          : "text-muted-foreground hover:text-primary"
        }`
      }
    >
      {icon}
    </NavLink>
  </li>
);
