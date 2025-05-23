import { cn } from "@/lib/utils";
import * as React from "react";

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  activeItem?: string;
  onItemClick: (id: string) => void;
}

export function Sidebar({ items, activeItem, onItemClick }: SidebarProps) {
  return (
    <nav className="flex flex-col p-4 space-y-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            item.id === activeItem
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          {item.icon && <span className="w-4 h-4">{item.icon}</span>}
          <span className="text-sm">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
