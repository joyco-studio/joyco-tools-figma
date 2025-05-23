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
      return fonts.map((font) => ({
        family: font.fontName.family,
        style: font.fontName.style,
      }));
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

      // Map variables to our interface with collection names
      const variablesWithCollections = typographyVariables.map((variable) => {
        const collection = collections.find(
          (col) => col.id === variable.variableCollectionId
        );
        console.log(
          `🏷️ Variable "${variable.name}" belongs to collection:`,
          collection?.name
        );
        return {
          id: variable.id,
          name: variable.name,
          resolvedType: variable.resolvedType,
          description: variable.description,
          collectionName: collection?.name || "Unknown Collection",
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
