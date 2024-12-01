import { CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Source } from "@/types/source";

interface SearchResultsProps {
  search: string;
  searchResults: Source[] | null;
  isValidUrl: boolean;
  onCreateSource: (url: string) => void;
  onClose: () => void;
}

export const SearchResults = ({
  search,
  searchResults,
  isValidUrl,
  onCreateSource,
  onClose,
}: SearchResultsProps) => {
  const navigate = useNavigate();

  return (
    <>
      <CommandEmpty>
        {isValidUrl ? (
          <CommandGroup heading="Create New">
            <CommandItem onSelect={() => onCreateSource(search)}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Add "{search}"</span>
            </CommandItem>
          </CommandGroup>
        ) : (
          "No results found."
        )}
      </CommandEmpty>
      
      {searchResults && searchResults.length > 0 && (
        <CommandGroup heading="Existing Sources">
          {searchResults.map((source) => (
            <CommandItem
              key={source.id}
              onSelect={() => {
                navigate(`/sources/${source.id}`);
                onClose();
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>{source.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
  );
};