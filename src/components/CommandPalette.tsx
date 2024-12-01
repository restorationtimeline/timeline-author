import React from "react";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SearchResults } from "./command-palette/SearchResults";
import { FileUploadHandler } from "./command-palette/FileUploadHandler";
import { isValidUrl, formatUrl } from "@/utils/urlUtils";
import { Source } from "@/types/source";
import { createNotification } from "@/utils/notifications";

export const CommandPalette = () => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const navigate = useNavigate();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["sources", search],
    queryFn: async () => {
      if (!isValidUrl(search)) return [];
      const { data, error } = await supabase
        .from("sources")
        .select("*")
        .ilike("identifiers->>url", `%${search}%`)
        .limit(5);

      if (error) throw error;
      return (data || []) as Source[];
    },
    enabled: !!search && isValidUrl(search),
  });

  const handleCreateDocument = async (url: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await createNotification(
          "Authentication Required",
          "You must be logged in to add sources"
        );
        return;
      }

      const formattedUrl = formatUrl(url);
      
      const { data, error } = await supabase
        .from("sources")
        .insert({
          name: formattedUrl,
          type: "webpage",
          identifiers: { url: formattedUrl, category: "webpage" },
          status: "pending",
          uploaded_by: session.user.id
        })
        .select()
        .single();

      if (error) throw error;

      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          source_id: data.id,
          task_name: 'Categorize the Source',
          status: 'completed',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        });

      if (taskError) {
        console.error("Error creating task:", taskError);
      }

      const { error: crawlError } = await supabase.functions.invoke('crawl-website', {
        body: { url: formattedUrl }
      });

      if (crawlError) {
        console.error("Error triggering crawl:", crawlError);
        await createNotification(
          "Warning",
          "Document created but crawling failed to start. Please try again from the crawl queue."
        );
      } else {
        await createNotification(
          "Success",
          "Document created and crawling started."
        );
      }

      setOpen(false);
      navigate("/crawl-queue");
    } catch (error) {
      await createNotification(
        "Error",
        "Failed to create document. Please try again."
      );
    }
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === " ") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Type a command or paste a URL..." 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => setOpen(false)}>
              <Upload className="mr-2 h-4 w-4" />
              <span>Upload Document</span>
            </CommandItem>
          </CommandGroup>

          <SearchResults
            search={search}
            searchResults={searchResults}
            isValidUrl={isValidUrl(search)}
            onCreateDocument={handleCreateDocument}
            onClose={() => setOpen(false)}
          />

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
      <FileUploadHandler onClose={() => setOpen(false)} />
    </>
  );
};