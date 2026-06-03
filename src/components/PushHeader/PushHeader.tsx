import type { ReactNode } from "react";
import { t } from "../../i18n/strings";

export interface PushHeaderProps {
  title: string;
  right?: ReactNode;
  tone?: "gold" | "crimson";
  onBack: () => void;
}

export function PushHeader({ title, right, tone = "gold", onBack }: PushHeaderProps) {
  return (
    <header className={`push-header push-header--${tone}`}>
      <button
        aria-label={t("common.back")}
        className="push-header__back"
        type="button"
        onClick={onBack}
      >
        ‹
      </button>
      <h1 className="tw-display">{title}</h1>
      {right ? <div className="push-header__right">{right}</div> : null}
    </header>
  );
}
