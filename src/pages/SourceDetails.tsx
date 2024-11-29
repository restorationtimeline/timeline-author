import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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
  const [isHolding, setIsHolding] = useState(false);
  const [holdStartTime, setHoldStartTime] = useState(0);
  const HOLD_DURATION = 1000; // 1 second hold duration

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{document.name}</h1>
              <p className="text-gray-500">
                {document.type || "Document"} • Uploaded on{" "}
                {new Date(document.uploaded_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={document.status} />
              <span className="text-sm font-medium capitalize">{document.status}</span>
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
