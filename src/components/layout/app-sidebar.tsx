import * as React from "react";
import { Type, Square, User2, ChevronUp, Box } from "lucide-react";
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
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { JoycoLogo } from "../icons/joyco-logo";

// Menu items.
const tools = [
  {
    id: "typography",
    title: "Typography",
    icon: Type,
    description: "Manage text styles and fonts",
  },
  {
    id: "3d-viewer",
    title: "3D Viewer",
    icon: Box,
    description: "View and render GLB/GLTF models",
  },
  {
    id: "rectangle-creator",
    title: "Rectangle Creator",
    icon: Square,
    description: "Create rectangles in bulk",
  },
];

interface AppSidebarProps {
  activeItem?: string;
  onItemClick: (id: string) => void;
}

export function AppSidebar({ activeItem, onItemClick }: AppSidebarProps) {
  return (
    <Sidebar collapsible="none" className="w-64 border-r bg-muted/50">
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
          <SidebarGroupLabel>
            Tools{" "}
            <p className="inline-flex items-center ml-3 text-xs text-accent">
              <span className="inline-block mr-2 rounded-full size-1.5 bg-accent" />
              2 new tools
            </p>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((tool) => (
                <SidebarMenuItem key={tool.id}>
                  <SidebarMenuButton
                    onClick={() => onItemClick(tool.id)}
                    isActive={activeItem === tool.id}
                    tooltip={tool.description}
                  >
                    <tool.icon />
                    <span>{tool.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
