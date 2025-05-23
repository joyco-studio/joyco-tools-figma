import * as React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

interface SidebarProps {
  children: React.ReactNode;
}

interface ContentProps {
  children: React.ReactNode;
}

function Container({ children }: LayoutProps) {
  return (
    <div className="flex w-full h-screen font-mono bg-background">
      {children}
    </div>
  );
}

function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-48 border-r border-border bg-muted/40">
      {children}
    </aside>
  );
}

function Content({ children }: ContentProps) {
  return <main className="flex-1 overflow-auto">{children}</main>;
}

export const Layout = {
  Container,
  Sidebar,
  Content,
};
