
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  search: string;
  setSearch: (value: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const SearchBar = ({ search, setSearch, isVisible, onClose }: SearchBarProps) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isVisible && inputRef.current) {
      // Focus immediately to show keyboard
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200); // Delay to let animation play
    }
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <div className="animate-scaleIn">
      <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3 border border-border/50">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          ref={inputRef}
          type="text" 
          placeholder={t("common", "search")} 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto text-base" 
        />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
