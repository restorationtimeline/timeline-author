import { LogOut, Moon, Sun, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { HeaderActionButton } from "./HeaderActionButton";

interface HeaderActionsProps {
  onLogout: () => Promise<void>;
}

export const HeaderActions = ({ onLogout }: HeaderActionsProps) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 md:gap-4">
      <HeaderActionButton
        icon={<List className="h-6 w-6 md:h-4 md:w-4" />}
        onClick={() => navigate('/crawl-queue')}
        tooltip="Crawl Queue"
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