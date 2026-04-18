import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingDown, Calculator, Trophy, Info, ListChecks } from "lucide-react";

interface HandicapInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handicap?: number | null;
}

const HandicapInfoDialog = ({ open, onOpenChange, handicap }: HandicapInfoDialogProps) => {
  const { language } = useLanguage();
  const isEs = language === "es";

  const t = {
    title: isEs ? "¿Cómo funciona el hándicap?" : "How does the handicap work?",
    yourHandicap: isEs ? "Tu hándicap actual" : "Your current handicap",
    notYet: isEs ? "Aún sin calcular" : "Not calculated yet",
    formulaTitle: isEs ? "Fórmula" : "Formula",
    formulaText: isEs
      ? "(Promedio de Score − Par del Campo) × 0.96"
      : "(Average Score − Course Par) × 0.96",
    formulaHint: isEs
      ? "El multiplicador 0.96 es el estándar USGA para el cálculo del hándicap."
      : "The 0.96 multiplier is the USGA standard for handicap calculation.",
    requirementsTitle: isEs ? "Requisitos" : "Requirements",
    req1: isEs
      ? "Necesitás al menos 3 rondas registradas para obtener tu hándicap."
      : "You need at least 3 recorded rounds to get your handicap.",
    req2: isEs
      ? "Se utilizan tus 10 rondas más recientes para mantenerlo actualizado."
      : "Your 10 most recent rounds are used to keep it up to date.",
    tipsTitle: isEs ? "Consejos" : "Tips",
    tip1: isEs
      ? "Cuanto más bajo el hándicap, mejor tu nivel de juego."
      : "The lower the handicap, the better your skill level.",
    tip2: isEs
      ? "Registrá cada ronda para que tu hándicap refleje tu progreso real."
      : "Log every round so your handicap reflects your real progress.",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100vw-1.5rem)] max-w-md sm:mx-auto bg-zinc-900/95 backdrop-blur-xl border border-white/10 max-h-[85vh] overflow-y-auto p-4 sm:p-6 rounded-2xl"
      >
        <DialogHeader className="space-y-2">
          <div className="mx-auto mb-1 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/15 flex items-center justify-center">
            <Calculator className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
          </div>
          <DialogTitle className="text-lg sm:text-xl text-center text-foreground leading-tight">
            {t.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* Current handicap */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl bg-zinc-800/60 border border-white/5 p-3 sm:p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Trophy className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm text-zinc-300 truncate">{t.yourHandicap}</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white shrink-0">
              {handicap !== null && handicap !== undefined ? handicap : "—"}
            </span>
          </motion.div>

          {/* Formula */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="rounded-2xl bg-zinc-800/40 border border-white/5 p-3 sm:p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <h4 className="text-sm font-semibold text-white">{t.formulaTitle}</h4>
            </div>
            <div className="rounded-xl bg-zinc-950/60 border border-white/5 px-3 py-2 text-center font-mono text-[11px] sm:text-sm text-primary break-words">
              {t.formulaText}
            </div>
            <p className="text-xs text-zinc-400 mt-2 leading-snug">{t.formulaHint}</p>
          </motion.div>

          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="rounded-2xl bg-zinc-800/40 border border-white/5 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-white">{t.requirementsTitle}</h4>
            </div>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{t.req1}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{t.req2}</span>
              </li>
            </ul>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="rounded-2xl bg-zinc-800/40 border border-white/5 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-white">{t.tipsTitle}</h4>
            </div>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{t.tip1}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{t.tip2}</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HandicapInfoDialog;
