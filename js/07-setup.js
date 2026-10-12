/* =====================================================================
   SECTION 7: Setup (modes / cities), Profile, Settings
   ===================================================================== */
function openSetup() { showScreen("setupScreen"); renderSetup(); }
function stars5(n) { let s = ""; for (let i = 0; i < 5; i++) s += i < n ? "🔥" : "▫️"; return s; }
function renderSetup() {
    const ml = $("modeList"); ml.innerHTML = "";
    Object.keys(MODES).forEach(function (id) {
        const m = MODES[id];
        const c = document.createElement("div");
        c.className = "sel-card" + (id === currentModeId ? " selected" : "");
        c.style.borderColor = id === currentModeId ? "#4ade80" : m.color + "88";
        c.innerHTML = '<div class="ico">' + m.icon + '</div><div><div class="nm" style="color:' + m.color + '">' + m.name + '</div><div class="ds">' + m.desc + '</div><div class="mt">الصعوبة ' + stars5(m.diff) + '  •  مكافآت ×' + m.reward + '</div></div>';
        c.onclick = function () { currentModeId = id; lsSet("boeingMode", id); renderSetup(); };
        ml.appendChild(c);
    });
    const cl = $("cityList"); cl.innerHTML = "";
    Object.keys(CITIES).forEach(function (id) {
        const t = CITIES[id];
        const c = document.createElement("div");
        c.className = "sel-card" + (id === currentMapId ? " selected" : "");
        c.style.background = "linear-gradient(135deg," + t.sky[1] + "," + t.sky[2] + ")";
        c.innerHTML = '<div class="ico">' + t.icon + '</div><div><div class="nm">' + t.name + '</div><div class="ds">' + t.desc + '</div><div class="mt">السرعة ×' + t.speed + '  •  مكافآت ×' + t.reward + '</div></div>';
        c.onclick = function () { currentMapId = id; lsSet("boeingMap", id); buildSkyline(); renderBackdrop(); renderSetup(); renderIdle(); };
        cl.appendChild(c);
    });
}
function openProfile() {
    showScreen("profileScreen");
    $("profName").innerText = "👤 " + playerName;
    const need = xpNeeded(playerLevel);
    $("profLevel").innerText = "⭐ Level " + playerLevel;
    $("profXpText").innerText = Math.floor(playerXP) + " / " + need + " XP";
    $("profXpFill").style.width = clamp(playerXP / need * 100, 0, 100) + "%";
    let fav = "-", bestN = 0;
    Object.keys(stats.modeCounts).forEach(function (k) { if (MODES[k] && stats.modeCounts[k] > bestN) { bestN = stats.modeCounts[k]; fav = MODES[k].icon + " " + MODES[k].name; } });
    let cities = 0; Object.keys(CITIES).forEach(function (k) { if (stats.citiesPlayed[k] > 0) cities++; });
    let ach = 0; ACHIEVEMENTS.forEach(function (a) { if (achievements[a.id]) ach++; });
    const rows = [
        ["🪙 Total Coins", totalCoins], ["🏆 High Score", highScore], ["✈️ Total Flights", stats.flights], ["🔥 Best Combo", "x" + stats.bestCombo],
        ["🏅 Achievements", ach + " / " + ACHIEVEMENTS.length], ["🌍 Cities Played", cities + " / " + Object.keys(CITIES).length], ["🎮 Favorite Mode", fav], ["📏 Best Distance", stats.bestDistance + " m"]
    ];
    $("profStats").innerHTML = rows.map(function (r) { return '<div class="stat"><span>' + r[0] + '</span><b>' + esc(r[1]) + '</b></div>'; }).join("");
}
function openSettings() { showScreen("settingsScreen"); syncSettingsUI(); }
function syncSettingsUI() {
    $("setMusic").value = Math.round(settings.music * 100);
    $("setSfx").value = Math.round(settings.sfx * 100);
    [["togWeather", "weather"], ["togParticles", "particles"], ["togShake", "shake"]].forEach(function (p) {
        const b = $(p[0]); b.innerText = settings[p[1]] ? "ON" : "OFF"; b.classList.toggle("on", !!settings[p[1]]);
    });
    ["low", "medium", "high"].forEach(function (q) { $("q" + q.charAt(0).toUpperCase() + q.slice(1)).classList.toggle("on", settings.quality === q); });
    [["auto", "dAuto"], ["pc", "dPc"], ["phone", "dPhone"]].forEach(function (p) { $(p[1]).classList.toggle("on", settings.display === p[0]); });
}
function setDisplay(d) { settings.display = d; saveSettings(); syncSettingsUI(); applyDisplay(); }
function onSettingRange() {
    settings.music = clamp(parseInt($("setMusic").value, 10) / 100, 0, 1);
    settings.sfx = clamp(parseInt($("setSfx").value, 10) / 100, 0, 1);
    applyVolumes(); saveSettings();
}
function toggleSetting(k) { settings[k] = !settings[k]; saveSettings(); syncSettingsUI(); if (k === "weather" && !settings.weather) { weather.cur = "clear"; weather.pending = null; weather.fade = 0; } }
function setQuality(q) { settings.quality = q; saveSettings(); syncSettingsUI(); applyQuality(); renderIdle(); }

