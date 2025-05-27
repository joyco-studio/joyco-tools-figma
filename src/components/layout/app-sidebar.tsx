import * as React from "react";
import {
  Type,
  Square,
  User2,
  ChevronUp,
  Box,
  ChevronRight,
  Shapes,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";

import { JoycoLogo } from "../icons/joyco-logo";

// Tool categories with their tools
const toolCategories = [
  {
    id: "typography",
    title: "Typography",
    icon: Type,
    tools: [
      {
        id: "typography",
        title: "Styles Generator",
        description: "Manage text styles and fonts",
      },
    ],
  },
  {
    id: "3d",
    title: "3D",
    icon: Box,
    tools: [
      {
        id: "3d-viewer",
        title: "GLB Viewer",
        description: "View and render GLB/GLTF models",
      },
    ],
  },
  {
    id: "shapes",
    title: "Shapes",
    icon: Shapes,
    tools: [
      {
        id: "rectangle-creator",
        title: "Rectangle Creator",
        description: "Create rectangles in bulk",
      },
    ],
  },
];

interface AppSidebarProps {
  activeItem?: string;
  onItemClick: (id: string) => void;
}

export function AppSidebar({ activeItem, onItemClick }: AppSidebarProps) {
  const [openGroups, setOpenGroups] = React.useState<string[]>([
    "typography",
    "3d",
    "shapes",
  ]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
    <Sidebar
      collapsible="none"
      className="w-64 gap-5 border-r border-dashed bg-muted/30"
    >
      <SidebarHeader>
        <div className="flex gap-1 border border-dashed rounded-lg ring-1 overflow-clip ring-muted/50 border-border bg-muted">
          <div className="flex items-center justify-center h-full border-r border-dashed bg-background/50 aspect-square border-border">
            <JoycoLogo className="size-6" />
          </div>
          <div className="flex flex-col p-2">
            <span className="text-base font-semibold uppercase truncate text-foreground/80 leading-[1.1]">
              Joyco Toolbox
            </span>
            <span className="text-xs uppercase truncate text-sidebar-foreground/70">
              Design for rebels
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 border-b border-dashed border-sidebar-border">
            Tools{" "}
            <p className="inline-flex items-center ml-3 text-xs text-accent">
              <span className="inline-block mr-2 rounded-full size-1.5 bg-accent" />
              3 categories
            </p>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolCategories.map((category) => (
                <Collapsible
                  key={category.id}
                  open={openGroups.includes(category.id)}
                  onOpenChange={() => toggleGroup(category.id)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton variant="secondary" className="w-full">
                        <category.icon />
                        <span>{category.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {category.tools.map((tool) => (
                          <SidebarMenuSubItem key={tool.id}>
                            <SidebarMenuSubButton
                              onClick={() => onItemClick(tool.id)}
                              isActive={activeItem === tool.id}
                              asChild
                            >
                              <button type="button">
                                <span>{tool.title}</span>
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <User2 className="size-4" />
                  <div className="grid flex-1 text-sm leading-tight text-left">
                    <span className="font-medium truncate text-sidebar-foreground">
                      User
                    </span>
                    <span className="text-xs truncate text-sidebar-foreground/70">
                      user@example.com
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>Account</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
