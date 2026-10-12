/* =====================================================================
   SECTION 11: Gameplay helpers (effects, explosion, combos, power-ups)
   ===================================================================== */
function maxParticles() { return Math.floor(320 * qf()); }
function burst(x, y, color, n, spd) {
    if (!settings.particles) return;
    n = Math.floor(n * qf());
    for (let i = 0; i < n && particles.length < maxParticles(); i++) {
        const a = Math.random() * Math.PI * 2, s = Math.random() * (spd || 6) + 1;
        particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: color, life: Math.random() * 0.8 + 0.4, size: Math.random() * 4 + 2, friction: 0.92 });
    }
}
function createExplosion(x, y) {
    if (explosionTriggered) return;
    explosionTriggered = true;
    shakeTimer = settings.shake ? 30 : 0;
    flashAlpha = 1.0;
    bgMusic.pause();
    playEl(explosionSound, "explosion");
    const count = settings.particles ? Math.floor(120 * Math.max(0.5, qf())) : 30;
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2, speed = Math.random() * 20 + 2;
        particles.push({ x: x, y: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color: "hsl(" + (Math.random() * 60 + 10) + ", 100%, 65%)", life: Math.random() * 1.2 + 0.5, size: Math.random() * 9 + 2, friction: 0.92 });
    }
}
function setBanner(text, sub, color, dur) { banner = { text: text, sub: sub || "", color: color || "#fbbf24", t: 0, dur: dur || 110 }; }
function coinValue() { return (hasPerk("doubleCoins") ? 2 : 1) * (pw.multi > 0 ? 3 : 1) * ((ev && ev.type === "goldRush") ? 2 : 1); }
function onPass() {
    score++; combo++;
    if (combo > bestComboRun) bestComboRun = combo;
    comboPulse = 1;
    addXP(2, true);
    missionUpdate("score", score); missionUpdate("combo", combo);
    const r = COMBO_REWARDS[combo];
    if (r) {
        sessionCoins += r.c; if (r.c) missionUpdate("coins", r.c);
        addXP(r.xp, true);
        setBanner("🔥 COMBO x" + combo, r.c ? "+" + r.c + " 🪙 bonus" : "", "#fb923c", 90);
        flashAlpha = Math.max(flashAlpha, 0.18); sfx("combo");
        burst(plane.x + plane.w / 2, plane.y + plane.h / 2, "#fb923c", 16, 6);
    }
    checkAchievements();
}
function pickWeighted(list) { let t = 0; list.forEach(function (p) { t += p[1]; }); let r = Math.random() * t; for (let i = 0; i < list.length; i++) { r -= list[i][1]; if (r <= 0) return list[i][0]; } return list[0][0]; }
function spawnPowerup() {
    const list = PU_WEIGHTS.filter(function (p) { return !(p[0] === "life" && plane.lives >= 3); });
    const type = pickWeighted(list);
    powerups.push({ type: type, x: W + (bWidth + SPACING) / 2, y: rand(140, H - 150), t: Math.random() * 6, collected: false });
    puSince = 0;
}
function collectPowerup(p) {
    p.collected = true;
    const def = POWERUPS[p.type];
    runPowerups++; missionUpdate("power", 1); addXP(3, true);
    switch (p.type) {
        case "shield": hasShield = true; break;
        case "life": plane.lives = Math.min(3, plane.lives + 1); break;
        default: pw[p.type] = def.dur;
    }
    sfx("powerup"); setBanner(def.icon + " " + def.name, "", def.color, 70);
    burst(p.x, p.y, def.color, 14, 5);
    checkAchievements();
}
// يعيد: false (تجاهل) | "shield" | "life" | "dead"
function crash(ix, iy) {
    if (plane.invuln > 0 || pw.turbo > 0) return false;
    if (hasShield) {
        hasShield = false; shakeTimer = settings.shake ? 20 : 0; plane.invuln = 50;
        burst(ix, iy, "#4ade80", 22, 7); sfx("life");
        return "shield";
    }
    if (plane.lives > 1) {
        plane.lives--; combo = 0; plane.invuln = 110; shakeTimer = settings.shake ? 24 : 0;
        burst(ix, iy, "#f87171", 24, 8); sfx("life");
        setBanner("❤️ -1 LIFE", "Lives: " + plane.lives, "#f87171", 80);
        return "life";
    }
    endRun(ix, iy);
    return "dead";
}
function endRun(ix, iy) {
    if (runEnded) return;
    runEnded = true; isOver = true; isPlaying = false; state = "over"; deathTimer = 0;
    handleGameOverSave();
    createExplosion(ix, iy);
}
function handleGameOverSave() {
    if (saved) return; saved = true;
    runCoins = Math.round(sessionCoins * rewardMult());
    totalCoins += runCoins;
    stats.coinsEarned += runCoins; stats.flights++;
    stats.totalTime += Math.floor(frame / 60);
    stats.bestCombo = Math.max(stats.bestCombo, bestComboRun);
    stats.bestDistance = Math.max(stats.bestDistance, Math.floor(distance / 10));
    stats.powerups += runPowerups; runPowerups = 0;
    wasNewRecord = score > highScore;
    if (wasNewRecord) { highScore = score; lsSetRaw("boeingHighScore", highScore); }
    saveCoins();
    lsSetRaw("boeingLastChar", selectedIndex);
    updateLeaderboardData(score);
    missionUpdate("flights", 1);
    saveStats();
    addXP(5, true);
    checkAchievements();
    saveAll();
}

