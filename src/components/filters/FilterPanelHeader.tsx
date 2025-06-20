
import { Button } from "@/components/ui/button";
import { X, RotateCcw } from "lucide-react";

interface FilterPanelHeaderProps {
  onClose: () => void;
  onReset: () => void;
}

export const FilterPanelHeader = ({ onClose, onReset }: FilterPanelHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4 px-4 flex-shrink-0 mt-2">
      <h3 className="text-lg font-semibold text-foreground">Busca tu cancha indicada</h3>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onReset} className="rounded-full">
          <RotateCcw size={18} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X size={20} />
        </Button>
      </div>
    </div>
  );
};
