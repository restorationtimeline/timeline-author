import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { getFriendlyMimeType } from "@/utils/mimeTypes";

type Document = {
  type: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  uploaded_at: string;
};

const StatusIcon = ({ status }: { status: Document["status"] }) => {
  switch (status) {
    case "processing":
      return <Clock className="h-5 w-5 text-accent animate-spin" />;
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "failed":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

export const DocumentMetadata = ({ document }: { document: Document }) => {
  return (
    <div className="space-y-2 text-sm text-gray-500">
      <div className="flex items-center gap-2">
        <span className="font-medium">Type:</span>
        <span>{getFriendlyMimeType(document.type)}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="font-medium">Uploaded:</span>
        <span>{new Date(document.uploaded_at).toLocaleDateString()}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="font-medium">Status:</span>
        <div className="flex items-center gap-1">
          <StatusIcon status={document.status} />
          <span className="capitalize">{document.status}</span>
        </div>
      </div>
    </div>
  );
};