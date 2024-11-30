import { FileText } from "lucide-react";
import { getFriendlyMimeType } from "@/utils/mimeTypes";
import { StatusIcon } from "./StatusIcon";

interface Document {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: string | null;
  uploaded_at: string;
}

interface DocumentListItemProps {
  document: Document;
  onClick: () => void;
}

export const DocumentListItem = ({ document, onClick }: DocumentListItemProps) => {
  return (
    <div
      className="p-4 bg-background dark:bg-gray-800 rounded-lg shadow-sm border border-border/40 animate-fade-up hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-medium text-foreground">{document.name}</h3>
            <p className="text-sm text-muted-foreground">
              {getFriendlyMimeType(document.type)} • Uploaded on{" "}
              {new Date(document.uploaded_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <StatusIcon status={document.status} />
      </div>
    </div>
  );
};