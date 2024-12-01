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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to add links");
        return;
      }

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
            identifiers: { url, category: "webpage" },
            status: "pending",
            uploaded_by: session.user.id
          });

        if (error) {
          console.error("Error adding link:", error);
          toast.error(`Failed to add link: ${url}`);
        } else {
          // Create a completed task for categorization
          const { error: taskError } = await supabase
            .from('tasks')
            .insert({
              source_id: error?.id,
              task_name: 'Categorize the Source',
              status: 'completed',
              started_at: new Date().toISOString(),
              completed_at: new Date().toISOString()
            });

          if (taskError) {
            console.error("Error creating task:", taskError);
          }

          toast.success(`Added link: ${url}`);
        }
      }

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