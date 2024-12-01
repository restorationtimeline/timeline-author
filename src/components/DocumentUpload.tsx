import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUploadQueueStore } from "@/stores/uploadQueueStore";

export const DocumentUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { addItem, updateItem, clearCompleted } = useUploadQueueStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
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
          .from('sources')  // Changed from 'documents' to 'sources'
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('sources')
          .insert({
            name: file.name,
            type: fileExt?.toLowerCase() || 'unknown',
            metadata: { mimetype: file.type },
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
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-gray-300"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isUploading ? (
        <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
      ) : (
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
      )}
      <h3 className="mt-4 text-lg font-medium">Upload Documents</h3>
      <p className="mt-2 text-sm text-gray-500">
        {isUploading
          ? "Uploading files..."
          : "Drag and drop your files here, or click to select files"}
      </p>
      <input
        type="file"
        multiple
        className="hidden"
        id="file-upload"
        onChange={handleFileInput}
        disabled={isUploading}
      />
      <label
        htmlFor="file-upload"
        className={`mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md cursor-pointer transition-colors ${
          isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90"
        }`}
      >
        Select Files
      </label>
    </div>
  );
};
