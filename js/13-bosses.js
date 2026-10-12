/* =====================================================================
   SECTION 13: Bosses
   ===================================================================== */
function maybeSpawnBoss() {
    if (boss || !MODE().boss || ev || score < nextBossScore) return;
    const def = BOSSES[bossCount % BOSSES.length];
    const passes = bossCount >= 3 ? 3 : 2;
    boss = { def: def, type: def.type, phase: "warn", t: 0, x: W + 100, y: H / 2, w: def.w, h: def.h, lane: rand(160, 430), sub: "", st: 0, pass: 0, passes: passes, maxHp: passes, hp: passes, lockY: 0 };
    sfx("boss");
}
function startBossFight() {
    boss.phase = "fight"; boss.t = 0;
    if (boss.type === "heli") { boss.x = W + 70; boss.y = boss.lane; }
    else if (boss.type === "ufo") { boss.x = W + 60; boss.y = boss.lane; boss.sub = "enter"; boss.st = 0; }
    else { boss.sub = "tele"; boss.st = 0; boss.x = W + 120; boss.y = boss.lane; }
}
function updateBoss(gs) {
    boss.t++;
    if (boss.phase === "warn") { if (boss.t >= BOSS_WARN) startBossFight(); return; }
    if (boss.type === "heli") {
        boss.x -= 2.4; boss.y = clamp(boss.lane + Math.sin(boss.t * 0.045) * 65, 70, H - 90);
        if (boss.x < -boss.w - 30) {
            boss.hp--; if (boss.hp <= 0) { bossDone(); return; }
            boss.x = W + 80; boss.lane = rand(160, 430);   // يعود لجولة أخرى
        }
    } else if (boss.type === "ufo") {
        if (boss.sub === "enter") { boss.x -= 2.2; if (boss.x <= 250) { boss.sub = "hover"; boss.st = 0; } }
        else if (boss.sub === "hover") { boss.st++; boss.y = clamp(boss.lane + Math.sin(boss.st * 0.08) * 90, 80, H - 100); if (boss.st > 140) { boss.sub = "aim"; boss.st = 0; boss.lockY = boss.y; } }
        else if (boss.sub === "aim") { boss.st++; boss.y = boss.lockY + Math.sin(boss.st * 1.2) * 1.5; if (boss.st > 48) { boss.sub = "dash"; } }
        else {
            boss.x -= 6.5; boss.y = boss.lockY;
            if (boss.x < -boss.w - 20) {
                boss.hp--; if (boss.hp <= 0) { bossDone(); return; }
                boss.x = W + 60; boss.sub = "enter"; boss.st = 0;   // يعود من جديد
            }
        }
    } else {
        if (boss.sub === "tele") { boss.st++; boss.x = W + 120; if (boss.st > 72) { boss.sub = "dash"; } }
        else {
            boss.x -= 9;
            if (boss.x < -boss.w - 40) {
                boss.hp--; if (boss.hp <= 0) { bossDone(); return; }
                let nl = rand(120, 460), guard = 0; while (Math.abs(nl - boss.lane) < 110 && guard++ < 10) nl = rand(120, 460);
                boss.lane = nl; boss.y = nl; boss.sub = "tele"; boss.st = 0; boss.x = W + 120;
            }
        }
    }
    // التصادم
    if (boss && boss.phase === "fight" && !(boss.type === "jet" && boss.sub === "tele") && !(boss.type === "ufo" && boss.sub === "aim" && false)) {
        const hx = boss.x - boss.w * 0.4, hw = boss.w * 0.8, hy = boss.y - boss.h * 0.4, hh = boss.h * 0.8;
        const px = plane.x + plane.w * 0.1, pw2 = plane.w * 0.8, py = plane.y + plane.h * 0.15, ph = plane.h * 0.7;
        if (px < hx + hw && px + pw2 > hx && py < hy + hh && py + ph > hy) {
            const r = crash(boss.x, boss.y);
            if (r === "life" || r === "shield") { plane.y = clamp(plane.y, 60, H - 120); plane.velocity = -3; }
        }
    }
}
function bossDone() {
    bossCount++; stats.bosses++;
    sessionCoins += 10; missionUpdate("coins", 10); missionUpdate("boss", 1);
    addXP(40, true);
    score += 3; missionUpdate("score", score);
    setBanner("✅ BOSS CLEARED", "+10 🪙  +3", "#4ade80", 130);
    boss = null;
    nextBossScore = score + Math.round(rand(32, 45) * MODE().bossGap);
    spawnDist = SPACING * 0.4;
    checkAchievements();
}

