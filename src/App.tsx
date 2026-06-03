import { Navigate, Route, Routes } from "react-router-dom";
import { BattlePage } from "./pages/BattlePage";
import { BattleResolvePage } from "./pages/BattleResolve/BattleResolvePage";
import { BattleResultPage } from "./pages/BattleResult/BattleResultPage";
import { EquipmentPage } from "./pages/EquipmentPage";
import { GarrisonPage } from "./pages/Garrison/GarrisonPage";
import { AppShell } from "./layouts/AppShell";
import { FloorPage } from "./pages/FloorPage";
import { HomePage } from "./pages/HomePage";
import { ReportsPage } from "./pages/ReportsPage";
import { RouteStubPage } from "./pages/RouteStubPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          index
          element={<HomePage />}
        />
        <Route
          path="floor/:floorId"
          element={<FloorPage />}
        />
        <Route
          path="equipment"
          element={<EquipmentPage />}
        />
        <Route
          path="reports"
          element={<ReportsPage />}
        />
        <Route
          path="garrison"
          element={<GarrisonPage />}
        />
        <Route
          path="settings"
          element={<SettingsPage />}
        />
        <Route
          path="battle/:battleId"
          element={<BattlePage />}
        />
        <Route
          path="battle/resolve"
          element={<BattleResolvePage />}
        />
        <Route
          path="battle/result"
          element={<BattleResultPage />}
        />
        <Route path="floor" element={<Navigate to="/floor/2" replace />} />
        <Route
          path="*"
          element={
            <RouteStubPage
              titleKey="route.notFound.title"
              bodyKey="route.notFound.body"
            />
          }
        />
      </Route>
    </Routes>
  );
}
