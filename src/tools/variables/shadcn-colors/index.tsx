import * as React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { InlineInput } from "@/components/ui/inline-input";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DraggableTableRow } from "@/components/ui/draggable-table-row";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, GripVertical, Trash2, X } from "lucide-react";
import { pluginApi } from "@/api";
import type {
  ShadcnColorEntry,
  ShadcnColorMode,
  ShadcnColorConfig,
  ShadcnValidationErrors,
} from "@/lib/types/shadcn-colors";
import {
  DEFAULT_SHADCN_COLORS,
  DEFAULT_SHADCN_MODES,
  DEFAULT_SHADCN_OPACITY_STEPS,
} from "@/lib/types/shadcn-colors";

// Helper function to generate unique IDs
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function ShadcnColors() {
  const [configName, setConfigName] = React.useState<string>("Colors");
  const [colorModes, setColorModes] =
    React.useState<ShadcnColorMode[]>(DEFAULT_SHADCN_MODES);
  const [colorEntries, setColorEntries] = React.useState<ShadcnColorEntry[]>(
    []
  );
  const [generateOpacityVariants, setGenerateOpacityVariants] =
    React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<ShadcnValidationErrors>({});
  const [cssInput, setCssInput] = React.useState("");
  const [showCssInput, setShowCssInput] = React.useState(false);

  // Initialize with default shadcn colors
  React.useEffect(() => {
    if (colorEntries.length === 0) {
      const initialEntries: ShadcnColorEntry[] = DEFAULT_SHADCN_COLORS.map(
        (entry) => ({
          ...entry,
          id: generateId(),
          colors: colorModes.reduce((acc, mode) => {
            acc[mode.id] = {
              main: getDefaultColor(entry.name, mode.id),
              ...(entry.type === "twin" && {
                foreground: getDefaultForegroundColor(entry.name, mode.id),
              }),
            };
            return acc;
          }, {} as Record<string, { main: string; foreground?: string }>),
        })
      );
      setColorEntries(initialEntries);
    }
  }, [colorModes, colorEntries.length]);

  // Get default colors for shadcn scheme - matching exact CSS provided
  function getDefaultColor(name: string, modeId: string): string {
    const lightColors: Record<string, string> = {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.145 0 0)",
      card: "oklch(1 0 0)",
      popover: "oklch(1 0 0)",
      primary: "oklch(0.205 0 0)",
      secondary: "oklch(0.97 0 0)",
      muted: "oklch(0.97 0 0)",
      accent: "oklch(0.97 0 0)",
      destructive: "oklch(0.577 0.245 27.325)",
      border: "oklch(0.922 0 0)",
      input: "oklch(0.922 0 0)",
      ring: "oklch(0.708 0 0)",
      "chart-1": "oklch(0.646 0.222 41.116)",
      "chart-2": "oklch(0.6 0.118 184.704)",
      "chart-3": "oklch(0.398 0.07 227.392)",
      "chart-4": "oklch(0.828 0.189 84.429)",
      "chart-5": "oklch(0.769 0.188 70.08)",
      sidebar: "oklch(0.985 0 0)",
      "sidebar-primary": "oklch(0.205 0 0)",
      "sidebar-accent": "oklch(0.97 0 0)",
      "sidebar-border": "oklch(0.922 0 0)",
      "sidebar-ring": "oklch(0.708 0 0)",
    };

    const darkColors: Record<string, string> = {
      background: "oklch(0.145 0 0)",
      foreground: "oklch(0.985 0 0)",
      card: "oklch(0.205 0 0)",
      popover: "oklch(0.205 0 0)",
      primary: "oklch(0.922 0 0)",
      secondary: "oklch(0.269 0 0)",
      muted: "oklch(0.269 0 0)",
      accent: "oklch(0.269 0 0)",
      destructive: "oklch(0.704 0.191 22.216)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.556 0 0)",
      "chart-1": "oklch(0.488 0.243 264.376)",
      "chart-2": "oklch(0.696 0.17 162.48)",
      "chart-3": "oklch(0.769 0.188 70.08)",
      "chart-4": "oklch(0.627 0.265 303.9)",
      "chart-5": "oklch(0.645 0.246 16.439)",
      sidebar: "oklch(0.205 0 0)",
      "sidebar-primary": "oklch(0.488 0.243 264.376)",
      "sidebar-accent": "oklch(0.269 0 0)",
      "sidebar-border": "oklch(1 0 0 / 10%)",
      "sidebar-ring": "oklch(0.556 0 0)",
    };

    if (modeId === "dark") {
      return darkColors[name] || "#000000";
    }
    return lightColors[name] || "#ffffff";
  }

  function getDefaultForegroundColor(name: string, modeId: string): string {
    const lightForegrounds: Record<string, string> = {
      card: "oklch(0.145 0 0)",
      popover: "oklch(0.145 0 0)",
      primary: "oklch(0.985 0 0)",
      secondary: "oklch(0.205 0 0)",
      muted: "oklch(0.556 0 0)",
      accent: "oklch(0.205 0 0)",
      destructive: "oklch(0.985 0 0)",
      sidebar: "oklch(0.145 0 0)",
      "sidebar-primary": "oklch(0.985 0 0)",
      "sidebar-accent": "oklch(0.205 0 0)",
    };

    const darkForegrounds: Record<string, string> = {
      card: "oklch(0.985 0 0)",
      popover: "oklch(0.985 0 0)",
      primary: "oklch(0.205 0 0)",
      secondary: "oklch(0.985 0 0)",
      muted: "oklch(0.708 0 0)",
      accent: "oklch(0.985 0 0)",
      destructive: "oklch(0.985 0 0)",
      sidebar: "oklch(0.985 0 0)",
      "sidebar-primary": "oklch(0.985 0 0)",
      "sidebar-accent": "oklch(0.985 0 0)",
    };

    if (modeId === "dark") {
      return darkForegrounds[name] || "#ffffff";
    }
    return lightForegrounds[name] || "#000000";
  }

  const handleAddColorEntry = () => {
    const newEntry: ShadcnColorEntry = {
      id: generateId(),
      name: "custom",
      type: "twin",
      colors: colorModes.reduce((acc, mode) => {
        acc[mode.id] = {
          main: getDefaultColor("custom", mode.id),
          foreground: getDefaultForegroundColor("custom", mode.id),
        };
        return acc;
      }, {} as Record<string, { main: string; foreground?: string }>),
    };
    setColorEntries((prev) => [...prev, newEntry]);
  };

  const handleDeleteColorEntry = (id: string) => {
    setColorEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleColorEntryChange = (
    id: string,
    updates: Partial<ShadcnColorEntry>
  ) => {
    setColorEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
    );
  };

  const handleReorderEntries = (fromIndex: number, toIndex: number) => {
    setColorEntries((prev) => {
      const newEntries = [...prev];
      const [movedEntry] = newEntries.splice(fromIndex, 1);
      newEntries.splice(toIndex, 0, movedEntry);
      return newEntries;
    });
  };

  const handleAddMode = () => {
    const newMode: ShadcnColorMode = {
      id: generateId(),
      name: `Mode ${colorModes.length + 1}`,
    };
    setColorModes((prev) => [...prev, newMode]);

    // Add default values for existing entries
    setColorEntries((prev) =>
      prev.map((entry) => ({
        ...entry,
        colors: {
          ...entry.colors,
          [newMode.id]: {
            main: getDefaultColor(entry.name, newMode.id),
            ...(entry.type === "twin" && {
              foreground: getDefaultForegroundColor(entry.name, newMode.id),
            }),
          },
        },
      }))
    );
  };

  const handleDeleteMode = (modeId: string) => {
    if (colorModes.length <= 1) return;

    setColorModes((prev) => prev.filter((mode) => mode.id !== modeId));
    setColorEntries((prev) =>
      prev.map((entry) => {
        const { [modeId]: removed, ...remainingColors } = entry.colors;
        return { ...entry, colors: remainingColors };
      })
    );
  };

  const handleModeChange = (
    modeId: string,
    updates: Partial<ShadcnColorMode>
  ) => {
    setColorModes((prev) =>
      prev.map((mode) => (mode.id === modeId ? { ...mode, ...updates } : mode))
    );
  };

  const parseCssColors = (css: string) => {
    try {
      // Extract variables from CSS
      const variables: Record<string, Record<string, string>> = {};

      // Parse :root block for light mode
      const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
      if (rootMatch) {
        const lightVars = rootMatch[1].match(/--[\w-]+:\s*[^;]+;/g) || [];
        lightVars.forEach((variable) => {
          const [name, value] = variable.split(":").map((s) => s.trim());
          if (name && value) {
            const cleanName = name.replace("--", "").replace(";", "");
            const cleanValue = value.replace(";", "");
            if (!variables[cleanName]) variables[cleanName] = {};
            variables[cleanName]["light"] = cleanValue;
          }
        });
      }

      // Parse .dark block for dark mode
      const darkMatch = css.match(/\.dark\s*\{([^}]+)\}/);
      if (darkMatch) {
        const darkVars = darkMatch[1].match(/--[\w-]+:\s*[^;]+;/g) || [];
        darkVars.forEach((variable) => {
          const [name, value] = variable.split(":").map((s) => s.trim());
          if (name && value) {
            const cleanName = name.replace("--", "").replace(";", "");
            const cleanValue = value.replace(";", "");
            if (!variables[cleanName]) variables[cleanName] = {};
            variables[cleanName]["dark"] = cleanValue;
          }
        });
      }

      // Convert to color entries
      const newEntries: ShadcnColorEntry[] = [];
      const usedModes = new Set<string>();

      Object.entries(variables).forEach(([name, modes]) => {
        // Skip radius and other non-color variables
        if (name === "radius") return;

        Object.keys(modes).forEach((mode) => usedModes.add(mode));

        const isForeground = name.endsWith("-foreground");
        const isChart = name.startsWith("chart-");
        const isSidebar = name.startsWith("sidebar-");

        if (isForeground) {
          // Skip foreground variables, they'll be handled as part of twin colors
          return;
        }

        const baseColorName = name;
        const foregroundName = `${name}-foreground`;
        const hasForeground = variables[foregroundName];

        const entry: ShadcnColorEntry = {
          id: generateId(),
          name: baseColorName,
          type: hasForeground ? "twin" : "single",
          colors: {},
        };

        // Set main colors for each mode
        Object.entries(modes).forEach(([mode, value]) => {
          entry.colors[mode] = { main: value };

          // Add foreground if it exists
          if (hasForeground && variables[foregroundName][mode]) {
            entry.colors[mode].foreground = variables[foregroundName][mode];
          }
        });

        newEntries.push(entry);
      });

      // Update modes based on what was found in CSS
      const newModes: ShadcnColorMode[] = Array.from(usedModes).map((mode) => ({
        id: mode,
        name: mode.charAt(0).toUpperCase() + mode.slice(1),
      }));

      setColorModes(newModes);
      setColorEntries(newEntries);
      setCssInput("");
      setShowCssInput(false);

      console.log("✅ Parsed CSS colors:", {
        entries: newEntries,
        modes: newModes,
      });
    } catch (error) {
      console.error("❌ Error parsing CSS:", error);
      setSubmitError("Failed to parse CSS. Please check the format.");
    }
  };

  const validateConfiguration = (): boolean => {
    const newErrors: ShadcnValidationErrors = {};

    if (!configName.trim()) {
      newErrors.name = "Configuration name is required";
    }

    if (colorModes.length === 0) {
      newErrors.modes = "At least one mode is required";
    }

    if (colorEntries.length === 0) {
      newErrors.entries = "At least one color entry is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApply = async () => {
    if (!validateConfiguration()) return;

    setIsGenerating(true);
    setSubmitError(null);

    try {
      const config: ShadcnColorConfig = {
        name: configName,
        modes: colorModes,
        entries: colorEntries,
        generateOpacityVariants,
        opacitySteps: DEFAULT_SHADCN_OPACITY_STEPS,
      };

      console.log("🚀 Generating shadcn Figma variables:", config);

      // Prepare variables for Figma API - convert shadcn structure to expected format
      const variables: Array<{
        id: string;
        name: string;
        values: Record<string, string>;
      }> = [];

      config.entries.forEach((entry) => {
        // Main color variable
        const mainVariable = {
          id: entry.id,
          name: entry.name,
          values: {} as Record<string, string>,
        };

        config.modes.forEach((mode) => {
          const colors = entry.colors[mode.id];
          if (colors?.main) {
            mainVariable.values[mode.id] = colors.main;
          }
        });
        variables.push(mainVariable);

        // Foreground color variable (for twin types)
        if (entry.type === "twin") {
          const foregroundVariable = {
            id: `${entry.id}-fg`,
            name: `${entry.name}-foreground`,
            values: {} as Record<string, string>,
          };

          config.modes.forEach((mode) => {
            const colors = entry.colors[mode.id];
            if (colors?.foreground) {
              foregroundVariable.values[mode.id] = colors.foreground;
            }
          });
          variables.push(foregroundVariable);
        }
      });

      // Create the variables using the API
      const apiConfig = {
        name: config.name,
        modes: config.modes,
        entries: variables,
        generateOpacityVariants: config.generateOpacityVariants,
        opacitySteps: config.opacitySteps,
      };

      const result = await pluginApi.createColorVariables(apiConfig);

      if (result.success) {
        console.log("✅ Shadcn color variables created successfully:", result);
        await pluginApi.notify(
          `Successfully created ${result.variablesCreated} shadcn color variables in collection "${result.collectionName}"!`
        );
      } else {
        throw new Error(result.message || "Failed to create color variables");
      }
    } catch (error) {
      console.error("❌ Error generating color variables:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to generate color variables"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate =
    colorEntries.length > 0 && colorModes.length > 0 && configName.trim();

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 border-b bg-background border-border">
        <div className="p-4 space-y-4">
          {/* Configuration Name */}
          <FormField label="Collection Name">
            <Input
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Enter collection name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </FormField>

          {/* Opacity Variants Toggle */}
          <div className="flex gap-2 items-center">
            <Switch
              checked={generateOpacityVariants}
              onCheckedChange={setGenerateOpacityVariants}
            />
            <span className="text-sm">
              Generate opacity variants (0%, 2.5%, 5%...95%)
            </span>
          </div>

          {/* CSS Import Section */}
          <div className="space-y-2">
            <div className="flex gap-2 items-center justify-between">
              <span className="text-sm font-medium">Import from CSS</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCssInput(!showCssInput)}
              >
                {showCssInput ? "Cancel" : "Paste CSS"}
              </Button>
            </div>

            {showCssInput && (
              <div className="space-y-2">
                <textarea
                  placeholder="Paste your CSS variables here (e.g., :root { --background: oklch(1 0 0); ... } .dark { --background: oklch(0.145 0 0); ... })"
                  value={cssInput}
                  onChange={(e) => setCssInput(e.target.value)}
                  className="w-full h-32 p-2 text-xs border rounded-md resize-none font-mono"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => parseCssColors(cssInput)}
                    disabled={!cssInput.trim()}
                  >
                    Parse CSS
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setCssInput("");
                      setShowCssInput(false);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area with Table */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 pb-20">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-12">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-24">Type</TableHead>
                  {colorModes.map((mode) => (
                    <TableHead key={mode.id} className="min-w-[300px]">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <InlineInput
                            value={mode.name}
                            onSave={(name) =>
                              handleModeChange(mode.id, { name })
                            }
                            className="font-medium"
                            placeholder={`Mode ${colorModes.indexOf(mode) + 1}`}
                          />
                          {colorModes.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMode(mode.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-12">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleAddMode}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <PlusIcon className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colorEntries.map((entry, index) => (
                  <DraggableTableRow
                    key={entry.id}
                    index={index}
                    onReorder={handleReorderEntries}
                    className="group"
                  >
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground cursor-grab hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <GripVertical className="h-3 w-3" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <InlineInput
                        value={entry.name}
                        onSave={(name) =>
                          handleColorEntryChange(entry.id, { name })
                        }
                        placeholder="Color name"
                        className="font-mono"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={entry.type}
                        onValueChange={(type: "single" | "twin") =>
                          handleColorEntryChange(entry.id, { type })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="twin">Twin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    {colorModes.map((mode) => (
                      <TableCell key={mode.id}>
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Main
                            </label>
                            <ColorPicker
                              color={entry.colors[mode.id]?.main || "#000000"}
                              onChange={(color) => {
                                const currentColors = entry.colors[mode.id] || {
                                  main: "#000000",
                                };
                                handleColorEntryChange(entry.id, {
                                  colors: {
                                    ...entry.colors,
                                    [mode.id]: {
                                      ...currentColors,
                                      main: color,
                                    },
                                  },
                                });
                              }}
                            />
                          </div>
                          {entry.type === "twin" && (
                            <div>
                              <label className="text-xs text-muted-foreground">
                                Foreground
                              </label>
                              <ColorPicker
                                color={
                                  entry.colors[mode.id]?.foreground || "#ffffff"
                                }
                                onChange={(color) => {
                                  const currentColors = entry.colors[
                                    mode.id
                                  ] || { main: "#000000" };
                                  handleColorEntryChange(entry.id, {
                                    colors: {
                                      ...entry.colors,
                                      [mode.id]: {
                                        ...currentColors,
                                        foreground: color,
                                      },
                                    },
                                  });
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                    ))}
                    <TableCell />
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteColorEntry(entry.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </DraggableTableRow>
                ))}
                {/* Add new color row */}
                <TableRow>
                  <TableCell colSpan={colorModes.length + 5}>
                    <button
                      onClick={handleAddColorEntry}
                      className="flex gap-3 justify-center items-center p-4 w-full text-sm italic font-normal rounded-lg border border-dashed transition-colors cursor-default text-muted-foreground bg-foreground/5 border-muted-foreground/25 hover:border-muted-foreground/50"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span className="text-sm font-normal">Add new color</span>
                    </button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>

      {/* Sticky Bottom Action Area */}
      <div className="flex sticky bottom-0 flex-col gap-3 p-4 border-t border-border bg-background">
        {submitError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
            {submitError}
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {colorEntries.length}{" "}
            {colorEntries.length === 1 ? "color" : "colors"} configured
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
