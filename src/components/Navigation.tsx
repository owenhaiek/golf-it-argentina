
import { NavLink } from "react-router-dom";
import { Flag, Plus, User, UserSearch, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export const Navigation = () => {
  const { t } = useLanguage();
  
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 shadow-lg"
      style={{
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div className="w-full">
        <nav className="w-full">
          <ul className="flex items-center justify-between max-w-xl mx-auto px-4 py-2">
            <NavItem to="/" icon={<Flag className="transition-all duration-200" size={20} />} label={t("common", "home")} />
            <NavItem to="/search-users" icon={<UserSearch className="transition-all duration-200" size={20} />} label={t("common", "search")} />
            <NavItem 
              to="/add-round" 
              icon={<Plus className="transition-all duration-200" size={22} />} 
              label={t("common", "add")}
              className="text-primary" 
            />
            <NavItem to="/profile" icon={<User className="transition-all duration-200" size={20} />} label={t("common", "profile")} />
            <NavItem to="/courses-map" icon={<Map className="transition-all duration-200" size={20} />} label={t("common", "map")} />
          </ul>
        </nav>
      </div>
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
          "flex flex-col items-center justify-center gap-1 py-2 px-3 transition-all duration-200 min-h-[44px] rounded-md",
          "hover:bg-primary/10 active:scale-95 active:bg-primary/20",
          "transform-gpu will-change-transform",
          isActive 
            ? "text-primary bg-primary/5 scale-105" 
            : "text-muted-foreground hover:text-primary/80",
          className
        )
      }
      aria-label={label}
    >
      <div className="transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <span className="text-[9px] font-medium tracking-wider uppercase leading-tight transition-all duration-200">{label}</span>
    </NavLink>
  </li>
);
