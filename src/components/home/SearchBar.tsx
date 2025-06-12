
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchBarProps {
  search: string;
  setSearch: (value: string) => void;
  isVisible: boolean;
}

const SearchBar = ({ search, setSearch, isVisible }: SearchBarProps) => {
  const { t } = useLanguage();
  
  if (!isVisible) return null;
  
  return (
    <div className="animate-in slide-in-from-top duration-300 px-4">
      <Input 
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
