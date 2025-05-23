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
  const [styles, setStyles] = React.useState<TextStyleData[]>([
    // Add some test data to see the delete button
    {
      id: "test-1",
      name: "Heading Large",
      fontName: { family: "Inter", style: "Bold" },
    },
    {
      id: "test-2",
      name: "Body Text",
      fontName: { family: "Inter", style: "Regular" },
    },
  ]);

  const handleAddStyle = (style: Omit<TextStyleData, "id">) => {
    const newStyle: TextStyleData = {
      id: generateId(),
      ...style,
    };
    setStyles([...styles, newStyle]);
  };

  const handleUpdateStyle = (
    id: string,
    updatedStyle: Omit<TextStyleData, "id">
  ) => {
    setStyles((prevStyles) =>
      prevStyles.map((style) =>
        style.id === id ? { ...style, ...updatedStyle } : style
      )
    );
  };

  const handleDeleteStyle = (id: string) => {
    setStyles((prevStyles) => prevStyles.filter((style) => style.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main content area */}
      <div className="flex-1 p-6 overflow-auto">
        {/* List of text styles */}
        <div className="space-y-4">
          {styles.map((style) => (
            <TextStyle
              key={style.id}
              mode="edit"
              currentFont={style.fontName}
              onChange={(updatedStyle) =>
                handleUpdateStyle(style.id, updatedStyle)
              }
              onDelete={() => handleDeleteStyle(style.id)}
            />
          ))}

          {/* Add new style */}
          <TextStyle mode="add" onChange={handleAddStyle} />
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
          className="cursor-default"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
