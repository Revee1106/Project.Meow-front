import { describe, expect, it } from "vitest";
import { changeLocale, i18n, t } from "./strings";

const keys = [
  "equip.totalCP",
  "equip.equipped",
  "equip.backpack",
  "equip.autoEquip",
  "equip.upgradesAvailable",
  "equip.equip",
  "equip.comparing",
  "equip.replaces",
  "equip.cpDelta",
  "equip.tapHint",
  "equip.emptyBackpack.title",
  "equip.emptyBackpack.body",
  "equip.slotEmpty",
  "reports.title",
  "reports.markAll",
  "reports.filter.label",
  "reports.filter.all",
  "reports.filter.attack",
  "reports.filter.defense",
  "reports.empty.title",
  "reports.empty.body",
  "report.attackWin.title",
  "report.attackWin.sub",
  "report.attackLoss.title",
  "report.attackLoss.sub",
  "report.defenseWin.title",
  "report.defenseWin.sub",
  "report.nodeLost.title",
  "report.nodeLost.sub",
  "report.viewReplay",
  "gear.wardensMaul.name",
  "gear.cryptHood.name",
  "gear.bonewovenPlate.name",
  "gear.emberBand.name",
  "gear.lumenLocket.name",
  "gear.gravewalkers.name",
  "gear.wardingCharm.name",
  "gear.ashenCowl.name",
  "gear.hollowSignet.name",
  "gear.dustTreads.name",
  "gear.sunderAxe.name",
];

describe("Phase C i18n keys", () => {
  it.each(["en", "zh-CN"] as const)("has all keys in %s", (locale) => {
    for (const key of keys) {
      const namespace = key.startsWith("gear.") ? "resources" : "common";
      expect(i18n.exists(key, { lng: locale, ns: namespace }), key).toBe(true);
    }
  });

  it("renders Equipment and Reports labels in both locales", async () => {
    await changeLocale("en");
    expect(t("equip.autoEquip")).toBe("Auto-Equip Best");
    expect(t("reports.markAll")).toBe("Mark all read");

    await changeLocale("zh-CN");
    expect(t("equip.autoEquip")).toBe("一键装备最佳");
    expect(t("reports.markAll")).toBe("全部已读");

    await changeLocale("en");
  });
});
