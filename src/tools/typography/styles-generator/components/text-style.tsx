import * as React from "react";
import {
  Type,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Zap,
  Sliders,
} from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";

// UI Components
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  FolderTabs,
  FolderTabsList,
  FolderTabsTrigger,
  FolderTabsContent,
} from "@/components/folder-tabs";

// Custom components
import { AutoResizeInput } from "./auto-resize-input";
import { FontSelector } from "./font-selector";
import { TypographySettings } from "./typography-settings";
import { ManualSizesSection } from "./manual-sizes-section";

// Types and hooks
import type { TextStyleProps } from "@/lib/types/typography";
import { useTypographyState } from "@/lib/hooks/use-typography-state";
import { useFontsStore, useVariablesStore } from "@/stores/fonts";

// Utils
import {
  getAvailableStyles,
  filterFontsByQuery,
  validateTypographyConfig,
} from "@/lib/utils/typography";
import { SCALE_RATIO_OPTIONS } from "@/lib/constants/typography";

export function TextStyle({
  styleId,
  onDelete,
  mode,
  onConfigurationChange,
}: TextStyleProps) {
  const { state, actions } = useTypographyState();
  const {
    setConfig,
    setScalingMode,
    setVariable,
    setSearchQuery,
    setEditingName,
    setPopover,
    addManualSize,
    removeManualSize,
    updateManualSize,
    toggleStyle,
    setAllStyles,
    reset,
  } = actions;
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

  // Direct validation computation - stable
  const currentErrors = React.useMemo(() => {
    return validateTypographyConfig(
      state.config,
      state.scalingMode,
      availableStyles
    );
  }, [state.config, state.scalingMode, availableStyles]);

  const isCurrentlyValid = React.useMemo(() => {
    return Object.keys(currentErrors).length === 0;
  }, [currentErrors]);

  // Check if a font is selected (either type font or variable)
  const hasFontSelected = React.useMemo(() => {
    return (
      (state.config.fontSource === "type" && state.config.fontFamily?.trim()) ||
      (state.config.fontSource === "variable" && state.selectedVariable)
    );
  }, [
    state.config.fontSource,
    state.config.fontFamily,
    state.selectedVariable,
  ]);

  // Notify parent of configuration changes
  React.useEffect(() => {
    if (onConfigurationChange) {
      onConfigurationChange(state.config, isCurrentlyValid);
    }
  }, [state.config, isCurrentlyValid, onConfigurationChange]);

  // Simple handlers without complex logic
  const handleNameSubmit = React.useCallback(() => {
    setEditingName(false);
  }, [setEditingName]);

  const handleNameKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleNameSubmit();
      if (e.key === "Escape") setEditingName(false);
    },
    [handleNameSubmit, setEditingName]
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
      setConfig({ fontFamily });
      setVariable(null);
      setSearchQuery("");

      // Auto-select all styles when in auto mode and font is selected
      if (state.scalingMode === "auto") {
        const newAvailableStyles = getAvailableStyles(
          state.config.fontSource,
          fontFamily,
          null,
          fonts
        );
        if (newAvailableStyles.length > 0) {
          setAllStyles(newAvailableStyles);
        }
      }

      if (onConfigurationChange) {
        onConfigurationChange(state.config, isCurrentlyValid);
      }
    },
    [
      setConfig,
      setVariable,
      setSearchQuery,
      state.scalingMode,
      state.config.fontSource,
      fonts,
      setAllStyles,
      isCurrentlyValid,
      onConfigurationChange,
    ]
  );

  const handleVariableSelect = React.useCallback(
    (variable: any) => {
      setVariable(variable);

      // Auto-select all styles when in auto mode and variable is selected
      if (state.scalingMode === "auto") {
        const newAvailableStyles = getAvailableStyles(
          "variable",
          state.config.fontFamily || "",
          variable,
          fonts
        );
        if (newAvailableStyles.length > 0) {
          setAllStyles(newAvailableStyles);
        }
      }
    },
    [
      setVariable,
      state.scalingMode,
      state.config.fontFamily,
      fonts,
      setAllStyles,
    ]
  );

  const handleVariableUnlink = React.useCallback(() => {
    setVariable(null);
    setConfig({ fontFamily: "" });
  }, [setVariable, setConfig]);

  const handleScalingModeChange = React.useCallback(
    (mode: "auto" | "manual") => {
      setScalingMode(mode);

      // Auto-select all styles when switching to auto mode if font is already selected
      if (mode === "auto" && availableStyles.length > 0) {
        setAllStyles(availableStyles);
      }

      // When switching to manual mode, ensure styles are selected and manual sizes have styles
      if (mode === "manual" && availableStyles.length > 0) {
        // Auto-select styles if no styles are selected
        if (state.config.styles.length === 0) {
          setAllStyles(availableStyles);
        }

        // Update existing manual sizes that have empty styles
        const currentManualSizes = state.config.manualSizes || [];
        const needsStyleUpdate = currentManualSizes.some(
          (size) => size.styles.length === 0
        );

        if (needsStyleUpdate) {
          // Always use ALL available styles for manual sizes
          const updatedSizes = currentManualSizes.map((size) =>
            size.styles.length === 0
              ? { ...size, styles: availableStyles }
              : size
          );
          setConfig({ manualSizes: updatedSizes });
        }
      }
    },
    [
      setScalingMode,
      availableStyles,
      setAllStyles,
      state.config.styles.length,
      state.config.manualSizes,
      setConfig,
    ]
  );

  return (
    <Accordion.Item
      value={styleId}
      className="w-full transition-colors border rounded-lg border-muted-foreground/25 hover:border-muted-foreground/50 overflow-clip"
    >
      <Accordion.Header className="flex items-center justify-between w-full gap-2 px-4 py-1 pr-1">
        <div className="flex items-center flex-1 gap-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Type className="size-3" />
            <span>/</span>
          </div>

          <div className="relative flex-1">
            {state.isEditingName ? (
              <AutoResizeInput
                value={state.config.name}
                onValueChange={(value) => setConfig({ name: value })}
                onBlur={handleNameSubmit}
                onKeyDown={handleNameKeyDown}
                className="px-3 py-2 text-sm font-medium h-7"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
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

          <Accordion.Trigger className="flex items-center justify-center h-8 px-2 rounded-md cursor-default hover:bg-muted/50 data-[state=open]:rotate-180">
            <ChevronDown className="size-5" />
          </Accordion.Trigger>
        </div>
      </Accordion.Header>

      <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
        <div className="flex flex-col gap-6 pt-6 border-t border-border">
          {/* Font Selection */}
          <FormField size="lg" className="px-4" label="Font Family">
            <FontSelector
              value={state.config.fontFamily || ""}
              selectedVariable={state.selectedVariable}
              searchQuery={state.searchQuery}
              fonts={filteredFonts}
              isLoading={fontsLoading}
              isOpen={state.popoverStates.fonts}
              onOpenChange={(open) => setPopover("fonts", open)}
              onSearchChange={setSearchQuery}
              onFontSelect={handleFontSelect}
              onVariableSelect={handleVariableSelect}
              onVariableUnlink={handleVariableUnlink}
            />
          </FormField>

          {/* Scaling Mode */}
          <div
            className={`${
              !hasFontSelected ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <FolderTabs
              value={state.scalingMode}
              onValueChange={
                hasFontSelected ? handleScalingModeChange : undefined
              }
            >
              <FolderTabsList className="pl-4">
                <FolderTabsTrigger
                  className="uppercase"
                  value="auto"
                  icon={<Zap className="size-3" />}
                  disabled={!hasFontSelected}
                >
                  Auto
                </FolderTabsTrigger>
                <FolderTabsTrigger
                  className="uppercase"
                  value="manual"
                  icon={<Sliders className="size-3" />}
                  disabled={!hasFontSelected}
                >
                  Manual
                </FolderTabsTrigger>
              </FolderTabsList>

              <FolderTabsContent value="auto">
                <div className="p-4 space-y-6">
                  {/* Typography Settings with new grid layout */}
                  <TypographySettings
                    initialSize={state.config.initialSize || 12}
                    steps={state.config.steps || 9}
                    lineHeight={state.config.lineHeight!}
                    letterSpacing={state.config.letterSpacing!}
                    textCase={state.config.textCase || "ORIGINAL"}
                    scaleRatio={state.config.scaleRatio!}
                    selectedStyles={state.config.styles}
                    availableStyles={availableStyles}
                    lineHeightVariable={state.config.lineHeightVariable}
                    letterSpacingVariable={state.config.letterSpacingVariable}
                    onInitialSizeChange={(value) => {
                      setConfig({ initialSize: value });
                    }}
                    onStepsChange={(value) => {
                      setConfig({ steps: value });
                    }}
                    onLineHeightChange={(value) => {
                      setConfig({ lineHeight: value });
                    }}
                    onLetterSpacingChange={(value) => {
                      setConfig({ letterSpacing: value });
                    }}
                    onTextCaseChange={(value) => {
                      setConfig({ textCase: value });
                    }}
                    onScaleRatioChange={(value) => {
                      setConfig({ scaleRatio: value });
                    }}
                    onToggleStyle={toggleStyle}
                    onSetAllStyles={setAllStyles}
                    onLineHeightVariableSelect={(variable) => {
                      setConfig({ lineHeightVariable: variable });
                    }}
                    onLetterSpacingVariableSelect={(variable) => {
                      setConfig({ letterSpacingVariable: variable });
                    }}
                    ratioOptions={SCALE_RATIO_OPTIONS}
                    isRatioOpen={state.popoverStates.ratio}
                    onRatioOpenChange={(open) => setPopover("ratio", open)}
                    isStylesOpen={state.popoverStates.styles}
                    onStylesOpenChange={(open) => setPopover("styles", open)}
                    errors={currentErrors}
                  />
                </div>
              </FolderTabsContent>

              <FolderTabsContent value="manual">
                <ManualSizesSection
                  sizes={state.config.manualSizes || []}
                  availableStyles={availableStyles}
                  onSizesChange={(sizes) => setConfig({ manualSizes: sizes })}
                  onAddSize={() =>
                    addManualSize(
                      availableStyles,
                      state.config.scaleRatio || 1.2
                    )
                  }
                  onRemoveSize={removeManualSize}
                  onUpdateSize={updateManualSize}
                  error={currentErrors.manualSizes}
                />
              </FolderTabsContent>
            </FolderTabs>
          </div>
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}
