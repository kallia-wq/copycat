//
//  neonhover.js
//  
//
//  Created by Kallie Albert on 10/22/25.
//


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