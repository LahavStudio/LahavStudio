
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

/* guests options filler (50 → 1000) — insert between Sheets block and WA capture */
(function(){
  const sel = document.getElementById('guests') || document.querySelector('#contact select[name="guests"]');
  if (!sel || sel.querySelector('option[value="50"]')) return;
  if (!sel.querySelector('option[value=""]')) {
    const first = document.createElement('option');
    first.value = ''; first.disabled = true; first.selected = true;
    first.textContent = 'בחר כמות';
    sel.prepend(first);
  }
  for (let n = 50; n <= 1000; n += 50) {
    if (!sel.querySelector(`option[value="${n}"]`)) {
      const opt = document.createElement('option');
      opt.value = String(n);
      opt.textContent = n.toLocaleString('he-IL');
      sel.appendChild(opt);
    }
  }
})();


// ===== v5.2.2 — WhatsApp redirect (capture-phase; overrides Sheets) =====
(function(){
  const form = document.getElementById('leadFormSheets');
  if(!form) return;
  const PHONE = '972532799664'; // יאן
  function val(name){ const el=form.querySelector(`[name="${name}"]`); return el ? String(el.value||'').trim() : ''; }
  function buildText(){
    const name = val('name');
    const phone= val('phone');
    const date = val('event_date');
    const type = val('event_type');
    const pack = val('package');
    const guests = val('guests');
    const note = val('msg');
    const lines = [];
    lines.push(`היי, זה ${name || 'לקוח'} מהאתר להב סטודיו 📸`);
    if (type || date || pack) {
      lines.push(`יש לי ${type || 'אירוע'} בתאריך ${date || '[תאריך]'} ואני מעוניין לשמוע עוד פרטים על חבילת ה-${pack || '[חבילה]'} 🎉`);
    }
    if (guests) {
      lines.push(`כמות המוזמנים שלי היא: ${guests} 💃🏽`);
    }
    if (phone) {
      lines.push(`זה מספר הפלאפון שלי: ${phone} 📱`);
    }
    if (note) {
      lines.push(`וחשוב לי שתדע על האירוע ש${note}`);
    }
    return lines.join('\
');
  }
  form.addEventListener('submit', function(e){
    // run before any other submit listeners:
    e.preventDefault(); e.stopImmediatePropagation();
    const text = encodeURIComponent(buildText());
    const url  = `https://api.whatsapp.com/send?phone=${PHONE}&text=${text}`;
    window.location.href = url;
  }, true); // capture-phase so it fires first
})();


// v5.2.2-inlineWA (minimal) — turn the Send button into a real <a> link that updates live
(function(){
  const form = document.getElementById('leadFormSheets') || document.querySelector('#contact form');
  const link = document.getElementById('waSend');
  const PHONE = '972532799664';
  if(!form || !link) return;

  function val(n){ const el=form.querySelector(`[name="${n}"]`); return el ? String(el.value||'').trim() : ''; }

  function buildText(){
    const name = val('name');
    const phone= val('phone');
    const date = val('event_date');
    const type = val('event_type');
    const pack = val('package');
    const guests = val('guests');
    const note = val('msg');
    const parts = [];
    parts.push(`היי, זה ${name || 'לקוח'} מהאתר להב סטודיו 📸`);
    parts.push(`יש לי ${type || 'אירוע'} בתאריך ${date || '[תאריך]'} ואני מעוניין לשמוע עוד פרטים על חבילת ה-${pack || '[חבילה]'} 🎉`);
    if (guests) parts.push(`כמות המוזמנים שלי היא: ${guests} 💃🏽`);
    if (phone)  parts.push(`זה מספר הפלאפון שלי: ${phone} 📱`);
    if (note)   parts.push(`וחשוב לי שתדע על האירוע ש${note}`);

    return encodeURIComponent(parts.join('\
'));
  }

  function update(){
    const text = buildText();
    // iOS/Safari is more consistent with api.whatsapp.com
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const base = (isiOS && isSafari) ? 'https://api.whatsapp.com/send' : `https://wa.me/${PHONE}`;
    const url  = base.includes('api.whatsapp.com')
      ? `${base}?phone=${PHONE}&text=${text}`
      : `${base}?text=${text}`;
    link.setAttribute('href', url);
  }

  form.addEventListener('input', update, {passive:true});
  form.addEventListener('change', update, {passive:true});
  update();
})();

