import * as React from "react";
import { Colors } from "./colors";
import { ShadcnColors } from "./shadcn-colors";

// Get the active tool from the URL or context
function getActiveTool(): string {
  // In a real implementation, this might come from props or context
  // For now, we'll determine it based on the sidebar selection
  return "colors"; // Default to colors
}

interface VariablesProps {
  activeTool?: string;
}

export function Variables({ activeTool = "colors" }: VariablesProps) {
  const renderTool = () => {
    switch (activeTool) {
      case "shadcn-colors":
        return <ShadcnColors />;
      case "colors":
      default:
        return <Colors />;
    }
  };

  return <div className="flex flex-col h-full">{renderTool()}</div>;
}
