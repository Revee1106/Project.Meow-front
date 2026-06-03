import type { Floor } from "../../services/types";
import { t } from "../../i18n/strings";

export function FloorHeader({ floor }: { floor: Floor }) {
  return (
    <header className="floor-header">
      <div className="floor-header__title-row">
        <h1 className="tw-display">{t("floor.title", { floor: floor.floor })}</h1>
        <span>{t(floor.nameKey)}</span>
      </div>
      <div className="floor-header__rule">
        <strong>{t("floor.rule")}</strong>
        <span>{t(floor.ruleKey)}</span>
        {floor.cleared ? <em>{t("floor.cleared")}</em> : null}
      </div>
    </header>
  );
}
