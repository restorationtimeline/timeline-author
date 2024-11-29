import React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const CommandPalette = () => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["documents", search],
    queryFn: async () => {
      if (!isValidUrl(search)) return [];
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .ilike("identifiers->>url", `%${search}%`)
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!search && isValidUrl(search),
  });

  const handleCreateDocument = async (url: string) => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .insert({
          name: url,
          type: "url",
          identifiers: { url },
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Document created",
        description: "The URL has been added to your documents.",
      });

      setOpen(false);
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create document. Please try again.",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Type a command or paste a URL..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          {isValidUrl(search) ? (
            <CommandGroup heading="Create New">
              <CommandItem
                onSelect={() => handleCreateDocument(search)}
              >
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
                  navigate(`/document/${doc.id}`);
                  setOpen(false);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>{doc.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => {
              navigate("/");
              setOpen(false);
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Documents</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};