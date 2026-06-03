import { describe, expect, it } from "vitest";
import { changeLocale, i18n, t } from "./strings";

const keys = [
  "battleResult.victory",
  "battleResult.defeat",
  "battleResult.subtitleNpc",
  "battleResult.subtitlePlayer",
  "battleResult.subtitleDefeat",
  "battleResult.upset",
  "battleResult.nodeUnlocked",
  "battleResult.vs",
  "battleResult.summary",
  "battleResult.rounds",
  "battleResult.dmgDealt",
  "battleResult.dmgTaken",
  "battleResult.hpLeft",
  "battleResult.rewards",
  "battleResult.noRewards",
  "battleResult.gearDrop",
  "battleResult.noGearDrop",
  "battleResult.betterBy",
  "battleResult.notBetter",
  "battleResult.actionOccupy",
  "battleResult.actionReturn",
  "battleResult.actionEquip",
  "battleResult.actionRetry",
  "garrison.pageTitle",
  "garrison.duration",
  "garrison.capIn",
  "garrison.capFull",
  "garrison.capFullNote",
  "garrison.capNearNote",
  "garrison.accumulated",
  "garrison.rewardCapProgress",
  "garrison.noRewardsYet",
  "garrison.claim",
  "garrison.claimEmpty",
  "garrison.leave",
  "garrison.return",
  "garrison.leaveWarning",
  "garrison.defenseWins",
  "garrison.defenseLosses",
  "garrison.defenseLog",
  "garrison.emptyLog.title",
  "garrison.emptyLog.body",
  "garrison.log.win",
  "garrison.log.loss",
  "garrison.lost.title",
  "garrison.lost.body",
  "garrison.leaveConfirm.title",
  "garrison.leaveConfirm.body",
  "garrison.leaveConfirm.confirm",
  "gear.lichcleaver.name",
  "gear.new",
  "slot.weapon",
  "stat.atk",
  "time.minAgo",
  "time.hourAgo",
  "common.back",
  "common.cancel",
  "common.confirm",
];

describe("Phase A i18n keys", () => {
  it.each(["en", "zh-CN"] as const)("has all keys in %s", (locale) => {
    for (const key of keys) {
      const namespace = key.startsWith("battleResult.")
        ? "battleResult"
        : key.startsWith("garrison.")
          ? "garrison"
          : key.startsWith("gear.") ||
              key.startsWith("slot.") ||
              key.startsWith("stat.")
            ? "resources"
            : "common";
      expect(i18n.exists(key, { lng: locale, ns: namespace }), key).toBe(true);
    }
  });

  it("renders Phase A CTAs in both locales", async () => {
    await changeLocale("en");
    expect(t("battleResult.actionOccupy")).toBe("Occupy Node");
    expect(t("garrison.leave")).toBe("Leave Garrison");

    await changeLocale("zh-CN");
    expect(t("battleResult.actionOccupy")).toBe("占领据点");
    expect(t("garrison.leave")).toBe("放弃驻守");

    await changeLocale("en");
  });
});
