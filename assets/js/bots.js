
// bots.js — interactive fake-live feed with optional real data
(function(){
  const feed = document.getElementById('botFeed');
  if(!feed) return;

  const handles = ["@user404","@glitchangel","@aiisbae","@influencer.exe","@feedghost","@contentvoid","@syntheticdream","@modeldrift"];
  const texts = ["so aesthetic omg 💀","bro this looks so AI it’s unreal","can't tell if i liked this already","posthuman vibes only 🧬","why does this feel familiar","algorithm gave me feelings again","me when the feed starts whispering","dead internet theory looking kinda alive rn"];

  const modes = ["x","tiktok","shorts","youtube"];
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  async function fetchQuotable(){
    const r = await fetch("https://api.quotable.io/random"); const j = await r.json(); return j.content;
  }
  async function fetchReddit(){
    const r = await fetch("https://www.reddit.com/r/all/random.json"); const j = await r.json();
    const p = j?.[0]?.data?.children?.[0]?.data?.title || j?.[0]?.data?.children?.[0]?.data?.selftext || "";
    return p || pick(texts);
  }
  async function fetchX(){
    // Requires optional backend server; will 404 if not running, which is fine.
    const q = encodeURIComponent("ai OR \"dead internet\" OR glitch lang:en -is:reply -is:retweet");
    const r = await fetch(`/api/x/search?q=${q}`).catch(()=>null);
    if(!r || !r.ok) throw new Error("x backend offline");
    const j = await r.json();
    const t = j?.data?.[0]?.text || pick(texts);
    return t;
  }

  async function getText(){
    const pickers = [fetchX, fetchReddit, fetchQuotable];
    for(const fn of pickers){
      try{ const t = await Promise.race([fn(), new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')), 1800))]); if(t) return t; }catch{ /* try next */ }
    }
    return pick(texts);
  }

  function heart(x,y){
    const h = document.createElement('div'); h.className='heart-pop'; h.textContent = '♥';
    h.style.left = x+'px'; h.style.top = y+'px'; document.body.appendChild(h);
    setTimeout(()=> h.remove(), 650);
  }

  function makeCard(text){
    const user = pick(handles);
    const likes = Math.floor(Math.random()*900)+100;
    const mode = pick(modes);
    const el = document.createElement('article');
    el.className = `card rgb-split flick interactive ${mode}`;
    el.innerHTML = `
      <div class="cap mono">
        <span class="user">${user}</span> · <span class="likes"><span class="count">${likes}</span> ♥</span>
      </div>
      <p class="body">${text}</p>
      <small class="mono ts">${new Date().toLocaleTimeString()} · via botnet</small>
    `;
    // interactions
    el.addEventListener('click', ()=> openModal({user, text, likesEl: el.querySelector('.count'), card: el}));
    el.addEventListener('dblclick', e=>{ const c = el.querySelector('.count'); c.textContent = (+c.textContent)+1; heart(e.clientX,e.clientY); });
    return el;
  }

  // Modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="backdrop"></div>
    <div class="sheet">
      <header><strong class="mono">@post</strong><button class="btn" id="close">Close</button></header>
      <main>
        <p class="mono" id="text"></p>
        <div class="meta"><span><span id="likeCount" class="count">0</span> ♥</span><span id="repostCount">0 ↻</span></div>
        <div id="replies"></div>
      <div class="trace mono tiny" id="trace">
  <div class="row">model: <b id="model">gpt-soup-XL</b> · seed: <b id="seed">0xDEADBEEF</b> · temp: <b id="temp">1.2</b></div>
  <div class="row">pipeline: scrape → sanitize → blend → resell</div>
</div>
<div class="confess mono tiny" id="confess">
  dataset confession: trained on
  <ul>
    <li>influencer captions (public domain??? maybe)</li>
    <li>brand copy scraped at 3:12 AM</li>
    <li>your sighs mapped to purchase intent</li>
  </ul>
</div>
</main>
      <div class="actions">
        <button class="chip" id="like">Like</button>
        <button class="chip" id="repost">Repost</button>
        <button class="chip" id="reply">Reply</button>
        <button class="chip" id="glitch">Glitch</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  const $ = s => modal.querySelector(s);

  function openModal(ctx){
    // fabricate traceback
    const hex = '0123456789ABCDEF'; let seed='0x';
    for(let i=0;i<8;i++) seed += hex[(Math.random()*hex.length)|0];
    modal.querySelector('#seed').textContent = seed;
    modal.querySelector('#model').textContent = ['gpt-soup-XL','aesthetic-mix-13b','slop-mamba-7b'][Math.floor(Math.random()*3)];
    modal.querySelector('#temp').textContent = (0.8 + Math.random()*0.9).toFixed(2);
    modal.classList.add('active');
    $('.mono').textContent = ctx.user;
    $('#text').textContent = ctx.text;
    $('#likeCount').textContent = ctx.likesEl.textContent;
    $('#repostCount').textContent = '0 ↻';
    $('#replies').innerHTML='';

    $('#like').onclick = ()=>{ ctx.likesEl.textContent = (+ctx.likesEl.textContent)+1; $('#likeCount').textContent = ctx.likesEl.textContent; };
    $('#repost').onclick = ()=>{ const v = +($('#repostCount').textContent.split(' ')[0])+1; $('#repostCount').textContent = v+' ↻'; };
    $('#reply').onclick = ()=>{
      const r = document.createElement('div'); r.className='reply mono tiny'; r.textContent = `${pick(handles)}: ${pick(texts)}`;
      $('#replies').prepend(r);
    };
    $('#glitch').onclick = ()=>{ ctx.card.classList.toggle('invert'); ctx.card.classList.toggle('rgb-split'); };
  }
  $('#close').onclick = ()=> modal.classList.remove('active');
  modal.querySelector('.backdrop').onclick = ()=> modal.classList.remove('active');

  async function tick(){
    const txt = await getText();
    const card = makeCard(txt);
    feed.prepend(card);
    if(feed.children.length > 25) feed.lastChild.remove();
  }
  setInterval(tick, 1600);
})();
