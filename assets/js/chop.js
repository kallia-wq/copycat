// assets/js/chop.js
// Requires your page to have: #chopFloat, #canvasStage, and shards with class .slice

(function(){
  function $(id){ return document.getElementById(id); }

  // Enable drag for a slice element
  function enableDrag(el){
    let sx=0, sy=0, ox=0, oy=0, dragging=false;
    const chopFloat = $("chopFloat");
    const canvasStage = $("canvasStage");

    el.addEventListener("pointerdown", (e)=>{
      dragging = true;
      el.setPointerCapture(e.pointerId);
      el.classList.add("dragging");
      chopFloat?.classList.add("pass-through"); // start drag through overlay

      el.dataset._cloning = e.altKey ? "1" : "";
      document.body.classList.add("dragging-slice");

      sx = e.clientX; sy = e.clientY;
      const r = el.getBoundingClientRect();
      const p = el.parentElement.getBoundingClientRect();
      ox = r.left - p.left; oy = r.top - p.top;

      canvasStage?.classList.add("hint");
    });

    el.addEventListener("pointermove", (e)=>{
      if(!dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      el.style.transform = `translate(${ox+dx}px, ${oy+dy}px)`;

      if (!canvasStage) return;
      const c = canvasStage.getBoundingClientRect();
      const over = e.clientX >= c.left && e.clientX <= c.right && e.clientY >= c.top && e.clientY <= c.bottom;
      canvasStage.classList.toggle("drop-target", over);
      if (over) chopFloat?.classList.remove("pass-through"); // let the stage accept drops
    });

    function endDrag(e){
      if(!dragging) return;
      dragging=false;
      el.classList.remove("dragging");
      document.body.classList.remove("dragging-slice");

      const canvasStage = $("canvasStage");
      if (canvasStage && e) {
        const c = canvasStage.getBoundingClientRect();
        const over = e.clientX >= c.left && e.clientX <= c.right && e.clientY >= c.top && e.clientY <= c.bottom;

        if (over) {
          const srcSlice = el;
          const slice = srcSlice.dataset._cloning ? srcSlice.cloneNode(true) : srcSlice;

          const localX = e.clientX - c.left;
          const localY = e.clientY - c.top;
          const rect = slice.getBoundingClientRect();

          slice.style.width  = rect.width + "px";
          slice.style.height = rect.height + "px";
          slice.style.left = localX + "px";
          slice.style.top  = localY + "px";
          slice.style.transform = "translate(0,0)";

          const media = slice.querySelector("img,video,canvas");
          if (media && media.tagName.toLowerCase()==="video") {
            media.muted = true; media.loop = true; media.autoplay = true; media.playsInline = true;
            media.play().catch(()=>{});
          }
          // reattach behaviors on clones
          enableDrag(slice);
          if (typeof window.enableGlitch === "function") window.enableGlitch(slice, media);

          canvasStage.appendChild(slice);
        }

        canvasStage.classList.remove("hint","drop-target");
      }

      $("chopFloat")?.classList.remove("pass-through");
    }

    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("lostpointercapture", endDrag);
  }

  // Public hook so you can call enableDrag on newly created slices
  window.enableChopDrag = enableDrag;

  // Sane starting position for the floating box
  window.addEventListener("DOMContentLoaded", ()=>{
    const cf = $("chopFloat");
    if (cf && !cf.style.left && !cf.style.top) {
      cf.style.left = "auto"; cf.style.top = "auto";
      cf.style.right = "18px"; cf.style.bottom = "18px";
    }
  });
})();
