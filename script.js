
const hamb = document.querySelector('.hamburger');
const nav = document.getElementById('nav');
if(hamb && nav){
  hamb.addEventListener('click', ()=>{
    const open = hamb.getAttribute('aria-expanded') === 'true';
    hamb.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('open', !open);
  });
  nav.querySelectorAll('a').forEach(link=> link.addEventListener('click', ()=>{
    nav.classList.remove('open'); hamb.setAttribute('aria-expanded', 'false');
  }));
}
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
(function(){
  const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(mediaReduced.matches) return;
  const canvas = document.getElementById('sparkles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w=0,h=0,dpr=1, particles=[];
  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    w = canvas.width = Math.floor(vw * dpr);
    h = canvas.height = Math.floor(vh * dpr);
    canvas.style.width = vw+'px';
    canvas.style.height = vh+'px';
    const base = vw*vh < 400*700 ? 60 : vw*vh < 900*900 ? 110 : 180;
    particles = new Array(base).fill(0).map(()=> ({
      x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.5 + 0.6,
      a: Math.random()*Math.PI*2, s: (Math.random()*0.4 + 0.15),
      tw: Math.random()*Math.PI*2, tc: Math.random()*0.02 + 0.008
    }));
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    for(const p of particles){
      p.x += Math.cos(p.a) * p.s;
      p.y += Math.sin(p.a) * p.s * 0.5;
      p.a += (Math.random()-0.5)*0.02;
      if(p.x < 0) p.x = w; else if(p.x > w) p.x = 0;
      if(p.y < 0) p.y = h; else if(p.y > h) p.y = 0;
      p.tw += p.tc;
      const alpha = 0.28 + Math.sin(p.tw)*0.22;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6);
      grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r*6, 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize, {passive:true});
  resize(); draw();
})();
