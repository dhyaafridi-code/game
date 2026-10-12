/* =====================================================================
   SECTION 14: Random events
   ===================================================================== */
function startEvent() {
    const keys = Object.keys(EVENTS).filter(function (k) { return k !== lastEv; });
    const t = pick(keys); lastEv = t;
    ev = { type: t, t: 0, dur: EVENTS[t].dur, a: 0 };
    setBanner(EVENTS[t].icon + " " + EVENTS[t].name, "", EVENTS[t].color, 110);
    sfx("combo");
}
function endEvent() {
    sessionCoins += 3; missionUpdate("coins", 3); addXP(6, true);
    ev = null;
    evTimer = Math.floor(rand(1100, 1900) * MODE().evGap);
}
function updateEvents() {
    if (ev) {
        ev.t++; ev.a = Math.min(1, ev.a + 0.04);
        if (ev.t > ev.dur - 30) ev.a = Math.max(0, ev.a - 0.06);
        if (ev.type === "coinRain" && ev.t % 9 === 0 && coins.length < 40) coins.push({ x: rand(120, W), y: -10, vy: 2.4, radius: 12, collected: false, gold: false });
        if (ev.type === "celebration" && ev.t % 45 === 1 && settings.particles) {
            const fx = rand(60, 340), fy = rand(60, 260), col = "hsl(" + Math.floor(rand(0, 360)) + ",100%,65%)";
            const n = Math.floor(26 * qf());
            for (let i = 0; i < n && particles.length < maxParticles(); i++) {
                const a = (i / n) * Math.PI * 2, s = rand(2, 4.5);
                particles.push({ x: fx, y: fy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: col, life: 1.2, size: 2.6, friction: 0.97, g: 0.05, decay: 0.012 });
            }
        }
        if (ev.t >= ev.dur) endEvent();
    } else if (!boss) {
        evTimer--;
        if (evTimer <= 0 && !(boss) && score >= 3) startEvent();
    }
}

