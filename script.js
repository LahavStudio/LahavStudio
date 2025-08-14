// Mobile nav
const hamb=document.querySelector('.hamburger');const nav=document.getElementById('nav');
if(hamb&&nav){
  hamb.addEventListener('click',()=>{
    const e='true'===hamb.getAttribute('aria-expanded');
    hamb.setAttribute('aria-expanded',String(!e));
    nav.classList.toggle('open',!e);
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    nav.classList.remove('open'); hamb.setAttribute('aria-expanded','false');
  }));
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href').slice(1), el=document.getElementById(id);
  if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
}));

// Year
const y=document.getElementById('year'); if(y) y.textContent=(new Date).getFullYear();

// Sparkles
(function(){
  const mediaReduced=window.matchMedia('(prefers-reduced-motion: reduce)'); if(mediaReduced.matches) return;
  const canvas=document.getElementById('sparkles'); if(!canvas) return;
  const ctx=canvas.getContext('2d'); let w=0,h=0,dpr=1,particles=[];
  function resize(){
    dpr=Math.min(window.devicePixelRatio||1,1.75);
    const vw=Math.max(document.documentElement.clientWidth,window.innerWidth||0);
    const vh=Math.max(document.documentElement.clientHeight,window.innerHeight||0);
    w=canvas.width=Math.floor(vw*dpr); h=canvas.height=Math.floor(vh*dpr);
    canvas.style.width=vw+'px'; canvas.style.height=vh+'px';
    const area=vw*vh, base=area<280000?60:area<810000?110:180;
    particles=new Array(base).fill(0).map(()=>({x:Math.random()*w,y:Math.random()*h,r:1.5*Math.random()+.6,a:Math.random()*Math.PI*2,s:.4*Math.random()+.15,tw:Math.random()*Math.PI*2,tc:.02*Math.random()+.008}));
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    for(const p of particles){
      p.x+=Math.cos(p.a)*p.s; p.y+=.5*Math.sin(p.a)*p.s; p.a+=(Math.random()-.5)*.02;
      if(p.x<0)p.x=w; else if(p.x>w)p.x=0; if(p.y<0)p.y=h; else if(p.y>h)p.y=0;
      p.tw+=p.tc; const alpha=.22+.22*Math.sin(p.tw);
      const grad=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,6*p.r);
      grad.addColorStop(0,`rgba(255,255,255,${alpha})`); grad.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(p.x,p.y,6*p.r,0,2*Math.PI); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize,{passive:true}); resize(); draw();
})();

// Lightbox
;(function(){
  const items=Array.from(document.querySelectorAll('.g-item')); if(items.length===0) return;
  const lb=document.querySelector('.lightbox'); const img=lb.querySelector('.lightbox-img');
  const closeBtn=lb.querySelector('.lightbox-close'); const prevBtn=lb.querySelector('.lightbox-prev'); const nextBtn=lb.querySelector('.lightbox-next');
  let idx=0;
  function open(i){ idx=i; img.src=items[idx].getAttribute('data-src'); lb.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
  function close(){ lb.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  function prev(){ open((idx-1+items.length)%items.length); }
  function next(){ open((idx+1)%items.length); }
  items.forEach((btn,i)=>btn.addEventListener('click',()=>open(i)));
  closeBtn.addEventListener('click',close); prevBtn.addEventListener('click',prev); nextBtn.addEventListener('click',next);
  lb.addEventListener('click',e=>{ if(e.target===lb) close(); });
  document.addEventListener('keydown',e=>{
    if(lb.getAttribute('aria-hidden')==='true') return;
    if(e.key==='Escape') close(); if(e.key==='ArrowLeft') prev(); if(e.key==='ArrowRight') next();
  });
})();

// Category chips filter
(function(){
  const chips = Array.from(document.querySelectorAll('.cat-inner .chip'));
  const items = Array.from(document.querySelectorAll('.g-item'));
  if(chips.length===0 || items.length===0) return;
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
;(function(){
  const form=document.getElementById('leadFormSheets'); if(!form) return;
  const msg=document.getElementById('formMsg');
  const ENDPOINT='PASTE_YOUR_APPS_SCRIPT_URL_HERE';
  document.querySelectorAll('[data-plan]').forEach(btn=>btn.addEventListener('click',()=>{
    const sel=document.getElementById('packageSelect'); if(sel) sel.value=btn.getAttribute('data-plan');
  }));
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd=new FormData(form); const payload=Object.fromEntries(fd.entries()); payload.source_url=location.href;
    msg.textContent='שולח...';
    try{
      await fetch(ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      msg.textContent='הטופס נשלח! ניצור קשר בהקדם.'; form.reset();
    }catch(err){ msg.textContent='שגיאה בשליחה. אפשר לנסות שוב או ליצור קשר בוואטסאפ.' }
  });
})();
