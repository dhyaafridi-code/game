/* =====================================================================
   SECTION 10: Images (الصور الأصلية مع fallback)
   ===================================================================== */
CHARACTERS.forEach(function (ch, idx) { const img = new Image(); img.src = ch.file; loadedImages[idx] = img; });

