import { describe, expect, it } from "vitest";
import { changeLocale, i18n, t } from "./strings";
import { useSettingsStore } from "../stores/settingsStore";

const keys = [
  "settings.title",
  "settings.section.preferences",
  "settings.section.account",
  "settings.section.about",
  "settings.language",
  "settings.langName.en",
  "settings.langName.zh-CN",
  "settings.sfx",
  "settings.music",
  "settings.battleSpeed",
  "settings.notifications",
  "settings.account",
  "settings.playerId",
  "settings.privacy",
  "settings.support",
  "settings.version",
  "settings.logout",
];

describe("Phase D settings i18n and state", () => {
  it.each(["en", "zh-CN"] as const)("has every settings key in %s", (locale) => {
    for (const key of keys) {
      expect(i18n.exists(key, { lng: locale, ns: "settings" }), key).toBe(true);
    }
  });

  it("switches visible labels through i18n", async () => {
    await changeLocale("en");
    expect(t("settings.title")).toBe("Settings");

    await changeLocale("zh-CN");
    expect(t("settings.title")).toBe("设置");

    await changeLocale("en");
  });

  it("stores settings controls", () => {
    const store = useSettingsStore.getState();

    store.setSfx(false);
    store.setMusic(true);
    store.setNotifications(false);
    store.setBattleSpeed("instant");

    expect(useSettingsStore.getState().sfx).toBe(false);
    expect(useSettingsStore.getState().music).toBe(true);
    expect(useSettingsStore.getState().notifications).toBe(false);
    expect(useSettingsStore.getState().battleSpeed).toBe("instant");
  });
});
