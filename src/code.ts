figma.showUI(__html__, {
  themeColors: true,
  width: 720,
  height: 540,
});

import * as api from "./api";

figma.on("selectionchange", () => {
  api.uiApi.selectionChanged(figma.currentPage.selection);
});

figma.on("currentpagechange", () => {
  api.uiApi.pageChanged(figma.currentPage);
});

// Handle messages from UI (currently no direct message handling needed)
figma.ui.onmessage = async (msg) => {
  // All functionality has been moved to the API pattern
  // Future direct message handling can be added here if needed
};
