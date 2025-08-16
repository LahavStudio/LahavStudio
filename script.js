
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



// v5.2.3 — Contact form → Google Sheets (JSON POST)
(function(){
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbykPdxDbPJmT48ZwSjYAqFNq41m4D0-mw18gNih2fskZBNsAfD5c7j4X7ADL0EYFppN/exec";
  const form = document.getElementById('leadFormSheets');
  const msg  = document.getElementById('formMsg');
  if(!form) return;

  // Optional: buttons that set the selected package
  document.querySelectorAll('[data-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sel = document.getElementById('packageSelect') || form.querySelector('[name="package"]');
      if (sel) sel.value = btn.getAttribute('data-plan');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    // Normalize common field names (keep your existing names)
    payload.source_url = location.href;
    payload.ua = navigator.userAgent;
    try {
      if (msg) msg.textContent = 'שולח...';
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // Treat any network success as OK; Apps Script returns JSON normally
      if (msg) msg.textContent = 'הטופס נשלח! ניצור קשר בהקדם.';
      form.reset();
    } catch(err) {
      if (msg) msg.textContent = 'שגיאה בשליחה. אפשר לנסות שוב או ליצור קשר בוואטסאפ.';
      console.error('Sheets submit error:', err);
    }
  });
})();
