import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface MetadataFormProps {
  documentId: string;
  initialMetadata?: Json;
}

export const MetadataForm = ({ documentId, initialMetadata = {} }: MetadataFormProps) => {
  const parseMetadata = (json: Json): Record<string, string> => {
    if (typeof json === 'object' && json !== null) {
      return Object.entries(json).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);
    }
    return {};
  };

  const [metadata, setMetadata] = useState<Record<string, string>>(parseMetadata(initialMetadata));
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAddMetadata = async () => {
    if (!newKey || !newValue.trim()) {
      toast.error("Both metadata key and value are required");
      return;
    }

    const updatedMetadata = {
      ...metadata,
      [newKey]: newValue,
    };

    try {
      const { error } = await supabase
        .from("sources")
        .update({ metadata: updatedMetadata })
        .eq("id", documentId);

      if (error) throw error;

      setMetadata(updatedMetadata);
      setNewKey("");
      setNewValue("");
      toast.success("Metadata added successfully");
    } catch (error) {
      console.error("Error adding metadata:", error);
      toast.error("Failed to add metadata");
    }
  };

  const handleRemoveMetadata = async (key: string) => {
    const updatedMetadata = { ...metadata };
    delete updatedMetadata[key];

    try {
      const { error } = await supabase
        .from("sources")
        .update({ metadata: updatedMetadata })
        .eq("id", documentId);

      if (error) throw error;

      setMetadata(updatedMetadata);
      toast.success("Metadata removed successfully");
    } catch (error) {
      console.error("Error removing metadata:", error);
      toast.error("Failed to remove metadata");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-medium">Metadata</h3>
      
      <div className="space-y-2">
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 p-2 bg-accent/20 rounded-md">
            <span className="font-medium">{key}:</span>
            <span className="flex-1">{value}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveMetadata(key)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleAddMetadata} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
    </div>
  );
};