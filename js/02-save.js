/* =====================================================================
   SECTION 2: Save system (localStorage) + safe migration
   ===================================================================== */
const SAVE_VERSION = 2;
let playerName = lsGetRaw("boeingPlayerName", "") || "";
let totalCoins = Math.max(0, parseInt(lsGetRaw("boeingCoins", "0"), 10) || 0);
let highScore = Math.max(0, parseInt(lsGetRaw("boeingHighScore", "0"), 10) || 0);
let unlockedChars = lsGet("boeingUnlocked", null);
let selectedIndex = 0;                 // الطائرة المجهزة
let playerXP = 0, playerLevel = 1;
let achievements = {};
let missionsData = { date: "", list: [] };
let skinsData = { owned: ["default"], selected: "default" };
let trailsData = { owned: ["none"], selected: "none" };
let currentModeId = "classic", currentMapId = "ny";
let settings = { music: 0.4, sfx: 0.7, weather: true, particles: true, shake: true, quality: "high", display: "auto" };
let stats = { flights: 0, bestCombo: 0, coinsEarned: 0, totalTime: 0, bestDistance: 0, bosses: 0, powerups: 0, citiesPlayed: {}, modeCounts: {} };
let currentMusicIdx = 0;

function migrateAndLoad() {
    // --- الأصلي: الطائرات المفتوحة ---
    if (!Array.isArray(unlockedChars)) unlockedChars = [];
    unlockedChars = unlockedChars.map(function (v) { return !!v; });
    while (unlockedChars.length < CHARACTERS.length) unlockedChars.push(false);
    unlockedChars[0] = true;
    const last = parseInt(lsGetRaw("boeingLastChar", "0"), 10);
    selectedIndex = (!isNaN(last) && last >= 0 && last < CHARACTERS.length && unlockedChars[last]) ? last : 0;
    // --- الموسيقى ---
    const mi = parseInt(lsGetRaw("boeingMusicIdx", "0"), 10);
    currentMusicIdx = (!isNaN(mi) && mi >= 0 && mi < MUSIC_TRACKS.length) ? mi : 0;
    // --- جديد ---
    const ver = lsGet("boeingSaveVersion", 0);
    playerXP = Math.max(0, Number(lsGet("boeingXP", 0)) || 0);
    playerLevel = Math.max(1, parseInt(lsGet("boeingLevel", 1), 10) || 1);
    const ac = lsGet("boeingAchievements", {});
    achievements = (ac && typeof ac === "object" && !Array.isArray(ac)) ? ac : {};
    const ms = lsGet("boeingMissions", null);
    if (ms && typeof ms === "object" && Array.isArray(ms.list)) missionsData = ms;
    const sk = lsGet("boeingSkins", null);
    if (sk && Array.isArray(sk.owned)) skinsData = { owned: sk.owned, selected: sk.selected || "default" };
    if (skinsData.owned.indexOf("default") < 0) skinsData.owned.push("default");
    if (!SKINS.some(function (s) { return s.id === skinsData.selected; }) || skinsData.owned.indexOf(skinsData.selected) < 0) skinsData.selected = "default";
    const tr = lsGet("boeingTrails", null);
    if (tr && Array.isArray(tr.owned)) trailsData = { owned: tr.owned, selected: tr.selected || "none" };
    if (trailsData.owned.indexOf("none") < 0) trailsData.owned.push("none");
    if (!TRAILS.some(function (t) { return t.id === trailsData.selected; }) || trailsData.owned.indexOf(trailsData.selected) < 0) trailsData.selected = "none";
    const md = lsGet("boeingMode", "classic"); currentModeId = MODES[md] ? md : "classic";
    const mp = lsGet("boeingMap", "ny"); currentMapId = CITIES[mp] ? mp : "ny";
    const st = lsGet("boeingSettings", {});
    if (st && typeof st === "object") {
        if (typeof st.music === "number") settings.music = clamp(st.music, 0, 1);
        if (typeof st.sfx === "number") settings.sfx = clamp(st.sfx, 0, 1);
        if (typeof st.weather === "boolean") settings.weather = st.weather;
        if (typeof st.particles === "boolean") settings.particles = st.particles;
        if (typeof st.shake === "boolean") settings.shake = st.shake;
        if (st.quality === "low" || st.quality === "medium" || st.quality === "high") settings.quality = st.quality;
        if (st.display === "auto" || st.display === "pc" || st.display === "phone") settings.display = st.display;
    }
    const ss = lsGet("boeingStats", null);
    if (ss && typeof ss === "object") {
        ["flights", "bestCombo", "coinsEarned", "totalTime", "bestDistance", "bosses", "powerups"].forEach(function (k) { if (typeof ss[k] === "number") stats[k] = ss[k]; });
        if (ss.citiesPlayed && typeof ss.citiesPlayed === "object") stats.citiesPlayed = ss.citiesPlayed;
        if (ss.modeCounts && typeof ss.modeCounts === "object") stats.modeCounts = ss.modeCounts;
    } else if (ver < SAVE_VERSION) {
        stats.coinsEarned = totalCoins; // ترحيل: نبدأ الإجمالي من رصيد اللاعب القديم
    }
    if (ver < SAVE_VERSION) lsSet("boeingSaveVersion", SAVE_VERSION);
    saveAll();
}
function saveCoins() { lsSetRaw("boeingCoins", totalCoins); }
function saveProgress() { lsSet("boeingXP", playerXP); lsSet("boeingLevel", playerLevel); saveCoins(); }
function saveStats() { lsSet("boeingStats", stats); }
function saveSettings() { lsSet("boeingSettings", settings); }
function saveAll() {
    saveProgress(); saveStats(); saveSettings();
    lsSet("boeingUnlocked", unlockedChars); lsSetRaw("boeingLastChar", selectedIndex);
    lsSet("boeingAchievements", achievements); lsSet("boeingMissions", missionsData);
    lsSet("boeingSkins", skinsData); lsSet("boeingTrails", trailsData);
    lsSet("boeingMode", currentModeId); lsSet("boeingMap", currentMapId);
    lsSetRaw("boeingHighScore", highScore);
}

