import * as React from "react";
import { cn } from "@/lib/utils";

interface ToolPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function ToolPanel({ children, className }: ToolPanelProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>{children}</div>
  );
}

interface ToolFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ToolFooter({ children, className }: ToolFooterProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 flex flex-col gap-3 px-4 py-2 border-t border-border bg-background",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ToolFooterErrorProps {
  children: React.ReactNode;
  className?: string;
}

export function ToolFooterError({ children, className }: ToolFooterErrorProps) {
  return (
    <div
      className={cn(
        "p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200",
        className
      )}
    >
      {children}
    </div>
  );
}

