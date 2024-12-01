import { useNavigate } from "react-router-dom";
import { HeaderLogo } from "./header/HeaderLogo";
import { HeaderActions } from "./header/HeaderActions";
import { useState } from "react";
import { LinkInputModal } from "./source-input/LinkInputModal";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsDropdown } from "./header/NotificationsDropdown";

export const Header = () => {
  const navigate = useNavigate();
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <HeaderLogo />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors md:w-[300px] md:focus-within:w-[500px]">
              <input
                className="flex h-full w-full bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Press ⌘ + Shift + Space to search..."
                disabled
              />
            </div>
          </div>
          <NotificationsDropdown />
          <HeaderActions 
            onLogout={handleLogout}
            onFileUploadClick={() => navigate("/upload")}
            onLinkModalOpen={() => setIsLinkModalOpen(true)}
          />
        </div>
      </div>
      <LinkInputModal
        open={isLinkModalOpen}
        onOpenChange={setIsLinkModalOpen}
      />
    </header>
  );
};