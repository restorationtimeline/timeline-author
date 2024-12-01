import { CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Source } from "@/types/source";

interface SearchResultsProps {
  search: string;
  searchResults: Source[] | null;
  isValidUrl: boolean;
  onCreateDocument: (url: string) => void;
  onClose: () => void;
}

export const SearchResults = ({
  search,
  searchResults,
  isValidUrl,
  onCreateDocument,
  onClose,
}: SearchResultsProps) => {
  const navigate = useNavigate();

  return (
    <>
      <CommandEmpty>
        {isValidUrl ? (
          <CommandGroup heading="Create New">
            <CommandItem onSelect={() => onCreateDocument(search)}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Add "{search}"</span>
            </CommandItem>
          </CommandGroup>
        ) : (
          "No results found."
        )}
      </CommandEmpty>
      
      {searchResults && searchResults.length > 0 && (
        <CommandGroup heading="Existing Documents">
          {searchResults.map((doc) => (
            <CommandItem
              key={doc.id}
              onSelect={() => {
                navigate(`/sources/${doc.id}`);
                onClose();
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>{doc.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
  );
};