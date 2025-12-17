import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flag } from "lucide-react";
import { motion } from "framer-motion";

interface HoleConfigurationCardProps {
  holes: number;
  holePars: number[];
  holeHandicaps: number[];
  updateHolePar: (holeIndex: number, par: number) => void;
  updateHoleHandicap: (holeIndex: number, handicap: number) => void;
}

const inputStyles = "bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-green-500/50 focus:ring-green-500/20";

export const HoleConfigurationCard: React.FC<HoleConfigurationCardProps> = ({
  holes,
  holePars,
  holeHandicaps,
  updateHolePar,
  updateHoleHandicap,
}) => {
  return (
    <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 overflow-hidden">
      <CardHeader className="border-b border-zinc-800/50">
        <CardTitle className="text-white flex items-center gap-2">
          <Flag className="h-5 w-5 text-green-500" />
          Configuración de Hoyos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: holes }, (_, i) => (
            <motion.div 
              key={i} 
              className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/30 space-y-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
            >
              <div className="font-medium text-center text-green-400 text-sm">
                Hoyo {i + 1}
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Par</Label>
                <Input
                  type="number"
                  min="3"
                  max="6"
                  value={holePars[i] || 4}
                  onChange={(e) => updateHolePar(i, parseInt(e.target.value) || 4)}
                  className={`${inputStyles} text-center text-sm h-8`}
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Handicap</Label>
                <Input
                  type="number"
                  min="1"
                  max={holes}
                  value={holeHandicaps[i] || 1}
                  onChange={(e) => updateHoleHandicap(i, parseInt(e.target.value) || 1)}
                  className={`${inputStyles} text-center text-sm h-8`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
