import { useEffect } from 'react';

interface ViewShortcutsProps {
  setActiveView: (view: string) => void;
}

export const ViewShortcuts = ({ setActiveView }: ViewShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "j":
            e.preventDefault();
            setActiveView("grid");
            break;
          case "l":
            e.preventDefault();
            setActiveView("list");
            break;
          case "k":
            e.preventDefault();
            setActiveView("kanban");
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setActiveView]);

  return null;
};