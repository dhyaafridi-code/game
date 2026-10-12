/* =====================================================================
   SECTION 6: XP / Level, Achievements, Missions
   ===================================================================== */
function xpNeeded(l) { return 80 + (l - 1) * 45; }
function addXP(amount, inRun) {
    amount = Math.round(amount * (inRun ? rewardMult() : 1));
    if (amount <= 0) return;
    if (inRun) runXP += amount;
    playerXP += amount;
    let gained = 0, coinsGot = 0;
    while (playerXP >= xpNeeded(playerLevel)) {
        playerXP -= xpNeeded(playerLevel); playerLevel++; gained++;
        coinsGot += 10 + (playerLevel - 1) * 5;
    }
    if (gained > 0) {
        totalCoins += coinsGot;
        showLevelUp(playerLevel, coinsGot); sfx("levelup");
        saveProgress();
        checkAchievements();
    } else {
        lsSet("boeingXP", playerXP);
    }
}

const ACHIEVEMENTS = [
    { id: "first_flight", icon: "🏅", name: "First Flight", desc: "أكمل أول رحلة", reward: 10, test: function () { return stats.flights >= 1; } },
    { id: "p50", icon: "🎯", name: "50 Points", desc: "وصل إلى 50 نقطة", reward: 25, test: function () { return Math.max(highScore, score) >= 50; } },
    { id: "legend", icon: "💯", name: "Legend", desc: "وصل إلى 100 نقطة", reward: 80, test: function () { return Math.max(highScore, score) >= 100; } },
    { id: "rich", icon: "🪙", name: "Rich Pilot", desc: "اجمع 100 عملة إجمالاً", reward: 20, test: function () { return stats.coinsEarned >= 100; } },
    { id: "combo10", icon: "🔥", name: "Combo Master", desc: "حقق Combo x10", reward: 30, test: function () { return Math.max(stats.bestCombo, bestComboRun) >= 10; } },
    { id: "pro5", icon: "⭐", name: "Professional Pilot", desc: "وصل إلى Level 5", reward: 50, test: function () { return playerLevel >= 5; } },
    { id: "addicted", icon: "🏆", name: "Addicted Pilot", desc: "أكمل 10 رحلات", reward: 40, test: function () { return stats.flights >= 10; } },
    { id: "world", icon: "🌍", name: "World Traveler", desc: "العب في جميع المدن", reward: 60, test: function () { for (const k in CITIES) { if (!(stats.citiesPlayed[k] > 0)) return false; } return true; } },
    { id: "boss1", icon: "🚁", name: "Boss Dodger", desc: "تجاوز أول Boss", reward: 40, test: function () { return stats.bosses >= 1; } },
    { id: "power10", icon: "⚡", name: "Power Hungry", desc: "التقط 10 Power-ups", reward: 25, test: function () { return stats.powerups + runPowerups >= 10; } },
    { id: "hardcore", icon: "💀", name: "Hardcore Hero", desc: "20 نقطة في Hardcore", reward: 50, test: function () { return state === "playing" && currentModeId === "hardcore" && score >= 20; } },
    { id: "nightmare", icon: "☠️", name: "Nightmare Survivor", desc: "15 نقطة في Nightmare", reward: 90, test: function () { return state === "playing" && currentModeId === "nightmare" && score >= 15; } }
];
let inAchCheck = false, achRecheck = false;
function checkAchievements() {
    if (inAchCheck) { achRecheck = true; return; }
    inAchCheck = true;
    let again = true, guard = 0;
    while (again && guard++ < 5) {
        again = false; achRecheck = false;
        for (let i = 0; i < ACHIEVEMENTS.length; i++) {
            const a = ACHIEVEMENTS[i];
            if (achievements[a.id]) continue;
            let ok = false;
            try { ok = a.test(); } catch (e) { ok = false; }
            if (ok) {
                achievements[a.id] = Date.now();
                lsSet("boeingAchievements", achievements);
                totalCoins += a.reward; saveCoins();
                toast("🏅 Achievement: " + a.name + "  +" + a.reward + "🪙", "ach");
                sfx("achievement");
                addXP(15, false);
            }
        }
        if (achRecheck) again = true;
    }
    inAchCheck = false;
}

