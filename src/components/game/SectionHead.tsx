import type { ReactNode } from "react";

type SectionHeadProps = {
  title: string;
  right?: ReactNode;
};

export function SectionHead({ title, right }: SectionHeadProps) {
  return (
    <div className="section-head">
      <div className="section-head__title">{title}</div>
      {right ? <div className="section-head__right">{right}</div> : null}
    </div>
  );
}
