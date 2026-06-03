import type { ReactNode } from "react";
import { t } from "../../i18n/strings";
import type { Gear } from "../../services/types";
import { GearIcon } from "../GearIcon";
import { RarityDot } from "../RarityDot";

export interface GearCardProps {
  gear: Gear;
  compact?: boolean;
  delta?: number;
  footer?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

export function GearCard({
  gear,
  compact,
  delta,
  footer,
  selected,
  onClick,
}: GearCardProps) {
  const Element = onClick ? "button" : "article";

  return (
    <Element
      className={[
        "gear-card",
        `gear-card--${gear.rarity}`,
        selected ? "gear-card--selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      type={onClick ? "button" : undefined}
      onClick={onClick}
    >
      <div className="gear-card__icon">
        <GearIcon rarity={gear.rarity} slot={gear.slot} size={compact ? 20 : 24} />
        {gear.isNew ? <span className="gear-card__new">{t("gear.new")}</span> : null}
      </div>
      <div className="gear-card__body">
        <div className="gear-card__meta">
          <RarityDot rarity={gear.rarity} />
          <span>{t(`rarity.${gear.rarity}`)}</span>
          <span>{t(`slot.${gear.slot}`)}</span>
        </div>
        <h3 className="tw-display">{t(gear.nameKey)}</h3>
        {gear.stats?.length && !compact ? (
          <div className="gear-card__stats">
            {gear.stats.map((stat) => (
              <span key={stat.k}>
                {t(`stat.${stat.k}`)} <strong className="tw-num">{stat.v}</strong>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="gear-card__cp">
        <strong className="tw-num">+{gear.cp ?? 0}</strong>
        <span>{t("common.cp")}</span>
      </div>
      {typeof delta === "number" ? (
        <div className={delta >= 0 ? "gear-card__delta is-good" : "gear-card__delta is-danger"}>
          {delta >= 0 ? "▲" : "▼"} {delta >= 0 ? "+" : ""}
          <span className="tw-num">{delta}</span> {t("common.cp")}
        </div>
      ) : null}
      {footer}
    </Element>
  );
}
