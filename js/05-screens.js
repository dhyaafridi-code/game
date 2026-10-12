/* =====================================================================
   SECTION 5: Screens / navigation
   ===================================================================== */
function showScreen(id) {
    const list = document.querySelectorAll(".overlay");
    for (let i = 0; i < list.length; i++) list[i].classList.add("hidden");
    activeScreen = id || "";
    if (id) $(id).classList.remove("hidden");
}
function openMain() {
    state = (state === "playing" || state === "intro") ? state : "menu";
    updateMenuInfo(); showScreen("mainMenu"); renderIdle();
}
function updateMenuInfo() {
    $("welcomeUserText").innerText = "👤 الكابتن: " + playerName;
    const need = xpNeeded(playerLevel);
    $("menuLevel").innerText = "⭐ Level " + playerLevel;
    $("menuXpText").innerText = Math.floor(playerXP) + " / " + need + " XP";
    $("menuXpFill").style.width = clamp(playerXP / need * 100, 0, 100) + "%";
    $("menuCoins").innerText = "🪙 " + totalCoins;
    $("menuSelection").innerText = MODE().icon + " " + MODE().name + "  •  " + CITY().icon + " " + CITY().name + "  •  ×" + rewardMult().toFixed(2) + " مكافآت";
    const n = claimableMissions();
    const b = $("missionBadge");
    if (n > 0) { b.innerText = n; b.classList.remove("hidden"); } else b.classList.add("hidden");
}
function saveUsername() {
    const inputVal = $("usernameInput").value.trim();
    if (inputVal === "") { alert("من فضلك اكتب اسمك للبدء!"); return; }
    playerName = inputVal;
    lsSetRaw("boeingPlayerName", playerName);
    openMain();
}
function changeName() { $("usernameInput").value = playerName; showScreen("nameScreen"); }

/* ---- لوحة الصدارة (الأصلية) ---- */
function defaultBoard() { return [{ name: "Ayoub", score: 20 }, { name: "Karim", score: 10 }, { name: "Sami", score: 5 }]; }
function getBoard() { const b = lsGet("boeingLeaderboard", null); return Array.isArray(b) ? b : defaultBoard(); }
function openLeaderboard() {
    showScreen("leaderboardScreen");
    const leaderboard = getBoard();
    const listContainer = $("leaderboardList");
    listContainer.innerHTML = "";
    leaderboard.sort(function (a, b) { return b.score - a.score; });
    leaderboard.forEach(function (entry, idx) {
        const item = document.createElement("div");
        const rankClass = idx === 0 ? "top-1" : (idx === 1 ? "top-2" : (idx === 2 ? "top-3" : ""));
        item.className = "leaderboard-item " + rankClass + (entry.name === playerName ? " me" : "");
        const a = document.createElement("span"); a.textContent = "#" + (idx + 1) + " - " + entry.name;
        const b = document.createElement("span"); b.style.cssText = "font-weight:bold;color:#fbbf24;"; b.textContent = entry.score + " نقطة";
        item.appendChild(a); item.appendChild(b); listContainer.appendChild(item);
    });
}
function closeLeaderboard() { openMain(); }
function updateLeaderboardData(newScore) {
    if (!playerName || newScore <= 0) return;
    const leaderboard = getBoard();
    const existingUser = leaderboard.find(function (item) { return item.name === playerName; });
    if (existingUser) { if (newScore > existingUser.score) existingUser.score = newScore; }
    else leaderboard.push({ name: playerName, score: newScore });
    leaderboard.sort(function (a, b) { return b.score - a.score; });
    lsSet("boeingLeaderboard", leaderboard.slice(0, 50));
}

/* ---- Toasts / Level banner ---- */
function toast(text, cls) {
    const layer = $("toastLayer");
    const d = document.createElement("div");
    d.className = "toast " + (cls || ""); d.textContent = text;
    layer.appendChild(d);
    while (layer.children.length > 3) layer.removeChild(layer.firstChild);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 2700);
}
let lvlTimer = 0;
function showLevelUp(lv, coinsGot) {
    const el = $("levelBanner");
    $("levelBannerSub").textContent = "Level " + lv + "  •  +" + coinsGot + " 🪙";
    el.classList.remove("hidden"); el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
    clearTimeout(lvlTimer); lvlTimer = setTimeout(function () { el.classList.add("hidden"); }, 2400);
}

