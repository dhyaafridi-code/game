/* =====================================================================
   SECTION 1: Data definitions
   ===================================================================== */
// الشخصيات الجديدة — كل طائرة تحمل "ability" (معرّف ميكانيك القدرة) بدل اعتمادها على رقمها،
// حتى تستطيع تغيير الصور أو الترتيب لاحقًا دون كسر القدرات.
const CHARACTERS = [
    { name: "آدم نخمة",         file: "assets/images/adem.png",   price: 0,   perk: "🔥 أثر صاروخ ناري",  rarity: "common" },
    { name: "نينو الطائر", file: "assets/images/nino.png",    price: 10,  perk: "🧲 مغناطيس عملات",  rarity: "common" },
    { name: "هواري الكفات",       file: "assets/images/lkefat.png",  price: 25,  perk: "🛡️ درع حماية واحد",  rarity: "rare" },
    { name: "رابيع بانا",        file: "assets/images/rabi3.png",   price: 60,  perk: "⭐ مضاعفة العملات x2",  rarity: "epic" },
    { name: "العربي الديكتاتوري",      file: "assets/images/l3arbi.png",  price: 100, perk: "⏳ إبطاء الزمن عند الخطر",  rarity: "legendary" },
    { name: "صبري الدجال",     file: "assets/images/صبري الدجال.png",     price: 40,  perk: "🛡️ درع حماية واحد",  rarity: "rare" },
    { name: "حرشي الدارك ويب", file: "assets/images/حرشي الدارك ويب.png", price: 55,  perk: "🔥 أثر صاروخ ناري",  rarity: "rare" },
    { name: "تشوناس المغوار ",     file: "assets/images/يونس المغوار.png",     price: 95,  perk: "🧲 مغناطيس عملات",  rarity: "epic" },
    { name: "فاطمة الحفري",     file: "assets/images/فاطمة الحفري.png",     price: 90,  perk: "🛡️ درع حماية واحد",  rarity: "rare" },
    { name: "داداش السوكارجي",  file: "assets/images/داداش السوكارجي.png",  price: 175, perk: "⭐ مضاعفة العملات x2",  rarity: "legendary" }
];
// هل الطائرة المجهزة تملك قدرة معينة؟ (تُستدعى وقت التشغيل لا وقت التحميل)
function hasPerk(id) {
    var c = CHARACTERS[selectedIndex]; if (!c) return false;
    if (c.ability) return c.ability === id;
    // احتياطي: استنتاج القدرة من رمز الـ perk إذا حُذف حقل ability
    var pk = c.perk || "";
    var ab = pk.indexOf("🔥") >= 0 ? "rocket" : pk.indexOf("🧲") >= 0 ? "magnet"
        : pk.indexOf("🛡") >= 0 ? "shield" : pk.indexOf("⭐") >= 0 ? "doubleCoins"
        : pk.indexOf("⏳") >= 0 ? "slowTime" : "";
    return ab === id;
}
const MUSIC_TRACKS = [
    { name: "el santi", file: "assets/audio/el santi.mp3" },
    { name: "bilal sghir", file: "assets/audio/music_track2.mp3" },
    { name: "la alo la msg", file: "assets/audio/La Alo La Messge.mp3" },
    { name: "ana n3chaq ana ntlaq", file: "assets/audio/ana n3chaq ana ntla9.mp3" },
    { name: "lubna story", file: "assets/audio/music_track3.mp3" }
];
const RARITY = { common: { n: "Common", i: "🟢" }, rare: { n: "Rare", i: "🔵" }, epic: { n: "Epic", i: "🟣" }, legendary: { n: "Legendary", i: "🟡" } };

