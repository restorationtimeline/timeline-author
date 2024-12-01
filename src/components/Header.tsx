import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { LinkInputModal } from "./source-input/LinkInputModal";
import { HeaderLogo } from "./header/HeaderLogo";
import { HeaderActions } from "./header/HeaderActions";
import { TooltipProvider } from "./ui/tooltip";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive",
      });
      return;
    }

    for (const file of Array.from(e.target.files)) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('sources')
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
        console.error('Error uploading file:', error);
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    e.target.value = '';
  };

  return (
    <header className="w-full h-16 md:h-10 bg-background border-b border-border/40 shadow-sm">
      <div className="container h-full flex items-center justify-between px-2 md:px-8">
        <HeaderLogo />
        <TooltipProvider>
          <HeaderActions
            onLogout={handleLogout}
            onFileUploadClick={handleFileUploadClick}
            onLinkModalOpen={() => setLinkModalOpen(true)}
          />
        </TooltipProvider>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        multiple
      />

      <LinkInputModal 
        open={linkModalOpen}
        onOpenChange={setLinkModalOpen}
      />
    </header>
  );
};