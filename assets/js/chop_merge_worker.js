//
//  chop_merge_worker.js
//  
//
//  Created by Kallie Albert on 10/21/25.
//


// assets/js/chop-merge-worker.js
self.onmessage = async (evt) => {
  const { width, height, layers, scale = 1, type = "image/png", quality } = evt.data || {};
  if (!width || !height || !Array.isArray(layers)) {
    self.postMessage({ ok: false, error: "bad-args" });
    return;
  }

  let canvas, ctx;
  try {
    canvas = new OffscreenCanvas(Math.ceil(width * scale), Math.ceil(height * scale));
    ctx = canvas.getContext("2d", { alpha: false });
  } catch {
    // Fallback for engines without OffscreenCanvas in workers (old Safari)
    self.postMessage({ ok: false, error: "offscreen-unsupported" });
    return;
  }

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const L of layers) {
    if (!L || !L.bitmap) continue;
    ctx.save();
    ctx.globalCompositeOperation = L.op || "source-over";
    ctx.filter = L.filter || "none";

    const dx = Math.round((L.x || 0) * scale);
    const dy = Math.round((L.y || 0) * scale);
    const dw = Math.round((L.w || 0) * scale);
    const dh = Math.round((L.h || 0) * scale);

    if (Array.isArray(L.poly) && L.poly.length >= 6) {
      ctx.beginPath();
      ctx.moveTo(L.poly[0] * scale, L.poly[1] * scale);
      for (let i = 2; i < L.poly.length; i += 2) ctx.lineTo(L.poly[i] * scale, L.poly[i + 1] * scale);
      ctx.closePath();
      ctx.clip();
    }

    try { ctx.drawImage(L.bitmap, dx, dy, dw, dh); } catch { /* ignore */ }
    ctx.restore();
  }

  try {
    const blob = await canvas.convertToBlob({ type, quality });
    self.postMessage({ ok: true, blob }, [blob]); // transfer
  } catch {
    self.postMessage({ ok: false, error: "convert-failed" });
  }
};