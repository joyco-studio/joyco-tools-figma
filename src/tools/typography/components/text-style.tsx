import * as React from "react";
import { Type, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  FolderTabs,
  FolderTabsList,
  FolderTabsTrigger,
  FolderTabsContent,
} from "../../../components/folder-tabs";

// Custom components
import { AutoResizeInput } from "./auto-resize-input";
import { FontSelector } from "./font-selector";
import { StylesSelector } from "./styles-selector";
import { TypographySettings } from "./typography-settings";
import { ManualSizesSection } from "./manual-sizes-section";

// Icons
import { AutoIcon } from "../../../components/icons/auto-icon";
import { ManualIcon } from "../../../components/icons/manual-icon";

// Types and hooks
import type { TextStyleProps } from "../../../lib/types/typography";
import { useTypographyState } from "../../../lib/hooks/use-typography-state";
import { useFontsStore, useVariablesStore } from "../../../stores/fonts";

// Utils
import {
  getAvailableStyles,
  filterFontsByQuery,
} from "../../../lib/utils/typography";
import { SCALE_RATIO_OPTIONS } from "../../../lib/constants/typography";

export function TextStyle({
  currentFont,
  onChange,
  onDelete,
  mode,
  onConfigurationChange,
}: TextStyleProps) {
  const { state, actions, validate, isValid } = useTypographyState();
  const { fonts, isLoading: fontsLoading } = useFontsStore();
  const { variables, isLoading: variablesLoading } = useVariablesStore();

  // Derived state
  const availableStyles = React.useMemo(
    () =>
      getAvailableStyles(
        state.config.fontSource,
        state.config.fontFamily || "",
        state.selectedVariable,
        fonts
      ),
    [
      state.config.fontSource,
      state.config.fontFamily,
      state.selectedVariable,
      fonts,
    ]
  );

  const filteredFonts = React.useMemo(
    () => filterFontsByQuery(fonts, state.searchQuery),
    [fonts, state.searchQuery]
  );

  // Effects
  React.useEffect(() => {
    if (currentFont) {
      actions.setConfig({
        fontFamily: currentFont.family.trim(),
      });
    }
  }, [currentFont, actions]);

  React.useEffect(() => {
    if (state.scalingMode === "auto" && availableStyles.length > 0) {
      actions.setAllStyles(availableStyles);
    }
  }, [state.scalingMode, availableStyles, actions]);

  React.useEffect(() => {
    if (state.scalingMode === "manual" && availableStyles.length > 0) {
      // Update manual sizes with available styles
      const updatedSizes = state.config.manualSizes?.map((size) => ({
        ...size,
        styles:
          size.styles.length === 0
            ? [availableStyles[0]]
            : size.styles.filter((s) => availableStyles.includes(s)),
      }));

      if (updatedSizes) {
        actions.setConfig({ manualSizes: updatedSizes });
      }
    }
  }, [availableStyles, state.scalingMode, actions]);

  React.useEffect(() => {
    if (onConfigurationChange) {
      const isValidConfig = validate(availableStyles);
      onConfigurationChange(state.config, isValidConfig);
    }
  }, [state.config, validate, availableStyles, onConfigurationChange]);

  // Handlers
  const handleNameSubmit = React.useCallback(() => {
    actions.setEditingName(false);
  }, [actions]);

  const handleNameKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleNameSubmit();
      if (e.key === "Escape") actions.setEditingName(false);
    },
    [handleNameSubmit, actions]
  );

  const handleDelete = React.useCallback(() => {
    if (
      onDelete &&
      window.confirm("Are you sure you want to delete this style?")
    ) {
      onDelete();
    }
  }, [onDelete]);

  const handleFontSelect = React.useCallback(
    (fontFamily: string) => {
      actions.setConfig({ fontFamily });
      actions.setVariable(null);
      actions.setSearchQuery("");
      actions.clearError("fontFamily");

      if (onChange) {
        onChange({
          name: state.config.name || `Style ${fontFamily}`,
          fontName: { family: fontFamily, style: currentFont?.style || "" },
        });
      }
    },
    [actions, state.config.name, onChange, currentFont]
  );

  const handleVariableSelect = React.useCallback(
    (variable: any) => {
      actions.setVariable(variable);
      actions.clearError("fontFamily");
    },
    [actions]
  );

  const handleVariableUnlink = React.useCallback(() => {
    actions.setVariable(null);
    actions.setConfig({ fontFamily: "" });
  }, [actions]);

  return (
    <div className="w-full transition-colors border rounded-lg border-muted-foreground/25 hover:border-muted-foreground/50">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-1 pr-1 border-b border-border">
        <div className="flex items-center flex-1 gap-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Type className="size-3" />
            <span>/</span>
          </div>

          <div className="relative flex-1">
            {state.isEditingName ? (
              <AutoResizeInput
                value={state.config.name}
                onValueChange={(value) => actions.setConfig({ name: value })}
                onBlur={handleNameSubmit}
                onKeyDown={handleNameKeyDown}
                className="px-3 py-2 text-sm font-medium h-7"
                autoFocus
              />
            ) : (
              <button
                onClick={() => actions.setEditingName(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-left rounded-md cursor-default h-7 text-foreground/50 hover:text-foreground/80 focus:outline-none focus:text-foreground/80 hover:bg-muted/50"
              >
                <span>{state.config.name}</span>
                <span className="ml-1">
                  <Pencil className="size-3 opacity-60" />
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 px-2 cursor-default text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              title="Delete style"
            >
              <Trash2 className="size-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => actions.setExpanded(!state.isExpanded)}
            className="h-8 px-3 py-1 cursor-default"
          >
            {state.isExpanded ? (
              <ChevronDown className="size-5" />
            ) : (
              <ChevronRight className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      {state.isExpanded && (
        <div className="flex flex-col gap-6 px-4 py-6">
          {/* Font Selection */}
          <FormField label="Font Family">
            <FontSelector
              value={state.config.fontFamily || ""}
              selectedVariable={state.selectedVariable}
              searchQuery={state.searchQuery}
              fonts={filteredFonts}
              isLoading={fontsLoading}
              isOpen={state.popoverStates.fonts}
              onOpenChange={(open) => actions.setPopover("fonts", open)}
              onSearchChange={actions.setSearchQuery}
              onFontSelect={handleFontSelect}
              onVariableSelect={handleVariableSelect}
              onVariableUnlink={handleVariableUnlink}
            />
          </FormField>

          {/* Scaling Mode */}
          <FormField label="Scaling Mode">
            <FolderTabs
              value={state.scalingMode}
              onValueChange={(value) =>
                actions.setScalingMode(value as "auto" | "manual")
              }
            >
              <FolderTabsList>
                <FolderTabsTrigger
                  value="auto"
                  icon={<AutoIcon />}
                  description="Generate sizes automatically with consistent scaling ratios"
                >
                  Auto
                </FolderTabsTrigger>
                <FolderTabsTrigger
                  value="manual"
                  icon={<ManualIcon />}
                  description="Define each size individually with custom properties"
                >
                  Manual
                </FolderTabsTrigger>
              </FolderTabsList>

              <FolderTabsContent value="auto">
                <div className="space-y-6">
                  {/* Styles Selection */}
                  <FormField label="Styles">
                    <StylesSelector
                      selectedStyles={state.config.styles}
                      availableStyles={availableStyles}
                      isOpen={state.popoverStates.styles}
                      onOpenChange={(open) =>
                        actions.setPopover("styles", open)
                      }
                      onToggleStyle={actions.toggleStyle}
                      onSetAllStyles={actions.setAllStyles}
                      error={state.errors.styles}
                    />
                  </FormField>

                  {/* Typography Settings */}
                  <TypographySettings
                    lineHeight={state.config.lineHeight!}
                    letterSpacing={state.config.letterSpacing!}
                    scaleRatio={state.config.scaleRatio!}
                    onLineHeightChange={(value) => {
                      actions.setConfig({ lineHeight: value });
                      actions.clearError("lineHeight");
                    }}
                    onLetterSpacingChange={(value) => {
                      actions.setConfig({ letterSpacing: value });
                      actions.clearError("letterSpacing");
                    }}
                    onScaleRatioChange={(value) => {
                      actions.setConfig({ scaleRatio: value });
                      actions.clearError("scaleRatio");
                    }}
                    ratioOptions={SCALE_RATIO_OPTIONS}
                    isRatioOpen={state.popoverStates.ratio}
                    onRatioOpenChange={(open) =>
                      actions.setPopover("ratio", open)
                    }
                    errors={state.errors}
                  />
                </div>
              </FolderTabsContent>

              <FolderTabsContent value="manual">
                <ManualSizesSection
                  sizes={state.config.manualSizes || []}
                  availableStyles={availableStyles}
                  onSizesChange={(sizes) =>
                    actions.setConfig({ manualSizes: sizes })
                  }
                  onAddSize={() =>
                    actions.addManualSize(
                      availableStyles,
                      state.config.scaleRatio || 1.2
                    )
                  }
                  onRemoveSize={actions.removeManualSize}
                  onUpdateSize={actions.updateManualSize}
                  error={state.errors.manualSizes}
                />
              </FolderTabsContent>
            </FolderTabs>
          </FormField>
        </div>
      )}
    </div>
  );
}
