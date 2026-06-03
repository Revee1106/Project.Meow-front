// i18n dictionary + LocaleText component for Tower PvP mockups.
// Single source of truth for all visible text in the mockups.
// Keys mirror the spec namespaces: common.*, home.*, tower.*, node.*, etc.

const DICTS = {
  en: {
    // common
    "common.challenge": "Challenge",
    "common.occupy": "Occupy",
    "common.leave": "Leave",
    "common.claim": "Claim",
    "common.claimRewards": "Claim Rewards",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.back": "Back",
    "common.close": "Close",
    "common.locked": "Locked",
    "common.you": "You",
    "common.vs": "VS",
    "common.viewAll": "View all",

    // tabs
    "tab.home": "Home",
    "tab.floor": "Floor",
    "tab.equipment": "Gear",
    "tab.reports": "Reports",

    // state banner
    "state.free.title": "Ready to climb",
    "state.free.hint": "Defeat nodes to loot gear and unlock higher floors.",
    "state.garrisoning.title": "Garrisoning {nodeName}",
    "state.garrisoning.hint": "Rewards are accumulating. Leave to climb higher.",
    "state.inBattle.title": "Battle in progress",
    "state.inBattle.hint": "Results will appear shortly.",
    "state.blocked.title": "One character, one position",
    "state.blocked.hint": "Leave {nodeName} before challenging another node.",

    // home
    "home.greeting": "Welcome back, {name}",
    "home.combatPower": "Combat Power",
    "home.highestUnlocked": "Highest floor unlocked",
    "home.floorOf": "{floor} of {max}",
    "home.cta.fightMajor": "Fight the Floor Boss",
    "home.cta.continueClimbing": "Continue Climbing",
    "home.cta.farmFloor": "Farm Floor {floor}",
    "home.cta.claimRewards": "Claim Rewards ({amount})",
    "home.cta.viewGarrison": "View Garrison",
    "home.cta.leaveNode": "Leave Node",
    "home.quick.equipment": "Equipment",
    "home.quick.reports": "Reports",
    "home.quick.garrison": "Garrison",
    "home.quick.ranks": "Ranks",
    "home.activity.title": "Recent activity",
    "home.activity.empty": "No activity yet.",
    "home.activity.lootRare": "Looted Rare {gearName}",
    "home.activity.defeatedNpc": "Defeated {npcName}",
    "home.activity.unlockedFloor": "Unlocked Floor {floor}",
    "home.activity.defenseSuccess": "Defended against {player}",
    "home.activity.nodeLost": "Lost {nodeName} to {player}",
    "home.notif.newReports": "{count} new battle report",
    "home.notif.newReports_plural": "{count} new battle reports",

    // tower / floor
    "tower.title": "Tower of Ash",
    "floor.title": "Floor {floor}",
    "floor.subtitle": "{name}",
    "floor.rule": "Rule",
    "floor.major": "Major",
    "floor.medium": "Medium",
    "floor.small": "Small",
    "floor.unlocksNext": "Defeating this unlocks Floor {next}",
    "floor.cleared": "Cleared",
    "floor.switcher.locked": "Floor {floor} · Locked",
    "floor.switcher.unlock": "Unlock by clearing Floor {prev}",

    // floor names (mock content)
    "floor.f1.name": "Outer Vault",
    "floor.f1.rule": "Bandits drop +20% gold",
    "floor.f2.name": "Crypt Gate",
    "floor.f2.rule": "Undead deal +10% damage",
    "floor.f3.name": "Hollow Spire",
    "floor.f3.rule": "Casters gain +15% crit",
    "floor.f4.name": "Ashen Reach",
    "floor.f4.rule": "Fire damage doubled",
    "floor.f5.name": "Abyssal Crown",
    "floor.f5.rule": "All foes +25% power",

    // node type
    "node.type.small": "Small Node",
    "node.type.medium": "Medium Node",
    "node.type.major": "Major Node",
    "node.type.small.short": "Small",
    "node.type.medium.short": "Medium",
    "node.type.major.short": "Major",

    // node state
    "node.state.npcControlled": "NPC Controlled",
    "node.state.available": "Available",
    "node.state.playerOccupied": "Held by {player}",
    "node.state.occupiedByMe": "Occupied by you",
    "node.state.protected": "Protected · {time}",
    "node.state.locked": "Locked",
    "node.state.cleared": "Cleared",

    // node actions
    "node.action.challengeNpc": "Challenge",
    "node.action.challengePlayer": "Challenge {player}",
    "node.action.challengePlayer.short": "Challenge",
    "node.action.occupy": "Occupy Node",
    "node.action.viewGarrison": "View Garrison",
    "node.action.claimRewards": "Claim ({amount})",
    "node.action.leave": "Leave Node",

    // node names (mock content)
    "node.f2.lichWarden.name": "Lich Warden",
    "node.f2.crystalVault.name": "Crystal Vault",
    "node.f2.boneReliquary.name": "Bone Reliquary",
    "node.f2.barrowMaw.name": "Barrow Maw",
    "node.f2.gravePyre.name": "Grave Pyre",
    "node.f2.silentLamp.name": "Silent Lamp",
    "node.f2.cracklingFont.name": "Crackling Font",

    // node detail
    "nodeDetail.recommendedCP": "Recommended CP",
    "nodeDetail.yourCP": "Your CP",
    "nodeDetail.winChance": "Win chance",
    "nodeDetail.rewards": "Rewards",
    "nodeDetail.rewardCap": "Reward cap",
    "nodeDetail.cost": "Cost",
    "nodeDetail.defender": "Defender",
    "nodeDetail.defenderGarrisoned": "Garrisoned for {time}",
    "nodeDetail.defenderDefenses": "Defended {count} attacks",
    "nodeDetail.captureReward": "Capture reward",
    "nodeDetail.protectionEnds": "Protection ends in {time}",
    "nodeDetail.tip.unlocksNext": "Defeating this unlocks Floor {next}",
    "nodeDetail.dailyFree": "{used} / {max} free attempts used today",
    "nodeDetail.ticketCost": "1 Challenge Ticket",
    "nodeDetail.blockedTitle": "You're garrisoning {nodeName}",
    "nodeDetail.blockedHint": "Leave it before you can challenge another node.",
    "nodeDetail.gotoGarrison": "Go to Garrison",
    "nodeDetail.protectedTitle": "Under protection",
    "nodeDetail.protectedHint": "This node can be challenged in {time}.",

    // win chance buckets
    "winChance.low": "Low",
    "winChance.fair": "Fair",
    "winChance.high": "High",

    // garrison
    "garrison.title": "Garrison",
    "garrison.duration": "Garrisoned for {time}",
    "garrison.capIn": "Reward cap in {time}",
    "garrison.capFull": "Reward cap reached",
    "garrison.accumulated": "Accumulated rewards",
    "garrison.defenses": "Defended {count} attacks",
    "garrison.reminder": "Your character is guarding this node. Leave to climb higher floors.",

    // resources
    "res.gold": "Gold",
    "res.stones": "Upgrade Stones",
    "res.fragments": "Gear Fragments",
    "res.tickets": "Challenge Tickets",
    "res.gear": "Gear",

    // rarity
    "rarity.common": "Common",
    "rarity.rare": "Rare",
    "rarity.epic": "Epic",
    "rarity.legendary": "Legendary",

    // time
    "time.h_m": "{h}h {m}m",
    "time.m_s": "{m}m {s}s",
    "time.m": "{m}m",
    "time.justNow": "just now",
    "time.minAgo": "{n}m ago",
    "time.hourAgo": "{n}h ago",

    // errors / blocked
    "blocked.byGarrison": "Leave {nodeName} to challenge other nodes.",
    "blocked.inBattle": "Battle in progress.",
    "blocked.dailyLimit": "Daily free attempts used.",
    "blocked.lowTickets": "Not enough Challenge Tickets.",
  },
};

// Variable interpolation: {key} → value. No MessageFormat plurals in MVP.
function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] === undefined ? `{${k}}` : String(vars[k])
  );
}

function t(key, vars, locale = "en") {
  const dict = DICTS[locale] || DICTS.en;
  const raw = dict[key] ?? DICTS.en[key] ?? key;
  return interpolate(raw, vars);
}

function LocaleText({ k, vars, locale, as: Tag = "span", ...rest }) {
  return <Tag {...rest}>{t(k, vars, locale)}</Tag>;
}

Object.assign(window, { TowerI18n: { t, LocaleText, DICTS } });
