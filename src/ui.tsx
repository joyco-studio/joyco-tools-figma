import * as React from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import { RectangleCreator } from "./tools/rectangle-creator";
import { Typography } from "./tools/typography";
import { ThreeDViewer } from "./tools/3d-viewer";
import { TypeIcon } from "lucide-react";
import { useFontsStore, useVariablesStore } from "./stores/fonts";
import { AppSidebar } from "./components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const tools = [
  {
    id: "typography",
    label: "Typography",
    icon: <TypeIcon className="w-3 h-3" />,
  },
  {
    id: "rectangle-creator",
    label: "Rectangle Creator",
  },
  // Add more tools here as we create them
];

function App() {
  const [activeTool, setActiveTool] = React.useState(tools[0].id);
  const loadFonts = useFontsStore((state) => state.loadFonts);
  const loadVariables = useVariablesStore((state) => state.loadVariables);

  // Load fonts and variables once when the app starts
  React.useEffect(() => {
    loadFonts();
    loadVariables();
  }, [loadFonts, loadVariables]);

  const renderTool = () => {
    switch (activeTool) {
      case "typography":
        return <Typography />;
      case "3d-viewer":
        return <ThreeDViewer />;
      case "rectangle-creator":
        return <RectangleCreator />;
      default:
        return <div>Select a tool</div>;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full h-screen overflow-hidden">
        <AppSidebar activeItem={activeTool} onItemClick={setActiveTool} />
        <SidebarInset className="flex-1 overflow-hidden">
          <main className="flex flex-col h-full overflow-auto">
            {renderTool()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

const root = createRoot(document.getElementById("react-page")!);
root.render(<App />);
