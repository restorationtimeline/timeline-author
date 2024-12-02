import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
}

export const SearchInput = ({ value, onChange, onSearch, isSearching }: SearchInputProps) => {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type="search"
          placeholder="Search across Google Scholar, Books, YouTube, Wikipedia, and more..."
          className="w-full pr-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Search and import content from multiple sources
      </p>
    </div>
  );
};