
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
  
  // Auto-focus the input when the search bar becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  // Handle escape key to clear search and hide search bar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        setSearch('');
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, setSearch]);
  
  if (!isVisible) return null;
  
  return (
    <div className="animate-in slide-in-from-top duration-300 px-4">
      <Input 
        ref={inputRef}
        type="text" 
        placeholder={t("common", "search")} 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        className="w-full" 
      />
    </div>
  );
};

export default SearchBar;
