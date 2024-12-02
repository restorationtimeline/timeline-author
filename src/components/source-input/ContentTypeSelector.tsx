import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  FileUp, 
  Globe, 
  Book, 
  Youtube, 
  Archive, 
  Users, 
  Wikipedia 
} from "lucide-react";

interface ContentType {
  id: string;
  label: string;
  description: string;
  icon: JSX.Element;
}

const contentTypes: ContentType[] = [
  {
    id: "file",
    label: "Upload File",
    description: "Upload PDF or EPUB files directly",
    icon: <FileUp className="h-4 w-4" />
  },
  {
    id: "url",
    label: "Fetch from URL",
    description: "Import content from web pages",
    icon: <Globe className="h-4 w-4" />
  },
  {
    id: "books",
    label: "Google Books & Scholar",
    description: "Search and import academic content",
    icon: <Book className="h-4 w-4" />
  },
  {
    id: "archive",
    label: "Internet Archive",
    description: "Access historical texts and media",
    icon: <Archive className="h-4 w-4" />
  },
  {
    id: "genealogy",
    label: "Family Search & Ancestry",
    description: "Import genealogical records",
    icon: <Users className="h-4 w-4" />
  },
  {
    id: "wikipedia",
    label: "Wikipedia",
    description: "Import Wikipedia articles",
    icon: <Wikipedia className="h-4 w-4" />
  },
  {
    id: "youtube",
    label: "YouTube & Videos",
    description: "Import video transcripts and content",
    icon: <Youtube className="h-4 w-4" />
  }
];

interface ContentTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const ContentTypeSelector = ({ value, onValueChange }: ContentTypeSelectorProps) => {
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
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
            className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <div className="flex w-full items-center space-x-2">
              {type.icon}
              <div className="flex-1 space-y-1">
                <p className="font-medium leading-none">{type.label}</p>
                <p className="text-sm text-muted-foreground">
                  {type.description}
                </p>
              </div>
            </div>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};