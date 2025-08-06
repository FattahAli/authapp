import { Button } from "./button";
import { Grid3X3, List } from "lucide-react";

interface ViewToggleProps {
  view: "cards" | "list";
  onViewChange: (view: "cards" | "list") => void;
  className?: string;
}

export function ViewToggle({
  view,
  onViewChange,
  className = "",
}: ViewToggleProps) {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Button
        variant={view === "cards" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewChange("cards")}
        className="h-8 px-3"
        title="Card view"
      >
        <Grid3X3 className="h-4 w-4 mr-1" />
        Cards
      </Button>
      <Button
        variant={view === "list" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewChange("list")}
        className="h-8 px-3"
        title="List view"
      >
        <List className="h-4 w-4 mr-1" />
        List
      </Button>
    </div>
  );
}
