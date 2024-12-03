import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFriendlyMimeType } from "@/utils/mimeTypes";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const [sources, setSources] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: sourcesList, isLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sources")
        .select("*")
        .is('deleted_at', null)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('source_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sources'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['sources'] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  const handleAddSources = async () => {
    const items = sources.split("\n").map(item => item.trim()).filter(Boolean);
    
    if (items.length === 0) {
      toast.error("Please enter at least one source");
      return;
    }

    setIsSubmitting(true);
    toast.info(`Processing ${items.length} source${items.length > 1 ? 's' : ''}...`);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to add sources");
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      for (const item of items) {
        // URL detection
        const urlRegex = /^(https?:\/\/[^\s]+)$/;
        // ISBN detection (both ISBN-10 and ISBN-13)
        const isbnRegex = /^(?:ISBN(?:-1[03])?:?\s*)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-\s]){3})[-\s0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[-\s]){4})[-\s0-9]{17}$)(?:97[89][-\s]?)?[0-9]{1,5}[-\s]?[0-9]+[-\s]?[0-9]+[-\s]?[0-9X]$/;
        // DOI detection
        const doiRegex = /^10.\d{4,9}\/[-._;()\/:A-Z0-9]+$/i;
        // Wikidata QID detection
        const qidRegex = /^Q\d+$/;

        let type = "unknown";
        let identifiers: Record<string, string> = {};

        if (urlRegex.test(item)) {
          type = "url";
          identifiers.url = item;
        } else if (isbnRegex.test(item)) {
          type = "book";
          identifiers.isbn = item;
        } else if (doiRegex.test(item)) {
          type = "article";
          identifiers.doi = item;
        } else if (qidRegex.test(item)) {
          type = "wikidata";
          identifiers.qid = item;
        }

        try {
          const { error } = await supabase
            .from("sources")
            .insert({
              name: type === "unknown" ? item : item.substring(0, 255),
              type,
              identifiers,
              status: "pending",
              uploaded_by: session.user.id
            });

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error("Error adding source:", error);
          failureCount++;
        }
      }

      // Show final summary
      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} source${successCount > 1 ? 's' : ''}`);
      }
      if (failureCount > 0) {
        toast.error(`Failed to add ${failureCount} source${failureCount > 1 ? 's' : ''}`);
      }

      setSources("");
    } catch (error) {
      console.error("Error adding sources:", error);
      toast.error("Failed to add sources. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Add Sources</h1>
          <p className="text-muted-foreground">
            Enter one source per line. You can add URLs, ISBNs, DOIs, Wikidata QIDs, or titles.
          </p>
          <Textarea
            value={sources}
            onChange={(e) => setSources(e.target.value)}
            placeholder="Enter your sources here, one per line..."
            className="min-h-[200px]"
          />
          <Button 
            onClick={handleAddSources}
            disabled={isSubmitting}
            className="w-full py-6 text-lg md:text-base md:py-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Add Sources'
            )}
          </Button>
        </div>

        <div className="max-w-4xl mx-auto mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Sources</h2>
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading sources...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sourcesList?.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium">{source.name}</TableCell>
                    <TableCell>{getFriendlyMimeType(source.type)}</TableCell>
                    <TableCell className="capitalize">{source.status}</TableCell>
                    <TableCell>{new Date(source.uploaded_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {!sourcesList?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No sources added yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;