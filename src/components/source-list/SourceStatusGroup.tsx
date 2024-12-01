import { StatusIcon } from "./StatusIcon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useNavigate } from "react-router-dom";
import { getFriendlyMimeType } from "@/utils/mimeTypes";

type Document = {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: string | null;
  uploaded_at: string;
};

const StatusLabel = ({ status }: { status: Document["status"] }) => {
  switch (status) {
    case "processing":
      return "Processing";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    default:
      return "Pending";
  }
};

export const DocumentStatusGroup = ({ 
  status, 
  documents 
}: { 
  status: Document["status"];
  documents: Document[];
}) => {
  const navigate = useNavigate();

  if (documents.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <StatusIcon status={status} />
        <h2 className="text-sm font-medium text-foreground break-words">
          {StatusLabel({ status })} ({documents.length})
        </h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Upload Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow
              key={doc.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => navigate(`/sources/${doc.id}`)}
            >
              <TableCell className="font-medium">{doc.name}</TableCell>
              <TableCell>{getFriendlyMimeType(doc.type)}</TableCell>
              <TableCell>
                {new Date(doc.uploaded_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};