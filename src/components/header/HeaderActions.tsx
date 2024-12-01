import { List, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useNavigate } from "react-router-dom";
import { HeaderActionButton } from "./HeaderActionButton";
import { NotificationsDropdown } from "./NotificationsDropdown";

export const HeaderActions = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 md:gap-2">
      <HeaderActionButton
        icon={<List className="h-6 w-6 md:h-4 md:w-4" />}
        onClick={() => navigate('/crawl-queue')}
        tooltip="Crawl Queue"
      />
      <NotificationsDropdown />
      <HeaderActionButton
        icon={theme === 'dark' ? (
          <Sun className="h-6 w-6 md:h-4 md:w-4" />
        ) : (
          <Moon className="h-6 w-6 md:h-4 md:w-4" />
        )}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        tooltip="Toggle theme"
      />
    </div>
  );
};