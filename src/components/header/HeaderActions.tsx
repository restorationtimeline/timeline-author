import { Button } from "@/components/ui/button";
import { LogOut, FilePlus, Moon, Sun, Link as LinkIcon, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import { HeaderActionButton } from "./HeaderActionButton";

interface HeaderActionsProps {
  onLogout: () => Promise<void>;
  onFileUploadClick: () => void;
  onLinkModalOpen: () => void;
}

export const HeaderActions = ({ 
  onLogout, 
  onFileUploadClick, 
  onLinkModalOpen 
}: HeaderActionsProps) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 md:gap-2">
      <HeaderActionButton
        icon={<List className="h-6 w-6 md:h-4 md:w-4" />}
        onClick={() => navigate('/crawl-queue')}
        tooltip="Crawl Queue"
      />

      <HeaderActionButton
        icon={<FilePlus className="h-6 w-6 md:h-4 md:w-4" />}
        onClick={onFileUploadClick}
        tooltip="Upload Files"
      />

      <HeaderActionButton
        icon={<LinkIcon className="h-6 w-6 md:h-4 md:w-4" />}
        onClick={onLinkModalOpen}
        tooltip="Add Links"
      />

      <HeaderActionButton
        icon={theme === "dark" ? (
          <Sun className="h-6 w-6 md:h-4 md:w-4" />
        ) : (
          <Moon className="h-6 w-6 md:h-4 md:w-4" />
        )}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        tooltip="Toggle theme"
      />

      <HeaderActionButton
        icon={<LogOut className="h-6 w-6 md:h-4 md:w-4" />}
        onClick={onLogout}
        tooltip="Sign out"
      />
    </div>
  );
};