
// ===== v5.1.0 — Deterministic hamburger (stagger IN/OUT via JS), links clickable =====
(function(){
  const hamb = document.querySelector('.hamburger');
  const menu = document.querySelector('.mobile-menu');
  if(!hamb || !menu) return;
  if(menu.dataset.menuInit === '1') return;
  menu.dataset.menuInit = '1';

  let isOpen = false, isAnimating = false;
  const items = Array.from(menu.querySelectorAll('.row a'));
  const inDur = 280, outDur = 220, gap = 30; // ms

  function animateIn(){
    items.forEach((a,i)=>{
      a.style.opacity = '0';
      a.style.transform = 'translateY(-8px)';
      a.style.animation = 'none';
      // force reflow
      void a.offsetWidth;
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
    const total = (items.length*gap) + outDur + 50;
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

  // Click inside the menu => smooth-scroll + close
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

  // ESC closes
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeMenu(); });
})();


// v5.0.7 — single-source hamburger controller (stagger open, reverse stagger close, clickable links)
// v5.0.5b — robust hamburger: staggered open, reverse stagger close, clickable links

// Year
const y=document.getElementById('year'); if(y) y.textContent=(new Date).getFullYear();



// v5.0.6 — Gallery category chips: robust delegation + URL sync + smooth scroll
(function(){
  const wrap = document.querySelector('.cat-inner');
  const gallery = document.getElementById('gallery');
  const items = Array.from(document.querySelectorAll('.g-item'));
  const chips = Array.from(document.querySelectorAll('.cat-inner .chip'));
  if(!wrap || items.length===0 || chips.length===0) return;

  function apply(cat){
    chips.forEach(c=>{
      const active = (c.dataset.cat===cat);
      c.classList.toggle('active', active);
      c.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    items.forEach(it=>{
      const k = it.dataset.cat || 'all';
      it.style.display = (cat==='all' || k===cat) ? '' : 'none';
    });
  }

  // Init from URL
  const url = new URL(location.href);
  let current = url.searchParams.get('cat') || 'all';
  if(!chips.some(c=>c.dataset.cat===current)) current = 'all';
  apply(current);

  // Delegate clicks
  wrap.addEventListener('click', (e)=>{
    const btn = e.target.closest('.chip');
    if(!btn) return;
    e.preventDefault();
    const cat = btn.dataset.cat || 'all';
    current = cat;
    apply(cat);
    const u = new URL(location.href);
    u.searchParams.set('cat', cat);
    history.replaceState(null,'',u.toString());
    if(gallery) gallery.scrollIntoView({behavior:'smooth'});
  }, {passive:false});
})();

// Google Sheets submit + package selection
(function(){
  const form=document.getElementById('leadFormSheets'); if(!form) return; const msg=document.getElementById('formMsg');
  const ENDPOINT='https://script.google.com/macros/s/AKfycbykPdxDbPJmT48ZwSjYAqFNq41m4D0-mw18gNih2fskZBNsAfD5c7j4X7ADL0EYFppN/exec';
  document.querySelectorAll('[data-plan]').forEach(btn=>btn.addEventListener('click',()=>{
    const sel=document.getElementById('packageSelect'); if(sel) sel.value=btn.getAttribute('data-plan');
  }));
  const fd=new FormData(form); const payload=Object.fromEntries(fd.entries()); payload.source_url=location.href; msg.textContent='שולח...';
    try{ await fetch(ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); msg.textContent='הטופס נשלח! ניצור קשר בהקדם.'; form.reset(); }
    catch(err){ msg.textContent='שגיאה בשליחה. אפשר לנסות שוב או ליצור קשר בוואטסאפ.'; }
  });
})();


// v5.2.0 — smooth-scroll for always-visible header nav (no hamburger)
(function(){
  const nav = document.querySelector('.main-nav');
  if(!nav) return;
  nav.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
    }, {passive:false});
  });
})();






// v5.2.2-whatsapp3 — ultra-robust WhatsApp open on mobile
(function(){
  const PHONE = '972532799664';
  function byName(form, name){ const el = form.querySelector(`[name="${name}"]`); return el?String(el.value||'').trim():''; }
  function buildText(form){
    const name = byName(form, 'name');
    const phone= byName(form, 'phone');
    const date = byName(form, 'date');
    const type = byName(form, 'type');
    const pack = byName(form, 'package');
    const note = byName(form, 'msg');
    const lines = [];
    lines.push(`היי, זה ${name || 'לקוח'} מהאתר "להב סטודיו" ✨`);
    if (phone) lines.push(`טלפון: ${phone}`);
    if (date)  lines.push(`תאריך האירוע: ${date}`);
    if (type)  lines.push(`סוג האירוע: ${type}`);
    if (pack)  lines.push(`חבילה: ${pack}`);
    if (note)  lines.push(`הודעה: ${note}`);
    lines.push(`קישור לעמוד: ${location.href}`);
    return encodeURIComponent(lines.join('\\n'));
  }

  function openWhatsApp(text){
    // Try native scheme first (best on iOS/Android), then fallbacks
    const scheme = `whatsapp://send?phone=${PHONE}&text=${text}`;
    const wa1 = `https://wa.me/${PHONE}?text=${text}`;
    const wa2 = `https://api.whatsapp.com/send?phone=${PHONE}&text=${text}`;

    let navigated = false;
    try {
      window.location.href = scheme;
      navigated = true;
    } catch(e){}

    // Fallback after a short delay if scheme blocked
    setTimeout(()=>{
      if (document.visibilityState === 'hidden') return; // already switched to app
      try {
        const w = window.open(wa1, '_blank');
        if (!w) window.location.assign(wa1);
      } catch(e) {
        window.location.assign(wa1);
      }
      // Secondary fallback if popup blocked
      setTimeout(()=>{
        if (document.visibilityState === 'hidden') return;
        window.location.assign(wa2);
      }, 900);
    }, 600);
  }

  function attach(){
    const form = document.getElementById('leadFormSheets') || document.querySelector('section#contact form');
    if(!form) return;
    const msgEl = document.getElementById('formMsg');

    function handle(e){
      if (e) e.preventDefault();
      if (msgEl) msgEl.textContent = 'פותח WhatsApp...';
      const txt = buildText(form);
      openWhatsApp(txt);
      return false;
    }

    // Submit event
    form.addEventListener('submit', handle, {passive:false});

    // Also on an explicit click of a submit button (in case type/button mismatches)
    const btn = form.querySelector('button[type="submit"], [data-wa-submit], .submit, .btn-submit');
    if (btn) btn.addEventListener('click', handle, {passive:false});
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
