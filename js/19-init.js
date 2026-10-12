/* =====================================================================
   SECTION 19: Init
   ===================================================================== */
function init() {
    migrateAndLoad();
    applyDisplay();
    applyVolumes();
    updateMusicBar();
    initStars();
    buildSkyline();
    resizeCanvas();
    renderBackdrop();
    ensureMissions();
    state = "menu";
    if (playerName) openMain();
    else { showScreen("nameScreen"); renderIdle(); }
}
init();
