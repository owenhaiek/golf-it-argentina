
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input className="pl-10" placeholder="Search golf courses..." />
      </div>
      <div className="text-center text-muted-foreground py-8">
        Enter a search term to find golf courses
      </div>
    </div>
  );
};

export default Search;
