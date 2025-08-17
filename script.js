
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
  form.addEventListener('submit', async (e)=>{
    e.preventDefault(); const fd=new FormData(form); const payload=Object.fromEntries(fd.entries()); payload.source_url=location.href; msg.textContent='שולח...';
    try{ await fetch(ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); msg.textContent='הטופס נשלח! ניצור קשר בהקדם.'; form.reset(); }
    catch(err){ msg.textContent='שגיאה בשליחה. אפשר לנסות שוב או ליצור קשר בוואטסאפ.'; }
  });
})();

/* guests options filler (50 → 1000) */
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
  const PHONE = '972532799664';
  const form = document.getElementById('leadFormSheets') || document.querySelector('#contact form');
  if (!form) return;
  const val = (n) => (form.querySelector(`[name="${n}"]`)?.value || '').trim();

  // מלא את כמות המוזמנים אם ריק
  const sel = form.querySelector('#guests');
  if (sel && !sel.querySelector('option[value="50"]')) {
    if (!sel.querySelector('option[value=""]')) {
      const first = document.createElement('option');
      first.value = ''; first.disabled = true; first.selected = true; first.textContent = 'בחר כמות';
      sel.prepend(first);
    }
    for (let n = 50; n <= 1000; n += 50) {
      const opt = document.createElement('option');
      opt.value = String(n);
      opt.textContent = n.toLocaleString('he-IL');
      sel.appendChild(opt);
    }
  }
function buildText(){
  const name = val('name');
  const phone= val('phone');
  const date = val('event_date');
  const type = val('event_type');
  const pack = val('package');
  const guests = val('guests');
  const note = val('msg');
  return `היי, זה ${name} מהאתר להב סטודיו 📸
יש לי ${type} בתאריך ${date}
כמות המוזמנים שלי היא: ${guests} 💃🏽
ואני מעוניין לשמוע עוד פרטים על חבילת ה-${pack} 🎉
זה מספר הפלאפון שלי:${phone} 📱
וחשוב לי שתדע על האירוע ש${note}`;
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

  const msg = `היי, זה ${name} מהאתר להב סטודיו 📸
יש לי ${type} בתאריך ${date}
כמות המוזמנים שלי היא: ${guests} 💃🏽
ואני מעוניין לשמוע עוד פרטים על חבילת ה-${pack} 🎉
זה מספר הפלאפון שלי:${phone} 📱
וחשוב לי שתדע על האירוע ש${note}`;

  return encodeURIComponent(msg);
}
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

/* v5.2.2 — harden contact form: guests + WhatsApp submit (capture) */
(function(){
  // 1) locate the form robustly
  var form =
    document.getElementById('leadFormSheets') ||
    document.getElementById('contactForm')   ||
    document.querySelector('#contact form');
  if (!form) return;

  // 2) normalize form so it won't submit/refresh by itself
  try { form.removeAttribute('action'); } catch(_){}
  try { form.removeAttribute('target'); } catch(_){}

  // 3) ensure the guests select exists and is populated 50..1000
  function fillGuests(){
    var sel = document.getElementById('guests') || form.querySelector('select[name="guests"]');
    if (!sel) return;
    // already filled?
    if (sel.querySelector('option[value="50"]')) return;

    // keep placeholder at the top
    if (!sel.querySelector('option[value=""]')){
      var first = document.createElement('option');
      first.value = '';
      first.disabled = true;
      first.selected = true;
      first.textContent = 'בחר כמות';
      sel.prepend(first);
    }

    for (var n = 50; n <= 1000; n += 50){
      if (!sel.querySelector('option[value="' + n + '"]')){
        var opt = document.createElement('option');
        opt.value = String(n);
        opt.textContent = n.toLocaleString('he-IL');
        sel.appendChild(opt);
      }
    }
  }

  // run now or on DOM ready (works בכל הדפדפנים)
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', fillGuests, {once:true});
  } else {
    fillGuests();
  }

  // 4) helper to read values by name=
  function val(n){
    var el = form.querySelector('[name="'+n+'"]');
    return el ? (el.value || '').trim() : '';
  }

  // 5) exact WhatsApp message (שורות חדשות אמיתיות)
  function buildMsg(){
    var name   = val('name');
    var phone  = val('phone');
    var date   = val('event_date');
    var type   = val('event_type');
    var pack   = val('package');
    var guests = val('guests');
    var note   = val('msg');

    return `היי, זה ${name} מהאתר להב סטודיו 📸
יש לי ${type} בתאריך ${date}
כמות המוזמנים שלי היא: ${guests} 💃🏽
ואני מעוניין לשמוע עוד פרטים על חבילת ה-${pack} 🎉
זה מספר הפלאפון שלי:${phone} 📱
וחשוב לי שתדע על האירוע ש${note}`;
  }

  // 6) capture submit FIRST: stop refresh, open WA
  form.addEventListener('submit', function(e){
    e.preventDefault();
    e.stopImmediatePropagation(); // עוצר מאזינים אחרים שינסו לשלוח

    var url = 'https://api.whatsapp.com/send?phone=972532799664&text=' + encodeURIComponent(buildMsg());

    // תאימות iOS/Safari
    setTimeout(function(){ window.location.href = url; }, 0);
  }, true);

  // 7) עוד גידור: מאזין bubble שמבטל כל שליחה מאוחרת
  form.addEventListener('submit', function(e){ e.preventDefault(); }, false);

  // 8) אם יש לך כפתור <a id="waSend"> — נעדכן לו קישור חי
  var link = document.getElementById('waSend');
  function updateLink(){
    if (!link) return;
    link.setAttribute(
      'href',
      'https://api.whatsapp.com/send?phone=972532799664&text=' + encodeURIComponent(buildMsg())
    );
  }
  ['input','change'].forEach(function(ev){
    form.addEventListener(ev, updateLink, true);
  });
  updateLink();
})();
