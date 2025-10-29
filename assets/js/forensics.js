//
//  forensics.js
//  
//
//  Created by Kallie Albert on 10/21/25.
//


// forensics.js — extracts simple image stats & random coordinates
window.ImageForensics = {
  async analyze(src) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    await img.decode();

    const c = document.createElement("canvas");
    const w = (c.width = img.width);
    const h = (c.height = img.height);
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, w, h).data;
    let r = 0, g = 0, b = 0;
    const step = Math.floor(data.length / (1000 * 4)) || 4;
    for (let i = 0; i < data.length; i += step * 4) {
      r += data[i]; g += data[i + 1]; b += data[i + 2];
    }
    const samples = Math.floor(data.length / (step * 4));
    r = Math.round(r / samples);
    g = Math.round(g / samples);
    b = Math.round(b / samples);

    // Generate “glitch coordinates” using pixel brightness
    const coords = [];
    for (let i = 0; i < 40; i++) {
      coords.push({
        x: Math.floor(Math.random() * w),
        y: Math.floor(Math.random() * h),
        size: 10 + Math.random() * 40,
        hue: (r + g + b + i * 13) % 360
      });
    }

    return { src, avg: { r, g, b }, coords, w, h };
  }
};