// v5.2.2 navfix: remove old hamburger/menu if present
(function(){
  document.querySelectorAll('.hamburger, .mobile-menu, .header-bar .logo').forEach(el=>el.remove());
})();
// smooth scroll for top-nav links
document.querySelectorAll('.top-nav .nav-link').forEach(a=>{
  a.addEventListener('click', function(e){
    const id = this.getAttribute('href');
    if(id && id.startsWith('#')){
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({behavior:'smooth', block:'start'});
    }
  }, {passive:false});
});


// v5.2.2 navfix2: smooth scroll for header links
document.querySelectorAll('.top-nav .nav-link').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const id = a.getAttribute('href');
    if(id && id.startsWith('#')){
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({behavior:'smooth', block:'start'});
    }
  }, {passive:false});
});


// ===== v5.3.1 — Gallery Carousel Paged (2x2), infinite, swipe, desktop arrows, lightbox =====
(function(){
  const root = document.querySelector('.carousel');
  if(!root) return;

  const track = root.querySelector('.car-track');
  const viewport = root.querySelector('.car-viewport');
  const btnPrev = root.querySelector('.car-arrow.left');
  const btnNext = root.querySelector('.car-arrow.right');

  // אסוף את כל הפריטים הקיימים (תמונות)
  let items = Array.from(track.querySelectorAll('.g-item'));
  if(items.length === 0) return;

  // הוסף אינדקסים קבועים לכל פריט (חשוב ללייטבוקס)
  items.forEach((el, i)=> el.dataset.idx = String(i));

  const PAGE_SIZE = 4; // 2x2 בכל עמוד
  const TRANSITION_MS = 360;

  // חלק לעמודים של 4
  function chunk(arr, size){
    const out = [];
    for(let i=0;i<arr.length;i+=size) out.push(arr.slice(i, i+size));
    return out;
  }
  const pagesData = chunk(items, PAGE_SIZE);

  // נקה את ה-track ובנה car-page לכל עמוד
  track.innerHTML = '';
  function makePage(nodes){
    const div = document.createElement('div');
    div.className = 'car-page';
    nodes.forEach(n => div.appendChild(n));
    return div;
  }
  const realPages = pagesData.map(makePage);
  realPages.forEach(p => track.appendChild(p));

  // לופ אינסופי: משכפלים עמוד ראשון ואחרון
  const headClone = realPages[0].cloneNode(true);
  const tailClone = realPages[realPages.length-1].cloneNode(true);
  track.insertBefore(tailClone, track.firstChild);
  track.appendChild(headClone);

  // רשימת כל העמודים כולל שכפולים
  let pages = Array.from(track.querySelectorAll('.car-page'));

  // אם יש רק עמוד אחד — נטרל חיצים (אין מה לדפדף)
  const pageCount = realPages.length;
  if(pageCount <= 1){
    root.classList.add('no-arrows');
  }else{
    root.classList.remove('no-arrows');
  }

  // מיקום התחלתי: העמוד האמיתי הראשון (index=1 כי 0 זה השכפול בזנב)
  let index = 1;
  function setTransition(on){
    track.style.transition = on ? `transform ${TRANSITION_MS}ms ease` : 'none';
  }
  function update(animate=true){
    setTransition(animate);
    const translate = -(index * 100); // כל עמוד = 100%
    track.style.transform = `translateX(${translate}%)`;
  }
  update(false);

  // ניווט
  let isAnimating = false;
  function step(dir){
    if(isAnimating || pageCount <= 1) return;
    isAnimating = true;
    index += (dir === 'next' ? 1 : -1);
    update(true);
  }
  const next = ()=> step('next');
  const prev = ()=> step('prev');

  // חיצים (יראו רק בדסקטופ לפי CSS)
  btnNext?.addEventListener('click', next, {passive:true});
  btnPrev?.addEventListener('click', prev, {passive:true});

  // לופ אחרי טרנזישן
  track.addEventListener('transitionend', ()=>{
    isAnimating = false;
    if(index >= pageCount + 1){ // עברנו את השכפול בסוף → קפיצה לעמוד 1
      index = 1; update(false);
    }else if(index <= 0){ // עברנו את השכפול בתחילה → קפיצה לעמוד האחרון
      index = pageCount; update(false);
    }
  });

  // סווייפ (pointer/touch) – עמוד־עמוד
  let startX = 0, deltaX = 0, isDown = false;
  const threshold = 40; // px
  function onDown(e){
    isDown = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    deltaX = 0;
  }
  function onMove(e){
    if(!isDown) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    deltaX = x - startX;
  }
  function onUp(){
    if(!isDown) return;
    isDown = false;
    if(Math.abs(deltaX) > threshold){
      // RTL: גרירה שמאלה -> next
      if(deltaX < 0) next(); else prev();
    }
  }
  viewport.addEventListener('pointerdown', onDown, {passive:true});
  window.addEventListener('pointermove', onMove, {passive:true});
  window.addEventListener('pointerup', onUp, {passive:true});
  viewport.addEventListener('touchstart', onDown, {passive:true});
  window.addEventListener('touchmove', onMove, {passive:true});
  window.addEventListener('touchend', onUp, {passive:true});

  // אוטו-פליי
  let autoplayTimer = null;
  const AUTOPLAY_MS = 4000;
  function startAuto(){ stopAuto(); if(pageCount>1) autoplayTimer = setInterval(next, AUTOPLAY_MS); }
  function stopAuto(){ if(autoplayTimer){ clearInterval(autoplayTimer); autoplayTimer = null; } }
  startAuto();
  root.addEventListener('mouseenter', stopAuto, {passive:true});
  root.addEventListener('mouseleave', startAuto, {passive:true});
  root.addEventListener('focusin', stopAuto);
  root.addEventListener('focusout', startAuto);

  // לייטבוקס – עובד על כל הפריטים האמיתיים (לא שכפולים)
  initLightbox();

  // התאמה ברזולוציה – שמירת מיקום
  window.addEventListener('resize', ()=> update(false));

  // --- Lightbox helper ---
  function initLightbox(){
    const lb = document.querySelector('.lightbox');
    if(!lb) return;
    const lbImg = lb.querySelector('.lb-img');
    const btnClose = lb.querySelector('.lb-close');
    const btnPrev = lb.querySelector('.lb-prev');
    const btnNext = lb.querySelector('.lb-next');

    // כל הפריטים האמיתיים (בלי השכפולים)
    const realPagesEls = Array.from(track.querySelectorAll('.car-page')).slice(1, -1);
    const realItems = realPagesEls.flatMap(p => Array.from(p.querySelectorAll('.g-item')));

    let current = 0;
    function openAt(i){
      const len = realItems.length;
      if(!len) return;
      current = ((i % len) + len) % len;
      const img = realItems[current].querySelector('img');
      if(img){
        lbImg.src = img.currentSrc || img.src;
        lb.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
        lb.focus();
      }
    }
    function close(){
      lb.setAttribute('hidden','');
      document.body.style.overflow = '';
    }
    function nextLB(){ openAt(current+1); }
    function prevLB(){ openAt(current-1); }

    // פתיחה בלחיצה – נעזר ב-data-idx שהוספנו לפני הקיבוץ לעמודים
    track.addEventListener('click', (e)=>{
      const btn = e.target.closest('.g-item');
      if(!btn) return;
      const idx = Number(btn.dataset.idx || '0');
      openAt(idx);
    });

    btnClose?.addEventListener('click', close, {passive:true});
    btnNext?.addEventListener('click', nextLB, {passive:true});
    btnPrev?.addEventListener('click', prevLB, {passive:true});

    lb.addEventListener('click', (e)=>{ if(e.target === lb) close(); }, {passive:true});
    document.addEventListener('keydown', (e)=>{
      if(lb.hasAttribute('hidden')) return;
      if(e.key === 'Escape') close();
      else if(e.key === 'ArrowRight') nextLB();
      else if(e.key === 'ArrowLeft') prevLB();
    });
  }
})();
