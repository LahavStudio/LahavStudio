// v5.0.5b — robust hamburger: staggered open, reverse stagger close, clickable links
(function(){
  const hamb = document.querySelector('.hamburger');
  const menu = document.querySelector('.mobile-menu');
  if(!hamb || !menu) return;
  let isOpen = false, isAnimating = false;

  function openMenu(){
    if(isAnimating || isOpen) return;
    isAnimating = true;
    menu.removeAttribute('hidden');
    menu.classList.remove('closing');
    menu.classList.add('opening');
    setTimeout(()=>{
      menu.classList.remove('opening');
      menu.classList.add('open'); // keep visible & clickable
      isAnimating = false; isOpen = true;
      hamb.setAttribute('aria-expanded','true');
    }, 350);
  }

  function closeMenu(){
    if(isAnimating || !isOpen) return;
    isAnimating = true;
    menu.classList.remove('opening');
    menu.classList.remove('open');       // allow itemOut reverse stagger
    menu.classList.add('closing');
    hamb.setAttribute('aria-expanded','false');
    setTimeout(()=>{
      menu.setAttribute('hidden','');
      menu.classList.remove('closing');
      isAnimating = false; isOpen = false;
    }, 400); // 150ms delay + 220ms anim ~= 370ms
  }

  hamb.addEventListener('click', (e)=>{
    e.preventDefault(); e.stopPropagation();
    if(isOpen){ closeMenu(); } else { openMenu(); }
  }, {passive:false});

  // Click on links -> smooth scroll + close
  menu.addEventListener('click', (e)=>{
    const a = e.target.closest('a');
    if(!a) return;
    const href = a.getAttribute('href') || '';
    if(href.startsWith('#')){
      const id = href.slice(1);
      const el = document.getElementById(id);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
      closeMenu();
    }
  });

  // ESC to close
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeMenu(); });

  // Clean state on load
  document.addEventListener('DOMContentLoaded', ()=>{
    if(menu.hasAttribute('hidden')){ menu.classList.remove('open','opening','closing'); }
  });
})();

// Year
const y=document.getElementById('year'); if(y) y.textContent=(new Date).getFullYear();

// Category chips filter
(function(){
  const chips=Array.from(document.querySelectorAll('.cat-inner .chip'));
  const items=Array.from(document.querySelectorAll('.g-item'));
  if(chips.length===0||items.length===0) return;
  function apply(cat){ chips.forEach(c=>c.classList.toggle('active', c.dataset.cat===cat)); items.forEach(it=>{ const k=it.dataset.cat||'all'; it.style.display=(cat==='all'||k===cat)?'':'none'; }); }
  chips.forEach(chip=> chip.addEventListener('click', ()=>{ const cat=chip.dataset.cat||'all'; apply(cat); const url=new URL(location.href); url.searchParams.set('cat',cat); history.replaceState(null,'',url.toString()); const g=document.getElementById('gallery'); if(g) g.scrollIntoView({behavior:'smooth'}); }));
  const url=new URL(location.href); const initial=url.searchParams.get('cat')||'all'; apply(chips.some(c=>c.dataset.cat===initial)?initial:'all');
})();

// Google Sheets submit + package selection
(function(){
  const form=document.getElementById('leadFormSheets'); if(!form) return; const msg=document.getElementById('formMsg');
  const ENDPOINT='https://script.google.com/macros/s/AKfycbykPdxDbPJmT48ZwSjYAqFNq41m4D0-mw18gNih2fskZBNsAfD5c7j4X7ADL0EYFppN/exec';
  document.querySelectorAll('[data-plan]').forEach(btn=>btn.addEventListener('click',()=>{
    const sel=document.getElementById('packageSelect'); if(sel) sel.value=btn.getAttribute('data-plan');
  }));
  form.addEventListener('submit', async (e)=>{
    e.preventDefault(); const fd=new FormData(form); const payload=Object.fromEntries(fd.entries()); payload.source_url=location.href; msg.textContent='שולח...';
    try{ await fetch(ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); msg.textContent='הטופס נשלח! ניצור קשר בהקדם.'; form.reset(); }
    catch(err){ msg.textContent='שגיאה בשליחה. אפשר לנסות שוב או ליצור קשר בוואטסאפ.'; }
  });
})();
