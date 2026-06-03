import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ListRow } from "../components/ListRow";
import { Panel } from "../components/Panel";
import { PushHeader } from "../components/PushHeader";
import { Segmented } from "../components/Segmented";
import { Toggle } from "../components/Toggle";
import { t, LOCALES, type Locale } from "../i18n/strings";
import { useI18nStore } from "../stores/i18nStore";
import {
  type BattleSpeed,
  useSettingsStore,
} from "../stores/settingsStore";
import { usePlayerStore } from "../stores/playerStore";

export function SettingsPage() {
  const navigate = useNavigate();
  const player = usePlayerStore((store) => store.player);
  const locale = useI18nStore((store) => store.locale);
  const setI18nLocale = useI18nStore((store) => store.setLocale);
  const sfx = useSettingsStore((store) => store.sfx);
  const music = useSettingsStore((store) => store.music);
  const notifications = useSettingsStore((store) => store.notifications);
  const battleSpeed = useSettingsStore((store) => store.battleSpeed);
  const setSettingsLocale = useSettingsStore((store) => store.setLocale);
  const setSfx = useSettingsStore((store) => store.setSfx);
  const setMusic = useSettingsStore((store) => store.setMusic);
  const setNotifications = useSettingsStore((store) => store.setNotifications);
  const setBattleSpeed = useSettingsStore((store) => store.setBattleSpeed);

  const changeLanguage = (nextLocale: Locale) => {
    setSettingsLocale(nextLocale);
    setI18nLocale(nextLocale);
  };

  return (
    <div className="settings-page-v2">
      <PushHeader title={t("settings.title")} onBack={() => navigate(-1)} />

      <div className="settings-scroll tw-scroll">
        <section className="settings-player-card">
          <span aria-hidden="true">{player.name.slice(0, 1)}</span>
          <div>
            <strong>{player.name}</strong>
            <p>
              {t("settings.playerId")} <em className="tw-num">#A7F32K</em>
            </p>
          </div>
        </section>

        <SettingGroup title={t("settings.section.preferences")}>
          <div className="settings-language-row">
            <div className="settings-control-label">
              <span aria-hidden="true">文</span>
              <strong>{t("settings.language")}</strong>
            </div>
            <Segmented<Locale>
              ariaLabel={t("settings.language")}
              options={LOCALES.map((item) => ({
                value: item,
                labelKey: `settings.langName.${item}`,
              }))}
              value={locale}
              onChange={changeLanguage}
            />
          </div>

          <ControlRow icon="S" label={t("settings.sfx")}>
            <Toggle
              ariaLabel={t("settings.sfx")}
              checked={sfx}
              onChange={setSfx}
            />
          </ControlRow>
          <ControlRow icon="M" label={t("settings.music")}>
            <Toggle
              ariaLabel={t("settings.music")}
              checked={music}
              onChange={setMusic}
            />
          </ControlRow>
          <ControlRow icon="B" label={t("settings.battleSpeed")}>
            <Segmented<BattleSpeed>
              ariaLabel={t("settings.battleSpeed")}
              options={[
                { value: "normal", labelKey: "settings.speed.normal" },
                { value: "fast", labelKey: "settings.speed.fast" },
                { value: "instant", labelKey: "settings.speed.instant" },
              ]}
              value={battleSpeed}
              onChange={setBattleSpeed}
            />
          </ControlRow>
          <ControlRow icon="N" label={t("settings.notifications")} last>
            <Toggle
              ariaLabel={t("settings.notifications")}
              checked={notifications}
              onChange={setNotifications}
            />
          </ControlRow>
        </SettingGroup>

        <SettingGroup title={t("settings.section.account")}>
          <ListRow
            icon={<span className="settings-row-icon">P</span>}
            right={<span className="settings-row-arrow">›</span>}
            title={t("settings.account")}
          />
          <ListRow
            danger
            icon={<span className="settings-row-icon settings-row-icon--danger">X</span>}
            right={<span className="settings-row-arrow is-danger">›</span>}
            title={t("settings.logout")}
          />
        </SettingGroup>

        <SettingGroup title={t("settings.section.about")}>
          <ListRow
            icon={<span className="settings-row-icon">L</span>}
            right={<span className="settings-row-arrow">›</span>}
            title={t("settings.privacy")}
          />
          <ListRow
            icon={<span className="settings-row-icon">?</span>}
            right={<span className="settings-row-arrow">›</span>}
            title={t("settings.support")}
          />
          <ControlRow icon="V" label={t("settings.version")} last>
            <span className="settings-version tw-num">1.0.0 (240)</span>
          </ControlRow>
        </SettingGroup>
      </div>
    </div>
  );
}

function SettingGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="settings-group">
      <h2>{title}</h2>
      <Panel>{children}</Panel>
    </section>
  );
}

function ControlRow({
  icon,
  label,
  children,
  last,
}: {
  icon: string;
  label: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div className={last ? "settings-control-row is-last" : "settings-control-row"}>
      <div className="settings-control-label">
        <span aria-hidden="true">{icon}</span>
        <strong>{label}</strong>
      </div>
      <div className="settings-control-value">{children}</div>
    </div>
  );
}
