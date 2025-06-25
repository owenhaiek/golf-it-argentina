
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface HolesPlayedSelectorProps {
  holesPlayed: "9" | "18" | "27";
  onHolesPlayedChange: (value: "9" | "18" | "27") => void;
  maxHoles?: number;
}

const HolesPlayedSelector = ({ holesPlayed, onHolesPlayedChange, maxHoles = 18 }: HolesPlayedSelectorProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Holes Played</h3>
      <ToggleGroup 
        type="single" 
        value={holesPlayed} 
        onValueChange={(value) => value && onHolesPlayedChange(value as "9" | "18" | "27")}
        className="justify-start"
      >
        <ToggleGroupItem value="9" aria-label="9 holes" className="px-6">
          9 Holes
        </ToggleGroupItem>
        <ToggleGroupItem value="18" aria-label="18 holes" className="px-6">
          18 Holes
        </ToggleGroupItem>
        {maxHoles === 27 && (
          <ToggleGroupItem value="27" aria-label="27 holes" className="px-6">
            27 Holes
          </ToggleGroupItem>
        )}
      </ToggleGroup>
    </div>
  );
};

export default HolesPlayedSelector;
