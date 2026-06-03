import type { ReactNode } from "react";

export interface MiniHeadProps {
  title: string;
  right?: ReactNode;
}

export function MiniHead({ title, right }: MiniHeadProps) {
  return (
    <div className="mini-head">
      <h2>{title}</h2>
      {right ? <div className="mini-head__right">{right}</div> : null}
    </div>
  );
}
