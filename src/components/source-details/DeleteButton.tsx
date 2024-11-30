import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const DeleteButton = ({ documentId }: { documentId: string }) => {
  const [isHolding, setIsHolding] = useState(false);
  const [holdStartTime, setHoldStartTime] = useState(0);
  const HOLD_DURATION = 1000;
  const navigate = useNavigate();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("documents")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", documentId);
      
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
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete the source",
        variant: "destructive",
      });
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
    return Math.min((Date.now() - holdStartTime) / HOLD_DURATION * 100, 100);
  };

  return (
    <Button
      variant="destructive"
      size="lg"
      className="w-full h-16 relative overflow-hidden touch-none select-none"
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
  );
};