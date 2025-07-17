
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchBarProps {
  search: string;
  setSearch: (value: string) => void;
  isVisible: boolean;
}

const SearchBar = ({ search, setSearch, isVisible }: SearchBarProps) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isVisible && inputRef.current) {
      // Small delay to ensure the animation starts before focusing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <div className="animate-slideInRight">
      <Input 
        ref={inputRef}
        type="text" 
        placeholder={t("common", "search")} 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        className="w-full h-9 text-sm" 
      />
    </div>
  );
};

export default SearchBar;
