import { t } from "../../i18n/strings";
import type { WinChanceBucket } from "./winChance";

export function WinChancePill({ bucket }: { bucket: WinChanceBucket }) {
  return (
    <span className={`win-chance win-chance--${bucket}`}>
      {t(`winChance.${bucket}`)}
    </span>
  );
}
