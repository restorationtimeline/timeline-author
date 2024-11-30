import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

type Identifiers = Record<string, string>;

interface IdentifiersFormProps {
  documentId: string;
  initialIdentifiers?: Json;
}

export const IdentifiersForm = ({ documentId, initialIdentifiers = {} }: IdentifiersFormProps) => {
  const parseIdentifiers = (json: Json): Identifiers => {
    if (typeof json === 'object' && json !== null) {
      return Object.entries(json).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = value;
        }
        return acc;
      }, {} as Identifiers);
    }
    return {};
  };

  const [identifiers, setIdentifiers] = useState<Identifiers>(parseIdentifiers(initialIdentifiers));
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAddIdentifier = async () => {
    if (!newKey.trim() || !newValue.trim()) {
      toast.error("Both key and value are required");
      return;
    }

    const updatedIdentifiers = {
      ...identifiers,
      [newKey]: newValue,
    };

    try {
      const { error } = await supabase
        .from("sources")
        .update({ identifiers: updatedIdentifiers })
        .eq("id", documentId);

      if (error) throw error;

      setIdentifiers(updatedIdentifiers);
      setNewKey("");
      setNewValue("");
      toast.success("Identifier added successfully");
    } catch (error) {
      console.error("Error adding identifier:", error);
      toast.error("Failed to add identifier");
    }
  };

  const handleRemoveIdentifier = async (key: string) => {
    const updatedIdentifiers = { ...identifiers };
    delete updatedIdentifiers[key];

    try {
      const { error } = await supabase
        .from("sources")
        .update({ identifiers: updatedIdentifiers })
        .eq("id", documentId);

      if (error) throw error;

      setIdentifiers(updatedIdentifiers);
      toast.success("Identifier removed successfully");
    } catch (error) {
      console.error("Error removing identifier:", error);
      toast.error("Failed to remove identifier");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-medium">Identifiers</h3>
      
      <div className="space-y-2">
        {Object.entries(identifiers).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 p-2 bg-accent/20 rounded-md">
            <span className="font-medium">{key}:</span>
            <span className="flex-1">{value}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveIdentifier(key)}
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
        <Button onClick={handleAddIdentifier} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
    </div>
  );
};