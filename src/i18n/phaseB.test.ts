import { describe, expect, it } from "vitest";
import { changeLocale, i18n, t } from "./strings";

const keys = [
  "resolve.title",
  "resolve.resolving",
  "resolve.round",
  "resolve.skip",
  "resolve.speed",
  "resolve.viewResult",
  "resolve.log.open",
  "resolve.log.enemyHit",
  "resolve.log.crit",
  "resolve.log.skill",
  "resolve.log.finish",
  "settings.speed.normal",
  "settings.speed.fast",
  "settings.speed.instant",
];

describe("Phase B i18n keys", () => {
  it.each(["en", "zh-CN"] as const)("has all keys in %s", (locale) => {
    for (const key of keys) {
      const namespace = key.startsWith("settings.") ? "settings" : "common";
      expect(i18n.exists(key, { lng: locale, ns: namespace }), key).toBe(true);
    }
  });

  it("renders resolve CTAs in both locales", async () => {
    await changeLocale("en");
    expect(t("resolve.skip")).toBe("Skip");
    expect(t("resolve.viewResult")).toBe("View Result");

    await changeLocale("zh-CN");
    expect(t("resolve.skip")).toBe("跳过");
    expect(t("resolve.viewResult")).toBe("查看结果");

    await changeLocale("en");
  });
});
