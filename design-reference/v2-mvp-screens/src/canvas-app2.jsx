// Canvas v2 — assembles ALL screens: the approved Home / Floor / Node Detail
// plus the new MVP screens (Battle Resolve, Battle Result, Garrison,
// Equipment, Reports, Settings) across their required states.

const { PhoneFrame, tokens } = window.TowerUI;
const T = window.TowerI18n.t;
const { useState } = React;

// ---------- existing-screen phone wrappers (parity with canvas-app.jsx) ----------
function HomePhone({ variant }) {
  return <PhoneFrame><window.HomeScreen variant={variant} /></PhoneFrame>;
}

function FloorPhone({ variant }) {
  const [openNode, setOpenNode] = useState(null);
  let modalVariant = null;
  if (openNode) {
    modalVariant = (variant === "garrisoning" && openNode.state !== "occupiedByMe") ? "blocked" : openNode.state;
  }
  return (
    <PhoneFrame
      modal={openNode && (
        <window.NodeDetailSheet
          variant={modalVariant} node={openNode}
          myGarrisonNodeName={T("node.f2.crystalVault.name")}
          onClose={() => setOpenNode(null)}
        />
      )}
    >
      <window.FloorScreen variant={variant} onTapNode={setOpenNode} />
    </PhoneFrame>
  );
}

function NodeDetailPhone({ variant, nodeId, backdropVariant = "pvp", garrisonName }) {
  const floor = backdropVariant === "garrisoning" ? window.TowerData.Floor2_Garrisoning : window.TowerData.Floor2_PvP;
  const node = floor.nodes.find((n) => n.id === nodeId) || floor.nodes[1];
  return (
    <PhoneFrame
      modal={<window.NodeDetailSheet variant={variant} node={node} myGarrisonNodeName={garrisonName || T("node.f2.crystalVault.name")} onClose={() => {}} />}
    >
      <window.FloorScreen variant={backdropVariant} onTapNode={() => {}} />
    </PhoneFrame>
  );
}

// ---------- new-screen phone wrappers ----------
function ResultPhone({ data, locale }) {
  return <PhoneFrame><window.BattleResultScreen data={data} locale={locale} onBack={() => {}} /></PhoneFrame>;
}
function ResolvePhone(props) {
  return (
    <PhoneFrame>
      <window.BattleResolveScreen data={window.TowerData.Battle.victoryNpc} log={window.TowerData.ResolveLog} onBack={() => {}} {...props} />
    </PhoneFrame>
  );
}
function GarrisonPhone({ stateKey, startModalOpen, locale }) {
  return <PhoneFrame><window.GarrisonScreen data={window.TowerData.Garrison[stateKey]} startModalOpen={startModalOpen} locale={locale} onBack={() => {}} /></PhoneFrame>;
}
function EquipmentPhone({ empty, locale }) {
  return <PhoneFrame><window.EquipmentScreen empty={empty} locale={locale} onSettings={() => {}} /></PhoneFrame>;
}
function ReportsPhone({ empty, locale }) {
  return <PhoneFrame><window.ReportsScreen empty={empty} locale={locale} /></PhoneFrame>;
}
function SettingsPhone({ initialLocale }) {
  return <PhoneFrame><window.SettingsScreen initialLocale={initialLocale} onBack={() => {}} /></PhoneFrame>;
}

// battle-result payloads
const B = window.TowerData.Battle;
const resVictoryDrop = { ...B.victoryNpc, drop: window.TowerData.GearDrop };
const resVictoryNoDrop = { ...B.victoryNpc, drop: null };
const resVictoryPlayer = { ...B.victoryPlayer, drop: null };
const resDefeat = { ...B.defeat, drop: null };

