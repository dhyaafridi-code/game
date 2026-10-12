/* =====================================================================
   SECTION 3: Run state (متغيرات اللعبة)
   ===================================================================== */
const canvas = $("gameCanvas");
const ctx = canvas.getContext("2d");
let renderScale = 1, bgCache = null;
let state = "menu";               // menu | intro | playing | over
let isPlaying = false, isOver = false, paused = false;
let running = false, loopId = 0, lastTs = 0, acc = 0;

let plane = { x: 70, y: 250, w: 85, h: 40, gravity: 0.32, lift: -6.8, velocity: 0, invuln: 0, lives: 1 };
let buildings = [], hazards = [], coins = [], powerups = [], stars = [], particles = [], rocketParticles = [], trailParticles = [], skyline = [], skylineW = 0;
let bWidth = 65, bGap = 200, curGap = 200;
let score = 0, sessionCoins = 0, frame = 0, colorTimer = 0, distance = 0;
let hasShield = false;
let explosionTriggered = false, shakeTimer = 0, flashAlpha = 0, deathTimer = 0;
let runEnded = false, saved = false, overShown = false;
let combo = 0, bestComboRun = 0, comboPulse = 0;
let pw = { magnet: 0, turbo: 0, freeze: 0, multi: 0 };
let puSince = 0, spawnDist = 0;
let boss = null, bossCount = 0, nextBossScore = 25;
let ev = null, evTimer = 800, lastEv = "";
let banner = null;
let runXP = 0, runCoins = 0, wasNewRecord = false, runPowerups = 0;
let passMult = 1, passCap = Math.min(1 + score * 0.0017 + score * score * 0.000005, 9);   // سقف تسريع passing (أقصى 9x)
let weather = { cur: "clear", pending: null, fade: 0, timer: 900, drops: [], flakes: [], flash: 0, lightT: 300, bolt: null, boltT: 0 };
let loadedImages = [];
let shopTab = "planes";
let shopSel = { planes: 0, skins: 0, trails: 0 };
let introTimers = [];
let activeScreen = "";
let tapRing = null, hazTimer = 0;

function CITY() { return CITIES[currentMapId]; }
function MODE() { return MODES[currentModeId]; }
function rewardMult() { return MODE().reward * CITY().reward; }
function qf() { return settings.quality === "low" ? 0.4 : (settings.quality === "medium" ? 0.7 : 1); }
function currentSkin() { for (let i = 0; i < SKINS.length; i++) if (SKINS[i].id === skinsData.selected) return SKINS[i]; return SKINS[0]; }
function currentTrail() { for (let i = 0; i < TRAILS.length; i++) if (TRAILS[i].id === trailsData.selected) return TRAILS[i]; return TRAILS[0]; }

