import * as React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/ui/form-field";
import { ToolPanel, ToolFooter, ToolFooterError } from "@/components/ui/tool-panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { PlusIcon, GripVertical, Trash2, X } from "lucide-react";

import { useVariablesStore } from "@/stores/fonts";
import { pluginApi } from "@/api";
import type {
  ColorVariableConfig,
  ColorEntry as ColorEntryType,
  ColorMode,
  ToolMode,
  ValidationErrors,
  VariableCollection,
} from "@/lib/types/colors";
import { DEFAULT_OPACITY_STEPS } from "@/lib/types/colors";

// Helper function to generate unique IDs
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function Colors() {
  const [mode, setMode] = React.useState<ToolMode>("create");
  const [selectedCollection, setSelectedCollection] =
    React.useState<string>("");
  const [collectionName, setCollectionName] = React.useState<string>("Colors");
  const [colorModes, setColorModes] = React.useState<ColorMode[]>([
    { id: generateId(), name: "Light" },
    { id: generateId(), name: "Dark" },
  ]);
  const [colorEntries, setColorEntries] = React.useState<ColorEntryType[]>([]);
  const [generateOpacityVariants, setGenerateOpacityVariants] =
    React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<ValidationErrors>({});

  // Mock collections data - in real app this would come from an API
  const [collections, setCollections] = React.useState<VariableCollection[]>([
    {
      id: "1",
      name: "Design System",
      modes: ["light", "dark"],
      defaultModeId: "light",
    },
    {
      id: "2",
      name: "Brand Colors",
      modes: ["default"],
      defaultModeId: "default",
    },
    {
      id: "3",
      name: "Semantic Colors",
      modes: ["light", "dark", "high-contrast"],
      defaultModeId: "light",
    },
  ]);

  const { variables, loadVariables } = useVariablesStore();

  // Load variables when component mounts
  React.useEffect(() => {
    loadVariables();
  }, [loadVariables]);

  // Initialize with some sample data
  React.useEffect(() => {
    if (colorEntries.length === 0) {
      const sampleEntries: ColorEntryType[] = [
        {
          id: generateId(),
          name: "primary",
          values: {
            [colorModes[0].id]: "#3b82f6",
            [colorModes[1].id]: "#60a5fa",
          },
        },
        {
          id: generateId(),
          name: "secondary",
          values: {
            [colorModes[0].id]: "#6b7280",
            [colorModes[1].id]: "#9ca3af",
          },
        },
      ];
      setColorEntries(sampleEntries);
    }
  }, [colorModes, colorEntries.length]);

  const handleModeToggle = () => {
    setMode(mode === "create" ? "edit" : "create");
    setSelectedCollection("");
    setErrors({});
  };

  const handleAddColorEntry = () => {
    const newEntry: ColorEntryType = {
      id: generateId(),
      name: "new-color",
      values: colorModes.reduce((acc, mode) => {
        acc[mode.id] = "#000000";
        return acc;
      }, {} as Record<string, string>),
    };
    setColorEntries((prev) => [...prev, newEntry]);
  };

  const handleDeleteColorEntry = (id: string) => {
    setColorEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleColorEntryChange = (
    id: string,
    updates: Partial<ColorEntryType>
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
    const newMode: ColorMode = {
      id: generateId(),
      name: `Mode ${colorModes.length + 1}`,
    };
    setColorModes((prev) => [...prev, newMode]);

    // Add default values for existing entries
    setColorEntries((prev) =>
      prev.map((entry) => ({
        ...entry,
        values: { ...entry.values, [newMode.id]: "#000000" },
      }))
    );
  };

  const handleDeleteMode = (modeId: string) => {
    if (colorModes.length <= 1) return; // Prevent deleting all modes

    setColorModes((prev) => prev.filter((mode) => mode.id !== modeId));
    setColorEntries((prev) =>
      prev.map((entry) => {
        const { [modeId]: removed, ...remainingValues } = entry.values;
        return { ...entry, values: remainingValues };
      })
    );
  };

  const handleModeNameChange = (modeId: string, name: string) => {
    setColorModes((prev) =>
      prev.map((mode) => (mode.id === modeId ? { ...mode, name } : mode))
    );
  };

  const validateConfiguration = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (mode === "create") {
      if (!collectionName.trim()) {
        newErrors.name = "Collection name is required";
      }
    } else {
      if (!selectedCollection) {
        newErrors.collection = "Please select a collection";
      }
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
      const config: ColorVariableConfig = {
        name: mode === "create" ? collectionName : selectedCollection,
        collectionId: mode === "edit" ? selectedCollection : undefined,
        modes: colorModes,
        entries: colorEntries,
        generateOpacityVariants,
        opacitySteps: DEFAULT_OPACITY_STEPS,
      };

      console.log("🚀 Generating color variables:", config);

      const result = await pluginApi.createColorVariables(config);

      if (result.success) {
        console.log("✅ Color variables created successfully:", result);
        await pluginApi.notify(
          `Successfully created ${result.variablesCreated} color variables in collection "${result.collectionName}"!`
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
    colorEntries.length > 0 &&
    colorModes.length > 0 &&
    (mode === "create" ? collectionName.trim() : selectedCollection);

  return (
    <ToolPanel>
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 border-b bg-background border-border">
        <div className="p-4 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-4 items-center">
            <FormField label="Mode">
              <div className="flex gap-2 items-center">
                <span
                  className={
                    mode === "create" ? "font-medium" : "text-muted-foreground"
                  }
                >
                  Create
                </span>
                <Switch
                  checked={mode === "edit"}
                  onCheckedChange={handleModeToggle}
                />
                <span
                  className={
                    mode === "edit" ? "font-medium" : "text-muted-foreground"
                  }
                >
                  Edit
                </span>
              </div>
            </FormField>

            {mode === "create" ? (
              <FormField label="Collection Name" className="flex-1">
                <Input
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="Enter collection name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </FormField>
            ) : (
              <FormField label="Select Collection" className="flex-1">
                <Select
                  value={selectedCollection}
                  onValueChange={setSelectedCollection}
                >
                  <SelectTrigger
                    className={errors.collection ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Choose a collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.collection && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.collection}
                  </p>
                )}
              </FormField>
            )}
          </div>

          {/* Opacity Variants Toggle */}
          <div className="flex gap-2 items-center">
            <Switch
              checked={generateOpacityVariants}
              onCheckedChange={setGenerateOpacityVariants}
            />
            <span className="text-sm">
              Generate opacity variants (0%, 2.5%, 5%, 10%...95%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area with Table */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 pb-20">
            {" "}
            {/* Extra padding for sticky footer */}
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-12">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  {colorModes.map((mode) => (
                    <TableHead key={mode.id} className="min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <InlineInput
                          value={mode.name}
                          onSave={(name) => handleModeNameChange(mode.id, name)}
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
                    {colorModes.map((mode) => (
                      <TableCell key={mode.id}>
                        <ColorPicker
                          color={entry.values[mode.id] || "#000000"}
                          onChange={(color) =>
                            handleColorEntryChange(entry.id, {
                              values: { ...entry.values, [mode.id]: color },
                            })
                          }
                        />
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
                  <TableCell colSpan={colorModes.length + 4}>
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

      <ToolFooter>
        {submitError && <ToolFooterError>{submitError}</ToolFooterError>}

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
      </ToolFooter>
    </ToolPanel>
  );
}
