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
      <DialogContent className="max-w-md mx-3 sm:mx-auto bg-zinc-900/95 backdrop-blur-xl border border-white/10 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
            <Calculator className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-xl text-center text-foreground">
            {t.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Current handicap */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl bg-zinc-800/60 border border-white/5 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-sm text-zinc-300">{t.yourHandicap}</span>
            </div>
            <span className="text-2xl font-bold text-white">
              {handicap !== null && handicap !== undefined ? handicap : "—"}
            </span>
          </motion.div>

          {/* Formula */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="rounded-2xl bg-zinc-800/40 border border-white/5 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-white">{t.formulaTitle}</h4>
            </div>
            <div className="rounded-xl bg-zinc-950/60 border border-white/5 px-3 py-2 text-center font-mono text-sm text-primary">
              {t.formulaText}
            </div>
            <p className="text-xs text-zinc-400 mt-2">{t.formulaHint}</p>
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
