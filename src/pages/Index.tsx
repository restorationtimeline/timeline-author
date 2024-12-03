import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [sources, setSources] = useState("");

  const handleAddSources = async () => {
    const items = sources.split("\n").map(item => item.trim()).filter(Boolean);
    
    if (items.length === 0) {
      toast.error("Please enter at least one source");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("You must be logged in to add sources");
      return;
    }

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
        toast.success(`Added source: ${item}`);
      } catch (error) {
        console.error("Error adding source:", error);
        toast.error(`Failed to add source: ${item}`);
      }
    }

    setSources("");
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
            className="w-full"
          >
            Add Sources
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;