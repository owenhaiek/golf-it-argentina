import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Flag } from "lucide-react";

interface HolesPlayedSelectorProps {
  holesPlayed: "9" | "18" | "27";
  onHolesPlayedChange: (value: "9" | "18" | "27") => void;
  maxHoles?: number;
}

const HolesPlayedSelector = ({ holesPlayed, onHolesPlayedChange, maxHoles = 18 }: HolesPlayedSelectorProps) => {
  const { t } = useLanguage();
  
  const options = [
    { value: "9" as const, label: "9", subtitle: "hoyos", available: true },
    { value: "18" as const, label: "18", subtitle: "hoyos", available: true },
    { value: "27" as const, label: "27", subtitle: "hoyos", available: maxHoles === 27 },
  ].filter(opt => opt.available);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Flag className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-medium text-foreground">
          {t("addRound", "holesPlayed") || "Hoyos a jugar"}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {options.map((option) => {
          const isSelected = holesPlayed === option.value;
          
          return (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => onHolesPlayedChange(option.value)}
              className={`
                relative overflow-hidden rounded-2xl p-4 transition-all duration-200
                ${isSelected 
                  ? 'bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25' 
                  : 'bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50'
                }
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="holes-indicator"
                  className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <div className="relative z-10 flex flex-col items-center">
                <span className={`text-3xl font-bold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {option.label}
                </span>
                <span className={`text-xs mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {option.subtitle}
                </span>
              </div>

              {/* Decorative circles */}
              {isSelected && (
                <>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.1 }}
                    className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white"
                  />
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.05 }}
                    transition={{ delay: 0.1 }}
                    className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white"
                  />
                </>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default HolesPlayedSelector;
