import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

type EditableTitleProps = {
  initialValue: string;
  onSave: (newValue: string) => Promise<void>;
};

export const EditableTitle = ({ initialValue, onSave }: EditableTitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  const handleSave = async () => {
    if (value.trim()) {
      await onSave(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 w-full">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="text-2xl font-bold h-auto py-1"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') setIsEditing(false);
          }}
        />
        <Button size="icon" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <h1 
        className="text-2xl font-bold cursor-pointer transition-colors hover:text-primary/80" 
        onClick={() => setIsEditing(true)}
      >
        {value}
      </h1>
    </div>
  );
};