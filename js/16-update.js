/* =====================================================================
   SECTION 16: Update (fixed timestep)
   ===================================================================== */
function worldSpeed() {
    let s = 2.2 * MODE().speed * CITY().speed;
    // تدرّج السرعة العامة: يبدأ معقولًا ثم يتصاعد بقوة كلما تقدّمت — بلا سقف
    if (currentModeId !== "zen") s *= 1 + score * 0.0017 + score * score * 0.000005;
    // كل عائق/سوار متخطى يضرب بـ passMult (يزداد تدريجيًا كل ما تمرّ)
    s *= passMult;
    if (hasPerk("slowTime")) {                      // إبطاء الزمن عند الخطر
        for (let i = 0; i < buildings.length; i++) { const b = buildings[i]; if (b.x - plane.x < 120 && b.x + bWidth > plane.x) { s *= 0.55; break; } }
    }
    if (pw.turbo > 0) s *= 1.6;
    if (pw.freeze > 0) s *= 0.55;
    if (ev && ev.type === "speedStorm") s *= 1.25;
    return s;
}
function addBuilding() {
    const maxH = H - curGap - 100;
    const h = Math.floor(Math.random() * maxH) + 50;
    const topH = h, bottomH = H - h - curGap;
    buildings.push({ x: W, top: topH, bottom: bottomH, passed: false, seed: Math.floor(Math.random() * 9999) });
    if (Math.random() > 0.6) coins.push({ x: W + bWidth / 2, y: topH + curGap / 2, collected: false, radius: 12, vy: 0, gold: false });
    if (ev && ev.type === "goldRush") {
        for (let k = -2; k <= 2; k++) if (k !== 0) coins.push({ x: W + bWidth / 2 + k * 38, y: topH + curGap / 2 + (k % 2 ? 0 : -16), collected: false, radius: 12, vy: 0, gold: true });
    }
    puSince++;
    if (!boss && ((puSince >= 4 && Math.random() < 0.4 * MODE().puRate) || puSince >= 9)) spawnPowerup();
}
function emitTrail() {
    if (!settings.particles) return;
    const t = currentTrail(), turbo = pw.turbo > 0;
    if (t.id === "none" && !turbo) return;
    if (trailParticles.length > 90 * qf() + 10) return;
    if (settings.quality === "low" && (frame & 1)) return;
    const id = t.id === "none" ? "fire" : t.id;
    const n = turbo ? 3 : 1;
    const ang = clamp(plane.velocity * 0.035, -0.3, 0.4);
    const tx = plane.x + plane.w / 2 - Math.cos(ang) * plane.w * 0.45, ty = plane.y + plane.h / 2 - Math.sin(ang) * plane.w * 0.45;
    for (let i = 0; i < n; i++) {
        let col;
        if (id === "fire") col = "hsl(" + Math.floor(rand(10, 45)) + ",100%,55%)";
        else if (id === "electric") col = pick(["#67e8f9", "#ffffff", "#a5f3fc", "#38bdf8"]);
        else if (id === "rainbow") col = "hsl(" + ((frame * 9 + i * 40) % 360) + ",100%,60%)";
        else if (id === "neon") col = "hsl(" + Math.floor(rand(280, 320)) + ",100%,65%)";
        else if (id === "ice") col = "hsl(" + Math.floor(rand(190, 210)) + ",90%," + Math.floor(rand(70, 92)) + "%)";
        else col = pick(["#a78bfa", "#60a5fa", "#f0abfc", "#ffffff"]);
        trailParticles.push({ x: tx, y: ty + rand(-4, 4), vx: -rand(1.5, 3) - (turbo ? 2 : 0), vy: rand(-0.6, 0.6) + (id === "electric" ? rand(-1.5, 1.5) : 0), size: rand(2.5, 5.5) * (turbo ? 1.3 : 1), life: 1, c: col });
    }
}
function update() {
    colorTimer++;
    if (tapRing) { tapRing.t++; if (tapRing.t > 18) tapRing = null; }
    // نجوم الخلفية
    for (let i = 0; i < stars.length; i++) { const s = stars[i]; s.x -= s.speed; if (s.x < 0) s.x = W; }
    // سكاي لاين البعيد
    if (state === "playing" || state === "over") {
        const v = isOver ? 0.2 : 0.25 * Math.max(1, worldSpeed());
        for (let i = 0; i < skyline.length; i++) { const s = skyline[i]; s.x -= v; if (s.x + s.w < 0) s.x += skylineW; }
    }
    // جسيمات الصاروخ (أثر الشخصية)
    if (hasPerk("rocket") && isPlaying && !isOver && settings.particles && rocketParticles.length < 60) {
        rocketParticles.push({ x: plane.x, y: plane.y + plane.h / 2, vx: -6 - Math.random() * 2, vy: (Math.random() - 0.5) * 2, size: Math.random() * 6 + 2, life: 1.0 });
    }
    for (let i = rocketParticles.length - 1; i >= 0; i--) { const rp = rocketParticles[i]; rp.x += rp.vx; rp.y += rp.vy; rp.life -= 0.05; if (rp.life <= 0) rocketParticles.splice(i, 1); }
    // Trails
    for (let i = trailParticles.length - 1; i >= 0; i--) { const p = trailParticles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.035; p.size *= 0.97; if (p.life <= 0) trailParticles.splice(i, 1); }
    // جسيمات الانفجار
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= p.friction; p.vy *= p.friction; p.x += p.vx; p.y += p.vy;
        p.vy += (p.g !== undefined ? p.g : 0.15);
        p.life -= (p.decay || 0.015); p.size *= 0.96;
        if (p.life <= 0 || p.size <= 0.5) particles.splice(i, 1);
    }
    if (shakeTimer > 0) shakeTimer--;
    if (flashAlpha > 0) flashAlpha = Math.max(0, flashAlpha - 0.05);
    if (comboPulse > 0) comboPulse = Math.max(0, comboPulse - 0.06);
    if (banner) { banner.t++; if (banner.t >= banner.dur) banner = null; }
    if (state === "playing" || state === "over") updateWeather();

    if (isOver || !isPlaying) {
        if (isOver) {
            deathTimer++;
            if (deathTimer >= 70 && !overShown) { overShown = true; showGameOver(); }
            if (overShown && particles.length === 0 && flashAlpha <= 0 && shakeTimer <= 0) running = false;
            if (deathTimer > 400) running = false;
        }
        return;
    }

    frame++;
    if (frame % 60 === 0) missionUpdate("time", Math.floor(frame / 60));
    const gs = worldSpeed();
    distance += gs;
    // مؤقتات القدرات
    ["magnet", "turbo", "freeze", "multi"].forEach(function (k) {
        if (pw[k] > 0) { pw[k]--; if (pw[k] === 0 && k === "turbo") plane.invuln = Math.max(plane.invuln, 70); }
    });
    if (plane.invuln > 0) plane.invuln--;
    emitTrail();

    // الفيزياء (الأصلية)
    plane.velocity += plane.gravity;
    plane.y += plane.velocity;
    const hitBound = (plane.y + plane.h >= H - 30 || plane.y <= 0);
    if (hitBound) {
        const r = crash(plane.x + plane.w / 2, plane.y + plane.h / 2);
        if (r === "dead") return;
        plane.y = clamp(plane.y, 2, H - 30 - plane.h - 2);
        if (plane.y < 120) plane.velocity = 2; else plane.velocity = -4;
        if (r === "life") plane.y = H / 2 - plane.h / 2;
    }

    // أحداث + Boss + طقس
    maybeSpawnBoss();
    if (boss) { updateBoss(gs); if (isOver) return; }
    updateEvents();

    // توليد المباني (متوقف أثناء الـ Boss)
    if (!boss) { spawnDist += gs; if (spawnDist >= SPACING) { spawnDist -= SPACING; addBuilding(); } }
    else if (frame % 90 === 0 && boss.phase !== "warn") coins.push({ x: W + 10, y: rand(130, H - 140), collected: false, radius: 12, vy: 0, gold: false });

    // عوائق متحركة تتقوّس في الطريق — أكثر عددًا وتتسارع كلما تقدّمت
    if (!boss && score >= 4) {
        hazTimer--;
        if (hazTimer <= 0) {
            const by = rand(110, H - 150);
            hazards.push({ x: W + 30, baseY: by, y: by, amp: rand(35, 80), ph: rand(0, 6.28), freq: rand(0.03, 0.05), r: rand(17, 23), rot: 0, sp: rand(1.0, 1.3) });
            hazTimer = Math.round(clamp(360 - score * 1.5, 170, 360) + rand(0, 110));
        }
    }

    // المباني
    for (let i = buildings.length - 1; i >= 0; i--) {
        const b = buildings[i];
        b.x -= gs;
        const hit = (plane.x + plane.w * 0.1 < b.x + bWidth && plane.x + plane.w * 0.9 > b.x &&
            (plane.y + plane.h * 0.1 < b.top || plane.y + plane.h * 0.9 > H - b.bottom));
        if (hit) {
            const ix = Math.max(plane.x, b.x), iy = plane.y + plane.h / 2;
            const r = crash(ix, iy);
            if (r === "dead") return;
            if (r === "shield") {
                if (!b.passed) { b.passed = true; onPass(); }
                burst(plane.x + plane.w / 2, plane.y + plane.h / 2, "#4ade80", 20, 6);
                flashAlpha = Math.max(flashAlpha, 0.22); shakeTimer = settings.shake ? 12 : 0;
                buildings.splice(i, 1); plane.velocity = -5; continue;
            }
            if (r === "life") { plane.y = b.top + curGap / 2 - plane.h / 2; plane.velocity = 0; }
        }
        if (!b.passed && b.x + bWidth < plane.x) { b.passed = true; onPass(); passMult = Math.min(passMult * 1.06, passCap); }
        if (b.x + bWidth < 0) buildings.splice(i, 1);
    }

    // العوائق المتحركة (تتقوّس عموديًا وتُدار بتفادي الطائرة)
    for (let i = hazards.length - 1; i >= 0; i--) {
        const h = hazards[i];
        h.x -= gs * h.sp; h.ph += h.freq; h.rot += 0.16;
        h.y = clamp(h.baseY + Math.sin(h.ph) * h.amp, h.r + 60, H - 34 - h.r);
        const hit = (plane.x + plane.w * 0.15 < h.x + h.r && plane.x + plane.w * 0.85 > h.x - h.r &&
            plane.y + plane.h * 0.2 < h.y + h.r && plane.y + plane.h * 0.8 > h.y - h.r);
        if (hit) {
            const r = crash(h.x, h.y);
            if (r === "dead") return;
            if (r === "shield") {
                burst(h.x, h.y, "#4ade80", 20, 6);
                flashAlpha = Math.max(flashAlpha, 0.22); shakeTimer = settings.shake ? 12 : 0;
                hazards.splice(i, 1); plane.velocity = -4; continue;
            }
            if (r === "life") plane.velocity = -3;
        }
        if (h.x + h.r < 0) hazards.splice(i, 1);
        }

    // العملات
    const magnetRange = Math.max(hasPerk("magnet") ? 120 : 46, pw.magnet > 0 ? 140 : 0);
    const pcx = plane.x + plane.w / 2, pcy = plane.y + plane.h / 2;
    for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        c.x -= gs; c.y += c.vy;
        const dx = pcx - c.x, dy = pcy - c.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (pw.magnet > 0 && dist < 170 && dist > 1) { c.x += dx * 0.1; c.y += dy * 0.1; }
        else if (hasPerk("magnet") && dist < 100 && dist > 1) { c.x += dx * 0.07; c.y += dy * 0.07; }
        if (!c.collected && dist < c.radius + magnetRange) {
            c.collected = true;
            const v = coinValue() * (c.gold ? 2 : 1);
            sessionCoins += v; missionUpdate("coins", v);
            addXP(1, true);
            playEl(coinSound, "coin");
            burst(c.x, c.y, c.gold ? "#fde047" : "#fbbf24", 6, 4);
            checkAchievements();
        }
        if (c.x + 30 < 0 || c.y > H + 20 || c.collected) coins.splice(i, 1);
    }
    // Power-ups
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        p.x -= gs; p.t += 0.08;
        const dx = pcx - p.x, dy = pcy - (p.y + Math.sin(p.t) * 6);
        if (!p.collected && Math.sqrt(dx * dx + dy * dy) < 38) collectPowerup(p);
        if (p.x < -30 || p.collected) powerups.splice(i, 1);
    }
}

