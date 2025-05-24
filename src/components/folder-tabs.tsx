import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export interface FolderTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface FolderTabsListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface FolderTabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  description?: string;
}

export interface FolderTabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

const FolderTabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

const useFolderTabsContext = () => {
  const context = React.useContext(FolderTabsContext);
  if (!context) {
    throw new Error("FolderTabs components must be used within FolderTabs");
  }
  return context;
};

const FolderTabs = React.forwardRef<HTMLDivElement, FolderTabsProps>(
  ({ value, onValueChange, children, className, ...props }, ref) => {
    return (
      <FolderTabsContext.Provider value={{ value, onValueChange }}>
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </FolderTabsContext.Provider>
    );
  }
);

const FolderTabsList = React.forwardRef<HTMLDivElement, FolderTabsListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ScrollArea>
        <div
          ref={ref}
          className={cn(
            "before:bg-border relative mb-3 h-auto w-full gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px",
            "flex",
            className
          )}
          {...props}
        >
          {children}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  }
);

const FolderTabsTrigger = React.forwardRef<
  HTMLButtonElement,
  FolderTabsTriggerProps
>(
  (
    { value: triggerValue, children, icon, description, className, ...props },
    ref
  ) => {
    const { value, onValueChange } = useFolderTabsContext();
    const isActive = value === triggerValue;

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => onValueChange(triggerValue)}
        className={cn(
          "bg-muted overflow-hidden rounded-b-none border-x border-t py-3 px-4",
          "transition-all duration-200 cursor-pointer flex-1",
          "hover:bg-muted/80",
          isActive &&
            "z-10 shadow-none bg-background border-b border-b-background",
          !isActive && "border-b-0",
          "first:rounded-tl-md last:rounded-tr-md",
          "first:border-l last:border-r",
          "[&:not(:first-child)]:border-l-0",
          className
        )}
        data-state={isActive ? "active" : "inactive"}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          {icon && <div className="text-lg">{icon}</div>}
          <div>
            <div className="text-sm font-medium">{children}</div>
            {description && (
              <div className="text-xs text-muted-foreground mt-1">
                {description}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  }
);

const FolderTabsContent = React.forwardRef<
  HTMLDivElement,
  FolderTabsContentProps
>(({ value: contentValue, children, className, ...props }, ref) => {
  const { value } = useFolderTabsContext();
  const isActive = value === contentValue;

  if (!isActive) return null;

  return (
    <div ref={ref} className={cn("mt-4", className)} {...props}>
      {children}
    </div>
  );
});

FolderTabs.displayName = "FolderTabs";
FolderTabsList.displayName = "FolderTabsList";
FolderTabsTrigger.displayName = "FolderTabsTrigger";
FolderTabsContent.displayName = "FolderTabsContent";

export { FolderTabs, FolderTabsList, FolderTabsTrigger, FolderTabsContent };

// Legacy default export for backward compatibility
export default function LegacyFolderTabs() {
  return (
    <FolderTabs value="tab-1" onValueChange={() => {}}>
      <FolderTabsList>
        <FolderTabsTrigger value="tab-1" icon={<div>🏠</div>}>
          Overview
        </FolderTabsTrigger>
        <FolderTabsTrigger value="tab-2" icon={<div>📁</div>}>
          Projects
        </FolderTabsTrigger>
        <FolderTabsTrigger value="tab-3" icon={<div>📦</div>}>
          Packages
        </FolderTabsTrigger>
      </FolderTabsList>
      <FolderTabsContent value="tab-1">
        <p className="p-4 pt-1 text-xs text-center text-muted-foreground">
          Content for Tab 1
        </p>
      </FolderTabsContent>
      <FolderTabsContent value="tab-2">
        <p className="p-4 pt-1 text-xs text-center text-muted-foreground">
          Content for Tab 2
        </p>
      </FolderTabsContent>
      <FolderTabsContent value="tab-3">
        <p className="p-4 pt-1 text-xs text-center text-muted-foreground">
          Content for Tab 3
        </p>
      </FolderTabsContent>
    </FolderTabs>
  );
}
