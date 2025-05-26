import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Upload, Image as ImageIcon, Settings, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluginApi } from "@/api";

// Declare model-viewer as a custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

interface RenderSettings {
  width: number;
  height: number;
  cameraOrbit: string;
  environmentImage: string;
  exposure: number;
  shadowIntensity: number;
}

const DEFAULT_SETTINGS: RenderSettings = {
  width: 800,
  height: 600,
  cameraOrbit: "0deg 75deg 105%",
  environmentImage: "neutral",
  exposure: 1,
  shadowIntensity: 0.4,
};

export function ThreeDViewer() {
  const [modelFile, setModelFile] = React.useState<File | null>(null);
  const [modelUrl, setModelUrl] = React.useState<string | null>(null);
  const [settings, setSettings] =
    React.useState<RenderSettings>(DEFAULT_SETTINGS);
  const [isRendering, setIsRendering] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [lastFrameName, setLastFrameName] = React.useState<string | null>(null);

  const modelViewerRef = React.useRef<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load model-viewer script
  React.useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Force disable animations when model loads
  React.useEffect(() => {
    if (modelViewerRef.current && modelUrl) {
      const viewer = modelViewerRef.current;

      // Wait for model to load then ensure auto-rotate is disabled
      const handleLoad = () => {
        viewer.autoRotate = false;
      };

      viewer.addEventListener("load", handleLoad);

      return () => {
        viewer.removeEventListener("load", handleLoad);
      };
    }
  }, [modelUrl]);

  const handleFileUpload = React.useCallback((file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().match(/\.(glb|gltf)$/)) {
      alert("Please select a GLB or GLTF file");
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
      return;
    }

    setModelFile(file);
    const url = URL.createObjectURL(file);
    setModelUrl(url);
  }, []);

  const handleFileInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const captureAndCreateFrame = React.useCallback(async () => {
    if (!modelViewerRef.current || !modelFile) return;

    setIsRendering(true);

    try {
      // Wait for the model to be fully rendered
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create a temporary canvas with exact dimensions
      const canvas = document.createElement("canvas");
      canvas.width = settings.width;
      canvas.height = settings.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Clear canvas with transparent background
      ctx.clearRect(0, 0, settings.width, settings.height);

      // Capture the model-viewer as a blob first
      const blob = await modelViewerRef.current.toBlob({
        mimeType: "image/png",
        qualityArgument: 1.0,
        idealAspect: true,
      });

      if (!blob) {
        throw new Error("Failed to capture model-viewer");
      }

      // Create image from blob and draw to our canvas
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });

      // Calculate scaling to fit our exact dimensions while maintaining aspect ratio
      const scale = Math.min(
        settings.width / img.width,
        settings.height / img.height
      );
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (settings.width - scaledWidth) / 2;
      const y = (settings.height - scaledHeight) / 2;

      // Draw the image centered on our canvas
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // Convert canvas to blob
      const finalBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, "image/png");
      });

      // Convert blob to Uint8Array
      const arrayBuffer = await finalBlob.arrayBuffer();
      const imageData = new Uint8Array(arrayBuffer);

      // Create frame in Figma using the API
      const result = await pluginApi.create3DFrame({
        imageData: Array.from(imageData),
        width: settings.width,
        height: settings.height,
        modelName: modelFile.name,
      });

      if (result.success) {
        setLastFrameName(result.frameName);
        // Show success message briefly
        setTimeout(() => setLastFrameName(null), 3000);
      } else {
        alert(`Failed to create frame: ${result.error}`);
      }
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      alert("Failed to capture screenshot. Please try again.");
    } finally {
      setIsRendering(false);
    }
  }, [modelFile, settings]);

  const resetCamera = React.useCallback(() => {
    if (modelViewerRef.current) {
      modelViewerRef.current.cameraOrbit = settings.cameraOrbit;
    }
  }, [settings.cameraOrbit]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex flex-1 overflow-hidden">
        {/* Main Viewer */}
        <div className="flex-1 relative">
          {modelUrl ? (
            <div className="w-full h-full relative">
              <model-viewer
                ref={modelViewerRef}
                src={modelUrl}
                camera-controls={true}
                auto-rotate={false}
                autoplay={false}
                camera-orbit={settings.cameraOrbit}
                environment-image={settings.environmentImage}
                exposure={settings.exposure}
                shadow-intensity={settings.shadowIntensity}
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "transparent",
                }}
              />

              {/* Floating Toolbar */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 p-2 bg-background border border-muted-foreground/20 rounded-lg shadow-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetCamera}
                  className="h-8 px-3"
                  title="Reset camera"
                >
                  <RotateCcw className="size-4" />
                </Button>

                <div className="w-px h-6 bg-border" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn("h-8 px-3", showSettings && "bg-muted")}
                  title="Settings"
                >
                  <Settings className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-3"
                  title="Upload new model"
                >
                  <Upload className="size-4" />
                </Button>

                <div className="w-px h-6 bg-border" />

                <Button
                  onClick={captureAndCreateFrame}
                  disabled={isRendering}
                  className="gap-2 h-8"
                  size="sm"
                >
                  {isRendering ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Rendering...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="size-4" />
                      Render
                    </>
                  )}
                </Button>

                {lastFrameName && (
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium ml-2">
                    ✓ Created
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Upload Area - Empty State
            <div
              className="flex items-center justify-center w-full h-full"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="text-center p-12">
                <Upload className="size-16 mx-auto mb-6 text-muted-foreground" />
                <h1 className="text-2xl font-semibold mb-2">
                  3D Model Renderer
                </h1>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Upload GLB/GLTF models and render them to Figma frames
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="size-4" />
                  Upload 3D Model
                </Button>
                <div className="text-xs text-muted-foreground mt-6 space-y-1">
                  <p>Supported: GLB, GLTF</p>
                  <p>Max size: 50MB</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-80 border-l bg-background p-4 space-y-6 overflow-y-auto">
            <div>
              <h3 className="font-medium mb-4">Render Settings</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <FormField label="Width">
                    <Input
                      type="number"
                      value={settings.width}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          width: parseInt(e.target.value) || 800,
                        }))
                      }
                      min="100"
                      max="4000"
                    />
                  </FormField>

                  <FormField label="Height">
                    <Input
                      type="number"
                      value={settings.height}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          height: parseInt(e.target.value) || 600,
                        }))
                      }
                      min="100"
                      max="4000"
                    />
                  </FormField>
                </div>

                <FormField label="Camera Orbit">
                  <Input
                    value={settings.cameraOrbit}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        cameraOrbit: e.target.value,
                      }))
                    }
                    placeholder="0deg 75deg 105%"
                  />
                </FormField>

                <FormField label="Environment">
                  <select
                    value={settings.environmentImage}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        environmentImage: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="legacy">Legacy</option>
                    <option value="studio">Studio</option>
                  </select>
                </FormField>

                <FormField label="Exposure">
                  <Input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.exposure}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        exposure: parseFloat(e.target.value),
                      }))
                    }
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {settings.exposure.toFixed(1)}
                  </div>
                </FormField>

                <FormField label="Shadow Intensity">
                  <Input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.shadowIntensity}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        shadowIntensity: parseFloat(e.target.value),
                      }))
                    }
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {settings.shadowIntensity.toFixed(1)}
                  </div>
                </FormField>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSettings(DEFAULT_SETTINGS)}
                className="w-full"
              >
                Reset to Defaults
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
