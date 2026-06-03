import { NavLink } from "react-router-dom";
import { t, type StringKey } from "../../i18n/strings";
import { useNotifStore } from "../../stores/notifStore";

type TabItem = {
  id: "home" | "floor" | "equipment" | "reports";
  labelKey: StringKey;
  to: string;
  glyph: string;
};

const TABS: TabItem[] = [
  { id: "home", labelKey: "tab.home", to: "/", glyph: "H" },
  { id: "floor", labelKey: "tab.floor", to: "/floor/2", glyph: "F" },
  { id: "equipment", labelKey: "tab.equipment", to: "/equipment", glyph: "G" },
  { id: "reports", labelKey: "tab.reports", to: "/reports", glyph: "R" },
];

function RedDot({ value }: { value: boolean | number }) {
  if (typeof value === "number") {
    return <span className="tab-bar__badge">{value > 99 ? "99+" : value}</span>;
  }

  return <span className="tab-bar__dot" />;
}

export function TabBar() {
  const redDots = useNotifStore((store) => store.redDots);

  return (
    <nav className="tab-bar" aria-label="Primary">
      {TABS.map((tab) => {
        const dot = tab.id === "home" ? undefined : redDots[tab.id];

        return (
          <NavLink
            className={({ isActive }) =>
              isActive ? "tab-bar__item tab-bar__item--active" : "tab-bar__item"
            }
            end={tab.to === "/"}
            key={tab.id}
            to={tab.to}
          >
            <span className="tab-bar__glyph" aria-hidden="true">
              {tab.glyph}
              {dot ? <RedDot value={dot} /> : null}
            </span>
            <span className="tab-bar__label">{t(tab.labelKey)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
