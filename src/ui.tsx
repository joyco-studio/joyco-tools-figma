import * as React from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import { pluginApi } from "./api";
import { Layout } from "./components/layout/layout";
import { Sidebar } from "./components/layout/sidebar";
import { RectangleCreator } from "./tools/rectangle-creator";
import { Typography } from "./tools/typography";
import { TypeIcon } from "lucide-react";

const tools = [
  {
    id: "typography",
    label: "Typography",
    icon: <TypeIcon className="w-4 h-4" />,
  },
  {
    id: "rectangle-creator",
    label: "Rectangle Creator",
  },
  // Add more tools here as we create them
];

function App() {
  const [activeTool, setActiveTool] = React.useState(tools[0].id);

  const renderTool = () => {
    switch (activeTool) {
      case "typography":
        return <Typography />;
      case "rectangle-creator":
        return <RectangleCreator />;
      default:
        return <div>Select a tool</div>;
    }
  };

  return (
    <Layout.Container>
      <Layout.Sidebar>
        <Sidebar
          items={tools}
          activeItem={activeTool}
          onItemClick={setActiveTool}
        />
      </Layout.Sidebar>
      <Layout.Content>{renderTool()}</Layout.Content>
    </Layout.Container>
  );
}

const root = createRoot(document.getElementById("react-page")!);
root.render(<App />);
