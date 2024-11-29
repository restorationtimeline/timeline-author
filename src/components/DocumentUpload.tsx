import { useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const DocumentUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
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

  const handleFiles = (files: File[]) => {
    // For now, just show a toast with the file names
    toast({
      title: "Files received",
      description: `Uploaded: ${files.map(f => f.name).join(", ")}`,
    });
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
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium">Upload Documents</h3>
      <p className="mt-2 text-sm text-gray-500">
        Drag and drop your files here, or click to select files
      </p>
      <input
        type="file"
        multiple
        className="hidden"
        id="file-upload"
        onChange={handleFileInput}
      />
      <label
        htmlFor="file-upload"
        className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
      >
        Select Files
      </label>
    </div>
  );
};