import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUploadQueueStore } from "@/stores/uploadQueueStore";

interface FileUploadHandlerProps {
  onClose: () => void;
}

export const FileUploadHandler = ({ onClose }: FileUploadHandlerProps) => {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { addItem, updateItem, clearCompleted } = useUploadQueueStore();

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    for (const file of files) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Error",
            description: "You must be logged in to upload files",
            variant: "destructive",
          });
          return;
        }

        addItem({
          file,
          progress: 0,
          status: 'waiting'
        });

        updateItem(file, { status: 'uploading' });

        const fileExt = file.name.split('.').pop();
        const documentId = crypto.randomUUID();
        const fileName = `${documentId}.${fileExt}`;
        const filePath = `${documentId}/${fileName}`; 
        
        const { data: storageData, error: uploadError } = await supabase.storage
          .from('sources')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const baseName = file.name.split('.')[0];
        
        const { error: dbError } = await supabase
          .from('sources')
          .insert({
            name: baseName,
            type: file.type,
            status: 'pending',
            uploaded_by: session.user.id,
            storage_path: filePath
          });

        if (dbError) throw dbError;

        updateItem(file, { progress: 100, status: 'completed' });
        
        toast({
          title: "Success",
          description: `Uploaded ${file.name}`,
        });

      } catch (error) {
        console.error('Error uploading file:', error);
        updateItem(file, { status: 'error' });
        
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setTimeout(() => {
      clearCompleted();
    }, 3000);
  };

  const handleUploadClick = () => {
    onClose();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFileUpload(e.target.files);
          }
        }}
        multiple
      />
    </>
  );
};