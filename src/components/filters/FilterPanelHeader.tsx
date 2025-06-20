
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterPanelHeaderProps {
  onClose: () => void;
}

export const FilterPanelHeader = ({ onClose }: FilterPanelHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4 px-4 flex-shrink-0 mt-2">
      <h3 className="text-lg font-semibold text-foreground">Busca tu cancha indicada</h3>
      <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
        <X size={20} />
      </Button>
    </div>
  );
};
