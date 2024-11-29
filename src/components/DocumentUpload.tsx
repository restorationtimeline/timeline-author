import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UploadQueue, UploadItem } from "./UploadQueue";

export const DocumentUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const { toast } = useToast();

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

  const getBaseFileName = (fileName: string) => {
    return fileName.replace(/\.[^/.]+$/, "");
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    // Initialize upload queue
    const newQueue = files.map(file => ({
      file,
      progress: 0,
      status: 'waiting' as const
    }));
    setUploadQueue(prev => [...prev, ...newQueue]);

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

      for (const [index, file] of files.entries()) {
        // Update status to uploading
        setUploadQueue(prev => prev.map(item => 
          item.file === file 
            ? { ...item, status: 'uploading' as const }
            : item
        ));

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload-document', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to upload file');
        }

        const baseName = getBaseFileName(file.name);
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            name: baseName,
            type: file.type,
            status: 'pending',
            uploaded_by: session.user.id
          });

        if (dbError) throw dbError;

        // Update progress and status
        setUploadQueue(prev => prev.map(item => 
          item.file === file 
            ? { ...item, progress: 100, status: 'completed' as const }
            : item
        ));
      }

      // Show success toast
      toast({
        title: "Success",
        description: `Uploaded ${files.length} file${files.length > 1 ? 's' : ''}`,
      });

      // Clear completed uploads after a delay
      setTimeout(() => {
        setUploadQueue(prev => prev.filter(item => item.status !== 'completed'));
      }, 3000);

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = (file: File) => {
    setUploadQueue(prev => prev.filter(item => item.file !== file));
    toast({
      title: "Upload cancelled",
      description: `Cancelled upload of ${file.name}`,
    });
  };

  return (
    <>
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
      <UploadQueue items={uploadQueue} onCancel={handleCancelUpload} />
    </>
  );
};