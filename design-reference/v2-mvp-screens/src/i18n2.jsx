// i18n augmentation for the MVP screens. Adds new EN keys and a parallel
// Simplified Chinese (zh) dictionary so the Settings language switch is real.
// Mutates the existing window.TowerI18n.DICTS in place.

const _D = window.TowerI18n.DICTS;

// ---- new English keys ----
Object.assign(_D.en, {
  // slots
  "slot.weapon": "Weapon", "slot.helmet": "Helmet", "slot.armor": "Armor",
  "slot.ring": "Ring", "slot.necklace": "Necklace", "slot.boots": "Boots",
  // stats
  "stat.atk": "ATK", "stat.def": "DEF", "stat.hp": "HP", "stat.crit": "CRIT", "stat.spd": "SPD",

  // ===== Battle result =====
  "result.victory": "Victory", "result.defeat": "Defeat",
  "result.subtitle.npc": "You cleared {name}",
  "result.subtitle.player": "You defeated {name}",
  "result.subtitle.defeat": "{name} held the node",
  "result.upset": "Upset win — lower CP!",
  "result.nodeUnlocked": "Node unlocked — you can occupy it",
  "result.cpComparison": "Combat power",
  "result.you": "You", "result.enemy": "Enemy",
  "result.summary": "Battle summary",
  "result.rounds": "Rounds", "result.dmgDealt": "Damage dealt",
  "result.dmgTaken": "Damage taken", "result.hpLeft": "HP remaining",
  "result.rewards": "Rewards gained", "result.noRewards": "No rewards — attack failed",
  "result.gearDrop": "New gear dropped", "result.noGearDrop": "No gear dropped this time",
  "result.betterBy": "+{n} CP vs equipped", "result.notBetter": "Lower than equipped",
  "result.action.occupy": "Occupy Node", "result.action.return": "Return to Floor",
  "result.action.equip": "Equip New Gear", "result.action.viewGear": "View in Equipment",
  "result.action.retry": "Try Again", "result.action.viewGarrison": "View Garrison",

  // ===== Battle resolve / replay =====
  "resolve.title": "Resolving Battle", "resolve.resolving": "Resolving…",
  "resolve.round": "Round {n}", "resolve.skip": "Skip",
  "resolve.speed": "Speed", "resolve.viewResult": "View Result",
  "resolve.log.open": "Battle begins.",
  "resolve.log.enemyHit": "Enemy strikes for {dmg}.",
  "resolve.log.crit": "Critical hit! {dmg} damage.",
  "resolve.log.skill": "Warden's Maul — {dmg} damage.",
  "resolve.log.finish": "Enemy defeated!",

  // ===== Equipment =====
  "equip.title": "Equipment", "equip.totalCP": "Total Combat Power",
  "equip.equipped": "Equipped", "equip.backpack": "Backpack",
  "equip.autoEquip": "Auto-Equip Best", "equip.equip": "Equip",
  "equip.equippedBadge": "Equipped", "equip.new": "New",
  "equip.compare": "Compare", "equip.comparing": "Comparing",
  "equip.replaces": "Replaces {name}", "equip.cpDelta": "CP change",
  "equip.tapHint": "Tap a backpack item to compare & equip",
  "equip.emptyBackpack.title": "Backpack empty",
  "equip.emptyBackpack.body": "Defeat nodes to loot new gear. Drops appear here.",
  "equip.slotEmpty": "Empty",

  // ===== Reports =====
  "reports.title": "Reports", "reports.markAll": "Mark all read",
  "reports.filter.all": "All", "reports.filter.attack": "Attacks", "reports.filter.defense": "Defenses",
  "reports.empty.title": "No reports yet",
  "reports.empty.body": "Attacks on your garrison and your raids will show up here.",
  "report.attackWin.title": "Raid won", "report.attackWin.sub": "You took {node} from {name}",
  "report.attackLoss.title": "Raid failed", "report.attackLoss.sub": "{name} held {node}",
  "report.defenseWin.title": "Defense held", "report.defenseWin.sub": "Repelled {name} at {node}",
  "report.nodeLost.title": "Node lost", "report.nodeLost.sub": "{name} captured {node}",
  "report.viewReplay": "View",

  // ===== Garrison (page) =====
  "garrison.pageTitle": "Garrison",
  "garrison.currentNode": "Current garrison",
  "garrison.state.holding": "Holding node",
  "garrison.rewardCapProgress": "Reward cap",
  "garrison.capFullNote": "Cap reached — claim to keep earning",
  "garrison.capNearNote": "Almost full — claim soon",
  "garrison.noRewardsYet": "No rewards yet — they accrue over time",
  "garrison.claim": "Claim Rewards ({amount})", "garrison.claimEmpty": "Nothing to claim yet",
  "garrison.leave": "Leave Garrison",
  "garrison.leaveWarning": "Leaving frees your character to climb again — the node returns to NPC control.",
  "garrison.defenseRecord": "Defense record",
  "garrison.defenseLog": "Defense log",
  "garrison.record": "{wins}W · {losses}L",
  "garrison.emptyLog.title": "No attacks yet",
  "garrison.emptyLog.body": "When players raid this node, the outcome shows here.",
  "garrison.log.win": "Defended against {name}",
  "garrison.log.loss": "Lost to {name}",
  "garrison.lost.title": "Node lost", "garrison.lost.body": "{name} defeated your garrison. Your character is free again.",
  "garrison.leaveConfirm.title": "Leave this node?",
  "garrison.leaveConfirm.body": "Unclaimed rewards are lost and the node returns to NPC control. Your character can climb again.",
  "garrison.leaveConfirm.confirm": "Leave & free character",

  // ===== Settings =====
  "settings.title": "Settings",
  "settings.section.preferences": "Preferences",
  "settings.section.account": "Account",
  "settings.section.about": "About",
  "settings.language": "Language", "settings.audio": "Audio",
  "settings.sfx": "Sound effects", "settings.music": "Music",
  "settings.battleSpeed": "Battle speed",
  "settings.speed.normal": "1×", "settings.speed.fast": "2×", "settings.speed.instant": "Skip",
  "settings.notifications": "Battle notifications",
  "settings.account": "Player", "settings.playerId": "Player ID",
  "settings.privacy": "Privacy policy", "settings.support": "Support",
  "settings.version": "Version", "settings.logout": "Sign out",
  "settings.langName.en": "English", "settings.langName.zh": "简体中文",
});

