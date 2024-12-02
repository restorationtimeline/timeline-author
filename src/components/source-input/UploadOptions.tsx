import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileUp, PenLine } from "lucide-react";

interface UploadOptionsProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const UploadOptions = ({ value, onValueChange }: UploadOptionsProps) => {
  const contentTypes = [
    {
      id: "file",
      label: "Upload File",
      description: "Upload PDF or EPUB files directly",
      icon: <FileUp className="h-4 w-4" />
    },
    {
      id: "manual",
      label: "Create Manual Source",
      description: "Manually create and enter source details",
      icon: <PenLine className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Or choose an option:</h3>
      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        className="grid gap-4 grid-cols-2"
      >
        {contentTypes.map((type) => (
          <div key={type.id}>
            <RadioGroupItem
              value={type.id}
              id={type.id}
              className="peer sr-only"
            />
            <Label
              htmlFor={type.id}
              className="flex flex-col rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <div className="flex items-center space-x-2 mb-2">
                {type.icon}
                <p className="font-medium leading-none">{type.label}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {type.description}
              </p>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};