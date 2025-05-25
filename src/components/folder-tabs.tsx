import * as React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface FolderTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface FolderTabsListProps
  extends React.ComponentProps<typeof TabsList> {}

export interface FolderTabsTriggerProps
  extends React.ComponentProps<typeof TabsTrigger> {
  icon?: React.ReactNode;
}

export interface FolderTabsContentProps
  extends React.ComponentProps<typeof TabsContent> {}

// Main FolderTabs wrapper
export const FolderTabs = React.forwardRef<
  React.ElementRef<typeof Tabs>,
  FolderTabsProps
>(({ value, onValueChange, children, className, ...props }, ref) => {
  return (
    <Tabs
      ref={ref}
      value={value}
      onValueChange={onValueChange}
      className={className}
      {...props}
    >
      {children}
    </Tabs>
  );
});

// FolderTabsList with scroll area and folder styling
export const FolderTabsList = React.forwardRef<
  React.ElementRef<typeof TabsList>,
  FolderTabsListProps
>(({ className, children, ...props }, ref) => {
  return (
    <ScrollArea>
      <TabsList
        ref={ref}
        className={cn(
          "before:bg-border relative h-auto w-full gap-2 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px justify-start",
          className
        )}
        {...props}
      >
        {children}
      </TabsList>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
});

// FolderTabsTrigger with folder tab styling
export const FolderTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsTrigger>,
  FolderTabsTriggerProps
>(({ icon, children, className, ...props }, ref) => {
  return (
    <TabsTrigger
      ref={ref}
      className={cn(
        "bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none",
        className
      )}
      {...props}
    >
      {icon &&
        React.cloneElement(icon as React.ReactElement, {
          className: "-ms-0.5 me-1.5 opacity-60",
          size: 16,
          "aria-hidden": "true",
        })}
      {children}
    </TabsTrigger>
  );
});

// FolderTabsContent is just the standard TabsContent
export const FolderTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsContent>,
  FolderTabsContentProps
>(({ className, ...props }, ref) => {
  return <TabsContent ref={ref} className={cn(className)} {...props} />;
});

FolderTabs.displayName = "FolderTabs";
FolderTabsList.displayName = "FolderTabsList";
FolderTabsTrigger.displayName = "FolderTabsTrigger";
FolderTabsContent.displayName = "FolderTabsContent";
