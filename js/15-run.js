/* =====================================================================
   SECTION 15: Start / intro / retry / pause
   ===================================================================== */
function clearIntro() { introTimers.forEach(function (t) { clearTimeout(t); }); introTimers = []; }
function setIntroText(a, b) {
    const m = $("introMain"), s = $("introSub");
    m.style.animation = "none"; s.style.animation = "none"; void m.offsetWidth; m.style.animation = ""; s.style.animation = "";
    m.textContent = a; s.textContent = b || "";
}
function playIntro() {
    clearIntro(); state = "intro"; isPlaying = false;
    showScreen("introScreen");
    const c = CITY(), m = MODE();
    setIntroText(c.icon + " " + c.name, c.desc); synth("intro");
    introTimers.push(setTimeout(function () { setIntroText(m.icon + " " + m.name, m.desc); }, 750));
    introTimers.push(setTimeout(function () { setIntroText("READY?", "✈️ " + playerName); }, 1450));
    introTimers.push(setTimeout(function () { beginRun(); }, 2150));
}
function skipIntro() { if (state !== "intro") return; clearIntro(); beginRun(); }
function startGame(skip) {
    if (state === "intro") return;
    unlockAudio();
    if (skip === true) beginRun(); else playIntro();
}
function retryGame() { startGame(true); }
function goShop() { openShop(); }
function goMenu() { openMain(); }
function beginRun() {
    clearIntro();
    if (loopId) { cancelAnimationFrame(loopId); loopId = 0; }
    showScreen(null);
    ensureMissions();
    const mode = MODE();
    curGap = Math.round(bGap * mode.gap);
    plane.y = 250; plane.velocity = 0; plane.invuln = 0; plane.lives = 1;
    buildings = []; hazards = []; coins = []; powerups = []; particles = []; rocketParticles = []; trailParticles = [];
    pw = { magnet: 0, turbo: 0, freeze: 0, multi: 0 };
    boss = null; bossCount = 0; nextBossScore = mode.boss ? mode.bossFirst : Infinity;
    ev = null; evTimer = Math.floor(rand(700, 1100) * mode.evGap); lastEv = "";
    banner = null; combo = 0; bestComboRun = 0; comboPulse = 0;
    puSince = 0; spawnDist = SPACING; distance = 0; hazTimer = 200;
    runXP = 0; runCoins = 0; runPowerups = 0; wasNewRecord = false;
    weather = { cur: "clear", pending: null, fade: 0, timer: 900, drops: [], flakes: [], flash: 0, lightT: 300, bolt: null, boltT: 0 };
    pickWeather(true);
    buildSkyline(); renderBackdrop();
    stats.citiesPlayed[currentMapId] = (stats.citiesPlayed[currentMapId] || 0) + 1;
    stats.modeCounts[currentModeId] = (stats.modeCounts[currentModeId] || 0) + 1;
    saveStats();
    explosionTriggered = false; shakeTimer = 0; flashAlpha = 0;
    score = 0; sessionCoins = 0; colorTimer = 0; frame = 0;
    isOver = false; runEnded = false; saved = false; overShown = false; deathTimer = 0; paused = false;
    hasShield = hasPerk("shield");
    state = "playing"; isPlaying = true;
    bgMusic.currentTime = 0; playMusic();
    checkAchievements();
    startLoop();
}
function pauseGame(p) {
    if (state !== "playing" || isOver) return;
    paused = p;
    if (p) bgMusic.pause(); else playMusic();
    lastTs = 0; acc = 0;
}
function jump() {
    if (!isPlaying || isOver || paused) return;
    plane.velocity = plane.lift;
    // مؤثر اللمس: نفخة دفع زرقاء خلف الطائرة
    burst(plane.x + plane.w * 0.2, plane.y + plane.h / 2, "rgba(125,211,252,0.85)", 7, 3.5);
}

