import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LinkInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LinkInputModal = ({ open, onOpenChange }: LinkInputModalProps) => {
  const [links, setLinks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const linkList = links
      .split("\n")
      .map((link) => link.trim())
      .filter((link) => link.length > 0);

    if (linkList.length === 0) {
      toast.error("Please enter at least one valid URL");
      return;
    }

    setIsSubmitting(true);

    try {
      for (const url of linkList) {
        try {
          new URL(url); // Validate URL format
        } catch {
          toast.error(`Invalid URL: ${url}`);
          continue;
        }

        const { error } = await supabase
          .from("sources")
          .insert({
            name: url,
            type: "url",
            identifiers: { url },
            status: "pending",
          });

        if (error) throw error;
      }

      toast.success("Links added successfully");
      setLinks("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding links:", error);
      toast.error("Failed to add some links. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Links</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            placeholder="Paste your links here, one per line"
            className="min-h-[200px]"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              Add Links
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};