function todayKey() { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function seededRng(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    let a = h >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function missionDef(id) { for (let i = 0; i < MISSION_POOL.length; i++) if (MISSION_POOL[i].id === id) return MISSION_POOL[i]; return null; }
function ensureMissions() {
    const key = todayKey();
    const valid = missionsData && missionsData.date === key && Array.isArray(missionsData.list) && missionsData.list.length === 3 && missionsData.list.every(function (m) { return missionDef(m.id); });
    if (valid) return;
    const rng = seededRng("boeing-" + key);
    const pool = MISSION_POOL.slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    const chosen = [], kinds = {};
    for (let i = 0; i < pool.length && chosen.length < 3; i++) { if (!kinds[pool[i].kind]) { kinds[pool[i].kind] = 1; chosen.push({ id: pool[i].id, progress: 0, claimed: false }); } }
    missionsData = { date: key, list: chosen };
    lsSet("boeingMissions", missionsData);
}
function missionUpdate(kind, val) {
    let changed = false;
    for (let i = 0; i < missionsData.list.length; i++) {
        const m = missionsData.list[i], d = missionDef(m.id);
        if (!d || d.kind !== kind || m.progress >= d.target) continue;
        const before = m.progress;
        if (MISSION_ADD_KINDS[kind]) m.progress = Math.min(d.target, m.progress + val);
        else m.progress = Math.min(d.target, Math.max(m.progress, val));
        if (m.progress !== before) {
            changed = true;
            if (m.progress >= d.target) { toast("✅ مهمة مكتملة: " + d.desc, "mis"); sfx("mission"); }
        }
    }
    if (changed) lsSet("boeingMissions", missionsData);
}
function claimableMissions() { let n = 0; missionsData.list.forEach(function (m) { const d = missionDef(m.id); if (d && m.progress >= d.target && !m.claimed) n++; }); return n; }
function claimMission(i) {
    const m = missionsData.list[i]; if (!m) return;
    const d = missionDef(m.id); if (!d || m.claimed || m.progress < d.target) return;
    m.claimed = true; totalCoins += d.reward; saveCoins(); lsSet("boeingMissions", missionsData);
    toast("🎁 +" + d.reward + " 🪙  +" + d.xp + " XP", "mis"); sfx("mission");
    addXP(d.xp, false);
    renderMissions(); updateMenuInfo();
}
function openMissions() { ensureMissions(); showScreen("missionsScreen"); renderMissions(); }
function renderMissions() {
    const box = $("missionList"); box.innerHTML = "";
    missionsData.list.forEach(function (m, i) {
        const d = missionDef(m.id); if (!d) return;
        const done = m.progress >= d.target;
        const row = document.createElement("div");
        row.className = "item-row" + (done ? " done" : "");
        row.innerHTML = '<div class="ico">' + d.icon + '</div><div class="mid"><div class="ds">' + esc(d.desc) + '</div><div class="bar gold"><i style="width:' + clamp(m.progress / d.target * 100, 0, 100) + '%"></i></div><div class="sub">' + m.progress + ' / ' + d.target + '  •  🎁 ' + d.reward + ' 🪙 + ' + d.xp + ' XP</div></div>';
        const btn = document.createElement("button");
        btn.className = "btn"; btn.disabled = !done || m.claimed;
        btn.textContent = m.claimed ? "✓ تم" : (done ? "استلم" : "🔒");
        btn.onclick = function () { claimMission(i); };
        row.appendChild(btn); box.appendChild(row);
    });
}
function openAchievements() {
    showScreen("achievementsScreen");
    const box = $("achList"); box.innerHTML = "";
    let n = 0;
    ACHIEVEMENTS.forEach(function (a) {
        const got = !!achievements[a.id]; if (got) n++;
        const row = document.createElement("div");
        row.className = "item-row " + (got ? "done" : "locked");
        row.innerHTML = '<div class="ico">' + (got ? a.icon : "🔒") + '</div><div class="mid"><div class="ds">' + esc(a.name) + '</div><div class="sub">' + esc(a.desc) + '  •  🎁 ' + a.reward + ' 🪙</div></div><div>' + (got ? "✅" : "") + '</div>';
        box.appendChild(row);
    });
    $("achCount").innerText = "🏅 " + n + " / " + ACHIEVEMENTS.length + " مفتوحة";
}

