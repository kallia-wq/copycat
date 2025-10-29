
(function(){
  function render(el){
    const src = el.getAttribute('data-src')||'';
    if(!src) return;
    const lower = src.toLowerCase();
    let node;
    if(lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')){
      node = document.createElement('video');
      node.src = src; node.muted = true; node.loop = true; node.autoplay = true; node.playsInline = true;
    } else {
      node = document.createElement('img');
      node.src = src; node.alt = el.getAttribute('data-alt') || 'media';
    }
    node.className = 'media-el';
    el.innerHTML = ''; el.appendChild(node);
  }
  function init(){ document.querySelectorAll('[data-src]').forEach(render); }
  document.addEventListener('DOMContentLoaded', init);
  new MutationObserver(init).observe(document.documentElement, {childList:true, subtree:true});
})();
