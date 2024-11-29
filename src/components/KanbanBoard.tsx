import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Card } from "./ui/card";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type Document = {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: string;
  uploaded_at: string;
};

const columns = [
  {
    id: "pending",
    title: "Pending",
    icon: <Clock className="h-5 w-5 text-gray-500" />,
  },
  {
    id: "processing",
    title: "Processing",
    icon: <Clock className="h-5 w-5 text-blue-500 animate-spin" />,
  },
  {
    id: "completed",
    title: "Completed",
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
  },
  {
    id: "failed",
    title: "Failed",
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
  },
];

export const KanbanBoard = () => {
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
  });

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    try {
      const { error } = await supabase
        .from("documents")
        .update({ status: newStatus })
        .eq("id", draggableId);

      if (error) throw error;
      
      toast.success("Document status updated successfully");
    } catch (error) {
      console.error("Error updating document status:", error);
      toast.error("Failed to update document status");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col bg-gray-100 p-4 rounded-lg min-h-[600px]">
            <div className="flex items-center gap-2 mb-4">
              {column.icon}
              <h3 className="font-semibold">{column.title}</h3>
            </div>
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1"
                >
                  {documents
                    ?.filter((doc) => doc.status === column.id)
                    .map((doc, index) => (
                      <Draggable
                        key={doc.id}
                        draggableId={doc.id}
                        index={index}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-4 mb-4 cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <h4 className="font-medium">{doc.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {doc.type} • {new Date(doc.uploaded_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};