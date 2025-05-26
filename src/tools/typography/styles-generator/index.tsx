import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { TextStyle } from "./components/text-style";
import { useFontsStore, useVariablesStore } from "@/stores/fonts";
import { pluginApi } from "@/api";

interface TextStyleData {
  id: string;
  name: string;
  fontName: {
    family: string;
    style: string;
  };
}

interface StyleConfiguration {
  id: string;
  config: any;
  isValid: boolean;
}

// Helper function to generate unique IDs
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function Typography() {
  const [styles, setStyles] = React.useState<TextStyleData[]>([]);
  const [styleConfigurations, setStyleConfigurations] = React.useState<
    Map<string, StyleConfiguration>
  >(new Map());
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  // Use the global fonts and variables stores
  const { fonts, isLoading: fontsLoading } = useFontsStore();
  const { variables, isLoading: variablesLoading } = useVariablesStore();

  const handleAddStyle = React.useCallback(() => {
    const newStyle: TextStyleData = {
      id: generateId(),
      name: "New Style",
      fontName: { family: "", style: "" },
    };
    setStyles((prev) => [...prev, newStyle]);
    // Open the new item by default
    setOpenItems((prev) => [...prev, newStyle.id]);
  }, []);

  const handleDeleteStyle = React.useCallback((id: string) => {
    setStyles((prevStyles) => prevStyles.filter((style) => style.id !== id));
    // Also remove the configuration and from open items
    setStyleConfigurations((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    setOpenItems((prev) => prev.filter((itemId) => itemId !== id));
    // Clean up callback reference
    configCallbacks.current.delete(id);
  }, []);

  const handleConfigurationChange = React.useCallback(
    (id: string, config: any, isValid: boolean) => {
      setStyleConfigurations((prev) => {
        const newMap = new Map(prev);
        newMap.set(id, { id, config, isValid });
        return newMap;
      });
    },
    []
  );

  // Store stable callbacks for each style
  const configCallbacks = React.useRef<
    Map<string, (config: any, isValid: boolean) => void>
  >(new Map());

  const getConfigCallback = React.useCallback(
    (styleId: string) => {
      if (!configCallbacks.current.has(styleId)) {
        configCallbacks.current.set(
          styleId,
          (config: any, isValid: boolean) => {
            handleConfigurationChange(styleId, config, isValid);
          }
        );
      }
      return configCallbacks.current.get(styleId)!;
    },
    [handleConfigurationChange]
  );

  // Check if all styles are valid and we have at least one style
  const canGenerate = React.useMemo(() => {
    if (styles.length === 0) return false;
    const allConfigs = Array.from(styleConfigurations.values());
    return styles.every((style) => {
      const config = allConfigs.find((c) => c.id === style.id);
      return config && config.isValid;
    });
  }, [styles, styleConfigurations]);

  const handleApply = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setSubmitError(null);

    try {
      const allConfigs = Array.from(styleConfigurations.values());
      let totalStylesCreated = 0;

      // Process each style configuration
      for (const styleConfig of allConfigs) {
        const style = styles.find((s) => s.id === styleConfig.id);
        if (!style || !styleConfig.isValid) continue;

        console.log(
          `🚀 Generating typography system for "${style.name}":`,
          styleConfig.config
        );

        const result = await pluginApi.createTypographySystem(
          styleConfig.config
        );

        if (result.success) {
          console.log(
            `✅ Typography system "${style.name}" created successfully:`,
            result
          );
          totalStylesCreated += result.styles.length;
        } else {
          throw new Error(
            `Failed to create "${style.name}": ${result.message}`
          );
        }
      }

      // Success notification
      await pluginApi.notify(
        `Successfully created ${totalStylesCreated} text styles from ${allConfigs.length} typography systems!`
      );
    } catch (error) {
      console.error("❌ Error generating typography systems:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to generate typography systems"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main content area */}
      <div className="flex-1 p-4 overflow-auto">
        {/* List of text styles */}
        <div className="space-y-4">
          <Accordion.Root
            type="multiple"
            className="space-y-4"
            value={openItems}
            onValueChange={setOpenItems}
          >
            {styles.map((style) => (
              <TextStyle
                key={style.id}
                styleId={style.id}
                mode="edit"
                onDelete={() => handleDeleteStyle(style.id)}
                onConfigurationChange={getConfigCallback(style.id)}
              />
            ))}
          </Accordion.Root>

          {/* Add new style */}
          <button
            onClick={handleAddStyle}
            className="flex items-center justify-center w-full gap-3 p-6 text-sm italic font-normal transition-colors border border-dashed rounded-lg cursor-default text-muted-foreground bg-foreground/5 border-muted-foreground/25 hover:border-muted-foreground/50"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="text-sm font-normal">Add new style</span>
          </button>
        </div>
      </div>

      {/* Sticky bottom action area */}
      <div className="sticky bottom-0 flex flex-col gap-3 p-4 border-t border-border bg-background">
        {submitError && (
          <div className="p-3 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
            {submitError}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {styles.length} {styles.length === 1 ? "style" : "styles"}{" "}
            configured
          </span>
          <Button
            disabled={!canGenerate || isGenerating}
            onClick={handleApply}
            className="cursor-default"
          >
            {isGenerating ? "Generating..." : "Apply"}
          </Button>
        </div>
      </div>
    </div>
  );
}
