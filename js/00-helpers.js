/* =====================================================================
   Boeing NYC Cinematic Edition — ULTIMATE
   SECTION 0: Helpers & constants
   ===================================================================== */
const W = 400, H = 600;            // أبعاد اللعبة المنطقية (ثابتة)
const SPACING = 264;               // المسافة بين المباني (نفس الأصل: 120 فريم × 2.2)
const STEP = 1000 / 60;            // خطوة التحديث الثابتة (نفس السرعة على كل الشاشات)
function $(id) { return document.getElementById(id); }
function lsGet(k, d) { try { const v = localStorage.getItem(k); if (v === null) return d; return JSON.parse(v); } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function lsGetRaw(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
function lsSetRaw(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function rand(a, b) { return a + Math.random() * (b - a); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

