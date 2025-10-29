
(function(){
  const trailChars = ["🤖","💀","✨","404","//","ai","♥","◇"];
  document.addEventListener('pointermove', e=>{
    const s = document.createElement('span');
    s.className = 'cursor-trail';
    s.textContent = trailChars[(Math.random()*trailChars.length)|0];
    s.style.left = e.clientX + 'px';
    s.style.top = e.clientY + 'px';
    s.style.color = ['#0f0','#f0f','#0ff','#ff0'][Math.floor(Math.random()*4)];
    s.style.transform += ` scale(${0.8+Math.random()}) rotate(${Math.random()*360}deg)`;
    document.body.appendChild(s);
    setTimeout(()=> s.remove(), 600);
  }, {passive:true});

  const meter = document.createElement('div');
  meter.className = 'mmeter mono';
  meter.innerHTML = 'Ping: <b>∞</b> ms · Users: <b>0</b> · Bot%: <b>100</b>';
  document.body.appendChild(meter);
  setInterval(()=>{
    const ping = (Math.random()<0.3) ? '∞' : Math.floor(40+Math.random()*300);
    const bots = 80 + Math.floor(Math.random()*21);
    const users = Math.floor(Math.random()*9);
    meter.innerHTML = `Ping: <b>${ping}</b> ms · Users: <b>${users}</b> · Bot%: <b>${bots}</b>`;
  }, 800);

  setInterval(()=>{ if(Math.random()<0.12) document.body.classList.toggle('invert'); }, 900);

  let ctx, master, muted = false;
  function ensure(){
    if(ctx) return;
    ctx = new (window.AudioContext||window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.12; master.connect(ctx.destination);
  }
  function grain(){
    if(muted) return; ensure();
    const s = ctx.createBufferSource();
    const len = Math.floor(ctx.sampleRate * (0.06 + Math.random()*0.06));
    const b = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = b.getChannelData(0); let last = 0;
    for(let i=0;i<len;i++){ const n=(Math.random()*2-1)*0.7; last = (last*0.82)+(n*0.18); d[i]=last; }
    s.buffer = b;
    const g = ctx.createGain(); g.gain.value=.4+Math.random()*.3;
    const bp = ctx.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=5; bp.frequency.value = 200 + Math.random()*3000;
    s.connect(bp); bp.connect(g); g.connect(master); s.start();
  }
  const volUI = document.createElement('div');
  volUI.className = 'mmeter mono'; volUI.style.right='10px'; volUI.style.left='auto';
  volUI.innerHTML = '<button id="mute" class="btn">Mute</button>';
  document.body.appendChild(volUI);
  volUI.querySelector('#mute').addEventListener('click', ()=>{ muted = !muted; volUI.querySelector('#mute').textContent = muted? 'Unmute':'Mute'; });
  document.addEventListener('pointerdown', ()=>{ ensure(); }, {once:true});
  document.addEventListener('mousemove', ()=>{ if(Math.random()<0.08) grain(); }, {passive:true});

  const phrases = ["THIS LOOKS SO REAL!!","sourced from nowhere","ai slop","dead internet","engagement optimized","curated by ghosts"];
  setInterval(()=>{
    const d = document.createElement('div');
    d.className='glitch';
    d.dataset.text = phrases[(Math.random()*phrases.length)|0];
    d.textContent = d.dataset.text;
    d.style.position='fixed';
    d.style.left = Math.random()*100 + 'vw';
    d.style.top = Math.random()*100 + 'vh';
    d.style.fontSize = (12+Math.random()*22) + 'px';
    document.body.appendChild(d);
    setTimeout(()=> d.remove(), 1600);
  }, 300);

  setInterval(()=>{
    if(Math.random()<0.05){
      const f = document.createElement('iframe');
      f.src = location.pathname; f.style.position='fixed'; f.style.width='220px'; f.style.height='140px';
      f.style.left = Math.random()*80 + 'vw'; f.style.top = Math.random()*70 + 'vh';
      f.style.border='1px solid #222';
      document.body.appendChild(f);
      setTimeout(()=> f.remove(), 4000);
    }
  }, 1000);
})();
/* ================================
   FILE: assets/js/chaos-neon.js
   Purpose: Neon hover, random highlights, Party/Perf modes
   ================================ */
(function(){
  const R = Math.random;
  const pick = a => a[(R()*a.length)|0];
  const colors = ["neon-r","neon-g","neon-b"];
  const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let targets = [];
  let timer = null;
  let party = false;
  let perf = false;

  // Party background hue cycle
  let partyHueTimer = null;
  let partyHueEndTimer = null;

  function scanTargets(){
    targets = Array.from(document.querySelectorAll(".btn, .site-nav a"));
    targets.forEach(el => el.classList.add("neon"));
  }

  function baseDelays(){
    return perf
      ? { min: 1100, max: 3000, holdMin: 450, holdMax: 850 }
      : { min: 900,  max: 2700, holdMin: 600, holdMax: 900 };
  }

  function scheduleTick(){
    if (prefersReduced() || !targets.length) return;
    const { min, max } = baseDelays();
    const speed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--party-speed")) || 1;
    const mult = party ? (1 / (1.2 * speed)) : 1;
    const delay = (min + R()*(max - min)) * mult;
    timer = setTimeout(tick, delay);
  }

  function tick(){
    const el = pick(targets);
    if (!el) return scheduleTick();

    const color = pick(colors);
    el.classList.remove("neon-r","neon-g","neon-b");
    el.classList.add(color, "lit");

    const { holdMin, holdMax } = baseDelays();
    const hold = (holdMin + R()*(holdMax - holdMin)) * (party ? 0.75 : 1);
    setTimeout(()=>{
      el.classList.remove("lit");
      if (R() < 0.5) el.classList.remove("neon-r","neon-g","neon-b");
    }, hold);

    scheduleTick();
  }

  function start(){ stop(); scanTargets(); scheduleTick(); }
  function stop(){ if (timer) clearTimeout(timer); timer = null; }

  // Party mode toggles
  function startParty(){
    party = true;
    document.body.classList.add("party-on","party-bg");
    start();
    kickPartyBackgroundCycle();
  }
  function stopParty(){
    party = false;
    document.body.classList.remove("party-on","party-bg");
    settlePartyBackground();
    start();
  }
  function toggleParty(){ party ? stopParty() : startParty(); }

  // Performance mode toggles
  function startPerf(){ perf = true;  document.body.classList.add("perf-on"); start(); }
  function stopPerf(){  perf = false; document.body.classList.remove("perf-on"); start(); }
  function togglePerf(){ perf ? stopPerf() : startPerf(); }

  // Hue rotate page for ~8s, then freeze at last hue
  function kickPartyBackgroundCycle(){
    clearInterval(partyHueTimer);
    clearTimeout(partyHueEndTimer);

    partyHueTimer = setInterval(()=>{
      const hue = (R()*360)|0;
      document.documentElement.style.setProperty("--party-hue", hue + "deg");
    }, 280);

    partyHueEndTimer = setTimeout(()=>{
      clearInterval(partyHueTimer);
      partyHueTimer = null;
      // keep last hue; stays until party mode exits
    }, 8000);
  }
  function settlePartyBackground(){
    clearInterval(partyHueTimer);
    clearTimeout(partyHueEndTimer);
    partyHueTimer = null; partyHueEndTimer = null;
  }

  function wireUI(){
    const partyBtn = document.getElementById("partyModeBtn");
    const perfBtn  = document.getElementById("perfModeBtn");

    if (partyBtn){
      partyBtn.addEventListener("click", ()=>{
        toggleParty();
        partyBtn.classList.toggle("neon-r", party);
        partyBtn.classList.toggle("neon-b", !party);
        partyBtn.textContent = party ? "Party Mode: ON" : "Party Mode";
      });
    }
    if (perfBtn){
      perfBtn.addEventListener("click", ()=>{
        togglePerf();
        perfBtn.textContent = perf ? "Performance Mode: ON" : "Performance Mode";
      });
    }

    window.addEventListener("keydown", e=>{
      const k = e.key.toLowerCase();
      if (k === "p") { toggleParty(); if (partyBtn) partyBtn.textContent = party ? "Party Mode: ON" : "Party Mode"; }
      if (k === "o") { togglePerf();  if (perfBtn)  perfBtn.textContent  = perf  ? "Performance Mode: ON" : "Performance Mode"; }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ()=>{ wireUI(); start(); });
  } else { wireUI(); start(); }

  // expose tiny API
  window.NeonFX = { rescan: scanTargets, startParty, stopParty, toggleParty, startPerf, stopPerf, togglePerf };
})();

if (document.body.dataset.page === 'recompile') {
  console.log('[chaos.js] Disabled on recompile page');
  return;
}
audio.addEventListener('timeupdate', ()=> localStorage.setItem('audioTime', audio.currentTime));
window.addEventListener('DOMContentLoaded', ()=>{
  const t = parseFloat(localStorage.getItem('audioTime')||0);
  if(t>1) audio.currentTime = t;
});
