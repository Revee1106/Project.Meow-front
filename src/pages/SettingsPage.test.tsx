import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { changeLocale } from "../i18n/strings";
import { useI18nStore } from "../stores/i18nStore";
import { useSettingsStore } from "../stores/settingsStore";
import { SettingsPage } from "./SettingsPage";

describe("SettingsPage", () => {
  beforeEach(async () => {
    await changeLocale("en");
    useI18nStore.getState().setLocale("en");
    useSettingsStore.getState().setLocale("en");
    vi.spyOn(console, "error").mockImplementation((message: unknown) => {
      if (String(message).includes("useLayoutEffect does nothing on the server")) {
        return;
      }

      throw new Error(String(message));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the full settings screen in English", () => {
    const html = renderSettings();

    expect(html).toContain("Settings");
    expect(html).toContain("Preferences");
    expect(html).toContain("Language");
    expect(html).toContain("Sound effects");
    expect(html).toContain("Battle speed");
    expect(html).toContain("Privacy policy");
  });

  it("renders Simplified Chinese after live locale switch", async () => {
    useSettingsStore.getState().setLocale("zh-CN");
    useI18nStore.getState().setLocale("zh-CN");
    await changeLocale("zh-CN");

    const html = renderSettings();

    expect(html).toContain("设置");
    expect(html).toContain("偏好设置");
    expect(html).toContain("语言");
    expect(html).toContain("音效");
    expect(html).toContain("战斗速度");
    expect(html).toContain("隐私政策");
  });
});

function renderSettings() {
  return renderToString(
    <MemoryRouter initialEntries={["/settings"]}>
      <SettingsPage />
    </MemoryRouter>,
  );
}
