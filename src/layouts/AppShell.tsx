import { Outlet } from "react-router-dom";
import { ModalLayer } from "../components/shell/ModalLayer";
import { StateBanner } from "../components/shell/StateBanner";
import { TabBar } from "../components/shell/TabBar";
import { useI18nStore } from "../stores/i18nStore";

export function AppShell() {
  const locale = useI18nStore((store) => store.locale);

  return (
    <div className="app-shell">
      <div className="app-shell__safe-area">
        <StateBanner />
        <main className="app-shell__content" key={locale}>
          <Outlet />
        </main>
        <TabBar />
        <ModalLayer />
      </div>
    </div>
  );
}