// Skins (تغيّر مظهر/توهج الطائرة فقط)
const SKINS = [
    { id: "default", name: "Classic", icon: "✈️", price: 0, rarity: "common", desc: "التوهج الأزرق الأصلي", glow: "rgba(56,189,248,0.7)" },
    { id: "fire", name: "Fire", icon: "🔥", price: 30, rarity: "rare", desc: "لهب برتقالي", glow: "rgba(249,115,22,0.95)" },
    { id: "lightning", name: "Lightning", icon: "⚡", price: 45, rarity: "rare", desc: "صواعق كهربائية", glow: "rgba(250,204,21,0.95)" },
    { id: "neon", name: "Neon", icon: "🌈", price: 60, rarity: "epic", desc: "ألوان نيون متغيرة", glow: "rgba(236,72,153,0.9)" },
    { id: "galaxy", name: "Galaxy", icon: "🌌", price: 80, rarity: "epic", desc: "نجوم تدور حولها", glow: "rgba(167,139,250,0.95)" },
    { id: "ghost", name: "Ghost", icon: "👻", price: 90, rarity: "epic", desc: "شبح شفاف", glow: "rgba(226,232,240,0.9)" },
    { id: "diamond", name: "Diamond", icon: "💎", price: 150, rarity: "legendary", desc: "لمعان الماس", glow: "rgba(165,243,252,1)" }
];
// Trails
const TRAILS = [
    { id: "none", name: "None", icon: "➖", price: 0, rarity: "common", desc: "بدون أثر" },
    { id: "fire", name: "Fire", icon: "🔥", price: 20, rarity: "common", desc: "أثر ناري" },
    { id: "ice", name: "Ice", icon: "❄️", price: 25, rarity: "common", desc: "أثر جليدي" },
    { id: "electric", name: "Electric", icon: "⚡", price: 30, rarity: "rare", desc: "شرارات كهربائية" },
    { id: "neon", name: "Neon", icon: "💜", price: 40, rarity: "rare", desc: "أثر بنفسجي نيون" },
    { id: "rainbow", name: "Rainbow", icon: "🌈", price: 50, rarity: "epic", desc: "قوس قزح" },
    { id: "galaxy", name: "Galaxy", icon: "🌌", price: 70, rarity: "epic", desc: "غبار نجوم" }
];

// أوضاع اللعب
const MODES = {
    classic:   { id: "classic",   name: "Classic",   icon: "✈️", desc: "الوضع الأصلي المتوازن", diff: 2, speed: 1.0,  gap: 1.0,  reward: 1.0, color: "#38bdf8", boss: true,  bossFirst: 25, bossGap: 1.0, puRate: 1.0, evGap: 1.0 },
    rush:      { id: "rush",      name: "Rush",      icon: "🔥", desc: "سرعة أكبر ومكافآت أعلى", diff: 3, speed: 1.35, gap: 1.0,  reward: 1.4, color: "#fb923c", boss: true,  bossFirst: 25, bossGap: 1.0, puRate: 1.0, evGap: 0.8 },
    hardcore:  { id: "hardcore",  name: "Hardcore",  icon: "💀", desc: "فجوات أصغر وأخطاء أصعب", diff: 4, speed: 1.1,  gap: 0.82, reward: 1.8, color: "#f87171", boss: true,  bossFirst: 22, bossGap: 0.9, puRate: 0.7, evGap: 1.0 },
    zen:       { id: "zen",       name: "Zen",       icon: "🧘", desc: "هادئ ومناسب للتدريب", diff: 1, speed: 0.8,  gap: 1.2,  reward: 0.5, color: "#4ade80", boss: false, bossFirst: 0,  bossGap: 1.0, puRate: 1.2, evGap: 1.5 },
    nightmare: { id: "nightmare", name: "Nightmare", icon: "☠️", desc: "أصعب وضع — مكافآت ضخمة", diff: 5, speed: 1.3,  gap: 0.75, reward: 3.0, color: "#c084fc", boss: true,  bossFirst: 18, bossGap: 0.75, puRate: 0.6, evGap: 0.7 },
    rccf:      { id: "rccf",      name: "RCCF",      icon: "🎯", desc: "هدف سريع — سرعة عالية لكن الفجوات واسعة", diff: 3, speed: 1.35, gap: 1.4, reward: 1.6, color: "#06b6d4", boss: true,  bossFirst: 30, bossGap: 1.5, puRate: 1.0, evGap: 1.0 }
};
// المدن / العوالم
const CITIES = {
    ny:    { id: "ny",    name: "New York", icon: "🗽", desc: "الخريطة الأصلية — سماء ليلية متوهجة", speed: 1.0,  reward: 1.0,  sky: ["#02040a", "#090d19", "#431407", "#9a3412"], bld: "#0f172a", edge: "rgba(56,189,248,0.4)", win: "#fef08a", win2: null, far: "#0a1222", weights: { clear: 3, rain: 2, snow: 1, fog: 1, storm: 1 } },
    dubai: { id: "dubai", name: "Dubai",    icon: "🌆", desc: "ألوان ذهبية وسماء غروب — أسرع قليلاً", speed: 1.12, reward: 1.15, sky: ["#1a0f2e", "#6b2d12", "#ea580c", "#fbbf24"], bld: "#2b1708", edge: "rgba(251,191,36,0.6)", win: "#fff7ed", win2: null, far: "#3a1c0a", weights: { clear: 5, fog: 1, rain: 0, snow: 0, storm: 0 } },
    tokyo: { id: "tokyo", name: "Tokyo",    icon: "🌃", desc: "Neon / Cyberpunk — مكافآت أعلى", speed: 1.06, reward: 1.25, sky: ["#05010f", "#1e0a3c", "#4a0e5c", "#be185d"], bld: "#0b0a1e", edge: "rgba(236,72,153,0.75)", win: "#22d3ee", win2: "#f472b6", far: "#150a2e", weights: { clear: 2, rain: 3, fog: 1, storm: 1, snow: 0 } },
    paris: { id: "paris", name: "Paris",    icon: "🗼", desc: "ليل سينمائي هادئ وأبطأ قليلاً", speed: 0.95, reward: 1.1,  sky: ["#020617", "#0b1330", "#1e1b4b", "#3b2f6b"], bld: "#111827", edge: "rgba(148,163,184,0.45)", win: "#fde68a", win2: null, far: "#0d1226", weights: { clear: 2, fog: 3, rain: 2, snow: 1, storm: 0 } }
};
const WEATHER_INFO = { clear: "🌙 Clear Night", rain: "🌧️ Rain", snow: "❄️ Snow", fog: "🌫️ Fog", storm: "⛈️ Storm" };

