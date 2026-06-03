import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import enBattleResult from "../locales/en/battleResult.json";
import enCommon from "../locales/en/common.json";
import enGarrison from "../locales/en/garrison.json";
import enHome from "../locales/en/home.json";
import enNode from "../locales/en/node.json";
import enResources from "../locales/en/resources.json";
import enSettings from "../locales/en/settings.json";
import enTower from "../locales/en/tower.json";
import zhBattleResult from "../locales/zh-CN/battleResult.json";
import zhCommon from "../locales/zh-CN/common.json";
import zhGarrison from "../locales/zh-CN/garrison.json";
import zhHome from "../locales/zh-CN/home.json";
import zhNode from "../locales/zh-CN/node.json";
import zhResources from "../locales/zh-CN/resources.json";
import zhSettings from "../locales/zh-CN/settings.json";
import zhTower from "../locales/zh-CN/tower.json";

export const LOCALES = ["en", "zh-CN"] as const;
export type Locale = (typeof LOCALES)[number];
export type StringKey = string;

const NAMESPACES = [
  "common",
  "battleResult",
  "home",
  "tower",
  "node",
  "garrison",
  "resources",
  "settings",
] as const;

const resources = {
  en: {
    common: enCommon,
    battleResult: enBattleResult,
    home: enHome,
    tower: enTower,
    node: enNode,
    garrison: enGarrison,
    resources: enResources,
    settings: enSettings,
  },
  "zh-CN": {
    common: zhCommon,
    battleResult: zhBattleResult,
    home: zhHome,
    tower: zhTower,
    node: zhNode,
    garrison: zhGarrison,
    resources: zhResources,
    settings: zhSettings,
  },
} as const;

void i18next.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  defaultNS: "common",
  fallbackNS: [...NAMESPACES],
  ns: [...NAMESPACES],
  keySeparator: false,
  nsSeparator: false,
  interpolation: {
    escapeValue: false,
    prefix: "{",
    suffix: "}",
  },
  returnNull: false,
});

export const i18n = i18next;

export function t(key: string, vars?: Record<string, string | number>) {
  const ns = namespaceForKey(key);
  const resolvedKey =
    typeof vars?.count === "number" &&
    vars.count !== 1 &&
    i18n.exists(`${key}_plural`, { ns })
      ? `${key}_plural`
      : key;

  if (import.meta.env.DEV && !i18n.exists(resolvedKey, { ns })) {
    console.warn(`Missing i18n key: ${resolvedKey}`);
  }

  return i18n.t(resolvedKey, { ns, ...vars });
}

export function interpolate(
  template: string,
  vars: Record<string, string | number> = {},
) {
  return template.replace(/\{([^{}]+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(vars, name)
      ? String(vars[name])
      : match,
  );
}

export function changeLocale(locale: Locale) {
  return i18n.changeLanguage(locale);
}

function namespaceForKey(key: string): (typeof NAMESPACES)[number] {
  if (key.startsWith("home.") || key.startsWith("state.")) {
    return "home";
  }

  if (key.startsWith("tower.") || key.startsWith("floor.")) {
    return "tower";
  }

  if (
    key.startsWith("node.") ||
    key.startsWith("nodeDetail.") ||
    key.startsWith("winChance.") ||
    key.startsWith("blocked.")
  ) {
    return "node";
  }

  if (
    key.startsWith("battleResult.") ||
    key.startsWith("slot.") ||
    key.startsWith("stat.")
  ) {
    return key.startsWith("battleResult.") ? "battleResult" : "resources";
  }

  if (
    key.startsWith("garrison.") ||
    key.startsWith("confirm.") ||
    key.startsWith("toast.")
  ) {
    return "garrison";
  }

  if (key.startsWith("res.") || key.startsWith("rarity.")) {
    return "resources";
  }

  if (key.startsWith("gear.")) {
    return "resources";
  }

  if (key.startsWith("settings.")) {
    return "settings";
  }

  return "common";
}
