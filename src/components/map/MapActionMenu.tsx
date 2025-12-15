import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Target, Trophy, Swords } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MapActionMenuProps {
  onOpenChange?: (isOpen: boolean) => void;
}

export const MapActionMenu = ({ onOpenChange }: MapActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  const actions = [
    {
      icon: Target,
      label: t('profile', 'addRound'),
      description: t('addRound', 'selectCourse'),
      route: '/add-round',
      color: 'bg-primary'
    },
    {
      icon: Trophy,
      label: t('tournaments', 'createTournament'),
      description: t('tournaments', 'tournamentDetails'),
      route: '/create-tournament',
      color: 'bg-amber-500'
    },
    {
      icon: Swords,
      label: t('matches', 'challengeFriend'),
      description: t('matches', 'matchDetails'),
      route: '/create-match',
      color: 'bg-blue-500'
    }
  ];

  const handleAction = (route: string) => {
    setIsOpen(false);
    setTimeout(() => navigate(route), 150);
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[5] bg-black/40 transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Action items */}
      <div 
        className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-3 items-center"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {actions.map((action, index) => (
          <button
            key={action.route}
            onClick={() => handleAction(action.route)}
            className={`flex items-center gap-4 bg-background/95 border shadow-xl rounded-2xl p-5 min-w-[300px] transition-all duration-200 ${
              isOpen 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8 pointer-events-none'
            }`}
            style={{ 
              transitionDelay: isOpen ? `${index * 50}ms` : `${(actions.length - 1 - index) * 30}ms`
            }}
          >
            <div className={`w-14 h-14 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <action.icon className="w-7 h-7 text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-lg">{action.label}</p>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Main action button */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10" 
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <button
          onClick={toggleMenu}
          className={`h-16 w-16 rounded-full bg-primary shadow-xl shadow-primary/40 flex items-center justify-center transition-all duration-200 active:scale-110 ${
            isOpen ? 'rotate-45' : 'rotate-0'
          }`}
        >
          {isOpen ? (
            <X className="w-7 h-7 text-primary-foreground" />
          ) : (
            <Plus className="w-7 h-7 text-primary-foreground" />
          )}
        </button>
      </div>
    </>
  );
};
