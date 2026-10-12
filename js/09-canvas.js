/* =====================================================================
   SECTION 9: Canvas sizing, backdrop cache, stars, skyline
   ===================================================================== */
function resizeCanvas() {
    const cont = $("game-container");
    const cw = cont.clientWidth || W, ch = cont.clientHeight || H;
    const sc = Math.min(cw / W, ch / H) || 1;
    canvas.style.width = Math.floor(W * sc) + "px";
    canvas.style.height = Math.floor(H * sc) + "px";
    canvas._cssScale = sc;
    applyQuality();
}
function applyQuality() {
    const cap = settings.quality === "low" ? 1 : (settings.quality === "medium" ? 1.5 : 2);
    const want = clamp((canvas._cssScale || 1) * (window.devicePixelRatio || 1), 1, cap);
    const rs = Math.round(want * 4) / 4;
    if (rs !== renderScale || canvas.width !== Math.round(W * rs)) {
        renderScale = rs;
        canvas.width = Math.round(W * rs); canvas.height = Math.round(H * rs);
        renderBackdrop();
    }
}
function initStars() {
    stars = [];
    for (let i = 0; i < 50; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, size: Math.random() * 2.5 + 0.5, speed: Math.random() * 0.8 + 0.2, alpha: Math.random() * 0.8 + 0.2, ph: Math.random() * 6.28 });
}
function buildSkyline() {
    skyline = []; let x = -20;
    while (x < W + 80) { const w = rand(26, 52), h = rand(60, 200); skyline.push({ x: x, w: w, h: h, neon: Math.random() < 0.3 }); x += w + rand(2, 10); }
    skylineW = x + 20;
}
function drawEiffel(c, x, base, hg) {
    c.fillStyle = "#0a0f1f";
    c.beginPath();
    c.moveTo(x - hg * 0.28, base); c.quadraticCurveTo(x - hg * 0.05, base - hg * 0.45, x - hg * 0.025, base - hg);
    c.lineTo(x + hg * 0.025, base - hg); c.quadraticCurveTo(x + hg * 0.05, base - hg * 0.45, x + hg * 0.28, base);
    c.lineTo(x + hg * 0.2, base); c.quadraticCurveTo(x, base - hg * 0.26, x - hg * 0.2, base); c.closePath(); c.fill();
    c.fillRect(x - hg * 0.12, base - hg * 0.42, hg * 0.24, 4); c.fillRect(x - hg * 0.07, base - hg * 0.7, hg * 0.14, 3);
    c.strokeStyle = "rgba(250,204,21,0.45)"; c.lineWidth = 1.2; c.stroke();
}
function renderBackdrop() {
    if (!bgCache) bgCache = document.createElement("canvas");
    bgCache.width = Math.round(W * renderScale); bgCache.height = Math.round(H * renderScale);
    const c = bgCache.getContext("2d"); if (!c) return;
    c.setTransform(renderScale, 0, 0, renderScale, 0, 0);
    const ct = CITY();
    const g = c.createLinearGradient(0, 0, 0, H);
    const stops = [0, 0.3, 0.65, 1];
    for (let i = 0; i < 4; i++) g.addColorStop(stops[i], ct.sky[i]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    if (ct.id === "dubai") {
        const rg = c.createRadialGradient(290, H - 150, 5, 290, H - 150, 190);
        rg.addColorStop(0, "rgba(254,240,138,0.95)"); rg.addColorStop(0.3, "rgba(251,146,60,0.45)"); rg.addColorStop(1, "rgba(251,146,60,0)");
        c.fillStyle = rg; c.fillRect(0, 0, W, H);
        c.fillStyle = "rgba(30,12,4,0.85)"; c.beginPath();
        c.moveTo(66, H - 30); c.lineTo(72, H - 200); c.lineTo(78, H - 260); c.lineTo(83, H - 330); c.lineTo(86, H - 400); c.lineTo(88, H - 450);
        c.lineTo(90, H - 400); c.lineTo(93, H - 330); c.lineTo(98, H - 260); c.lineTo(104, H - 200); c.lineTo(110, H - 30); c.closePath(); c.fill();
    } else if (ct.id === "tokyo") {
        const rg = c.createRadialGradient(300, 130, 4, 300, 130, 130);
        rg.addColorStop(0, "rgba(244,114,182,0.9)"); rg.addColorStop(0.25, "rgba(190,24,93,0.35)"); rg.addColorStop(1, "rgba(190,24,93,0)");
        c.fillStyle = rg; c.fillRect(0, 0, W, H);
        c.fillStyle = "#6b0f1a"; c.beginPath(); c.moveTo(90, H - 30); c.lineTo(115, H - 300); c.lineTo(121, H - 300); c.lineTo(146, H - 30); c.closePath(); c.fill();
        c.strokeStyle = "rgba(255,255,255,0.5)"; c.lineWidth = 1.5; c.beginPath();
        for (let i = 1; i < 6; i++) { const yy = H - 30 - i * 45; const half = 28 - i * 4; c.moveTo(118 - half, yy); c.lineTo(118 + half, yy); }
        c.stroke();
    } else if (ct.id === "paris") {
        const rg = c.createRadialGradient(320, 110, 6, 320, 110, 90);
        rg.addColorStop(0, "rgba(254,249,195,0.95)"); rg.addColorStop(0.3, "rgba(254,249,195,0.3)"); rg.addColorStop(1, "rgba(254,249,195,0)");
        c.fillStyle = rg; c.fillRect(0, 0, W, H);
        c.fillStyle = "#fef9c3"; c.beginPath(); c.arc(320, 110, 22, 0, Math.PI * 2); c.fill();
        drawEiffel(c, 120, H - 30, 330);
    }
}

/* ===== وضع العرض: حاسوب (عريض) / هاتف (طولي) ===== */
function resolveDisplay() {
    if (settings.display === "pc" || settings.display === "phone") return settings.display;
    var touch = (navigator.maxTouchPoints || 0) > 0 || ("ontouchstart" in window);
    var narrow = window.innerHeight >= window.innerWidth;
    return (touch && narrow) ? "phone" : "pc";
}
function applyDisplay() {
    var root = document.documentElement;
    var mode = resolveDisplay();
    root.classList.remove("mode-pc", "mode-phone");
    root.classList.add(mode === "phone" ? "mode-phone" : "mode-pc");
    resizeCanvas(); renderIdle();
}

