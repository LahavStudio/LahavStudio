// Mobile nav
const hamb=document.querySelector('.hamburger');const nav=document.getElementById('nav');
if(hamb&&nav){hamb.addEventListener('click',()=>{const e='true'===hamb.getAttribute('aria-expanded');hamb.setAttribute('aria-expanded',String(!e)),nav.classList.toggle('open',!e)});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');hamb.setAttribute('aria-expanded','false')}));}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href').slice(1),el=document.getElementById(id);if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'})}}));

// Year
const y=document.getElementById('year'); if(y) y.textContent=(new Date).getFullYear();

// Sparkles
(function(){const m=window.matchMedia('(prefers-reduced-motion: reduce)');if(m.matches)return;const c=document.getElementById('sparkles');if(!c)return;
const x=c.getContext('2d');let w=0,h=0,d=1,p=[];function R(){d=Math.min(window.devicePixelRatio||1,1.75);const vw=Math.max(document.documentElement.clientWidth,window.innerWidth||0),vh=Math.max(document.documentElement.clientHeight,window.innerHeight||0);w=c.width=Math.floor(vw*d);h=c.height=Math.floor(vh*d);c.style.width=vw+'px';c.style.height=vh+'px';const A=vw*vh,B=A<280000?60:A<810000?110:180;p=new Array(B).fill(0).map(()=>({x:Math.random()*w,y:Math.random()*h,r:1.5*Math.random()+.6,a:Math.random()*Math.PI*2,s:.4*Math.random()+.15,tw:Math.random()*Math.PI*2,tc:.02*Math.random()+.008}))}function D(){x.clearRect(0,0,w,h);for(const o of p){o.x+=Math.cos(o.a)*o.s;o.y+=.5*Math.sin(o.a)*o.s;o.a+=(Math.random()-.5)*.02;o.x<0?o.x=w:o.x>w&&(o.x=0);o.y<0?o.y=h:o.y>h&&(o.y=0);o.tw+=o.tc;const a=.22+.22*Math.sin(o.tw),g=x.createRadialGradient(o.x,o.y,0,o.x,o.y,6*o.r);g.addColorStop(0,`rgba(255,255,255,${a})`);g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.arc(o.x,o.y,6*o.r,0,2*Math.PI);x.fill()}requestAnimationFrame(D)}window.addEventListener('resize',R,{passive:!0});R();D()})();

// Lightbox
(function(){const items=Array.from(document.querySelectorAll('.g-item'));if(items.length===0)return;const lb=document.querySelector('.lightbox'),img=lb.querySelector('.lightbox-img'),cl=lb.querySelector('.lightbox-close'),pr=lb.querySelector('.lightbox-prev'),nx=lb.querySelector('.lightbox-next');let i=0;function O(n){i=n;img.src=items[i].getAttribute('data-src');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}function C(){lb.setAttribute('aria-hidden','true');document.body.style.overflow=''}function P(){O((i-1+items.length)%items.length)}function N(){O((i+1)%items.length)}items.forEach((b,n)=>b.addEventListener('click',()=>O(n)));cl.addEventListener('click',C);pr.addEventListener('click',P);nx.addEventListener('click',N);lb.addEventListener('click',e=>{if(e.target===lb)C()});document.addEventListener('keydown',e=>{'true'!==lb.getAttribute('aria-hidden')&&('Escape'===e.key?C():'ArrowLeft'===e.key?P():'ArrowRight'===e.key&&N())})})();

// Category chips filter
(function(){
  const wrap = document.querySelector('.cat-wrap');
  const chips = Array.from(document.querySelectorAll('.cat-inner .chip'));
  const items = Array.from(document.querySelectorAll('.g-item'));
  if(!wrap || chips.length===0 || items.length===0) return;

  function apply(cat){
    chips.forEach(c=>c.classList.toggle('active', c.dataset.cat===cat));
    items.forEach(it=>{ const k=it.dataset.cat||'all'; it.style.display = (cat==='all'||k===cat)? '' : 'none'; });
  }
  chips.forEach(chip=> chip.addEventListener('click', ()=>{
    const cat = chip.dataset.cat || 'all'; apply(cat);
    const url = new URL(location.href); url.searchParams.set('cat', cat); history.replaceState(null,'',url.toString());
    const g=document.getElementById('gallery'); if(g) g.scrollIntoView({behavior:'smooth'});
  }));
  const url = new URL(location.href); const initial = url.searchParams.get('cat') || 'all'; const ok = chips.some(c=>c.dataset.cat===initial);
  apply(ok?initial:'all');
})();

// Google Sheets submit
(function(){
  const form=document.getElementById('leadFormSheets'); if(!form) return;
  const msg=document.getElementById('formMsg');
  const ENDPOINT='PASTE_YOUR_APPS_SCRIPT_URL_HERE';
  document.querySelectorAll('[data-plan]').forEach(btn=>btn.addEventListener('click',()=>{const sel=document.getElementById('packageSelect'); if(sel) sel.value=btn.getAttribute('data-plan')}));
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd=new FormData(form); const payload=Object.fromEntries(fd.entries()); payload.source_url=location.href;
    msg.textContent='שולח...';
    try{ await fetch(ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      msg.textContent='הטופס נשלח! ניצור קשר בהקדם.'; form.reset();
    }catch(err){ msg.textContent='שגיאה בשליחה. אפשר לנסות שוב או ליצור קשר בוואטסאפ.' }
  });
})();