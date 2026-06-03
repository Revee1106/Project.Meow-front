import { describe, expect, it } from "vitest";
import { changeLocale, interpolate, t } from "./strings";

describe("i18n", () => {
  it("interpolates brace tokens and leaves missing tokens visible", () => {
    expect(
      interpolate("Floor {floor}: {name}", { floor: 2, name: "Crypt Gate" }),
    ).toBe("Floor 2: Crypt Gate");
    expect(interpolate("Missing {token}", {})).toBe("Missing {token}");
  });

  it("resolves explicit plural keys and switches locale", async () => {
    await changeLocale("en");

    expect(t("home.notif.newReports", { count: 1 })).toBe(
      "1 new battle report",
    );
    expect(t("home.notif.newReports", { count: 2 })).toBe(
      "2 new battle reports",
    );

    await changeLocale("zh-CN");
    expect(t("home.notif.newReports", { count: 2 })).toBe("2 条新战报");

    await changeLocale("en");
  });
});
