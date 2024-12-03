import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SourceInputForm = () => {
  const [sources, setSources] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const urlRegex = /^(https?:\/\/[^\s]+)$/;
        const isbnRegex = /^(?:ISBN(?:-1[03])?:?\s*)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-\s]){3})[-\s0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[-\s]){4})[-\s0-9]{17}$)(?:97[89][-\s]?)?[0-9]{1,5}[-\s]?[0-9]+[-\s]?[0-9]+[-\s]?[0-9X]$/;
        const doiRegex = /^10.\d{4,9}\/[-._;()\/:A-Z0-9]+$/i;
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
  );
};