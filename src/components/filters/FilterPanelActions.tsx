
import { Button } from "@/components/ui/button";

interface FilterPanelActionsProps {
  onReset: () => void;
  onApply: () => void;
}

export const FilterPanelActions = ({ onReset, onApply }: FilterPanelActionsProps) => {
  return (
    <div className="flex-shrink-0 p-4 bg-card border-t pb-28 pt-6">
      <div className="flex space-x-3">
        <Button onClick={onReset} variant="outline" className="flex-1 h-12 text-base">
          Reset
        </Button>
        <Button onClick={onApply} className="flex-1 h-12 text-base">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};
