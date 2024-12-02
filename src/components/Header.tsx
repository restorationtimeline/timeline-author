import { ModeToggle } from "@/components/theme/ModeToggle";

export const Header = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="font-semibold text-lg">Your App</div>
        <ModeToggle />
      </div>
    </header>
  );
};