import * as React from "react";
import { Button } from "@/components/ui/button";
import { TextStyle } from "./components/text-style";
import { generateId } from "@/lib/utils";

interface TextStyleData {
  id: string;
  name: string;
  fontName: {
    family: string;
    style: string;
  };
}

export function Typography() {
  const [styles, setStyles] = React.useState<TextStyleData[]>([]);

  const handleAddStyle = (style: Omit<TextStyleData, "id">) => {
    const newStyle: TextStyleData = {
      id: generateId(),
      ...style,
    };
    setStyles([...styles, newStyle]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main content area */}
      <div className="flex-1 overflow-auto p-6">
        {/* List of text styles */}
        <div className="space-y-4">
          {styles.map((style) => (
            <div key={style.id} className="p-4 border rounded-lg bg-background">
              <div className="font-medium">{style.name}</div>
              <div className="text-sm text-muted-foreground">
                {style.fontName.family} - {style.fontName.style}
              </div>
            </div>
          ))}

          {/* Add new style */}
          <TextStyle mode="add" onAdd={handleAddStyle} />
        </div>
      </div>

      {/* Sticky bottom action area */}
      <div className="sticky bottom-0 border-t border-border bg-background p-4 flex items-center justify-between">
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
