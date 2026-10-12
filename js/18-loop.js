/* =====================================================================
   SECTION 18: Game Over screen + main loop + input
   ===================================================================== */
function showGameOver() {
    $("goScore").innerText = score;
    $("goBest").innerText = highScore;
    $("goCoins").innerText = "+" + runCoins + " 🪙";
    $("goXP").innerText = "+" + runXP + " XP";
    $("goCombo").innerText = "x" + bestComboRun;
    $("goDist").innerText = Math.floor(distance / 10) + " m";
    $("goMode").innerText = MODE().icon + " " + MODE().name;
    $("goCity").innerText = CITY().icon + " " + CITY().name;
    $("goNew").innerText = wasNewRecord ? "🔥 ممتاز! رقم قياسي جديد!" : "💪 استمر في التقدم لتكسير الرقم!";
    $("goNew").style.color = wasNewRecord ? "#4ade80" : "#94a3b8";
    showScreen("gameOverScreen");
}
function startLoop() {
    if (loopId) cancelAnimationFrame(loopId);
    lastTs = 0; acc = 0; running = true;
    loopId = requestAnimationFrame(loop);
}
function loop(ts) {
    if (!running) { loopId = 0; try { draw(); } catch (e) {} return; }
    loopId = requestAnimationFrame(loop);
    if (!lastTs) lastTs = ts;
    let dt = ts - lastTs; lastTs = ts;
    if (dt > 100) dt = 100;
    acc += dt;
    let steps = 0;
    while (acc >= STEP && steps < 3) { if (!paused) update(); acc -= STEP; steps++; }
    if (steps >= 3) acc = 0;
    draw();
}

function canvasPoint(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (W / (r.width || W)), y: (e.clientY - r.top) * (H / (r.height || H)) };
}
canvas.addEventListener("pointerdown", function (e) {
    e.preventDefault(); unlockAudio();
    if (state !== "playing") return;
    const p = canvasPoint(e);
    if (p.x < 44 && p.y > H - 32) { pauseGame(!paused); return; }   // زر الإيقاف
    if (paused) { pauseGame(false); return; }
    jump();
    tapRing = { x: p.x, y: p.y, t: 0 };
});
canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });
window.addEventListener("keydown", function (e) {
    if (e.code === "Space" || e.code === "ArrowUp") {
        if (state === "playing") { e.preventDefault(); if (paused) pauseGame(false); else { jump(); tapRing = { x: plane.x + plane.w / 2, y: plane.y + plane.h / 2, t: 0 }; } }
        else if (state === "intro") { e.preventDefault(); skipIntro(); }
        else if (e.code === "Space" && activeScreen !== "nameScreen") e.preventDefault();
    } else if (e.code === "KeyP" || e.code === "Escape") {
        if (state === "playing") pauseGame(!paused);
    } else if (e.code === "Enter" && activeScreen === "nameScreen") saveUsername();
});
document.addEventListener("visibilitychange", function () { if (document.hidden && state === "playing" && !paused) pauseGame(true); });
window.addEventListener("blur", function () { if (state === "playing" && !paused) pauseGame(true); });
window.addEventListener("resize", function () { resizeCanvas(); renderIdle(); });
window.addEventListener("orientationchange", function () { setTimeout(function () { resizeCanvas(); renderIdle(); }, 200); });
document.addEventListener("pointerdown", unlockAudio);
// صوت نقر على أي زر
document.addEventListener("click", function (e) {
    const t = e.target;
    if (t && t.closest && t.closest("button")) sfx("click");
});

