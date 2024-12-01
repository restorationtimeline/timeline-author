import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid2X2, List, Columns3 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ViewToggleProps {
  activeView: string;
  setActiveView: (view: "grid" | "kanban") => void;
}

export const ViewToggle = ({ activeView, setActiveView }: ViewToggleProps) => (
  <TabsList className="bg-white dark:bg-gray-800 border">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <TabsTrigger 
            value="grid" 
            onClick={() => setActiveView("grid")}
            className="flex items-center gap-2 aria-selected:bg-gray-200 dark:aria-selected:bg-gray-700 aria-selected:text-foreground aria-selected:font-medium aria-[selected=false]:text-muted-foreground aria-[selected=false]:hover:text-foreground transition-colors"
          >
            <Grid2X2 className="h-4 w-4" />
            Grid
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Grid View (⌘J)</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <TabsTrigger 
            value="kanban"
            onClick={() => setActiveView("kanban")}
            className="flex items-center gap-2 aria-selected:bg-gray-200 dark:aria-selected:bg-gray-700 aria-selected:text-foreground aria-selected:font-medium aria-[selected=false]:text-muted-foreground aria-[selected=false]:hover:text-foreground transition-colors"
          >
            <Columns3 className="h-4 w-4" />
            Kanban
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Kanban View (⌘K)</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <TabsTrigger 
            value="list"
            onClick={() => setActiveView("list")}
            className="flex items-center gap-2 aria-selected:bg-gray-200 dark:aria-selected:bg-gray-700 aria-selected:text-foreground aria-selected:font-medium aria-[selected=false]:text-muted-foreground aria-[selected=false]:hover:text-foreground transition-colors"
          >
            <List className="h-4 w-4" />
            List
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>List View (⌘L)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </TabsList>
);