import { t } from "../../i18n/strings";
import type { OpponentKind } from "../../services/types";

export interface CombatantAvatarProps {
  kind: "me" | OpponentKind;
  name?: string;
  nameKey?: string;
  cp: number;
  upset?: boolean;
}

export function CombatantAvatar({
  kind,
  name,
  nameKey,
  cp,
  upset,
}: CombatantAvatarProps) {
  const label = nameKey ? t(nameKey) : (name ?? t("battleResult.enemy"));
  const initial = kind === "npc" ? "N" : label.slice(0, 1);

  return (
    <div className={`combatant combatant--${kind}${upset ? " combatant--upset" : ""}`}>
      <div className="combatant__avatar" aria-hidden="true">
        {initial}
      </div>
      <strong>{label}</strong>
      <span>
        {t("common.cp")} <em className="tw-num">{cp.toLocaleString()}</em>
      </span>
    </div>
  );
}
