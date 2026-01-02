import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { hapticLight } from "@/hooks/useDespiaNative";

interface DistanceSliderProps {
  value: number;
  onChange: (value: number) => void;
  maxDistance?: number;
}

export const DistanceSlider = ({ value, onChange, maxDistance = 500 }: DistanceSliderProps) => {
  const handleChange = (values: number[]) => {
    hapticLight();
    onChange(values[0]);
  };

  const getDisplayValue = () => {
    if (value === 0 || value >= maxDistance) return "Sin límite";
    if (value < 1) return `${Math.round(value * 1000)} m`;
    return `${value} km`;
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">Distancia máxima</span>
        </div>
        <motion.span 
          key={value}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full"
        >
          {getDisplayValue()}
        </motion.span>
      </div>

      {/* Slider */}
      <div className="px-1">
        <Slider
          value={[value]}
          onValueChange={handleChange}
          max={maxDistance}
          min={0}
          step={5}
          className="cursor-pointer"
        />
      </div>

      {/* Distance markers */}
      <div className="flex justify-between text-[10px] text-muted-foreground px-1">
        <span>0</span>
        <span>50km</span>
        <span>100km</span>
        <span>250km</span>
        <span>∞</span>
      </div>
    </div>
  );
};
