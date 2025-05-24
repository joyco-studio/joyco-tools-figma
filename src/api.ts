import { createPluginAPI, createUIAPI } from "figma-jsonrpc";

export const pluginApi = createPluginAPI({
  exit() {
    figma.closePlugin();
  },
  notify(message: string) {
    figma.notify(message);
  },
  async getAvailableFonts() {
    try {
      const fonts = await figma.listAvailableFontsAsync();

      // Group fonts by family and collect all available styles/weights
      const fontFamilies = new Map();

      fonts.forEach((font) => {
        const family = font.fontName.family;
        const style = font.fontName.style;

        if (!fontFamilies.has(family)) {
          fontFamilies.set(family, {
            family: family,
            styles: [],
          });
        }

        fontFamilies.get(family).styles.push(style);
      });

      // Convert to array and sort families alphabetically
      const groupedFonts = Array.from(fontFamilies.values())
        .map((fontFamily) => ({
          family: fontFamily.family,
          styles: fontFamily.styles.sort(), // Sort styles alphabetically
        }))
        .sort((a, b) => a.family.localeCompare(b.family)); // Sort families alphabetically

      console.log("Grouped fonts by family:", groupedFonts.length, "families");
      return groupedFonts;
    } catch (error) {
      console.error("Error loading fonts:", error);
      return [];
    }
  },
  async getAvailableVariables() {
    try {
      console.log("🔍 Fetching variables from plugin context...");

      // Get all local variable collections
      const collections = await figma.variables.getLocalVariableCollections();
      console.log("📚 Collections found:", collections.length, collections);

      // Get all local variables
      const allVariables = await figma.variables.getLocalVariables();
      console.log("🔤 All variables found:", allVariables.length, allVariables);

      // Log variable types to see what we're working with
      const variableTypes = allVariables.map((v) => ({
        name: v.name,
        type: v.resolvedType,
      }));
      console.log("📝 Variable types:", variableTypes);

      // Filter for typography-relevant variables (STRING and FLOAT types)
      const typographyVariables = allVariables.filter(
        (variable) =>
          variable.resolvedType === "STRING" ||
          variable.resolvedType === "FLOAT"
      );
      console.log(
        "✨ Typography variables after filtering:",
        typographyVariables.length,
        typographyVariables
      );

      // Map variables to our interface with collection names and resolved values
      const variablesWithCollections = typographyVariables.map((variable) => {
        const collection = collections.find(
          (col) => col.id === variable.variableCollectionId
        );

        // Get the resolved value for STRING variables
        let resolvedValue: string | number | undefined = undefined;
        if (
          variable.resolvedType === "STRING" ||
          variable.resolvedType === "FLOAT"
        ) {
          const modeIds = Object.keys(variable.valuesByMode);
          if (modeIds.length > 0) {
            const modeId = modeIds[0]; // Use the first mode
            resolvedValue = variable.valuesByMode[modeId] as string | number;
          }
        }

        console.log(
          `🏷️ Variable "${variable.name}" belongs to collection:`,
          collection?.name,
          "resolved value:",
          resolvedValue
        );
        return {
          id: variable.id,
          name: variable.name,
          resolvedType: variable.resolvedType,
          description: variable.description,
          collectionName: collection?.name || "Unknown Collection",
          resolvedValue: resolvedValue,
        };
      });

      console.log(
        "🎯 Final variables with collections:",
        variablesWithCollections
      );
      return variablesWithCollections;
    } catch (error) {
      console.error("❌ Error loading variables:", error);
      return [];
    }
  },
  createRectangle(count: number) {
    const nodes = [];

    for (let i = 0; i < count; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  },
  async createTypographySystem(config: {
    name: string;
    fontSource: "type" | "variable";

    // Font-based configuration
    fontFamily?: string;
    styles?: string[];

    // Variable-based configuration
    variableId?: string;

    // Typography settings (disabled when manual)
    lineHeight?: number;
    letterSpacing?: number; // percentage

    // Scale configuration
    isManualScale: boolean;
    scaleRatio?: number;
    manualSizes?: Array<{
      id: string;
      name: string;
      size: number;
      lineHeight: number;
      letterSpacing: number;
      // Optional variable binding for size
      sizeVariable?: Variable | null;
    }>;
  }) {
    try {
      console.log("🚀 Creating typography system:", config);

      // Validate configuration using Figma types
      if (
        config.fontSource === "type" &&
        (!config.fontFamily || !config.styles?.length)
      ) {
        throw new Error(
          "Font family and styles are required for type-based typography"
        );
      }

      if (config.fontSource === "variable" && !config.variableId) {
        throw new Error(
          "Variable ID is required for variable-based typography"
        );
      }

      if (!config.isManualScale && !config.scaleRatio) {
        throw new Error("Scale ratio is required for predefined scale");
      }

      if (config.isManualScale && !config.manualSizes?.length) {
        throw new Error("Manual sizes are required for manual scale");
      }

      let fontFamily: string;
      let availableStyles: string[];
      let baseVariable: Variable | null = null;

      // Step 1: Resolve font information
      if (config.fontSource === "variable") {
        console.log(
          "📝 Resolving typography from variable:",
          config.variableId
        );

        // Get the variable using Figma's type
        const variable = await figma.variables.getVariableById(
          config.variableId
        );
        if (!variable) {
          throw new Error("Typography variable not found");
        }

        baseVariable = variable;

        // For variable-based typography, we'll determine font info from the variable
        // but we'll bind the actual variable to the text style properties
        if (variable.resolvedType === "STRING") {
          // For string variables, assume they contain font family information
          const modeId = Object.keys(variable.valuesByMode)[0];
          fontFamily = variable.valuesByMode[modeId] as string;

          // Get available styles for this font family
          const fonts: Font[] = await figma.listAvailableFontsAsync();
          const fontStyles = fonts
            .filter((font) => font.fontName.family === fontFamily)
            .map((font) => font.fontName.style);
          availableStyles = [...new Set(fontStyles)];

          console.log(
            `🎨 Variable resolved to font: ${fontFamily} with styles:`,
            availableStyles
          );
        } else {
          // For other variable types, we might need different handling
          // For now, we'll require the user to specify font family manually or via another variable
          throw new Error(
            "Variable-based typography currently requires string variables containing font family"
          );
        }
      } else {
        // Type-based: use provided font family and styles
        fontFamily = config.fontFamily!;
        availableStyles = config.styles!;

        console.log(
          `🎨 Using font: ${fontFamily} with styles:`,
          availableStyles
        );

        // Validate that all requested styles are available using Figma types
        const fonts: Font[] = await figma.listAvailableFontsAsync();
        const actualAvailableStyles = fonts
          .filter((font) => font.fontName.family === fontFamily)
          .map((font) => font.fontName.style);

        const invalidStyles = availableStyles.filter(
          (style) => !actualAvailableStyles.includes(style)
        );

        if (invalidStyles.length > 0) {
          throw new Error(
            `Font styles not available: ${invalidStyles.join(", ")}`
          );
        }
      }

      // Step 2: Generate size scale with new naming logic
      let sizeScale: Array<{
        name: string;
        size: number;
        lineHeight: number;
        letterSpacing: number;
      }>;

      if (config.isManualScale) {
        // Use manual sizes - default to number names if not specified
        sizeScale = config.manualSizes!.map((size, index) => ({
          name: size.name || (index + 1).toString(),
          size: size.size,
          lineHeight: size.lineHeight,
          letterSpacing: size.letterSpacing,
        }));

        console.log("📏 Using manual scale:", sizeScale);
      } else {
        // Generate predefined scale - 9 sizes starting from 10px
        const ratio = config.scaleRatio!;
        const baseSize = 10; // Start from 10px
        const defaultLineHeight = config.lineHeight || 1.4;
        const defaultLetterSpacing = config.letterSpacing || 0;

        sizeScale = Array.from({ length: 9 }, (_, index) => ({
          name: (index + 1).toString(), // "1", "2", "3", ... "9"
          size: Math.round(baseSize * Math.pow(ratio, index)),
          lineHeight: defaultLineHeight,
          letterSpacing: defaultLetterSpacing,
        }));

        console.log(
          `📏 Generated scale with ratio ${ratio} (9 sizes from 10px):`,
          sizeScale
        );
      }

      // Step 3: Create text styles in Figma with new naming structure
      const createdStyles: Array<{
        id: string;
        name: string;
        fontFamily: string;
        style: string;
        size: number;
        lineHeight: number;
        letterSpacing: number;
      }> = [];

      for (const style of availableStyles) {
        for (const size of sizeScale) {
          try {
            // Load the font before creating style using Figma types
            await figma.loadFontAsync({
              family: fontFamily,
              style: style,
            } as FontName);

            // Create text style using Figma API
            const textStyle: TextStyle = figma.createTextStyle();

            // New naming structure: {Name}/{Number}/{Style}
            textStyle.name = `${config.name}/${size.name}/${style}`;

            // Apply typography settings using Figma types
            textStyle.fontName = {
              family: fontFamily,
              style: style,
            } as FontName;

            textStyle.fontSize = size.size;

            // Set line height using Figma's LineHeight type
            textStyle.lineHeight = {
              value: Math.round(size.size * size.lineHeight),
              unit: "PIXELS",
            } as LineHeight;

            // Set letter spacing using Figma's LetterSpacing type
            textStyle.letterSpacing = {
              value: size.letterSpacing / 100, // Convert % to decimal
              unit: "PERCENT",
            } as LetterSpacing;

            // If using variable, bind variable to text style properties
            if (baseVariable && config.fontSource === "variable") {
              textStyle.description = `Generated from variable: ${baseVariable.name}`;

              try {
                // Bind the font family variable to the text style
                if (baseVariable.resolvedType === "STRING") {
                  console.log(
                    `🔗 Binding variable ${baseVariable.name} to fontFamily property`
                  );
                  // Use type assertion as the TypeScript types may be outdated
                  (textStyle as any).setBoundVariable(
                    "fontFamily",
                    baseVariable
                  );
                  console.log("✅ Successfully bound fontFamily variable");
                }
              } catch (bindingError) {
                console.warn(
                  "⚠️ Failed to bind fontFamily variable:",
                  bindingError
                );
                textStyle.description += " (Variable binding failed)";
              }
            }

            // If manual sizes have variable bindings, apply them
            if (config.isManualScale && config.manualSizes) {
              const currentSize = config.manualSizes.find(
                (s) => s.name === size.name
              );
              if (currentSize?.sizeVariable) {
                try {
                  console.log(`🔗 Binding size variable to fontSize property`);

                  // Get the actual Figma Variable object if we have an ID
                  let sizeVariable = currentSize.sizeVariable;
                  if (typeof sizeVariable === "string") {
                    sizeVariable = await figma.variables.getVariableById(
                      sizeVariable
                    );
                  } else if (
                    sizeVariable &&
                    typeof sizeVariable === "object" &&
                    sizeVariable.id
                  ) {
                    // If we have our interface object, get the actual Figma variable
                    sizeVariable = await figma.variables.getVariableById(
                      sizeVariable.id
                    );
                  }

                  if (sizeVariable) {
                    // Use type assertion as the TypeScript types may be outdated
                    (textStyle as any).setBoundVariable(
                      "fontSize",
                      sizeVariable
                    );
                    console.log("✅ Successfully bound fontSize variable");
                  } else {
                    console.warn("⚠️ Could not resolve size variable");
                  }
                } catch (bindingError) {
                  console.warn(
                    "⚠️ Failed to bind fontSize variable:",
                    bindingError
                  );
                }
              }
            }

            createdStyles.push({
              id: textStyle.id,
              name: textStyle.name,
              fontFamily,
              style,
              size: size.size,
              lineHeight: size.lineHeight,
              letterSpacing: size.letterSpacing,
            });

            console.log(`✅ Created text style: ${textStyle.name}`);
          } catch (styleError) {
            console.error(
              `❌ Failed to create style ${size.name}/${style}:`,
              styleError
            );
            throw new Error(
              `Failed to create text style ${size.name}/${style}: ${
                styleError instanceof Error
                  ? styleError.message
                  : "Unknown error"
              }`
            );
          }
        }
      }

      console.log(
        `🎉 Successfully created ${createdStyles.length} text styles`
      );

      // Step 4: Return summary
      return {
        success: true,
        message: `Created ${createdStyles.length} text styles in group "${config.name}"`,
        styles: createdStyles,
        config: {
          name: config.name,
          fontFamily,
          styles: availableStyles,
          scale: sizeScale,
          isManualScale: config.isManualScale,
          scaleRatio: config.scaleRatio,
        },
      };
    } catch (error) {
      console.error("❌ Error creating typography system:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create typography system",
        error: error,
      };
    }
  },
});

let eventCallback = {
  selectionChanged: (selection) => {},
  pageChanged: (page) => {},
};

export const setEventCallback = (name: string, callback: Function) => {
  eventCallback[name] = callback;
};

export const uiApi = createUIAPI({
  selectionChanged(selection) {
    eventCallback.selectionChanged(selection.map((item) => item.id));
  },
  pageChanged(page) {
    eventCallback.pageChanged(page);
  },
});