// ---- Simplified Chinese ----
_D.zh = {
  // common / nav
  "common.cancel": "取消", "common.confirm": "确认", "common.back": "返回",
  "common.close": "关闭", "common.you": "你", "common.viewAll": "查看全部",
  "tab.home": "主页", "tab.floor": "层", "tab.equipment": "装备", "tab.reports": "战报",

  // slots / stats
  "slot.weapon": "武器", "slot.helmet": "头盔", "slot.armor": "护甲",
  "slot.ring": "戒指", "slot.necklace": "项链", "slot.boots": "战靴",
  "stat.atk": "攻击", "stat.def": "防御", "stat.hp": "生命", "stat.crit": "暴击", "stat.spd": "速度",

  // rarity
  "rarity.common": "普通", "rarity.rare": "稀有", "rarity.epic": "史诗", "rarity.legendary": "传说",

  // resources
  "res.gold": "金币", "res.stones": "强化石", "res.fragments": "装备碎片", "res.tickets": "挑战券", "res.gear": "装备",

  // node names
  "node.f2.lichWarden.name": "巫妖守卫", "node.f2.crystalVault.name": "水晶宝库",
  "node.f2.boneReliquary.name": "白骨圣龛", "node.f2.silentLamp.name": "寂静之灯",

  // node type
  "node.type.medium": "中型据点", "node.type.major": "大型据点", "node.type.small": "小型据点",
  "floor.title": "第 {floor} 层",

  // battle result
  "result.victory": "胜利", "result.defeat": "战败",
  "result.subtitle.npc": "你攻占了 {name}",
  "result.subtitle.player": "你击败了 {name}",
  "result.subtitle.defeat": "{name} 守住了据点",
  "result.upset": "以弱胜强 — 战力更低！",
  "result.nodeUnlocked": "据点已解锁 — 可以占领",
  "result.cpComparison": "战斗力", "result.you": "你方", "result.enemy": "敌方",
  "result.summary": "战斗概要", "result.rounds": "回合数",
  "result.dmgDealt": "造成伤害", "result.dmgTaken": "受到伤害", "result.hpLeft": "剩余生命",
  "result.rewards": "获得奖励", "result.noRewards": "无奖励 — 进攻失败",
  "result.gearDrop": "掉落新装备", "result.noGearDrop": "本次未掉落装备",
  "result.betterBy": "战力 +{n}（对比已装备）", "result.notBetter": "低于已装备",
  "result.action.occupy": "占领据点", "result.action.return": "返回楼层",
  "result.action.equip": "装备新装备", "result.action.viewGear": "在装备中查看",
  "result.action.retry": "再次挑战", "result.action.viewGarrison": "查看驻守",

  // resolve
  "resolve.title": "战斗结算中", "resolve.resolving": "结算中…",
  "resolve.round": "第 {n} 回合", "resolve.skip": "跳过",
  "resolve.speed": "速度", "resolve.viewResult": "查看结果",
  "resolve.log.open": "战斗开始。",
  "resolve.log.enemyHit": "敌方造成 {dmg} 点伤害。",
  "resolve.log.crit": "暴击！造成 {dmg} 点伤害。",
  "resolve.log.skill": "守卫之锤 — {dmg} 点伤害。",
  "resolve.log.finish": "敌方被击败！",

  // equipment
  "equip.title": "装备", "equip.totalCP": "总战斗力",
  "equip.equipped": "已装备", "equip.backpack": "背包",
  "equip.autoEquip": "一键装备最佳", "equip.equip": "装备",
  "equip.equippedBadge": "已装备", "equip.new": "新",
  "equip.compare": "对比", "equip.comparing": "对比中",
  "equip.replaces": "替换 {name}", "equip.cpDelta": "战力变化",
  "equip.tapHint": "点击背包装备进行对比和更换",
  "equip.emptyBackpack.title": "背包为空",
  "equip.emptyBackpack.body": "击败据点掉落新装备，掉落会出现在这里。",
  "equip.slotEmpty": "空",

  // reports
  "reports.title": "战报", "reports.markAll": "全部已读",
  "reports.filter.all": "全部", "reports.filter.attack": "进攻", "reports.filter.defense": "防守",
  "reports.empty.title": "暂无战报",
  "reports.empty.body": "对你驻守据点的进攻和你的突袭都会显示在这里。",
  "report.attackWin.title": "突袭成功", "report.attackWin.sub": "你从 {name} 手中夺取了 {node}",
  "report.attackLoss.title": "突袭失败", "report.attackLoss.sub": "{name} 守住了 {node}",
  "report.defenseWin.title": "防守成功", "report.defenseWin.sub": "在 {node} 击退了 {name}",
  "report.nodeLost.title": "据点失守", "report.nodeLost.sub": "{name} 占领了 {node}",
  "report.viewReplay": "查看",

  // garrison
  "garrison.pageTitle": "驻守", "garrison.title": "驻守",
  "garrison.currentNode": "当前驻守",
  "garrison.duration": "已驻守 {time}",
  "garrison.state.holding": "据点驻守中",
  "garrison.accumulated": "累计奖励",
  "garrison.rewardCapProgress": "奖励上限",
  "garrison.capIn": "{time} 后达到上限",
  "garrison.capFull": "已达到奖励上限",
  "garrison.capFullNote": "已达上限 — 领取后继续累积",
  "garrison.capNearNote": "即将达到上限 — 请尽快领取",
  "garrison.noRewardsYet": "暂无奖励 — 奖励会随时间累积",
  "garrison.claim": "领取奖励（{amount}）", "garrison.claimEmpty": "暂无可领取奖励",
  "garrison.leave": "放弃驻守",
  "garrison.leaveWarning": "放弃后角色可重新攀登，据点将恢复为 NPC 控制。",
  "garrison.defenseRecord": "防守记录", "garrison.defenseLog": "防守日志",
  "garrison.defenses": "防守 {count} 次进攻",
  "garrison.record": "{wins}胜 · {losses}负",
  "garrison.emptyLog.title": "暂无进攻",
  "garrison.emptyLog.body": "当有玩家突袭此据点时，结果会显示在这里。",
  "garrison.log.win": "击退了 {name}",
  "garrison.log.loss": "败给了 {name}",
  "garrison.lost.title": "据点失守", "garrison.lost.body": "{name} 击败了你的驻守，你的角色已重获自由。",
  "garrison.leaveConfirm.title": "放弃此据点？",
  "garrison.leaveConfirm.body": "未领取的奖励将丢失，据点将恢复为 NPC 控制。你的角色可重新攀登。",
  "garrison.leaveConfirm.confirm": "放弃并释放角色",
  "garrison.reminder": "你的角色正在驻守此据点。放弃后可攀登更高楼层。",

  // settings
  "settings.title": "设置",
  "settings.section.preferences": "偏好设置",
  "settings.section.account": "账号",
  "settings.section.about": "关于",
  "settings.language": "语言", "settings.audio": "音频",
  "settings.sfx": "音效", "settings.music": "音乐",
  "settings.battleSpeed": "战斗速度",
  "settings.speed.normal": "1×", "settings.speed.fast": "2×", "settings.speed.instant": "跳过",
  "settings.notifications": "战斗通知",
  "settings.account": "玩家", "settings.playerId": "玩家 ID",
  "settings.privacy": "隐私政策", "settings.support": "客服支持",
  "settings.version": "版本", "settings.logout": "退出登录",
  "settings.langName.en": "English", "settings.langName.zh": "简体中文",
};
