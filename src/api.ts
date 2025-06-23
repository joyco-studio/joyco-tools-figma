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
  async createColorVariables(config: {
    name: string;
    collectionId?: string;
    modes: Array<{ id: string; name: string }>;
    entries: Array<{
      id: string;
      name: string;
      values: Record<string, string>;
    }>;
    generateOpacityVariants: boolean;
    opacitySteps: number[];
  }) {
    try {
      console.log("🚀 Creating color variables:", config);

      let collection: VariableCollection;

      if (config.collectionId) {
        // Edit existing collection
        collection = await figma.variables.getVariableCollectionById(
          config.collectionId
        );
        if (!collection) {
          throw new Error("Collection not found");
        }
        console.log("📝 Using existing collection:", collection.name);
      } else {
        // Create new collection
        collection = figma.variables.createVariableCollection(config.name);
        console.log("🆕 Created new collection:", collection.name);
      }

      // Set up modes
      const modeMap: Record<string, string> = {};

      // Clear existing modes if creating new collection
      if (!config.collectionId) {
        // Remove default mode
        const existingModes = collection.modes;
        for (let i = 1; i < existingModes.length; i++) {
          collection.removeMode(existingModes[i].modeId);
        }

        // Rename first mode
        if (existingModes.length > 0) {
          collection.renameMode(existingModes[0].modeId, config.modes[0].name);
          modeMap[config.modes[0].id] = existingModes[0].modeId;
        }

        // Add additional modes
        for (let i = 1; i < config.modes.length; i++) {
          const modeId = collection.addMode(config.modes[i].name);
          modeMap[config.modes[i].id] = modeId;
        }
      } else {
        // For existing collections, map existing modes
        config.modes.forEach((mode) => {
          const existingMode = collection.modes.find(
            (m) => m.name === mode.name
          );
          if (existingMode) {
            modeMap[mode.id] = existingMode.modeId;
          } else {
            // Add new mode if it doesn't exist
            const modeId = collection.addMode(mode.name);
            modeMap[mode.id] = modeId;
          }
        });
      }

      console.log("🎨 Mode mapping:", modeMap);

      const createdVariables: Array<{
        id: string;
        name: string;
        description: string;
      }> = [];

      // Group entries by base color name for twin handling
      const groupedEntries = new Map<
        string,
        { main?: any; foreground?: any }
      >();

      // Special case: check if both "background" and "foreground" exist
      const backgroundEntry = config.entries.find(
        (e) => e.name === "background"
      );
      const foregroundEntry = config.entries.find(
        (e) => e.name === "foreground"
      );

      if (backgroundEntry && foregroundEntry) {
        // Group background and foreground under "main"
        groupedEntries.set("main", {
          main: backgroundEntry,
          foreground: foregroundEntry,
        });
      } else {
        // Add them individually if only one exists
        if (backgroundEntry) {
          groupedEntries.set("background", { main: backgroundEntry });
        }
        if (foregroundEntry) {
          groupedEntries.set("foreground", { main: foregroundEntry });
        }
      }

      // Process other entries with normal twin logic
      config.entries.forEach((entry) => {
        // Skip background and foreground as they're handled above
        if (entry.name === "background" || entry.name === "foreground") {
          return;
        }

        const isMainColor = !entry.name.includes("-foreground");
        const baseColorName = entry.name.replace("-foreground", "");

        if (!groupedEntries.has(baseColorName)) {
          groupedEntries.set(baseColorName, {});
        }

        if (isMainColor) {
          groupedEntries.get(baseColorName)!.main = entry;
        } else {
          groupedEntries.get(baseColorName)!.foreground = entry;
        }
      });

      // Helper function to parse colors
      const parseColor = (colorValue: string) => {
        console.log(`🎨 Parsing color: ${colorValue}`);
        let figmaColor;

        if (colorValue.startsWith("#")) {
          // Convert hex to RGB
          const hex = colorValue.replace("#", "");
          const r = parseInt(hex.substring(0, 2), 16) / 255;
          const g = parseInt(hex.substring(2, 4), 16) / 255;
          const b = parseInt(hex.substring(4, 6), 16) / 255;
          figmaColor = { r, g, b };
          console.log(`📝 Hex converted to RGB:`, figmaColor);
        } else if (colorValue.startsWith("rgb")) {
          // Parse RGB values
          const matches = colorValue.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (matches) {
            figmaColor = {
              r: parseInt(matches[1]) / 255,
              g: parseInt(matches[2]) / 255,
              b: parseInt(matches[3]) / 255,
            };
            console.log(`📝 RGB parsed:`, figmaColor);
          }
        } else if (colorValue.startsWith("oklch")) {
          // Parse OKLCH values - oklch(L C H / A)
          const matches = colorValue.match(
            /oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\)/
          );
          if (matches) {
            const l = parseFloat(matches[1]); // Lightness 0-1
            const c = parseFloat(matches[2]); // Chroma 0-0.4+
            const h = parseFloat(matches[3]); // Hue 0-360

            // Better OKLCH to RGB conversion
            const hRad = (h * Math.PI) / 180;
            const a = c * Math.cos(hRad);
            const b = c * Math.sin(hRad);

            // Convert OKLAB to Linear RGB (simplified)
            const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
            const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
            const s_ = l - 0.0894841775 * a - 1.291485548 * b;

            const l_3 = l_ * l_ * l_;
            const m_3 = m_ * m_ * m_;
            const s_3 = s_ * s_ * s_;

            let r =
              +4.0767416621 * l_3 - 3.3077115913 * m_3 + 0.2309699292 * s_3;
            let g =
              -1.2684380046 * l_3 + 2.6097574011 * m_3 - 0.3413193965 * s_3;
            let blue =
              -0.0041960863 * l_3 - 0.7034186147 * m_3 + 1.707614701 * s_3;

            // Clamp to 0-1 range
            r = Math.max(0, Math.min(1, r));
            g = Math.max(0, Math.min(1, g));
            blue = Math.max(0, Math.min(1, blue));

            figmaColor = { r, g, b: blue };
            console.log(
              `📝 OKLCH(${l}, ${c}, ${h}) converted to RGB:`,
              figmaColor
            );
          } else {
            console.warn(`Invalid OKLCH format: ${colorValue}`);
            figmaColor = { r: 0.5, g: 0.5, b: 0.5 };
          }
        } else {
          console.warn(`Unknown color format: ${colorValue}`);
          figmaColor = { r: 0, g: 0, b: 0 };
        }

        return figmaColor;
      };

      // Create variables for each group
      for (const [baseColorName, { main, foreground }] of groupedEntries) {
        // Replace dashes with spaces for group names
        const groupName = baseColorName.replace(/-/g, " ");

        // Create main color variable at group root
        if (main) {
          // Special naming for "main" group (background/foreground)
          const mainVariableName =
            baseColorName === "main"
              ? `${groupName}/background`
              : `${groupName}/${baseColorName}`;

          const mainVariable = figma.variables.createVariable(
            mainVariableName,
            collection.id,
            "COLOR"
          );

          // Set values for each mode
          Object.keys(main.values).forEach((configModeId) => {
            const figmaModeId = modeMap[configModeId];
            if (figmaModeId) {
              try {
                const figmaColor = parseColor(main.values[configModeId]);
                mainVariable.setValueForMode(figmaModeId, figmaColor);
              } catch (colorError) {
                console.warn(
                  `Failed to set color for ${main.name} in mode ${configModeId}:`,
                  colorError
                );
              }
            }
          });

          mainVariable.description = `Color variable: ${main.name}`;
          createdVariables.push({
            id: mainVariable.id,
            name: mainVariable.name,
            description: mainVariable.description,
          });

          console.log(`✅ Created main variable: ${mainVariable.name}`);
        }

        // Create foreground color variable at group root (if it exists)
        if (foreground) {
          // Special naming for "main" group (background/foreground)
          const foregroundVariableName =
            baseColorName === "main"
              ? `${groupName}/foreground`
              : `${groupName}/${baseColorName} foreground`;

          const foregroundVariable = figma.variables.createVariable(
            foregroundVariableName,
            collection.id,
            "COLOR"
          );

          // Set values for each mode
          Object.keys(foreground.values).forEach((configModeId) => {
            const figmaModeId = modeMap[configModeId];
            if (figmaModeId) {
              try {
                const figmaColor = parseColor(foreground.values[configModeId]);
                foregroundVariable.setValueForMode(figmaModeId, figmaColor);
              } catch (colorError) {
                console.warn(
                  `Failed to set foreground color for ${foreground.name} in mode ${configModeId}:`,
                  colorError
                );
              }
            }
          });

          foregroundVariable.description = `Color variable: ${foreground.name}`;
          createdVariables.push({
            id: foregroundVariable.id,
            name: foregroundVariable.name,
            description: foregroundVariable.description,
          });

          console.log(
            `✅ Created foreground variable: ${foregroundVariable.name}`
          );
        }

        // Create opacity variants if enabled
        if (config.generateOpacityVariants) {
          // Create main color opacity variants in subgroup
          if (main) {
            for (const opacity of config.opacitySteps) {
              // Special naming for "main" group opacity variants
              const opacitySubgroupName =
                baseColorName === "main" ? "background" : baseColorName;
              const opacityVariableName = `${groupName}/${opacitySubgroupName} opacity/${opacitySubgroupName}-${opacity
                .toString()
                .replace(".", ",")}`;

              const opacityVariable = figma.variables.createVariable(
                opacityVariableName,
                collection.id,
                "COLOR"
              );

              // Set opacity values for each mode
              Object.keys(main.values).forEach((configModeId) => {
                const figmaModeId = modeMap[configModeId];
                if (figmaModeId) {
                  try {
                    const baseColor = parseColor(main.values[configModeId]);
                    const opacityColor = { ...baseColor, a: opacity / 100 };
                    opacityVariable.setValueForMode(figmaModeId, opacityColor);
                  } catch (colorError) {
                    console.warn(
                      `Failed to set opacity color for ${main.name}-${opacity}:`,
                      colorError
                    );
                  }
                }
              });

              opacityVariable.description = `${main.name} color at ${opacity}% opacity`;
              createdVariables.push({
                id: opacityVariable.id,
                name: opacityVariable.name,
                description: opacityVariable.description,
              });

              console.log(
                `✅ Created opacity variable: ${opacityVariable.name}`
              );
            }
          }

          // Create foreground color opacity variants in subgroup (if it exists)
          if (foreground) {
            for (const opacity of config.opacitySteps) {
              // Special naming for "main" group foreground opacity variants
              const foregroundSubgroupName =
                baseColorName === "main"
                  ? "foreground"
                  : `${baseColorName} foreground`;
              const opacityVariableName = `${groupName}/${foregroundSubgroupName} opacity/${foregroundSubgroupName}-${opacity
                .toString()
                .replace(".", ",")}`;

              const opacityVariable = figma.variables.createVariable(
                opacityVariableName,
                collection.id,
                "COLOR"
              );

              // Set opacity values for each mode
              Object.keys(foreground.values).forEach((configModeId) => {
                const figmaModeId = modeMap[configModeId];
                if (figmaModeId) {
                  try {
                    const baseColor = parseColor(
                      foreground.values[configModeId]
                    );
                    const opacityColor = { ...baseColor, a: opacity / 100 };
                    opacityVariable.setValueForMode(figmaModeId, opacityColor);
                  } catch (colorError) {
                    console.warn(
                      `Failed to set foreground opacity color for ${foreground.name}-${opacity}:`,
                      colorError
                    );
                  }
                }
              });

              opacityVariable.description = `${foreground.name} color at ${opacity}% opacity`;
              createdVariables.push({
                id: opacityVariable.id,
                name: opacityVariable.name,
                description: opacityVariable.description,
              });

              console.log(
                `✅ Created foreground opacity variable: ${opacityVariable.name}`
              );
            }
          }
        }
      }

      console.log(
        `🎉 Successfully created ${createdVariables.length} color variables`
      );

      return {
        success: true,
        message: `Created ${createdVariables.length} color variables in collection "${collection.name}"`,
        variablesCreated: createdVariables.length,
        variables: createdVariables,
        collectionId: collection.id,
        collectionName: collection.name,
      };
    } catch (error) {
      console.error("❌ Error creating color variables:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create color variables",
        error: error,
      };
    }
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
    textCase?:
      | "ORIGINAL"
      | "UPPER"
      | "LOWER"
      | "TITLE"
      | "SMALL_CAPS"
      | "SMALL_CAPS_FORCED";

    // Scale configuration
    isManualScale: boolean;
    scaleRatio?: number;
    manualSizes?: Array<{
      id: string;
      name: string;
      size: number;
      lineHeight: number;
      letterSpacing: number;
      textCase?:
        | "ORIGINAL"
        | "UPPER"
        | "LOWER"
        | "TITLE"
        | "SMALL_CAPS"
        | "SMALL_CAPS_FORCED";
      styles?: string[]; // Add styles to manual sizes
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
      let selectedStyles: string[]; // The styles that should be used for generation
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

          // For variable-based typography, use provided styles or all available styles
          selectedStyles =
            config.styles && config.styles.length > 0
              ? config.styles
              : availableStyles;

          console.log(
            `🎨 Variable resolved to font: ${fontFamily} with available styles:`,
            availableStyles
          );
          console.log(`🎯 Using selected styles:`, selectedStyles);
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
        selectedStyles = config.styles!; // Use the selected styles directly

        console.log(
          `🎨 Using font: ${fontFamily} with selected styles:`,
          selectedStyles
        );

        // Validate that all requested styles are available using Figma types
        const fonts: Font[] = await figma.listAvailableFontsAsync();
        const actualAvailableStyles = fonts
          .filter((font) => font.fontName.family === fontFamily)
          .map((font) => font.fontName.style);

        const invalidStyles = selectedStyles.filter(
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
        textCase:
          | "ORIGINAL"
          | "UPPER"
          | "LOWER"
          | "TITLE"
          | "SMALL_CAPS"
          | "SMALL_CAPS_FORCED";
        styles?: string[]; // Add styles to size scale for manual mode
      }>;

      if (config.isManualScale) {
        // Use manual sizes - default to number names if not specified
        sizeScale = config.manualSizes!.map((size, index) => ({
          name: size.name || (index + 1).toString(),
          size: size.size,
          lineHeight: size.lineHeight,
          letterSpacing: size.letterSpacing,
          textCase: size.textCase || "ORIGINAL",
          styles: size.styles || selectedStyles, // Use size-specific styles or fallback to selected styles
        }));

        console.log("📏 Using manual scale:", sizeScale);
      } else {
        // Generate predefined scale - 9 sizes starting from 10px
        const ratio = config.scaleRatio!;
        const baseSize = 10; // Start from 10px
        const defaultLineHeight = config.lineHeight || 1.4;
        const defaultLetterSpacing = config.letterSpacing || 0;
        const defaultTextCase = config.textCase || "ORIGINAL";

        sizeScale = Array.from({ length: 9 }, (_, index) => ({
          name: (index + 1).toString(), // "1", "2", "3", ... "9"
          size: Math.round(baseSize * Math.pow(ratio, index)),
          lineHeight: defaultLineHeight,
          letterSpacing: defaultLetterSpacing,
          textCase: defaultTextCase,
          // No styles property for auto mode - we'll use selectedStyles globally
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

      // For auto mode, use selectedStyles globally
      // For manual mode, use styles from each size entry
      if (config.isManualScale) {
        // Manual mode: iterate through each size and its specific styles
        for (const size of sizeScale) {
          const stylesToUse = size.styles || selectedStyles;
          for (const style of stylesToUse) {
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
                value: size.lineHeight, // Use percentage value directly (120 for 120%)
                unit: "PERCENT",
              } as LineHeight;

              // Set letter spacing using Figma's LetterSpacing type
              textStyle.letterSpacing = {
                value: size.letterSpacing, // Already in percentage
                unit: "PERCENT",
              } as LetterSpacing;

              // Set text case
              textStyle.textCase = size.textCase as any; // Use type assertion for compatibility

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
              const currentSize = config.manualSizes!.find(
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
      } else {
        // Auto mode: use selectedStyles globally for all sizes
        for (const style of selectedStyles) {
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
                value: size.lineHeight, // Use percentage value directly (120 for 120%)
                unit: "PERCENT",
              } as LineHeight;

              // Set letter spacing using Figma's LetterSpacing type
              textStyle.letterSpacing = {
                value: size.letterSpacing, // Already in percentage
                unit: "PERCENT",
              } as LetterSpacing;

              // Set text case
              textStyle.textCase = size.textCase as any; // Use type assertion for compatibility

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
          styles: selectedStyles, // Return the actual selected styles, not all available ones
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
  async create3DFrame(data: {
    imageData: number[];
    width: number;
    height: number;
    modelName: string;
  }) {
    try {
      console.log(
        "🎯 Creating 3D frame:",
        data.modelName,
        `${data.width}x${data.height}`
      );

      // Create image from the data
      const imageData = new Uint8Array(data.imageData);
      const image = figma.createImage(imageData);

      // Create a rectangle to hold the image
      const rect = figma.createRectangle();
      rect.name = `3D Render - ${data.modelName}`;
      rect.resize(data.width, data.height);

      // Position the rectangle in the viewport
      rect.x = figma.viewport.center.x - data.width / 2;
      rect.y = figma.viewport.center.y - data.height / 2;

      // Set the image fill with no background
      rect.fills = [
        {
          type: "IMAGE",
          imageHash: image.hash,
          scaleMode: "FILL",
        },
      ];

      // Add to current page
      figma.currentPage.appendChild(rect);

      // Select the new image
      figma.currentPage.selection = [rect];
      figma.viewport.scrollAndZoomIntoView([rect]);

      console.log("✅ Successfully created 3D frame:", rect.name);

      return {
        success: true,
        frameName: rect.name,
      };
    } catch (error) {
      console.error("❌ Error creating 3D frame:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
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
