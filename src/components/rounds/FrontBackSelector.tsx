
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <ToggleGroupItem 
            value="front" 
            aria-label="Front 9 holes" 
            className="relative h-32 sm:h-40 p-0 overflow-hidden rounded-lg border-2 data-[state=on]:border-primary data-[state=on]:border-4 transition-all duration-200 hover:scale-[1.02]"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(/lovable-uploads/b66b4122-bff1-40db-96f3-cd86d8a903af.png)'
              }}
            />
            <div className="absolute inset-0 bg-black/40 data-[state=on]:bg-black/20 transition-colors" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
              <div className="text-lg sm:text-xl font-bold mb-1">Front 9</div>
              <div className="text-sm sm:text-base opacity-90">Holes 1-9</div>
            </div>
          </ToggleGroupItem>
          
          <ToggleGroupItem 
            value="back" 
            aria-label="Back 9 holes" 
            className="relative h-32 sm:h-40 p-0 overflow-hidden rounded-lg border-2 data-[state=on]:border-primary data-[state=on]:border-4 transition-all duration-200 hover:scale-[1.02]"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(/lovable-uploads/8de2faff-5c71-4c09-a5e7-217d1b2a4534.png)'
              }}
            />
            <div className="absolute inset-0 bg-black/40 data-[state=on]:bg-black/20 transition-colors" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
              <div className="text-lg sm:text-xl font-bold mb-1">Back 9</div>
              <div className="text-sm sm:text-base opacity-90">Holes 10-18</div>
            </div>
          </ToggleGroupItem>
        </ToggleGroup>
      </CardContent>
    </Card>
  );
};

export default FrontBackSelector;
