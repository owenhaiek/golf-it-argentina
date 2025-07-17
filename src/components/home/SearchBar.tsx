
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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
      inputRef.current.focus();
    }
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <div className="animate-slideInRight flex items-center gap-2">
      <Input 
        ref={inputRef}
        type="text" 
        placeholder={t("common", "search")} 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        className="w-full h-9 text-sm" 
      />
      <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0 h-9 w-9">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SearchBar;
