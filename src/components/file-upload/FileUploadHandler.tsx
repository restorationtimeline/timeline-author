import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadHandlerProps {
  children: React.ReactNode;
  onDragStateChange?: (isDragging: boolean) => void;
}

export const FileUploadHandler = ({ children, onDragStateChange }: FileUploadHandlerProps) => {
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragStateChange?.(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    onDragStateChange?.(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    onDragStateChange?.(false);
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive",
      });
      return;
    }

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('sources')
          .insert({
            name: file.name,
            type: file.type,
            status: 'pending',
            uploaded_by: session.user.id
          });

        if (dbError) throw dbError;

        toast({
          title: "Success",
          description: `Uploaded: ${file.name}`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
        console.error(error);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};