/* =====================================================================
   SECTION 17: Drawing
   ===================================================================== */
function T(s, x, y, align, dir) { ctx.textAlign = align || "left"; ctx.direction = dir || "ltr"; ctx.fillText(s, x, y); }
function rr(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
function drawBackground() {
    if (bgCache && bgCache.width > 0) ctx.drawImage(bgCache, 0, 0, W, H);
    else { ctx.fillStyle = "#090d19"; ctx.fillRect(0, 0, W, H); }
    // نجوم
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        ctx.globalAlpha = s.alpha * (0.65 + 0.35 * Math.sin(colorTimer * 0.03 + s.ph));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // سكاي لاين بعيد
    const ct = CITY();
    ctx.fillStyle = ct.far;
    for (let i = 0; i < skyline.length; i++) { const s = skyline[i]; ctx.fillRect(s.x, H - 30 - s.h, s.w, s.h); }
    if (ct.id === "tokyo") {
        for (let i = 0; i < skyline.length; i++) { const s = skyline[i]; if (s.neon) { ctx.fillStyle = (i % 2) ? "rgba(34,211,238,0.8)" : "rgba(244,114,182,0.85)"; ctx.fillRect(s.x + 3, H - 30 - s.h + 6, s.w - 6, 2); } }
    }
}
function winOn(b, ci, ri) { return ((b.seed + ci * 7 + ri * 13) % 17) !== 0 && (((frame >> 6) + b.seed + ci * 3 + ri) % 29) !== 0; }
function drawBuildings() {
    const c = CITY(), high = settings.quality === "high";
    for (let n = 0; n < buildings.length; n++) {
        const b = buildings[n];
        ctx.fillStyle = c.bld;
        ctx.fillRect(b.x, 0, bWidth, b.top);
        ctx.fillRect(b.x, H - b.bottom, bWidth, b.bottom);
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.fillRect(b.x + bWidth - 9, 0, 9, b.top); ctx.fillRect(b.x + bWidth - 9, H - b.bottom, 9, b.bottom);
        ctx.strokeStyle = c.edge; ctx.lineWidth = 2;
        ctx.strokeRect(b.x, 0, bWidth, b.top); ctx.strokeRect(b.x, H - b.bottom, bWidth, b.bottom);
        // نوافذ (Path واحد لكل لون)
        const pA = new Path2D(), pB = new Path2D();
        let ci = 0;
        for (let wx = b.x + 8; wx < b.x + bWidth - 8; wx += 14, ci++) {
            const target = (c.win2 && (ci & 1)) ? pB : pA;
            let ri = 0;
            for (let wy = 15; wy < b.top - 15; wy += 22, ri++) if (winOn(b, ci, ri)) target.rect(wx, wy, 5, 9);
            ri = 100;
            for (let wy = H - b.bottom + 15; wy < H - 40; wy += 22, ri++) if (winOn(b, ci, ri)) target.rect(wx, wy, 5, 9);
        }
        if (high) { ctx.shadowColor = c.win; ctx.shadowBlur = 8; }
        ctx.fillStyle = c.win; ctx.fill(pA);
        if (c.win2) { if (high) ctx.shadowColor = c.win2; ctx.fillStyle = c.win2; ctx.fill(pB); }
        ctx.shadowBlur = 0; ctx.shadowColor = "transparent";
        // ضوء تحذيري على سطح المبنى السفلي
        if (((frame >> 4) & 1) === 0) { ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(b.x + bWidth / 2, H - b.bottom - 4, 2.5, 0, Math.PI * 2); ctx.fill(); }
    }
}
function drawCoins() {
    const m = coinValue();
    for (let i = 0; i < coins.length; i++) {
        const c = coins[i]; if (c.collected) continue;
        ctx.save();
        ctx.beginPath(); ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fillStyle = c.gold ? "#fde047" : "#fbbf24";
        if (settings.quality !== "low") { ctx.shadowColor = c.gold ? "#facc15" : "#f59e0b"; ctx.shadowBlur = 12; }
        ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#78350f"; ctx.font = "bold 12px Arial";
        ctx.textBaseline = "middle"; T(m > 1 ? (m + "x") : "$", c.x, c.y, "center");
        ctx.restore();
    }
}
function drawPowerups() {
    for (let i = 0; i < powerups.length; i++) {
        const p = powerups[i], def = POWERUPS[p.type];
        const y = p.y + Math.sin(p.t) * 6, pulse = 1 + Math.sin(p.t * 2) * 0.08;
        ctx.save(); ctx.translate(p.x, y); ctx.scale(pulse, pulse);
        if (settings.quality !== "low") { ctx.shadowColor = def.color; ctx.shadowBlur = 16; }
        ctx.fillStyle = "rgba(15,23,42,0.85)"; ctx.strokeStyle = def.color; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0; ctx.font = "18px Arial"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff";
        T(def.icon, 0, 1, "center");
        ctx.restore();
    }
}
function drawBoss() {
    if (!boss) return;
    const t = boss.t;
    if (boss.phase === "warn") {
        // مؤشر المسار على الحافة اليمنى
        const blink = ((t >> 3) & 1) === 0;
        if (blink) {
            ctx.save();
            ctx.fillStyle = "rgba(239,68,68,0.2)";
            if (boss.type === "heli") ctx.fillRect(0, boss.lane - 70, W, 140); else ctx.fillRect(0, boss.lane - 16, W, 32);
            ctx.fillStyle = "#f87171"; ctx.font = "22px Arial"; ctx.textBaseline = "middle"; T(boss.def.icon + " ◀", W - 14, boss.lane, "right");
            ctx.restore();
        }
        return;
    }
    if (boss.type === "jet" && boss.sub === "tele") {
        if (((boss.st >> 2) & 1) === 0) {
            ctx.save(); ctx.fillStyle = "rgba(239,68,68,0.25)"; ctx.fillRect(0, boss.y - 14, W, 28);
            ctx.strokeStyle = "rgba(248,113,113,0.8)"; ctx.setLineDash([10, 8]); ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, boss.y); ctx.lineTo(W, boss.y); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = "#f87171"; ctx.font = "22px Arial"; ctx.textBaseline = "middle"; T("✈️ ◀", W - 14, boss.y, "right");
            ctx.restore();
        }
        return;
    }
    ctx.save(); ctx.translate(boss.x, boss.y);
    if (boss.type === "heli") {
        ctx.fillStyle = "rgba(253,224,71,0.09)"; ctx.beginPath(); ctx.moveTo(-14, 14); ctx.lineTo(-70, 130); ctx.lineTo(20, 130); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#1e293b"; ctx.beginPath(); ctx.ellipse(0, 0, 34, 15, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(26, -3, 38, 6); ctx.fillRect(60, -12, 4, 14);
        ctx.fillStyle = "rgba(125,211,252,0.85)"; ctx.beginPath(); ctx.ellipse(-16, -3, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#334155"; ctx.fillRect(-4, -20, 8, 6);
        const rw = 46 * Math.abs(Math.cos(t * 0.6)) + 6;
        ctx.fillStyle = "#94a3b8"; ctx.fillRect(-rw, -22, rw * 2, 2.5);
        ctx.fillStyle = (t >> 3) & 1 ? "#ef4444" : "#3b82f6"; ctx.beginPath(); ctx.arc(-6, -22, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = (t >> 3) & 1 ? "#3b82f6" : "#ef4444"; ctx.beginPath(); ctx.arc(8, -22, 3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#64748b"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-18, 17); ctx.lineTo(18, 17); ctx.stroke();
    } else if (boss.type === "ufo") {
        if (boss.sub === "aim") {
            ctx.strokeStyle = "rgba(248,113,113," + (0.4 + 0.4 * ((t >> 2) & 1)) + ")"; ctx.lineWidth = 3; ctx.setLineDash([12, 8]);
            ctx.beginPath(); ctx.moveTo(-boss.w / 2, 0); ctx.lineTo(-boss.x - 10, 0); ctx.stroke(); ctx.setLineDash([]);
        }
        if (settings.quality !== "low") { ctx.shadowColor = "#4ade80"; ctx.shadowBlur = 16; }
        ctx.fillStyle = "rgba(125,211,252,0.8)"; ctx.beginPath(); ctx.ellipse(0, -6, 18, 14, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = "#94a3b8"; ctx.beginPath(); ctx.ellipse(0, 2, 34, 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        for (let i = -2; i <= 2; i++) { ctx.fillStyle = ((t >> 3) + i) & 1 ? "#fde047" : "#4ade80"; ctx.beginPath(); ctx.arc(i * 12, 3, 2.6, 0, Math.PI * 2); ctx.fill(); }
    } else {
        ctx.fillStyle = "#334155"; ctx.beginPath(); ctx.moveTo(-42, 0); ctx.lineTo(-10, -7); ctx.lineTo(36, -6); ctx.lineTo(42, 0); ctx.lineTo(36, 6); ctx.lineTo(-10, 7); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#475569"; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(18, -26); ctx.lineTo(26, -26); ctx.lineTo(16, 0); ctx.lineTo(26, 26); ctx.lineTo(18, 26); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#38bdf8"; ctx.beginPath(); ctx.ellipse(-22, -1, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
        const fl = 14 + Math.random() * 12;
        ctx.fillStyle = "#fb923c"; ctx.beginPath(); ctx.moveTo(42, -3); ctx.lineTo(42 + fl, 0); ctx.lineTo(42, 3); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.moveTo(42, -1.5); ctx.lineTo(42 + fl * 0.6, 0); ctx.lineTo(42, 1.5); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // شريط أздоров الزعيم — ينقص مع كل تفادي ناجح (تقتله بالتفادي)
    if (boss.phase === "fight") {
        const bw = 78, bh = 7, bx = boss.x - bw / 2, by = boss.y - boss.h / 2 - 16;
        const hpFrac = clamp(boss.hp / boss.maxHp, 0, 1);
        ctx.fillStyle = "rgba(2,6,23,0.72)"; ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
        ctx.fillStyle = "#334155"; ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = hpFrac > 0.5 ? "#4ade80" : (hpFrac > 0.25 ? "#fbbf24" : "#ef4444");
        ctx.fillRect(bx, by, bw * hpFrac, bh);
        ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
        ctx.font = "bold 10px Arial"; ctx.fillStyle = "#fca5a5"; ctx.textBaseline = "bottom";
        T(boss.def.name + "  ♥" + boss.hp, boss.x, by - 4, "center");
    }
}
function drawTrails() {
    if (trailParticles.length === 0 && rocketParticles.length === 0) return;
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < trailParticles.length; i++) {
        const p = trailParticles[i];
        ctx.globalAlpha = Math.max(0, p.life) * 0.9; ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    for (let i = 0; i < rocketParticles.length; i++) {
        const rp = rocketParticles[i];
        ctx.save(); ctx.globalAlpha = rp.life; ctx.fillStyle = "#ea580c";
        if (settings.quality === "high") { ctx.shadowColor = "#fb923c"; ctx.shadowBlur = 12; }
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
}
function drawFallbackPlane() {
    ctx.fillStyle = "#e2e8f0"; ctx.beginPath(); ctx.ellipse(0, 0, plane.w * 0.45, plane.h * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#94a3b8"; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-22, -plane.h * 0.45); ctx.lineTo(-10, -plane.h * 0.45); ctx.lineTo(8, 0); ctx.lineTo(-10, plane.h * 0.45); ctx.lineTo(-22, plane.h * 0.45); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#38bdf8"; ctx.beginPath(); ctx.ellipse(plane.w * 0.28, -2, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
}
function drawSkinFX(sk) {
    const t = frame;
    if (sk.id === "lightning") {
        if (t % 6 < 3) { ctx.strokeStyle = "#fde047"; ctx.lineWidth = 1.6; ctx.beginPath(); let x = -plane.w / 2; ctx.moveTo(x, rand(-8, 8)); for (let i = 0; i < 5; i++) { x += plane.w / 5; ctx.lineTo(x, rand(-15, 15)); } ctx.stroke(); }
    } else if (sk.id === "galaxy") {
        ctx.fillStyle = "#e9d5ff";
        for (let i = 0; i < 4; i++) { const a = t * 0.05 + i * 1.57; ctx.fillRect(Math.cos(a) * plane.w * 0.48 - 1, Math.sin(a) * plane.h * 0.7 - 1, 2.6, 2.6); }
    } else if (sk.id === "diamond") {
        if (t % 45 < 8) { const sx = rand(-plane.w * 0.3, plane.w * 0.3), sy = rand(-plane.h * 0.3, plane.h * 0.3); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx - 6, sy); ctx.lineTo(sx + 6, sy); ctx.moveTo(sx, sy - 6); ctx.lineTo(sx, sy + 6); ctx.stroke(); }
    } else if (sk.id === "fire") {
        ctx.fillStyle = "rgba(251,146,60,0.85)";
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-plane.w / 2 - rand(0, 6), rand(-4, 4), rand(2, 5), 0, Math.PI * 2); ctx.fill(); }
    }
}
function drawPlane() {
    if (isOver) return;
    const sk = currentSkin();
    ctx.save();
    ctx.translate(plane.x + plane.w / 2, plane.y + plane.h / 2);
    ctx.rotate(clamp(plane.velocity * 0.035, -0.3, 0.4));
    if (plane.invuln > 0 && ((frame >> 2) & 1) === 0) ctx.globalAlpha = 0.45;
    if (sk.id === "ghost") ctx.globalAlpha *= 0.65;
    let glow = sk.glow;
    if (sk.id === "neon") glow = "hsl(" + ((frame * 4) % 360) + ",100%,60%)";
    if (settings.quality !== "low") { ctx.shadowColor = glow; ctx.shadowBlur = 15; }
    const activeImg = loadedImages[selectedIndex];
    if (activeImg && activeImg.complete && activeImg.naturalWidth > 0) ctx.drawImage(activeImg, -plane.w / 2, -plane.h / 2, plane.w, plane.h);
    else drawFallbackPlane();
    ctx.shadowBlur = 0; ctx.shadowColor = "transparent";
    drawSkinFX(sk);
    if (hasPerk("magnet") || pw.magnet > 0) {
        const mr = (hasPerk("magnet") && pw.magnet <= 0 ? 55 : 62) + Math.sin(frame * 0.15) * 4;
        ctx.save();
        ctx.lineWidth = 3; ctx.strokeStyle = "rgba(56,189,248,0.85)";
        if (settings.quality !== "low") { ctx.shadowColor = "#38bdf8"; ctx.shadowBlur = 18; }
        ctx.beginPath(); ctx.arc(0, 0, mr, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0; ctx.globalAlpha = 0.6; ctx.lineWidth = 2; ctx.strokeStyle = "#bae6fd";
        ctx.setLineDash([6, 10]); ctx.lineDashOffset = -frame * 0.8;
        ctx.beginPath(); ctx.arc(0, 0, mr - 7, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }
    if (hasShield) {
        const sr = Math.max(plane.w, plane.h) * 0.75 + Math.sin(frame * 0.12) * 3;
        ctx.save();
        ctx.lineWidth = 4; ctx.strokeStyle = "rgba(74,222,128,0.95)";
        if (settings.quality !== "low") { ctx.shadowColor = "#4ade80"; ctx.shadowBlur = 24; }
        ctx.beginPath(); ctx.arc(0, 0, sr, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0; ctx.globalAlpha = 0.85; ctx.lineWidth = 5; ctx.strokeStyle = "#bbf7d0";
        ctx.setLineDash([12, 16]); ctx.lineDashOffset = frame * 1.2;
        ctx.beginPath(); ctx.arc(0, 0, sr + 3, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }
    ctx.restore();
}
function drawParticles() {
    if (particles.length === 0) return;
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    const glowOk = settings.quality === "high" && particles.length < 90;
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.globalAlpha = clamp(p.life, 0, 1); ctx.fillStyle = p.color;
        if (glowOk) { ctx.shadowColor = p.color; ctx.shadowBlur = 10; }
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.4, p.size), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}
function drawWeather() {
    if (!settings.weather || weather.cur === "clear" || weather.fade <= 0.01) return;
    const f = weather.fade;
    if (weather.cur === "rain" || weather.cur === "storm") {
        ctx.save(); ctx.globalAlpha = 0.55 * f; ctx.strokeStyle = "#a5b4fc"; ctx.lineWidth = 1; ctx.beginPath();
        for (let i = 0; i < weather.drops.length; i++) { const d = weather.drops[i]; ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.l * 0.2, d.y + d.l); }
        ctx.stroke(); ctx.restore();
    }
    if (weather.cur === "snow") {
        ctx.save(); ctx.globalAlpha = 0.85 * f; ctx.fillStyle = "#fff";
        for (let i = 0; i < weather.flakes.length; i++) { const s = weather.flakes[i]; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
    }
    if (weather.cur === "fog") {
        const tint = currentMapId === "dubai" ? "235,200,150" : "200,210,225";
        for (let i = 0; i < 3; i++) {
            const y = H * (0.28 + i * 0.22) + Math.sin((frame + i * 90) * 0.012) * 22;
            const g = ctx.createLinearGradient(0, y - 70, 0, y + 70);
            g.addColorStop(0, "rgba(" + tint + ",0)"); g.addColorStop(0.5, "rgba(" + tint + "," + (0.2 * f) + ")"); g.addColorStop(1, "rgba(" + tint + ",0)");
            ctx.fillStyle = g; ctx.fillRect(0, y - 70, W, 140);
        }
    }
    if (weather.cur === "storm") {
        if (weather.flash > 0) { ctx.fillStyle = "rgba(255,255,255," + (weather.flash * f) + ")"; ctx.fillRect(0, 0, W, H); }
        if (weather.boltT > 0 && weather.bolt) {
            ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2.5; ctx.beginPath();
            weather.bolt.forEach(function (p, i) { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
            ctx.stroke(); ctx.restore();
        }
    }
}
function drawEventFX() {
    if (!ev) return;
    const a = ev.a;
    if (ev.type === "speedStorm") {
        ctx.save(); ctx.strokeStyle = "rgba(186,230,253," + (0.5 * a) + ")"; ctx.lineWidth = 1.5; ctx.beginPath();
        for (let i = 0; i < 9; i++) { const y = (i * 67 + frame * 7) % (H - 40), x = ((i * 131) - frame * 24) % (W + 120); const xx = x < 0 ? x + W + 120 : x; ctx.moveTo(xx, y); ctx.lineTo(xx + 50, y); }
        ctx.stroke(); ctx.restore();
    } else if (ev.type === "goldRush") {
        ctx.fillStyle = "rgba(250,204,21," + (0.08 * a) + ")"; ctx.fillRect(0, 0, W, H);
    } else if (ev.type === "police") {
        const red = ((frame >> 4) & 1) === 0;
        const g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, red ? "rgba(239,68,68," + (0.3 * a) + ")" : "rgba(59,130,246," + (0.3 * a) + ")"); g.addColorStop(0.35, "rgba(0,0,0,0)");
        g.addColorStop(0.65, "rgba(0,0,0,0)"); g.addColorStop(1, red ? "rgba(59,130,246," + (0.3 * a) + ")" : "rgba(239,68,68," + (0.3 * a) + ")");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else if (ev.type === "blackout") {
        const px = plane.x + plane.w / 2, py = plane.y + plane.h / 2;
        const g = ctx.createRadialGradient(px, py, 90, px, py, 260);
        g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0," + (0.82 * a) + ")");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
}
function drawVignette() {
    const m = MODE();
    ctx.save(); ctx.lineWidth = 4; ctx.strokeStyle = m.color; ctx.globalAlpha = (currentModeId === "classic") ? 0 : (currentModeId === "nightmare" ? 0.35 + 0.2 * Math.sin(colorTimer * 0.08) : 0.35);
    if (ctx.globalAlpha > 0) ctx.strokeRect(2, 2, W - 4, H - 4);
    ctx.restore();
    if (combo >= 10) { ctx.save(); ctx.globalAlpha = Math.min(0.35, 0.08 + combo * 0.006); ctx.lineWidth = 6; ctx.strokeStyle = "#fb923c"; ctx.strokeRect(3, 3, W - 6, H - 6); ctx.restore(); }
}
function drawHUD() {
    ctx.save();
    ctx.fillStyle = "rgba(2,6,23,0.5)"; ctx.fillRect(0, 0, W, 48);
    const need = xpNeeded(playerLevel);
    ctx.font = "bold 12px Arial"; ctx.fillStyle = "#fbbf24"; ctx.textBaseline = "alphabetic";
    T("⭐ Lv " + playerLevel, 8, 15, "left");
    ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(8, 20, 86, 6);
    ctx.fillStyle = "#38bdf8"; ctx.fillRect(8, 20, 86 * clamp(playerXP / need, 0, 1), 6);
    ctx.font = "9px Arial"; ctx.fillStyle = "#cbd5e1"; T(Math.floor(playerXP) + "/" + need + " XP", 100, 27, "left");
    ctx.font = "12px Arial"; let hearts = ""; for (let i = 0; i < plane.lives; i++) hearts += "❤️"; T(hearts, 8, 43, "left");
    // Combo (وسط)
    if (combo >= 2) {
        const sc = 1 + comboPulse * 0.35;
        ctx.save(); ctx.translate(W / 2 + 10, 26); ctx.scale(sc, sc);
        ctx.font = "bold 20px Arial"; ctx.fillStyle = combo >= 10 ? "#fb923c" : "#fde047";
        if (settings.quality !== "low") { ctx.shadowColor = "#f97316"; ctx.shadowBlur = 10; }
        ctx.textBaseline = "middle"; T("🔥 x" + combo, 0, 0, "center");
        ctx.restore();
    }
    // النقاط والعملات (يمين)
    ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.shadowBlur = 6; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#fff"; ctx.font = "bold 17px Arial"; T("النقاط: " + score, W - 10, 20, "right", "rtl");
    ctx.fillStyle = "#fbbf24"; ctx.font = "bold 15px Arial"; T("🪙 " + sessionCoins, W - 10, 40, "right");
    ctx.shadowBlur = 0;
    // مؤقتات القدرات (يمين، تحت الشريط)
    const chips = [];
    ["magnet", "turbo", "freeze", "multi"].forEach(function (k) { if (pw[k] > 0) chips.push([k, pw[k] / POWERUPS[k].dur]); });
    if (hasShield) chips.push(["shield", 1]);
    let cy = 54;
    chips.forEach(function (c) {
        const def = POWERUPS[c[0]];
        ctx.fillStyle = "rgba(2,6,23,0.55)"; rr(W - 84, cy, 76, 16, 8); ctx.fill();
        ctx.font = "11px Arial"; ctx.fillStyle = "#fff"; ctx.textBaseline = "middle"; T(def.icon, W - 80, cy + 8.5, "left");
        ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(W - 62, cy + 5, 48, 6);
        ctx.fillStyle = def.color; ctx.fillRect(W - 62, cy + 5, 48 * clamp(c[1], 0, 1), 6);
        cy += 19;
    });
    // شريط الأرض: وضع/مدينة + زر إيقاف
    ctx.textBaseline = "middle"; ctx.font = "bold 11px Arial"; ctx.fillStyle = MODE().color;
    T(MODE().icon + " " + MODE().name + "  " + CITY().icon + " " + CITY().name + "  ×" + rewardMult().toFixed(2), W / 2 + 14, H - 15, "center");
    ctx.font = "16px Arial"; ctx.fillStyle = "#fff"; T(paused ? "▶" : "⏸", 18, H - 15, "center");
    ctx.restore();
}
function drawBanner() {
    if (!banner) return;
    const p = banner.t / banner.dur;
    const a = p < 0.15 ? p / 0.15 : (p > 0.8 ? (1 - p) / 0.2 : 1);
    const sc = p < 0.15 ? 0.7 + 0.3 * (p / 0.15) : 1;
    ctx.save(); ctx.globalAlpha = clamp(a, 0, 1); ctx.translate(W / 2, 118); ctx.scale(sc, sc);
    ctx.font = "bold 24px Arial"; ctx.fillStyle = banner.color; ctx.textBaseline = "middle";
    if (settings.quality !== "low") { ctx.shadowColor = banner.color; ctx.shadowBlur = 16; }
    T(banner.text, 0, 0, "center");
    if (banner.sub) { ctx.shadowBlur = 0; ctx.font = "bold 14px Arial"; ctx.fillStyle = "#fff"; T(banner.sub, 0, 26, "center"); }
    ctx.restore();
}
function drawBossWarning() {
    if (!boss || boss.phase !== "warn") return;
    const blink = ((boss.t >> 3) & 1) === 0;
    ctx.save();
    ctx.fillStyle = "rgba(239,68,68," + (blink ? 0.12 : 0.04) + ")"; ctx.fillRect(0, 0, W, H);
    ctx.font = "bold 28px Arial"; ctx.textBaseline = "middle"; ctx.fillStyle = blink ? "#ef4444" : "#fecaca";
    if (settings.quality !== "low") { ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 20; }
    T("⚠️ WARNING ⚠️", W / 2, H * 0.3, "center");
    ctx.shadowBlur = 0; ctx.font = "bold 16px Arial"; ctx.fillStyle = "#fff"; T(boss.def.icon + " " + boss.def.name + " INCOMING", W / 2, H * 0.3 + 32, "center");
    ctx.restore();
}
function draw() {
    ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
    ctx.direction = "ltr";
    const inGame = (state === "playing" || state === "over");
    ctx.save();
    if (shakeTimer > 0 && settings.shake) ctx.translate((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14);
    drawBackground();
    if (inGame) {
        drawBuildings(); drawHazards();
        drawCoins(); drawPowerups(); drawBoss(); drawTrails(); drawPlane(); drawParticles(); drawTapRing();
        drawWeather(); drawEventFX(); drawVignette();
        if (flashAlpha > 0) { ctx.fillStyle = "rgba(255,140,0," + flashAlpha + ")"; ctx.fillRect(0, 0, W, H); }
    }
    // الأرض (الأصلية)
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "#090d16"; ctx.fillRect(0, H - 30, W, 30);
    ctx.strokeStyle = "rgba(251,191,36,0.3)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, H - 30); ctx.lineTo(W, H - 30); ctx.stroke();
    ctx.restore();
    if (inGame) {
        drawHUD(); drawBossWarning(); drawBanner();
        if (paused) {
            ctx.fillStyle = "rgba(2,6,23,0.7)"; ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = "#fbbf24"; ctx.font = "bold 28px Arial"; ctx.textBaseline = "middle"; T("⏸ PAUSED", W / 2, H / 2 - 12, "center");
            ctx.fillStyle = "#fff"; ctx.font = "14px Arial"; T("اضغط للمتابعة", W / 2, H / 2 + 22, "center", "rtl");
        }
    }
}
function renderIdle() { if (!running) { try { draw(); } catch (e) {} } }
function drawTapRing() {
    if (!tapRing) return;
    const pr = tapRing.t / 18;
    ctx.save();
    ctx.globalAlpha = 1 - pr;
    ctx.strokeStyle = "#7dd3fc"; ctx.lineWidth = 3;
    if (settings.quality !== "low") { ctx.shadowColor = "#38bdf8"; ctx.shadowBlur = 12; }
    ctx.beginPath(); ctx.arc(tapRing.x, tapRing.y, 8 + pr * 36, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}
function drawHazards() {
    if (hazards.length === 0) return;
    for (let i = 0; i < hazards.length; i++) {
        const h = hazards[i];
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rot);
        ctx.fillStyle = "#ef4444";
        if (settings.quality !== "low") { ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 14; }
        const spikes = 8;
        ctx.beginPath();
        for (let s = 0; s < spikes * 2; s++) {
            const ang = (Math.PI / spikes) * s;
            const rad = (s % 2 === 0) ? h.r : h.r * 0.5;
            const px = Math.cos(ang) * rad, py = Math.sin(ang) * rad;
            if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#7f1d1d";
        ctx.beginPath(); ctx.arc(0, 0, h.r * 0.32, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#fca5a5"; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
    }
}

