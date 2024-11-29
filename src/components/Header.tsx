import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export const Header = () => {
  return (
    <header className="w-full h-10 bg-primary border-b border-border/40 shadow-sm">
      <div className="container h-full flex items-center justify-between">
        <div className="text-primary-foreground font-semibold">
          Restoration Timeline
        </div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={cn(
                  "text-primary-foreground/90 hover:text-primary-foreground",
                  "transition-colors"
                )}
                href="/"
              >
                Documents
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};