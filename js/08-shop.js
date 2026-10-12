/* =====================================================================
   SECTION 8: Shop (Planes / Skins / Trails)
   ===================================================================== */
let notificationTimeout;
function showNotification(text) {
    const notif = $("shopNotification");
    notif.innerText = text; notif.classList.remove("hidden"); notif.style.opacity = "1";
    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(function () { notif.style.opacity = "0"; setTimeout(function () { notif.classList.add("hidden"); }, 300); }, 2200);
}
function setShopTab(t) { shopTab = t; updateShopUI(); }
function updateShopUI() {
    $("totalCoinsDisplay").innerText = "🪙 رصيدك: " + totalCoins;
    $("tabPlanes").classList.toggle("active", shopTab === "planes");
    $("tabSkins").classList.toggle("active", shopTab === "skins");
    $("tabTrails").classList.toggle("active", shopTab === "trails");
    const hints = { planes: "اختر طائرتك المفضلة وانطلق في سماء نيويورك المتوهجة!", skins: "الـ Skins تغيّر شكل وتوهج الطائرة فقط", trails: "الـ Trails تظهر خلف الطائرة أثناء الطيران" };
    $("shopHint").innerText = hints[shopTab];
    const grid = $("charsGrid"); grid.innerHTML = "";
    const addCard = function (idx, ico, name, rarity, line, owned, equipped, price, isImg) {
        const card = document.createElement("div");
        card.className = "char-card r-" + rarity + (idx === shopSel[shopTab] ? " selected" : "");
        card.innerHTML = (isImg ? '<img src="' + ico + '" alt="' + esc(name) + '" onerror="this.style.visibility=\'hidden\'">' : '<div class="big-ico">' + ico + '</div>') +
            '<div class="char-name">' + esc(name) + '</div>' +
            '<div class="rar-tag rar-' + rarity + '">' + RARITY[rarity].i + ' ' + RARITY[rarity].n + '</div>' +
            '<div class="char-perk">' + esc(line) + '</div>' +
            '<div class="char-status ' + (owned ? "status-owned" : "status-locked") + '">' + (owned ? (equipped ? "✓ مجهز" : "مملوكة") : "🔒 " + price + " 🪙") + '</div>';
        card.onclick = function () { shopSel[shopTab] = idx; updateShopUI(); };
        grid.appendChild(card);
    };
    let owned = false, price = 0;
    if (shopTab === "planes") {
        CHARACTERS.forEach(function (ch, idx) { addCard(idx, ch.file, ch.name, ch.rarity, ch.perk, unlockedChars[idx], idx === selectedIndex, ch.price, true); });
        owned = unlockedChars[shopSel.planes]; price = CHARACTERS[shopSel.planes].price;
    } else if (shopTab === "skins") {
        SKINS.forEach(function (s, idx) { addCard(idx, s.icon, s.name, s.rarity, s.desc, skinsData.owned.indexOf(s.id) >= 0, skinsData.selected === s.id, s.price, false); });
        const s = SKINS[shopSel.skins]; owned = skinsData.owned.indexOf(s.id) >= 0; price = s.price;
    } else {
        TRAILS.forEach(function (t, idx) { addCard(idx, t.icon, t.name, t.rarity, t.desc, trailsData.owned.indexOf(t.id) >= 0, trailsData.selected === t.id, t.price, false); });
        const t = TRAILS[shopSel.trails]; owned = trailsData.owned.indexOf(t.id) >= 0; price = t.price;
    }
    const btn = $("actionBtn");
    if (owned) { btn.innerText = "تجهيز"; btn.style.background = "#fbbf24"; }
    else { btn.innerText = "شراء بـ " + price + " 🪙"; btn.style.background = "#4ade80"; }
}
function openShop() {
    shopSel.planes = selectedIndex;
    shopSel.skins = Math.max(0, SKINS.findIndex(function (s) { return s.id === skinsData.selected; }));
    shopSel.trails = Math.max(0, TRAILS.findIndex(function (t) { return t.id === trailsData.selected; }));
    showScreen("shopScreen"); updateShopUI();
}
function closeShop() { openMain(); }
function handleShopAction() {
    if (shopTab === "planes") {
        const idx = shopSel.planes;
        if (unlockedChars[idx]) { selectedIndex = idx; lsSetRaw("boeingLastChar", idx); showNotification("✅ ازدم يا راجل زين! تم التجهيز"); }
        else {
            const price = CHARACTERS[idx].price;
            if (totalCoins >= price) {
                totalCoins -= price; unlockedChars[idx] = true; selectedIndex = idx;
                lsSet("boeingUnlocked", unlockedChars); lsSetRaw("boeingLastChar", idx); saveCoins();
                showNotification("🎉 مبروك! تم شراء الطائرة بنجاح");
            } else showNotification("❌ رصيدك غير كافٍ يا زعيم!");
        }
    } else if (shopTab === "skins") {
        const s = SKINS[shopSel.skins];
        if (skinsData.owned.indexOf(s.id) >= 0) { skinsData.selected = s.id; lsSet("boeingSkins", skinsData); showNotification("✅ تم تجهيز الـ Skin"); }
        else if (totalCoins >= s.price) { totalCoins -= s.price; skinsData.owned.push(s.id); skinsData.selected = s.id; lsSet("boeingSkins", skinsData); saveCoins(); showNotification("🎉 تم شراء الـ Skin"); }
        else showNotification("❌ رصيدك غير كافٍ يا زعيم!");
    } else {
        const t = TRAILS[shopSel.trails];
        if (trailsData.owned.indexOf(t.id) >= 0) { trailsData.selected = t.id; lsSet("boeingTrails", trailsData); showNotification("✅ تم تجهيز الـ Trail"); }
        else if (totalCoins >= t.price) { totalCoins -= t.price; trailsData.owned.push(t.id); trailsData.selected = t.id; lsSet("boeingTrails", trailsData); saveCoins(); showNotification("🎉 تم شراء الـ Trail"); }
        else showNotification("❌ رصيدك غير كافٍ يا زعيم!");
    }
    updateShopUI();
}

