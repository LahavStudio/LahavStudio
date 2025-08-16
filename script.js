/* Lahav Studio v5.1.0 — Mobile menu animations + clickable links hotfix */

/* ========== HAMBURGER (deterministic stagger) ========== */
(function(){
  const hamb = document.querySelector('.hamburger');
  const menu = document.querySelector('.mobile-menu');
  if(!hamb || !menu) return;
  if(menu.dataset.menuInit === '1') return;
  menu.dataset.menuInit = '1';

  let isOpen = false, isAnimating = false;
  const items = Array.from(menu.querySelectorAll('.row a'));
  const inDur = 280, outDur = 220, gap = 30; // ms

  function ensureClickable(){
    // Protect against CSS that disables clicks
    menu.style.zIndex = '9999';
    menu.style.pointerEvents = 'auto';
    items.forEach(a=>{
      a.style.pointerEvents = 'auto';
      a.style.cursor = 'pointer';
    });
  }

  function animateIn(){
    ensureClickable();
    items.forEach((a,i)=>{
      a.style.opacity = '0';
      a.style.transform = 'translateY(-8px)';
      a.style.animation = 'none';
      void a.offsetWidth; // reflow
      a.style.animation = `menuItemIn ${inDur}ms ease forwards`;
      a.style.animationDelay = `${(i+1)*gap}ms`;
    });
  }

  function animateOut(){
    items.slice().reverse().forEach((a,idx)=>{
      a.style.animation = 'none';
      void a.offsetWidth;
      a.style.animation = `menuItemOut ${outDur}ms ease forwards`;
      a.style.animationDelay = `${(idx+1)*gap}ms`;
    });
  }

  function openMenu(){
    if(isAnimating || isOpen) return;
    isAnimating = true;
    menu.removeAttribute('hidden');
    menu.classList.remove('closing');
    menu.classList.add('open'); // make links clickable immediately
    animateIn();
    const total = (items.length*gap) + inDur + 50;
    setTimeout(()=>{ isAnimating=false; isOpen=true; hamb.setAttribute('aria-expanded','true'); }, total);
  }

  function closeMenu(){
    if(isAnimating || !isOpen) return;
    isAnimating = true;
    animateOut();
    const total = (items.length*gap) + outDur + 60;
    setTimeout(()=>{
      menu.setAttribute('hidden','');
      isAnimating=false; isOpen=false;
      hamb.setAttribute('aria-expanded','false');
    }, total);
  }

  hamb.addEventListener('click',(e)=>{
    e.preventDefault(); e.stopPropagation();
    if(isOpen){ closeMenu(); } else { openMenu(); }
  }, {passive:false});

  // Make each link perform native anchor + close the menu
  items.forEach(a=>{
    a.addEventListener('click', function(){
      // allow default browser behavior (#anchor scroll), then close
      setTimeout(closeMenu, 60);
    }, {passive:true});
  });

  // ESC closes
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeMenu(); });
})();

/* ========== KEYFRAMES (in case they are missing in CSS, harmless if duplicated) ========== */
(function(){
  const id = 'menu-keyframes-fallback';
  if(document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
  @keyframes menuItemIn{ to{ opacity:1; transform:none } }
  @keyframes menuItemOut{ to{ opacity:0; transform:translateY(-8px) } }
  `;
  document.head.appendChild(style);
})();

/* ========== GALLERY CHIPS (leave as-is if already implemented; safe fallback) ========== */
(function(){
  const wrap = document.querySelector('.cat-inner');
  const items = Array.from(document.querySelectorAll('.g-item'));
  const chips = Array.from(document.querySelectorAll('.cat-inner .chip'));
  if(!wrap || items.length===0 || chips.length===0) return;
  function apply(cat){
    chips.forEach(c=>c.classList.toggle('active', c.dataset.cat===cat));
    items.forEach(it=>{ const k=it.dataset.cat||'all'; it.style.display=(cat==='all'||k===cat)?'':'none'; });
  }
  const url=new URL(location.href);
  let current = url.searchParams.get('cat') || 'all';
  if(!chips.some(c=>c.dataset.cat===current)) current='all';
  apply(current);
  wrap.addEventListener('click',(e)=>{
    const btn=e.target.closest('.chip'); if(!btn) return;
    const cat=btn.dataset.cat||'all'; apply(cat);
    const u=new URL(location.href); u.searchParams.set('cat',cat); history.replaceState(null,'',u.toString());
    document.getElementById('gallery')?.scrollIntoView({behavior:'smooth'});
  }, {passive:false});
})();

/* ========== GOOGLE SHEETS (leave as-is if already implemented; safe fallback) ========== */
(function(){
  const form=document.getElementById('leadFormSheets'); if(!form) return; const msg=document.getElementById('formMsg');
  const ENDPOINT='https://script.google.com/macros/s/AKfycbykPdxDbPJmT48ZwSjYAqFNq41m4D0-mw18gNih2fskZBNsAfD5c7j4X7ADL0EYFppN/exec';
  document.querySelectorAll('[data-plan]').forEach(btn=>btn.addEventListener('click',()=>{
    const sel=document.getElementById('packageSelect'); if(sel) sel.value=btn.getAttribute('data-plan');
  }));
  form.addEventListener('submit', async (e)=>{
    e.preventDefault(); const fd=new FormData(form); const payload=Object.fromEntries(fd.entries()); payload.source_url=location.href; if(msg) msg.textContent='שולח...';
    try{ await fetch(ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); if(msg) msg.textContent='הטופס נשלח! ניצור קשר בהקדם.'; form.reset(); }
    catch(err){ if(msg) msg.textContent='שגיאה בשליחה. אפשר לנסות שוב או ליצור קשר בוואטסאפ.'; }
  });
})();

/* ========== YEAR ========== */
(()=>{ const y=document.getElementById('year'); if(y) y.textContent=(new Date).getFullYear(); })();
