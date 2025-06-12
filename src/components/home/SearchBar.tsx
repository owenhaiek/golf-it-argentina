
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchBarProps {
  onSearch: (value: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="w-full">
      <Input 
        type="text" 
        placeholder={t("common", "search")} 
        onChange={e => onSearch(e.target.value)} 
        className="w-full" 
      />
    </div>
  );
};

export default SearchBar;
