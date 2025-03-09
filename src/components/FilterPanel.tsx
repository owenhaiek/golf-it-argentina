
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";

type FilterOptions = {
  holes: string;
  location: string;
};

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const FilterPanel = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}: FilterPanelProps) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  useEffect(() => {
    // Reset filters when panel opens/closes
    setFilters(currentFilters);
  }, [isOpen, currentFilters]);

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = { holes: "", location: "" };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <Card className="rounded-t-xl border-b-0 pb-8 pt-4 px-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filter Courses</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="holes-filter">Number of Holes</Label>
            <RadioGroup
              value={filters.holes}
              onValueChange={(value) => setFilters({ ...filters, holes: value })}
              className="flex flex-wrap gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="holes-all" />
                <Label htmlFor="holes-all">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="9" id="holes-9" />
                <Label htmlFor="holes-9">9 Holes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="18" id="holes-18" />
                <Label htmlFor="holes-18">18 Holes</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location-filter">Location</Label>
            <Input
              id="location-filter"
              type="text"
              placeholder="City or state..."
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="w-1/2"
            >
              Reset
            </Button>
            <Button onClick={handleApplyFilters} className="w-1/2">
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FilterPanel;
