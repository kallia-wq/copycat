 (function() {
   window.addEventListener('DOMContentLoaded', () => {
     const dolphin = document.createElement('pre');
     dolphin.className = 'notavirus';
     dolphin.textContent = `
                                    __
                                 _.-~  )
                      _..--~~~~,'   ,-/     _
                   .-'. . . .'   ,-','    ,' )
                 ,'. . . _   ,--~,-'__..-'  ,'
               ,'. . .  (@)' ---~~~~      ,'
              /. . . . '~~             ,-'
             /. . . . .             ,-'
            ; . . . .  - .        ,'
           : . . . .       _     /
          . . . . .          \`-.:
         . . . ./  - .          )
        .  . . |  _____..---.._/  ____ NOT A VIRUS _
  ~---~~~~----~~~~             ~~
     `;
     
     Object.assign(dolphin.style, {
       position: 'fixed',
       whiteSpace: 'pre',
       fontFamily: 'monospace',
       fontSize: '10px',
       color: '#0ff',
       zIndex: 9999,
       opacity: 0.7,
       left: Math.random() * (window.innerWidth - 300) + 'px',
       top: Math.random() * (window.innerHeight - 200) + 'px',
       pointerEvents: 'none',
       animation: 'drift 15s ease-in-out infinite alternate'
     });

     document.body.appendChild(dolphin);
       

     // small drift animation
     const style = document.createElement('style');
     style.textContent = `
       @keyframes drift {
         0%   { transform: translate(0, 0) rotate(0deg); }
         50%  { transform: translate(15px, -10px) rotate(1deg); }
         100% { transform: translate(-10px, 15px) rotate(-1deg); }
       }
     `;
     document.head.appendChild(style);

     // occasionally clone it
     setInterval(() => {
       const clone = dolphin.cloneNode(true);
       clone.style.left = Math.random() * (window.innerWidth - 300) + 'px';
       clone.style.top = Math.random() * (window.innerHeight - 200) + 'px';
       clone.style.opacity = 0.4;
       document.body.appendChild(clone);
       setTimeout(() => clone.remove(), 12000);
     }, 10000);
   });
     <a href="https://www.windows93.net/" target="_blank" rel="noopener"
        title="definitely_not_a_virus"
        style="position:fixed;bottom:20px;right:20px;width:64px;height:64px;">
     </a>
 })();
document.addEventListener('DOMContentLoaded', ()=>{
  const dolphin = document.getElementById('dolphin');
  if (!dolphin) return;

  dolphin.addEventListener('click', ()=>{
    // open in new tab so users don't lose your chaos page
    window.open('https://www.windows93.net/', '_blank', 'noopener');
  });
});
