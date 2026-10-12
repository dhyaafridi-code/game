/* =====================================================================
   SECTION 4: Audio (الملفات الموجودة + صوتيات احتياطية مولّدة — لا تتعطل أبداً)
   ===================================================================== */
const bgMusic = $("bgMusic");
const musicTitleDisplay = $("musicTitleDisplay");
const explosionSound = $("explosionSound");
const coinSound = $("coinSound");
bgMusic.addEventListener("error", function () {});
let actx = null;
function getActx() {
    if (actx) return actx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { actx = new AC(); } catch (e) { actx = null; }
    return actx;
}
function unlockAudio() { const c = getActx(); if (c && c.state === "suspended" && c.resume) { try { c.resume(); } catch (e) {} } }
function tone(freq, t0, dur, type, vol) {
    const c = getActx(); if (!c || settings.sfx <= 0) return;
    try {
        const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
        o.type = type || "sine"; o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * settings.sfx), t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.03);
    } catch (e) {}
}
function noiseBurst(dur, vol) {
    const c = getActx(); if (!c || settings.sfx <= 0) return;
    try {
        const n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
        const s = c.createBufferSource(), g = c.createGain();
        g.gain.value = vol * settings.sfx; s.buffer = buf; s.connect(g); g.connect(c.destination); s.start();
    } catch (e) {}
}
const SYNTH = {
    click: function () { tone(900, 0, 0.05, "square", 0.05); },
    coin: function () { tone(988, 0, 0.08, "triangle", 0.12); tone(1319, 0.07, 0.12, "triangle", 0.12); },
    explosion: function () { noiseBurst(0.7, 0.5); tone(80, 0, 0.5, "sawtooth", 0.15); },
    powerup: function () { tone(440, 0, 0.1, "sine", 0.14); tone(660, 0.08, 0.1, "sine", 0.14); tone(880, 0.16, 0.16, "sine", 0.14); },
    levelup: function () { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, i * 0.1, 0.2, "triangle", 0.16); }); },
    achievement: function () { [784, 988, 1175].forEach(function (f, i) { tone(f, i * 0.12, 0.25, "square", 0.08); }); },
    combo: function () { tone(660, 0, 0.09, "square", 0.07); tone(880, 0.08, 0.12, "square", 0.07); },
    boss: function () { for (let i = 0; i < 4; i++) tone(i % 2 ? 180 : 240, i * 0.22, 0.2, "sawtooth", 0.12); },
    mission: function () { tone(660, 0, 0.1, "sine", 0.14); tone(880, 0.1, 0.1, "sine", 0.14); tone(1100, 0.2, 0.2, "sine", 0.14); },
    life: function () { tone(300, 0, 0.12, "sine", 0.14); tone(500, 0.1, 0.18, "sine", 0.14); },
    intro: function () { tone(60, 0, 0.9, "sawtooth", 0.1); tone(120, 0.5, 0.6, "triangle", 0.1); }
};
function synth(name) { try { const f = SYNTH[name]; if (f) f(); } catch (e) {} }
// Hooks لملفات صوتية اختيارية — إن لم توجد يتم استخدام الصوت المولّد
const SFX_FILES = { click: "assets/audio/click_sound.mp3", powerup: "assets/audio/powerup_sound.mp3", levelup: "assets/audio/levelup_sound.mp3", achievement: "assets/audio/achievement_sound.mp3", combo: "assets/audio/combo_sound.mp3", boss: "assets/audio/boss_warning.mp3", mission: "assets/audio/mission_sound.mp3" };
const sfxAudio = {}, sfxFailed = {};
function sfx(name) {
    if (settings.sfx <= 0) return;
    const f = SFX_FILES[name];
    if (f && !sfxFailed[name]) {
        try {
            let a = sfxAudio[name];
            if (!a) { a = new Audio(); a.preload = "auto"; a.onerror = function () { sfxFailed[name] = true; }; a.src = f; sfxAudio[name] = a; }
            a.volume = settings.sfx; a.currentTime = 0;
            const p = a.play();
            if (p && p.catch) p.catch(function () { synth(name); });
            return;
        } catch (e) {}
    }
    synth(name);
}
function playEl(el, name) {
    if (settings.sfx <= 0) return;
    try {
        el.currentTime = 0;
        const p = el.play();
        if (p && p.catch) p.catch(function () { synth(name); });
    } catch (e) { synth(name); }
}
function applyVolumes() {
    bgMusic.volume = settings.music;
    explosionSound.volume = settings.sfx;
    coinSound.volume = settings.sfx * 0.85;
}
function updateMusicBar() {
    musicTitleDisplay.innerText = MUSIC_TRACKS[currentMusicIdx].name;
    bgMusic.src = MUSIC_TRACKS[currentMusicIdx].file;
    lsSetRaw("boeingMusicIdx", currentMusicIdx);
}
function nextMusic() { currentMusicIdx = (currentMusicIdx + 1) % MUSIC_TRACKS.length; updateMusicBar(); }
function prevMusic() { currentMusicIdx = (currentMusicIdx - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length; updateMusicBar(); }
function playMusic() { try { applyVolumes(); const p = bgMusic.play(); if (p && p.catch) p.catch(function (e) { console.log("Audio play blocked by browser:", e); }); } catch (e) {} }

