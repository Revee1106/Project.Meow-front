import type { ReactNode } from "react";

export interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className }: PanelProps) {
  return <section className={["mvp-panel", className].filter(Boolean).join(" ")}>{children}</section>;
}