// Power-ups
const POWERUPS = {
    shield: { icon: "🛡️", color: "#4ade80", dur: 0,   name: "Shield" },
    magnet: { icon: "🧲", color: "#38bdf8", dur: 480, name: "Magnet" },
    turbo:  { icon: "🚀", color: "#fb923c", dur: 300, name: "Turbo" },
    freeze: { icon: "❄️", color: "#93c5fd", dur: 360, name: "Freeze" },
    multi:  { icon: "💎", color: "#c084fc", dur: 480, name: "x3 Coins" },
    life:   { icon: "❤️", color: "#f87171", dur: 0,   name: "Second Life" }
};
const PU_WEIGHTS = [["shield", 3], ["magnet", 3], ["turbo", 2], ["freeze", 2], ["multi", 2], ["life", 1]];

// Bosses
const BOSSES = [
    { type: "heli", icon: "🚁", name: "POLICE HELICOPTER", w: 74, h: 34 },
    { type: "ufo",  icon: "🛸", name: "UFO",               w: 66, h: 30 },
    { type: "jet",  icon: "✈️", name: "FIGHTER JET",       w: 84, h: 24 }
];
const BOSS_WARN = 170;
// Random Events
const EVENTS = {
    coinRain:    { icon: "🌟", name: "COIN RAIN",         dur: 360, color: "#fbbf24" },
    speedStorm:  { icon: "⚡", name: "SPEED STORM",       dur: 300, color: "#38bdf8" },
    goldRush:    { icon: "💰", name: "GOLDEN COIN RUSH",  dur: 480, color: "#facc15" },
    blackout:    { icon: "🌑", name: "BLACKOUT",          dur: 280, color: "#94a3b8" },
    police:      { icon: "🚨", name: "POLICE CHASE",      dur: 420, color: "#f87171" },
    celebration: { icon: "🎆", name: "CITY CELEBRATION",  dur: 360, color: "#f472b6" }
};
const COMBO_REWARDS = { 2: { c: 0, xp: 3 }, 5: { c: 2, xp: 8 }, 10: { c: 5, xp: 15 }, 20: { c: 10, xp: 30 }, 30: { c: 15, xp: 45 }, 50: { c: 30, xp: 80 } };

// Daily missions pool (kind: max = أعلى قيمة في الرحلة | add = تراكمي خلال اليوم)
const MISSION_POOL = [
    { id: "score30", icon: "🎯", desc: "سجل 30 نقطة في رحلة واحدة", kind: "score", target: 30, reward: 15, xp: 30 },
    { id: "score60", icon: "🚀", desc: "سجل 60 نقطة", kind: "score", target: 60, reward: 35, xp: 60 },
    { id: "coins15", icon: "🪙", desc: "اجمع 15 عملة", kind: "coins", target: 15, reward: 10, xp: 20 },
    { id: "coins30", icon: "💰", desc: "اجمع 30 عملة", kind: "coins", target: 30, reward: 22, xp: 40 },
    { id: "time45",  icon: "⏱️", desc: "ابقَ في الجو 45 ثانية", kind: "time", target: 45, reward: 15, xp: 30 },
    { id: "combo8",  icon: "🔥", desc: "حقق Combo x8", kind: "combo", target: 8, reward: 20, xp: 40 },
    { id: "power3",  icon: "⚡", desc: "التقط 3 Power-ups", kind: "power", target: 3, reward: 15, xp: 30 },
    { id: "flights3", icon: "✈️", desc: "أكمل 3 رحلات", kind: "flights", target: 3, reward: 12, xp: 25 },
    { id: "boss1",   icon: "🚨", desc: "تجاوز Boss واحد", kind: "boss", target: 1, reward: 30, xp: 50 }
];
const MISSION_ADD_KINDS = { coins: 1, power: 1, flights: 1, boss: 1 };

