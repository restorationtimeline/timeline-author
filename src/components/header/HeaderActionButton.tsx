import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip: string;
}

export const HeaderActionButton = ({ icon, onClick, tooltip }: HeaderActionButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className="text-foreground/60 hover:text-foreground hover:bg-accent dark:hover:bg-accent/20 h-12 w-12 md:h-8 md:w-8"
      >
        {icon}
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p className="text-sm">{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);