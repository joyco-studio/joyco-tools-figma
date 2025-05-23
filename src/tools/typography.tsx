import * as React from "react";
import { Button } from "../components/ui/button";
import { PlusIcon } from "lucide-react";
import { TextStyle } from "./typography/components/text-style";
import { useFontsStore } from "../stores/fonts";

interface TextStyleData {
  id: string;
  name: string;
  fontName: {
    family: string;
    style: string;
  };
}

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function Typography() {
  const [styles, setStyles] = React.useState<TextStyleData[]>([]);

  // Use the global fonts store
  const { fonts, isLoading: fontsLoading } = useFontsStore();

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

  return (
    <div className="flex flex-col h-full">
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {/* List of text styles */}
        <div className="space-y-4">
          {styles.map((style) => (
            <TextStyle
              key={style.id}
              mode="edit"
              fonts={fonts}
              fontsLoading={fontsLoading}
              currentFont={style.fontName}
              onUpdate={(updatedStyle) =>
                handleUpdateStyle(style.id, updatedStyle)
              }
            />
          ))}

          {/* Add new style */}
          <TextStyle
            mode="add"
            onAdd={handleAddStyle}
            fonts={fonts}
            fontsLoading={fontsLoading}
          />
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