/* ---- نسخة احتياطية: تصدير/استيراد التقدّم (حماية من ضياع localStorage) ---- */
function collectSave() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf("boeing") === 0) data[k] = localStorage.getItem(k);
    }
    return { app: "boeing_nyc", version: SAVE_VERSION, exportedAt: new Date().toISOString(), data: data };
}
function exportSave() {
    try {
        const json = JSON.stringify(collectSave(), null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "boeing-nyc-save-" + new Date().toISOString().slice(0, 10) + ".json";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        if (typeof showNotification === "function") showNotification("⬇️ تم تصدير نسخة احتياطية");
    } catch (e) { if (typeof showNotification === "function") showNotification("❌ تعذّر التصدير"); }
}
function importSave() {
    try {
        const inp = document.createElement("input");
        inp.type = "file"; inp.accept = "application/json,.json";
        inp.onchange = function () {
            const file = inp.files && inp.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function () {
                try {
                    const parsed = JSON.parse(reader.result);
                    const data = parsed && parsed.data;
                    if (!data || typeof data !== "object" || Array.isArray(data)) { showNotification("❌ ملف غير صالح"); return; }
                    let n = 0;
                    Object.keys(data).forEach(function (k) {
                        if (k.indexOf("boeing") === 0) { localStorage.setItem(k, data[k]); n++; }
                    });
                    if (n === 0) { showNotification("❌ لا توجد بيانات صالحة في الملف"); return; }
                    showNotification("⬆️ تم الاستيراد بنجاح — إعادة التحميل...");
                    setTimeout(function () { location.reload(); }, 900);
                } catch (e) { showNotification("❌ ملف غير صالح"); }
            };
            reader.readAsText(file);
        };
        inp.click();
    } catch (e) { if (typeof showNotification === "function") showNotification("❌ تعذّر الاستيراد"); }
}

