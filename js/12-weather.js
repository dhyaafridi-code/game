/* =====================================================================
   SECTION 12: Weather
   ===================================================================== */
function pickWeather(initial) {
    if (!settings.weather) { weather.cur = "clear"; weather.pending = null; weather.fade = 0; weather.timer = 600; return; }
    const w = CITY().weights; const list = [];
    Object.keys(w).forEach(function (k) { if (w[k] > 0) list.push([k, w[k]]); });
    let t = pickWeighted(list);
    if (initial && t !== "clear" && Math.random() < 0.6) t = "clear";
    weather.timer = Math.floor(rand(1100, 2000));
    if (t !== weather.cur) {
        if (initial) { weather.cur = t; weather.pending = null; weather.fade = t === "clear" ? 0 : 1; }
        else { weather.pending = t; }
        if (t !== "clear" && !initial) setBanner(WEATHER_INFO[t], "", "#cbd5e1", 80);
    }
}
function ensureWeatherParticles() {
    const base = weather.cur === "storm" ? 90 : 55;
    const n = Math.floor(base * qf() * (settings.particles ? 1 : 0.5));
    if (weather.cur === "rain" || weather.cur === "storm") {
        while (weather.drops.length < n) weather.drops.push({ x: Math.random() * (W + 60), y: Math.random() * H, l: rand(8, 16), s: rand(9, 14) });
        if (weather.drops.length > n) weather.drops.length = n;
    }
    if (weather.cur === "snow") {
        const m = Math.floor(50 * qf() * (settings.particles ? 1 : 0.5));
        while (weather.flakes.length < m) weather.flakes.push({ x: Math.random() * W, y: Math.random() * H, r: rand(1.2, 3), s: rand(0.7, 1.8), ph: Math.random() * 6.28 });
        if (weather.flakes.length > m) weather.flakes.length = m;
    }
}
function updateWeather() {
    if (!settings.weather) { weather.cur = "clear"; weather.fade = 0; return; }
    weather.timer--;
    if (weather.timer <= 0 && !weather.pending) pickWeather(false);
    if (weather.pending) {
        weather.fade -= 0.02;
        if (weather.fade <= 0) { weather.cur = weather.pending; weather.pending = null; weather.fade = 0; weather.drops.length = 0; weather.flakes.length = 0; }
    } else if (weather.cur !== "clear" && weather.fade < 1) weather.fade = Math.min(1, weather.fade + 0.02);
    else if (weather.cur === "clear" && weather.fade > 0) weather.fade = Math.max(0, weather.fade - 0.02);
    if (weather.cur === "clear") return;
    ensureWeatherParticles();
    const wd = weather.drops;
    for (let i = 0; i < wd.length; i++) { const d = wd[i]; d.y += d.s; d.x -= d.s * 0.2; if (d.y > H || d.x < -20) { d.y = -20; d.x = Math.random() * (W + 60); } }
    const wf = weather.flakes;
    for (let i = 0; i < wf.length; i++) { const f = wf[i]; f.y += f.s; f.ph += 0.03; f.x += Math.sin(f.ph) * 0.5 - 0.3; if (f.y > H) { f.y = -5; f.x = Math.random() * W; } if (f.x < -5) f.x = W + 5; }
    if (weather.cur === "storm") {
        weather.lightT--;
        if (weather.lightT <= 0) {
            weather.flash = 0.35; weather.lightT = Math.floor(rand(240, 520));
            const pts = []; let bx = rand(60, 340), by = 0; pts.push([bx, by]);
            while (by < H * 0.55) { bx += rand(-22, 22); by += rand(30, 60); pts.push([bx, by]); }
            weather.bolt = pts; weather.boltT = 8;
            if (settings.sfx > 0) noiseBurst(0.5, 0.18);
        }
    }
    if (weather.flash > 0) weather.flash = Math.max(0, weather.flash - 0.02);
    if (weather.boltT > 0) weather.boltT--;
}

