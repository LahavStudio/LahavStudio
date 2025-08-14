// Mobile hamburger toggle
const hamb=document.querySelector('.hamburger');
const mobileMenu=document.querySelector('.mobile-menu');
if(hamb && mobileMenu){
  hamb.addEventListener('click', ()=>{
    const open=mobileMenu.classList.toggle('open');
    hamb.setAttribute('aria-expanded', String(open));
  });
}
// Smooth scroll & close menu after click
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href').slice(1), el=document.getElementById(id);
  if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); if(mobileMenu) mobileMenu.classList.remove('open'); if(hamb) hamb.setAttribute('aria-expanded','false'); }
}));
// Year
const y=document.getElementById('year'); if(y) y.textContent=(new Date).getFullYear();
// Category filter
(function(){
  const chips=Array.from(document.querySelectorAll('.cat-inner .chip'));
  const items=Array.from(document.querySelectorAll('.g-item'));
  if(chips.length===0||items.length===0) return;
  function apply(cat){ chips.forEach(c=>c.classList.toggle('active', c.dataset.cat===cat)); items.forEach(it=>{ const k=it.dataset.cat||'all'; it.style.display=(cat==='all'||k===cat)?'':'none'; }); }
  chips.forEach(chip=> chip.addEventListener('click', ()=>{ const cat=chip.dataset.cat||'all'; apply(cat); const url=new URL(location.href); url.searchParams.set('cat',cat); history.replaceState(null,'',url.toString()); const g=document.getElementById('gallery'); if(g) g.scrollIntoView({behavior:'smooth'}); }));
  const url=new URL(location.href); const initial=url.searchParams.get('cat')||'all'; apply(chips.some(c=>c.dataset.cat===initial)?initial:'all');
})();
// Google Sheets submit
(function(){
  const form=document.getElementById('leadFormSheets'); if(!form) return; const msg=document.getElementById('formMsg');
  const ENDPOINT='https://script.google.com/macros/s/AKfycbykPdxDbPJmT48ZwSjYAqFNq41m4D0-mw18gNih2fskZBNsAfD5c7j4X7ADL0EYFppN/exec';
  document.querySelectorAll('[data-plan]').forEach(btn=>btn.addEventListener('click',()=>{ const sel=document.getElementById('packageSelect'); if(sel) sel.value=btn.getAttribute('data-plan'); }));
  form.addEventListener('submit', async (e)=>{ e.preventDefault(); const fd=new FormData(form); const payload=Object.fromEntries(fd.entries()); payload.source_url=location.href; msg.textContent='שולח...';
    try{ await fetch(ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); msg.textContent='הטופס נשלח! ניצור קשר בהקדם.'; form.reset(); }
    catch(err){ msg.textContent='שגיאה בשליחה. אפשר לנסות שוב או ליצור קשר בוואטסאפ.'; }
  });
})();
