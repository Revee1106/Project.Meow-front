import { create } from "zustand";
import type { Locale } from "../i18n/strings";

export type BattleSpeed = "normal" | "fast" | "instant";

type SettingsState = {
  locale: Locale;
  sfx: boolean;
  music: boolean;
  notifications: boolean;
  battleSpeed: BattleSpeed;
};

type SettingsStore = SettingsState & {
  setLocale: (locale: Locale) => void;
  setSfx: (sfx: boolean) => void;
  setMusic: (music: boolean) => void;
  setNotifications: (notifications: boolean) => void;
  setBattleSpeed: (battleSpeed: BattleSpeed) => void;
};

const STORAGE_KEY = "tower-pvp.settings";

const defaults: SettingsState = {
  locale: "en",
  sfx: true,
  music: false,
  notifications: true,
  battleSpeed: "fast",
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...readSettings(),
  setLocale: (locale) =>
    setAndPersist(set, () => ({ ...get(), locale })),
  setSfx: (sfx) => setAndPersist(set, () => ({ ...get(), sfx })),
  setMusic: (music) => setAndPersist(set, () => ({ ...get(), music })),
  setNotifications: (notifications) =>
    setAndPersist(set, () => ({ ...get(), notifications })),
  setBattleSpeed: (battleSpeed) =>
    setAndPersist(set, () => ({ ...get(), battleSpeed })),
}));

function readSettings(): SettingsState {
  if (typeof localStorage === "undefined") {
    return defaults;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaults;
    }

    return { ...defaults, ...(JSON.parse(raw) as Partial<SettingsState>) };
  } catch {
    return defaults;
  }
}

function setAndPersist(
  set: (partial: SettingsStore) => void,
  next: () => SettingsStore,
) {
  const value = next();
  set(value);

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        locale: value.locale,
        sfx: value.sfx,
        music: value.music,
        notifications: value.notifications,
        battleSpeed: value.battleSpeed,
      }),
    );
  }
}
