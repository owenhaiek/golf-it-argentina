
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface LocationFilterProps {
  location: string;
  onChange: (location: string) => void;
}

export const LocationFilter = ({ location, onChange }: LocationFilterProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="location-filter" className="text-sm font-medium text-foreground">Location</Label>
      <Input 
        id="location-filter" 
        type="text" 
        placeholder="City or state..." 
        value={location} 
        onChange={e => onChange(e.target.value)}
        className="h-12 text-base"
      />
    </div>
  );
};
