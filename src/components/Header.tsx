import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { HeaderLogo } from "./header/HeaderLogo";
import { HeaderActions } from "./header/HeaderActions";
import { TooltipProvider } from "./ui/tooltip";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <header className="w-full h-16 md:h-10 bg-background border-b border-border/40 shadow-sm">
      <div className="container h-full flex items-center justify-between px-2 md:px-8">
        <HeaderLogo />
        <TooltipProvider>
          <HeaderActions onLogout={handleLogout} />
        </TooltipProvider>
      </div>
    </header>
  );
};