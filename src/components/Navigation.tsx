
import { NavLink } from "react-router-dom";
import { Flag, Plus, User, UserSearch, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export const Navigation = () => {
  const { t } = useLanguage();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <nav className="bg-background/95 backdrop-blur-sm border-t border-border/5">
        <ul className="flex items-center justify-between max-w-xl mx-auto px-2">
          <NavItem to="/" icon={<Flag className="transition-colors" size={20} />} label={t("common", "home")} />
          <NavItem to="/search-users" icon={<UserSearch className="transition-colors" size={20} />} label={t("common", "search")} />
          <NavItem 
            to="/add-round" 
            icon={<Plus className="transition-colors" size={22} />} 
            label={t("common", "add")}
            className="text-primary" 
          />
          <NavItem to="/profile" icon={<User className="transition-colors" size={20} />} label={t("common", "profile")} />
          <NavItem to="/courses-map" icon={<Map className="transition-colors" size={20} />} label={t("common", "map")} />
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
          "flex flex-col items-center justify-center gap-0.5 py-2 px-2 transition-all duration-200",
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
