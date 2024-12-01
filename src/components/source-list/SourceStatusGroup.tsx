import { StatusIcon } from "./StatusIcon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useNavigate } from "react-router-dom";
import { getFriendlyMimeType } from "@/utils/mimeTypes";

type Source = {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: string | null;
  uploaded_at: string;
};

const StatusLabel = ({ status }: { status: Source["status"] }) => {
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

export const SourceStatusGroup = ({ 
  status, 
  sources 
}: { 
  status: Source["status"];
  sources: Source[];
}) => {
  const navigate = useNavigate();

  if (sources.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <StatusIcon status={status} />
        <h2 className="text-sm font-medium text-foreground break-words">
          {StatusLabel({ status })} ({sources.length})
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
          {sources.map((source) => (
            <TableRow
              key={source.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => navigate(`/sources/${source.id}`)}
            >
              <TableCell className="font-medium">{source.name}</TableCell>
              <TableCell>{getFriendlyMimeType(source.type)}</TableCell>
              <TableCell>
                {new Date(source.uploaded_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};