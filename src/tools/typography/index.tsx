import * as React from "react";
import { Button } from "@/components/ui/button";
import { TextStyle } from "./components/text-style";
import { generateId } from "@/lib/utils";
import { pluginApi } from "@/api";

interface TextStyleData {
  id: string;
  name: string;
  fontName: {
    family: string;
    style: string;
  };
}

interface Font {
  family: string;
  style: string;
}

export function Typography() {
  const [styles, setStyles] = React.useState<TextStyleData[]>([]);
  const [fonts, setFonts] = React.useState<Font[]>([]);
  const [fontsLoading, setFontsLoading] = React.useState(true);

  // Load fonts once when the component mounts
  React.useEffect(() => {
    const loadFonts = async () => {
      try {
        console.log("Starting to load fonts...");
        const availableFonts = await pluginApi.getAvailableFonts();
        console.log("Fonts loaded:", availableFonts.length, "fonts");
        console.log("First few fonts:", availableFonts.slice(0, 5));
        setFonts(availableFonts);
      } catch (error) {
        console.error("Error loading fonts:", error);
        setFonts([]);
      } finally {
        setFontsLoading(false);
        console.log("Font loading finished, fontsLoading set to false");
      }
    };

    loadFonts();
  }, []);

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
      <div className="flex-1 p-6 overflow-auto">
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

      {/* PopoverTest for debugging */}
    </div>
  );
}
