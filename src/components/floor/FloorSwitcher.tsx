import { t } from "../../i18n/strings";

export function FloorSwitcher({ current, max }: { current: number; max: number }) {
  return (
    <div className="floor-switcher">
      {[1, 2, 3, 4, 5].map((floor) => {
        const unlocked = floor <= max;

        return (
          <span
            className={[
              "floor-switcher__item",
              floor === current ? "is-current" : "",
              unlocked ? "is-unlocked" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={floor}
          >
            {unlocked ? t("floor.short", { floor }) : t("common.locked")}
          </span>
        );
      })}
    </div>
  );
}
