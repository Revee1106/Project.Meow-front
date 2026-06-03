import { create } from "zustand";
import { changeLocale, type Locale } from "../i18n/strings";

type I18nStore = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const STORAGE_KEY = "tower-pvp.settings";

export const useI18nStore = create<I18nStore>((set) => ({
  locale: readLocale(),
  setLocale: (locale) => {
    void changeLocale(locale);
    persistLocale(locale);
    set({ locale });
  },
}));

void changeLocale(readLocale());

function readLocale(): Locale {
  if (typeof localStorage === "undefined") {
    return "en";
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as {
      locale?: Locale;
    };
    return parsed.locale === "zh-CN" ? "zh-CN" : "en";
  } catch {
    return "en";
  }
}

function persistLocale(locale: Locale) {
  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<
      string,
      unknown
    >;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, locale }));
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ locale }));
  }
}
