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
