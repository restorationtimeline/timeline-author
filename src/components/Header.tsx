import { Button } from "@/components/ui/button";
import { LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";
import { useUploadQueueStore } from "@/stores/uploadQueueStore";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addItem, updateItem, clearCompleted } = useUploadQueueStore();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
      toast({
        title: "Logged out successfully"
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    for (const file of fileArray) {
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
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { data: storageData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const baseName = file.name.split('.')[0];
        
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            name: baseName,
            type: file.type,
            status: 'pending',
            uploaded_by: session.user.id,
            identifiers: {
              storage_path: fileName
            }
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

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <header className="w-full h-16 md:h-20 bg-primary border-b border-border/40 shadow-sm">
      <div className="container h-full flex items-center justify-between px-2 md:px-8">
        <Link to="/" className="text-primary-foreground font-semibold text-lg md:text-xl hover:text-primary-foreground/90 transition-colors">
          Restoration Timeline
        </Link>
        <div className="flex items-center gap-1 md:gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFileUploadClick}
                className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 h-12 w-12"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Upload Files</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 h-12 w-12"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Logout</p>
            </TooltipContent>
          </Tooltip>
        </div>

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
      </div>
    </header>
  );
};