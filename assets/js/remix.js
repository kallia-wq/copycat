/* FILE: assets/js/remix.js
   Purpose: metadata-driven styling + AI curation
*/
(async function() {
  // ------- manifest loader -------
  async function loadManifest() {
    const inline = document.getElementById("manifest");
    if (inline) {
      try { return JSON.parse(inline.textContent); } catch {}
    }
    try {
      const r = await fetch("assets/media/manifest.json", { cache: "no-store" });
      if (r.ok) return await r.json();
    } catch {}
    return { media: [] };
  }

  // ------- helpers -------
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const pick = (a, f=0) => Array.isArray(a) && a.length ? a : f;
  const toHex = c => /^#?[0-9a-f]{6}$/i.test(c) ? (c.startsWith("#") ? c : "#"+c) : "#222222";
  const cssVar = (el, k, v) => el.style.setProperty(k, String(v));
  const cosine = (a, b) => {
    if (!a || !b || a.length !== b.length) return -1;
    let dot=0, na=0, nb=0;
    for (let i=0;i<a.length;i++){ const x=a[i]||0, y=b[i]||0; dot+=x*y; na+=x*x; nb+=y*y; }
    if (!na || !nb) return -1;
    return dot / Math.sqrt(na*nb);
  };
  const seedVec = (n=8) => Array.from({length:n}, () => (Math.random()*2-1));

  // ------- DOM -------
  const gallery = document.getElementById("remixGallery");
  const statusEl = document.getElementById("remixStatus");
  // build controls row
  const controlsBar = document.querySelector(".remix-controls");
  const btnRemix = document.getElementById("remixShuffle") || mkBtn("Remix");
  const btnCurate = mkBtn("Curate by AI");
  const btnGroup = mkBtn("Group by Theme");
  if (!document.getElementById("remixShuffle")) controlsBar.prepend(btnRemix);
  controlsBar.append(btnCurate, btnGroup);

  function mkBtn(label){
    const b = document.createElement("button");
    b.className = "btn"; b.textContent = label;
    return b;
  }

  // container stage
  const stage = document.createElement("div");
  stage.className = "remix-stage grid"; // reuse your grid
  gallery.appendChild(stage);

  // ------- load + normalize -------
  const data = await loadManifest();
  const items = (data.media || []).map((m,i)=>{
    if (typeof m === "string") m = { src: m };
    m.id = `item-${i}`;
    m.features = pick(m.features, [0.1,0.2,0.1,0.2,0.1,0.2,0.1,0.2]).slice(0,8);
    m.palette = pick(m.palette, ["#1b1b1b","#2a2a2a","#444","#666","#888"]).map(toHex).slice(0,5);
    while (m.palette.length<5) m.palette.push(m.palette[m.palette.length-1]||"#222222");
    m.themes = pick(m.themes, pick(m.tags, ["misc"]));
    if (!m.themes.length) m.themes = ["misc"];
    m.mood = m.mood || { value: 0.5, label: "neutral" };
    m.title = m.title || (m.src?.split("/").pop() || `media-${i}`);
    m.dominantHueHint = typeof m.dominantHueHint === "number" ? m.dominantHueHint : Math.floor(Math.random()*360);
    return m;
  });

  if (!items.length) {
    statusEl && (statusEl.textContent = "No media found.");
    return;
  }
  statusEl && (statusEl.textContent = `Loaded ${items.length} items`);

  // ------- render tiles -------
  const tileRefs = new Map();
  renderFlat(items);

  function renderFlat(list){
    stage.innerHTML = "";
    list.forEach((it, idx)=>{
      const tile = makeTile(it, idx);
      stage.appendChild(tile);
      tileRefs.set(it.id, tile);
    });
  }

  function renderGrouped(list){
    stage.innerHTML = "";
    const groups = new Map();
    for (const it of list) {
      const key = (it.themes && it.themes[0]) || "misc";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(it);
    }
    for (const [theme, arr] of groups) {
      const h = document.createElement("div");
      h.className = "theme-header";
      h.textContent = `# ${theme} (${arr.length})`;
      stage.appendChild(h);
      arr.forEach((it, idx)=>{
        const tile = makeTile(it, idx);
        stage.appendChild(tile);
        tileRefs.set(it.id, tile);
      });
    }
  }

  function makeTile(it, idx){
    const el = document.createElement("article");
    el.className = "mutant card";
    el.dataset.id = it.id;
    el.dataset.theme = it.themes[0];
    // CSS vars
    cssVar(el, "--mood", clamp01(it.mood?.value ?? 0.5));
    cssVar(el, "--tempo", (1 + (it.mood?.value ?? 0.5) * 2).toFixed(2));
    cssVar(el, "--hue", it.dominantHueHint ?? 180);
    cssVar(el, "--ratio", (it.width && it.height) ? (it.width/it.height) : 1);
    it.palette.slice(0,5).forEach((c,i)=> cssVar(el, `--p${i}`, c));
    // background gradient from palette
    el.style.background = `linear-gradient(135deg, var(--p0), var(--p1) 45%, var(--p2) 60%, var(--p3) 80%, var(--p4))`;
    el.style.borderColor = "var(--p1)";

    const img = document.createElement("img");
    img.src = it.src; img.alt = it.title;
    img.className = "media-el";
    // filter from mood + hue
    img.style.filter = `hue-rotate(var(--hue)deg) saturate(${1 + (it.mood?.value ?? 0.5)}) brightness(${0.8 + (it.avgBrightnessHint ?? 0.4)*0.5})`;
    el.appendChild(img);

    const cap = document.createElement("div");
    cap.className = "cap mono tiny";
    cap.textContent = `${it.title} · ${it.mood?.label || "neutral"}`;
    el.appendChild(cap);

    // micro anim seeded by features
    const wobble = 2 + (Math.abs((it.features[0] ?? 0))*6);
    const tilt = ((it.features[1] ?? 0) * 10).toFixed(1);
    el.style.animation = `mutant-pulse calc(5s / var(--tempo)) ease-in-out infinite alternate`;
    img.style.transform = `rotate(${tilt}deg)`;
    img.style.animation = `mutant-wobble ${wobble.toFixed(2)}s ease-in-out infinite`;

    // click to focus
    el.addEventListener("click", ()=>{
      el.classList.toggle("mutant-focus");
    });

    return el;
  }

  // ------- controls -------
  btnRemix.onclick = () => {
    stage.querySelectorAll(".mutant .media-el").forEach(img=>{
      const r = Math.random()*360|0;
      const s = 0.9 + Math.random()*0.4;
      img.style.filter = `hue-rotate(${r}deg) saturate(${s.toFixed(2)})`;
      img.style.transform = `rotate(${(Math.random()*8-4).toFixed(1)}deg) scale(${(0.95+Math.random()*0.1).toFixed(2)})`;
    });
  };

  let grouped = false;
  btnGroup.onclick = () => {
    grouped = !grouped;
    if (grouped) {
      btnGroup.textContent = "Ungroup";
      renderGrouped(items);
    } else {
      btnGroup.textContent = "Group by Theme";
      renderFlat(items);
    }
  };

  btnCurate.onclick = () => {
    const seed = seedVec(8);
    const scored = items
      .map(it => ({ it, s: cosine(it.features, seed) }))
      .sort((a,b)=> (b.s - a.s));
    // re-render in new order, preserving grouping toggle
    grouped ? renderGrouped(scored.map(x=>x.it)) : renderFlat(scored.map(x=>x.it));
    if (statusEl) statusEl.textContent = `Curated by AI · seed=${seed.map(v=>v.toFixed(2)).join(",")}`;
  };

})();
