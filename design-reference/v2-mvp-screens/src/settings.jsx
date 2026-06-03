// Settings — pushed screen. Minimal MVP settings with a LIVE language switch
// (English / 简体中文). Selecting a language re-renders the whole screen.

const T = window.TowerI18n.t;
const { tokens, PushHeader, Panel, Toggle, Segmented, ListRow } = window.TowerUI;
const { useState } = React;

function SettingGroup({ title, children }) {
  return (
    <>
      <div style={{ paddingInline: 14, marginTop: 16, marginBottom: 6, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: tokens.textMuted }}>
        {title}
      </div>
      <Panel style={{ marginTop: 0 }}>{children}</Panel>
    </>
  );
}

function ControlRow({ icon, label, children, last }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      paddingInline: 12, paddingBlock: 11, minHeight: 48,
      borderBottom: last ? "none" : `1px solid ${tokens.borderSubtle}`,
    }}>
      {icon !== undefined && (
        <span style={{ flex: "0 0 auto", width: 30, height: 30, borderRadius: 8, background: tokens.inset, color: tokens.textSecondary, display: "grid", placeItems: "center", fontSize: 15 }}>{icon}</span>
      )}
      <span style={{ flex: "1 1 auto", minWidth: 0, fontSize: 13, fontWeight: 600, color: tokens.textPrimary }}>{label}</span>
      <span style={{ flex: "0 0 auto" }}>{children}</span>
    </div>
  );
}

function SettingsScreen({ initialLocale = "en", onBack }) {
  const [loc, setLoc] = useState(initialLocale);
  const [sfx, setSfx] = useState(true);
  const [music, setMusic] = useState(false);
  const [notif, setNotif] = useState(true);
  const [speed, setSpeed] = useState("fast");

  return (
    <>
      <PushHeader title={T("settings.title", null, loc)} onBack={onBack} />

      <div className="tw-scroll" style={{ flex: "1 1 auto", overflowY: "auto", paddingBottom: 18 }}>
        {/* player card */}
        <div style={{
          marginInline: 14, marginTop: 14, padding: 14, borderRadius: 12,
          background: tokens.surfaceRaised, border: `1px solid ${tokens.borderSubtle}`,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, flex: "0 0 auto",
            background: `linear-gradient(135deg, ${tokens.purple}, ${tokens.crimson})`,
            border: `1px solid ${tokens.borderStrong}`, display: "grid", placeItems: "center",
            fontFamily: tokens.fontDisplay, fontSize: 20, fontWeight: 700, color: tokens.textPrimary,
          }}>V</div>
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: tokens.textPrimary }}>Veyra</div>
            <div style={{ fontSize: 11, color: tokens.textMuted, marginTop: 2 }}>
              {T("settings.playerId", null, loc)} · <span className="tw-num">#A7F32K</span>
            </div>
          </div>
        </div>

        {/* preferences */}
        <SettingGroup title={T("settings.section.preferences", null, loc)}>
          {/* language — the important one */}
          <div style={{ paddingInline: 12, paddingTop: 11, paddingBottom: 12, borderBottom: `1px solid ${tokens.borderSubtle}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ flex: "0 0 auto", width: 30, height: 30, borderRadius: 8, background: tokens.inset, color: tokens.gold, display: "grid", placeItems: "center", fontSize: 15 }}>文</span>
              <span style={{ flex: "1 1 auto", fontSize: 13, fontWeight: 600, color: tokens.textPrimary }}>{T("settings.language", null, loc)}</span>
            </div>
            <Segmented
              value={loc} onChange={setLoc}
              options={[
                { value: "en", label: "English" },
                { value: "zh", label: "简体中文" },
              ]}
            />
          </div>

          <ControlRow icon="♪" label={T("settings.sfx", null, loc)}>
            <Toggle on={sfx} onChange={setSfx} />
          </ControlRow>
          <ControlRow icon="♫" label={T("settings.music", null, loc)}>
            <Toggle on={music} onChange={setMusic} />
          </ControlRow>
          <ControlRow icon="⚔" label={T("settings.battleSpeed", null, loc)}>
            <div style={{ width: 152 }}>
              <Segmented
                locale={loc} value={speed} onChange={setSpeed}
                options={[
                  { value: "normal", labelKey: "settings.speed.normal" },
                  { value: "fast", labelKey: "settings.speed.fast" },
                  { value: "instant", labelKey: "settings.speed.instant" },
                ]}
              />
            </div>
          </ControlRow>
          <ControlRow icon="🔔" label={T("settings.notifications", null, loc)} last>
            <Toggle on={notif} onChange={setNotif} />
          </ControlRow>
        </SettingGroup>

        {/* account */}
        <SettingGroup title={T("settings.section.account", null, loc)}>
          <ListRow icon="♚" title={T("settings.account", null, loc)} right={<span style={{ color: tokens.textMuted, fontSize: 14 }}>›</span>} onClick={() => {}} />
          <ListRow icon="↪" title={T("settings.logout", null, loc)} danger right={<span style={{ color: tokens.crimson, fontSize: 14 }}>›</span>} onClick={() => {}} style={{ borderBottom: "none" }} />
        </SettingGroup>

        {/* about */}
        <SettingGroup title={T("settings.section.about", null, loc)}>
          <ListRow icon="🛡" title={T("settings.privacy", null, loc)} right={<span style={{ color: tokens.textMuted, fontSize: 14 }}>›</span>} onClick={() => {}} />
          <ListRow icon="✉" title={T("settings.support", null, loc)} right={<span style={{ color: tokens.textMuted, fontSize: 14 }}>›</span>} onClick={() => {}} />
          <ControlRow icon="ⓘ" label={T("settings.version", null, loc)} last>
            <span className="tw-num" style={{ fontSize: 12, color: tokens.textMuted }}>1.0.0 (240)</span>
          </ControlRow>
        </SettingGroup>
      </div>
    </>
  );
}

window.SettingsScreen = SettingsScreen;
