import { useUniversalSearch } from "@/hooks/useUniversalSearch";
import { SearchInput } from "../search-results/SearchInput";
import { SearchResults } from "../search-results/SearchResults";
import { UploadOptions } from "./UploadOptions";

interface ContentTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const ContentTypeSelector = ({ value, onValueChange }: ContentTypeSelectorProps) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    isSearching, 
    searchResults, 
    handleSearch 
  } = useUniversalSearch();

  return (
    <div className="space-y-6">
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
        isSearching={isSearching}
      />

      <SearchResults results={searchResults} />

      <UploadOptions value={value} onValueChange={onValueChange} />
    </div>
  );
};