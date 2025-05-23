import * as React from "react";
import { Button } from "../components/ui/button";
import { PlusIcon } from "lucide-react";
import { TextStyle } from "./typography/components/text-style";

interface TextStyle {
  id: string;
  name: string;
  // Add more properties as needed
}

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function Typography() {
  const [styles, setStyles] = React.useState<TextStyle[]>([]);

  const handleAddStyle = () => {
    const newStyle: TextStyle = {
      id: generateId(),
      name: `Style ${styles.length + 1}`,
    };
    setStyles([...styles, newStyle]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main content area */}
      <div className="flex-1 p-6 overflow-auto">
        {/* List of text styles */}
        <div className="space-y-4">
          {styles.map((style) => (
            <TextStyle key={style.id} mode="edit" onAdd={handleAddStyle} />
          ))}

          {/* Empty dashed area */}
          <button
            onClick={handleAddStyle}
            className="flex items-center justify-center w-full gap-2 p-4 transition-colors border-2 border-dashed rounded-lg border-muted-foreground/25 hover:border-muted-foreground/50 text-muted-foreground"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Text Style</span>
          </button>
        </div>
      </div>

      {/* Sticky bottom action area */}
      <div className="sticky bottom-0 flex items-center justify-between p-4 border-t border-border bg-background">
        <span className="text-sm text-muted-foreground">
          {styles.length} {styles.length === 1 ? "style" : "styles"} added
        </span>
        <Button
          disabled={styles.length === 0}
          onClick={() => {
            // TODO: Implement apply logic
          }}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
