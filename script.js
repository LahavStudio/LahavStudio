// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href').slice(1), el=document.getElementById(id); if(el){e.preventDefault(); el.scrollIntoView({behavior:'smooth'});}}));
// Year
const y=document.getElementById('year'); if(y) y.textContent=(new Date).getFullYear();
// Sparkles
(function(){const m=window.matchMedia('(prefers-reduced-motion: reduce)'); if(m.matches) return; const canvas=document.getElementById('sparkles'); if(!canvas) return;
  const ctx=canvas.getContext('2d'); let w=0,h=0,d=1,p=[]; function R(){d=Math.min(window.devicePixelRatio||1,1.75); const vw=Math.max(document.documentElement.clientWidth,window.innerWidth||0),vh=Math.max(document.documentElement.clientHeight,window.innerHeight||0);
    w=canvas.width=Math.floor(vw*d); h=canvas.height=Math.floor(vh*d); canvas.style.width=vw+'px'; canvas.style.height=vh+'px'; const A=vw*vh,B=A<280000?60:A<810000?110:180;
    p=new Array(B).fill(0).map(()=>({x:Math.random()*w,y:Math.random()*h,r:1.5*Math.random()+.6,a:Math.random()*Math.PI*2,s:.4*Math.random()+.15,tw:Math.random()*Math.PI*2,tc:.02*Math.random()+.008})); }
  function D(){ctx.clearRect(0,0,w,h); for(const o of p){o.x+=Math.cos(o.a)*o.s; o.y+=.5*Math.sin(o.a)*o.s; o.a+=(Math.random()-.5)*.02; if(o.x<0)o.x=w; else if(o.x>w)o.x=0; if(o.y<0)o.y=h; else if(o.y>h)o.y=0;
      o.tw+=o.tc; const a=.22+.22*Math.sin(o.tw); const g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,6*o.r); g.addColorStop(0,`rgba(255,255,255,${a})`); g.addColorStop(1,'rgba(255,255,255,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(o.x,o.y,6*o.r,0,2*Math.PI); ctx.fill(); }
    requestAnimationFrame(D);} window.addEventListener('resize',R,{passive:true}); R(); D(); })();
// Lightbox
(function(){const items=Array.from(document.querySelectorAll('.g-item')); if(items.length===0) return; const lb=document.querySelector('.lightbox'); const img=lb.querySelector('.lightbox-img');
  const cl=lb.querySelector('.lightbox-close'); const pr=lb.querySelector('.lightbox-prev'); const nx=lb.querySelector('.lightbox-next'); let i=0;
  function O(n){i=n; const el=items[i]; img.src=el.getAttribute('data-src') || el.querySelector('img')?.src || ''; lb.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';}
  function C(){lb.setAttribute('aria-hidden','true'); document.body.style.overflow='';} function P(){O((i-1+items.length)%items.length)} function N(){O((i+1)%items.length)}
  items.forEach((b,n)=>b.addEventListener('click',()=>O(n))); cl.addEventListener('click',C); pr.addEventListener('click',P); nx.addEventListener('click',N);
  lb.addEventListener('click',e=>{if(e.target===lb)C()}); document.addEventListener('keydown',e=>{if(lb.getAttribute('aria-hidden')==='true')return; if(e.key==='Escape')C(); if(e.key==='ArrowLeft')P(); if(e.key==='ArrowRight')N();}); })();
// Category filter
(function(){const chips=Array.from(document.querySelectorAll('.cat-inner .chip')); const items=Array.from(document.querySelectorAll('.g-item')); if(chips.length===0||items.length===0) return;
  function apply(cat){chips.forEach(c=>c.classList.toggle('active',c.dataset.cat===cat)); items.forEach(it=>{const k=it.dataset.cat||'all'; it.style.display=(cat==='all'||k===cat)?'':'none';});}
  chips.forEach(chip=>chip.addEventListener('click',()=>{const cat=chip.dataset.cat||'all'; apply(cat); const url=new URL(location.href); url.searchParams.set('cat',cat); history.replaceState(null,'',url.toString()); const g=document.getElementById('gallery'); if(g) g.scrollIntoView({behavior:'smooth'});}));
  const url=new URL(location.href); const initial=url.searchParams.get('cat')||'all'; apply(chips.some(c=>c.dataset.cat===initial)?initial:'all'); })();
// Google Sheets submit
(function(){const form=document.getElementById('leadFormSheets'); if(!form) return; const msg=document.getElementById('formMsg');
  const ENDPOINT='https://script.google.com/macros/s/AKfycbykPdxDbPJmT48ZwSjYAqFNq41m4D0-mw18gNih2fskZBNsAfD5c7j4X7ADL0EYFppN/exec';
  document.querySelectorAll('[data-plan]').forEach(btn=>btn.addEventListener('click',()=>{const sel=document.getElementById('packageSelect'); if(sel) sel.value=btn.getAttribute('data-plan');}));
  form.addEventListener('submit', async (e)=>{e.preventDefault(); const fd=new FormData(form); const payload=Object.fromEntries(fd.entries()); payload.source_url=location.href; msg.textContent='שולח...';
    try{await fetch(ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); msg.textContent='הטופס נשלח! ניצור קשר בהקדם.'; form.reset();}
    catch(err){msg.textContent='שגיאה בשליחה. אפשר לנסות שוב או ליצור קשר בוואטסאפ.';}}); })();
