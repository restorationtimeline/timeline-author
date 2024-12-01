import { Clock } from "lucide-react";
import { DocumentStatusGroup } from "./document-list/DocumentStatusGroup";
import { useDocuments } from "@/hooks/useDocuments";

export const DocumentList = () => {
  const { documents, isLoading } = useDocuments();

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <Clock className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  const groupedDocuments = documents?.reduce((acc, doc) => {
    if (!acc[doc.status]) {
      acc[doc.status] = [];
    }
    acc[doc.status].push(doc);
    return acc;
  }, {} as Record<string, typeof documents>);

  const statusOrder: ("processing" | "pending" | "completed" | "failed")[] = ["processing", "pending", "completed", "failed"];

  return (
    <div className="w-full space-y-8">
      {statusOrder.map((status) => (
        <DocumentStatusGroup
          key={status}
          status={status}
          documents={groupedDocuments?.[status] || []}
        />
      ))}
    </div>
  );
};