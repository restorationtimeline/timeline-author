import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { getFriendlyMimeType } from "@/utils/mimeTypes";

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "processing":
      return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "failed":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

const SourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isHolding, setIsHolding] = useState(false);
  const [holdStartTime, setHoldStartTime] = useState(0);
  const HOLD_DURATION = 1000;

  const { data: document, isLoading } = useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const { error } = await supabase
        .from("documents")
        .update({ name: newName })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Name updated",
        description: "The document name has been updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update the document name",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("documents")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Source deleted",
        description: "The source has been successfully deleted",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete the source",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleHoldStart = () => {
    setIsHolding(true);
    setHoldStartTime(Date.now());
  };

  const handleHoldEnd = () => {
    if (isHolding && Date.now() - holdStartTime >= HOLD_DURATION) {
      deleteMutation.mutate();
    }
    setIsHolding(false);
    setHoldStartTime(0);
  };

  const getHoldProgress = () => {
    if (!isHolding) return 0;
    const progress = Math.min((Date.now() - holdStartTime) / HOLD_DURATION * 100, 100);
    return progress;
  };

  const handleStartEditing = () => {
    setEditedName(document?.name || "");
    setIsEditing(true);
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      updateNameMutation.mutate(editedName);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Source not found</h1>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 w-full">
              {isEditing ? (
                <div className="flex items-center gap-2 w-full">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-2xl font-bold h-auto py-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setIsEditing(false);
                    }}
                  />
                  <Button onClick={handleSaveName}>Save</Button>
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <h1 className="text-2xl font-bold">{document.name}</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleStartEditing}
                    className="ml-2"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

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
          </div>

          {document.error_logs && document.error_logs.length > 0 && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <h3 className="text-red-800 font-medium mb-2">Error Logs</h3>
              <ul className="list-disc list-inside space-y-1">
                {document.error_logs.map((error, index) => (
                  <li key={index} className="text-red-600 text-sm">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button
            variant="destructive"
            size="lg"
            className="w-full h-16 relative overflow-hidden touch-none"
            onPointerDown={handleHoldStart}
            onPointerUp={handleHoldEnd}
            onPointerLeave={handleHoldEnd}
          >
            <div
              className="absolute left-0 bottom-0 h-1 bg-red-300 transition-all duration-100"
              style={{ width: `${getHoldProgress()}%` }}
            />
            <span className="relative z-10">
              {isHolding ? "Hold to delete..." : "Delete Source"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SourceDetails;
