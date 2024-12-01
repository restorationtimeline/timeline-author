import { Button } from "@/components/ui/button";
import { Link, Upload } from "lucide-react";

interface HeaderActionsProps {
  onLogout: () => Promise<void>;
  onFileUploadClick: () => void;
  onLinkModalOpen: () => void;
}

export const HeaderActions = ({ onLogout, onFileUploadClick, onLinkModalOpen }: HeaderActionsProps) => {
  return (
    <nav className="flex items-center gap-0.5 md:gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onFileUploadClick}
        className="h-8 w-8"
      >
        <Upload className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onLinkModalOpen}
        className="h-8 w-8"
      >
        <Link className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        onClick={onLogout}
        className="h-8 px-2 text-sm"
      >
        Logout
      </Button>
    </nav>
  );
};