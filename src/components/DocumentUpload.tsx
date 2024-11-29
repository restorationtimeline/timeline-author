import { useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface UploadProgress {
  totalFiles: number;
  completedFiles: number;
  currentFileName: string;
}

export const DocumentUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
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

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({
      totalFiles: files.length,
      completedFiles: 0,
      currentFileName: files[0].name,
    });

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

      // Show the upload progress toast
      toast({
        title: "Uploading files",
        description: (
          <div className="w-full">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">
                {uploadProgress?.currentFileName}
              </span>
              <span className="text-sm text-gray-500">
                {uploadProgress?.completedFiles}/{uploadProgress?.totalFiles} files
              </span>
            </div>
            <Progress 
              value={(uploadProgress?.completedFiles || 0) / files.length * 100} 
              className="h-2"
            />
          </div>
        ),
        duration: Infinity,
      });

      for (const [index, file] of files.entries()) {
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

        setUploadProgress(prev => ({
          totalFiles: files.length,
          completedFiles: (prev?.completedFiles || 0) + 1,
          currentFileName: index < files.length - 1 ? files[index + 1].name : file.name,
        }));
      }

      // Show success toast
      toast({
        title: "Success",
        description: `Uploaded ${files.length} file${files.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
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