// ---------- cover ----------
function CoverArtboard() {
  const groups = [
    { tag: "Battle Result", body: "Victory vs NPC · Victory vs player (upset) · Defeat · gear-drop / none" },
    { tag: "Garrison", body: "Accruing · cap near-full · cap full · no rewards · node lost · leave modal" },
    { tag: "Battle Resolve", body: "Resolving (skip + speed) · Complete → View Result" },
    { tag: "Equipment", body: "Slots · backpack · compare & equip · auto-equip · empty" },
    { tag: "Reports", body: "Raid / defense list · filters · unread · empty" },
    { tag: "Settings", body: "Live English / 简体中文 switch · audio · battle speed" },
  ];
  return (
    <div className="tw-root" style={{ width: 760, background: "#FFFFFF", border: "1px solid #d8d3c8", borderRadius: 12, padding: 32, color: "#1a1a1a", fontFamily: tokens.fontUI }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#8a6b22" }}>Tower PvP · MVP Screens</div>
      <div className="tw-display" style={{ fontSize: 34, fontWeight: 700, marginTop: 10, color: "#15131C" }}>
        Completing the core loop
      </div>
      <div style={{ fontSize: 14, color: "#4a4a4a", marginTop: 12, lineHeight: 1.5, maxWidth: 600 }}>
        Six remaining MVP screens, built on the approved Home / Floor / Node Detail system — same tokens,
        type, cards, badges, RewardChip / TimerPill / NodeStateBadge, and bottom-tab nav. Every label routes
        through <code style={{ background: "#f0eee9", padding: "1px 4px", borderRadius: 3 }}>t("ns.key")</code>;
        the Settings screen switches the live UI between English and 简体中文.
      </div>
      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {groups.map((b) => (
          <div key={b.tag} style={{ border: "1px solid #e2dccc", borderRadius: 8, padding: 12, background: "#fbf9f3" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#8a6b22" }}>{b.tag}</div>
            <div style={{ fontSize: 12, color: "#1a1a1a", marginTop: 6, lineHeight: 1.4 }}>{b.body}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, fontSize: 11, color: "#6b6478", background: "#f0eee9", padding: 10, borderRadius: 6, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
        Garrison is a pushed route (not a tab). Battle &amp; Battle Result are pushed flow screens. Bottom tabs stay Home · Floor · Gear · Reports.
      </div>
    </div>
  );
}

const W = 360, H = 760;

function CanvasRoot() {
  return (
    <window.DesignCanvas>
      <window.DCSection id="cover" title="Tower PvP — MVP Screens" subtitle="The remaining core-loop & support screens, on the approved component system. Tweak any text — it's all i18n keys.">
        <window.DCArtboard id="intro" label="Brief" width={760} height={392}><CoverArtboard /></window.DCArtboard>
      </window.DCSection>

      <window.DCSection id="result" title="Battle Result" subtitle="Pushed flow after a challenge resolves · P0. Victory / defeat, node unlock, rewards, gear drop.">
        <window.DCArtboard id="res-npc-drop" label="01 · Victory vs NPC · gear drop" width={W} height={H}><ResultPhone data={resVictoryDrop} /></window.DCArtboard>
        <window.DCArtboard id="res-npc-nodrop" label="02 · Victory vs NPC · no drop" width={W} height={H}><ResultPhone data={resVictoryNoDrop} /></window.DCArtboard>
        <window.DCArtboard id="res-player" label="03 · Victory vs player · upset" width={W} height={H}><ResultPhone data={resVictoryPlayer} /></window.DCArtboard>
        <window.DCArtboard id="res-defeat" label="04 · Defeat" width={W} height={H}><ResultPhone data={resDefeat} /></window.DCArtboard>
      </window.DCSection>

      <window.DCSection id="resolve" title="Battle Resolving / Replay" subtitle="Lightweight theatrical transition · P1. Auto-resolved server-side — UI is presentation.">
        <window.DCArtboard id="resolve-mid" label="01 · Resolving · skip + speed" width={W} height={H}><ResolvePhone phase="resolving" visibleLines={3} myHp={64} enemyHp={28} /></window.DCArtboard>
        <window.DCArtboard id="resolve-done" label="02 · Complete · View Result" width={W} height={H}><ResolvePhone phase="complete" myHp={58} enemyHp={0} /></window.DCArtboard>
      </window.DCSection>

      <window.DCSection id="garrison" title="Garrison" subtitle="Pushed route (not a tab) · P0. Extension of the occupied-node sheet.">
        <window.DCArtboard id="garr-normal" label="01 · Accruing rewards" width={W} height={H}><GarrisonPhone stateKey="normal" /></window.DCArtboard>
        <window.DCArtboard id="garr-near" label="02 · Cap nearly full" width={W} height={H}><GarrisonPhone stateKey="capNear" /></window.DCArtboard>
        <window.DCArtboard id="garr-full" label="03 · Cap full" width={W} height={H}><GarrisonPhone stateKey="capFull" /></window.DCArtboard>
        <window.DCArtboard id="garr-empty" label="04 · No rewards yet · empty log" width={W} height={H}><GarrisonPhone stateKey="empty" /></window.DCArtboard>
        <window.DCArtboard id="garr-lost" label="05 · Node lost" width={W} height={H}><GarrisonPhone stateKey="lost" /></window.DCArtboard>
        <window.DCArtboard id="garr-leave" label="06 · Leave confirmation" width={W} height={H}><GarrisonPhone stateKey="normal" startModalOpen /></window.DCArtboard>
      </window.DCSection>

      <window.DCSection id="equipment" title="Equipment" subtitle="Bottom tab · P1. Tap a backpack item to open compare & equip.">
        <window.DCArtboard id="equip-main" label="01 · Equipped + backpack" width={W} height={H}><EquipmentPhone /></window.DCArtboard>
        <window.DCArtboard id="equip-empty" label="02 · Empty backpack" width={W} height={H}><EquipmentPhone empty /></window.DCArtboard>
      </window.DCSection>

      <window.DCSection id="reports" title="Reports" subtitle="Bottom tab · P1. Async PvP & defense records.">
        <window.DCArtboard id="reports-list" label="01 · Report list · filters" width={W} height={H}><ReportsPhone /></window.DCArtboard>
        <window.DCArtboard id="reports-empty" label="02 · Empty" width={W} height={H}><ReportsPhone empty /></window.DCArtboard>
      </window.DCSection>

      <window.DCSection id="settings" title="Settings" subtitle="Pushed screen · P1. The language switch is live — tap it.">
        <window.DCArtboard id="settings-en" label="01 · English" width={W} height={H}><SettingsPhone initialLocale="en" /></window.DCArtboard>
        <window.DCArtboard id="settings-zh" label="02 · 简体中文" width={W} height={H}><SettingsPhone initialLocale="zh" /></window.DCArtboard>
      </window.DCSection>

      <window.DCSection id="home" title="Home — approved" subtitle="Reference · unchanged.">
        <window.DCArtboard id="home-free" label="01 · Free" width={W} height={H}><HomePhone variant="free" /></window.DCArtboard>
        <window.DCArtboard id="home-garr" label="02 · Garrisoning" width={W} height={H}><HomePhone variant="garrisoning" /></window.DCArtboard>
        <window.DCArtboard id="home-garr-report" label="03 · Garrisoning + report" width={W} height={H}><HomePhone variant="garrisoning_with_report" /></window.DCArtboard>
      </window.DCSection>

      <window.DCSection id="floor" title="Floor — approved" subtitle="Reference · unchanged. Tap nodes to open detail.">
        <window.DCArtboard id="floor-early" label="01 · Early NPC" width={W} height={H}><FloorPhone variant="early" /></window.DCArtboard>
        <window.DCArtboard id="floor-postclear" label="02 · Post-clear" width={W} height={H}><FloorPhone variant="postClear" /></window.DCArtboard>
        <window.DCArtboard id="floor-pvp" label="03 · PvP occupation" width={W} height={H}><FloorPhone variant="pvp" /></window.DCArtboard>
        <window.DCArtboard id="floor-garr" label="04 · Garrisoning · blocked" width={W} height={H}><FloorPhone variant="garrisoning" /></window.DCArtboard>
      </window.DCSection>

      <window.DCSection id="nodedetail" title="Node Detail — approved" subtitle="Reference · unchanged.">
        <window.DCArtboard id="nd-npc" label="01 · NPC Controlled" width={W} height={H}><NodeDetailPhone variant="npcControlled" nodeId="n_major" backdropVariant="early" /></window.DCArtboard>
        <window.DCArtboard id="nd-avail" label="02 · Available" width={W} height={H}><NodeDetailPhone variant="available" nodeId="n_med1" backdropVariant="postClear" /></window.DCArtboard>
        <window.DCArtboard id="nd-pvp" label="03 · Player Occupied" width={W} height={H}><NodeDetailPhone variant="playerOccupied" nodeId="n_med2" backdropVariant="pvp" /></window.DCArtboard>
        <window.DCArtboard id="nd-mine" label="04 · Occupied by Me" width={W} height={H}><NodeDetailPhone variant="occupiedByMe" nodeId="n_med1" backdropVariant="garrisoning" /></window.DCArtboard>
        <window.DCArtboard id="nd-blocked" label="05 · Blocked by garrison" width={W} height={H}><NodeDetailPhone variant="blocked" nodeId="n_med2" backdropVariant="garrisoning" /></window.DCArtboard>
      </window.DCSection>
    </window.DesignCanvas>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<CanvasRoot />);
