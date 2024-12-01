import { Clock } from "lucide-react";
import { SourceStatusGroup } from "./source-list/SourceStatusGroup";
import { useSources } from "@/hooks/useDocuments";

export const SourceList = () => {
  const { sources, isLoading } = useSources();

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <Clock className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  const groupedSources = sources?.reduce((acc, source) => {
    if (!acc[source.status]) {
      acc[source.status] = [];
    }
    acc[source.status].push(source);
    return acc;
  }, {} as Record<string, typeof sources>);

  const statusOrder: ("processing" | "pending" | "completed" | "failed")[] = ["processing", "pending", "completed", "failed"];

  return (
    <div className="w-full space-y-8">
      {statusOrder.map((status) => (
        <SourceStatusGroup
          key={status}
          status={status}
          sources={groupedSources?.[status] || []}
        />
      ))}
    </div>
  );
};