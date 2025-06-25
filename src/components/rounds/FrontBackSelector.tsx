
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface FrontBackSelectorProps {
  selectedSide: "front" | "back";
  onSideChange: (side: "front" | "back") => void;
}

const FrontBackSelector = ({ selectedSide, onSideChange }: FrontBackSelectorProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Select 9 Holes</CardTitle>
        <CardDescription>
          Choose which 9 holes you played
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ToggleGroup 
          type="single" 
          value={selectedSide} 
          onValueChange={(value) => value && onSideChange(value as "front" | "back")}
          className="grid grid-cols-2 gap-3"
        >
          <ToggleGroupItem 
            value="front" 
            aria-label="Front 9 holes" 
            className="flex items-center gap-2 h-12 px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <div className="text-center">
              <div className="font-medium">Front 9</div>
              <div className="text-xs opacity-80">Holes 1-9</div>
            </div>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="back" 
            aria-label="Back 9 holes" 
            className="flex items-center gap-2 h-12 px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <div className="text-center">
              <div className="font-medium">Back 9</div>
              <div className="text-xs opacity-80">Holes 10-18</div>
            </div>
            <ArrowRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </CardContent>
    </Card>
  );
};

export default FrontBackSelector;
