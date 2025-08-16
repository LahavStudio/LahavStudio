/*! menu-links-hotfix.js — makes hamburger menu items clickable without touching animations (v5.1.0 base) */
(function(){
  try{
    // 1) Style injection: make sure the overlay catches taps and links are clickable
    const styleId = 'menu-links-hotfix-style';
    if(!document.getElementById(styleId)){
      const s = document.createElement('style');
      s.id = styleId;
      s.textContent = `
        .mobile-menu{ z-index:9999 !important; pointer-events:auto !important }
        .mobile-menu *{ pointer-events:auto !important }
        .mobile-menu .row a{ display:inline-block; cursor:pointer; -webkit-tap-highlight-color: rgba(0,0,0,0.15) }
      `;
      document.head.appendChild(s);
    }

    // 2) Turn items into anchors if they aren't
    const menu = document.querySelector('.mobile-menu');
    if(!menu) return;
    const row = menu.querySelector('.row') || menu;
    const sections = ['home','services','packages','gallery','contact']; // common ids on your page
    let kids = Array.from(row.children).filter(n => n.nodeType===1);

    if(!kids.some(n => n.tagName === 'A')){
      kids.forEach((el, idx) => {
        const a = document.createElement('a');
        a.href = '#' + (sections[idx] || 'home');
        a.className = 'menu-link';
        a.textContent = el.textContent.trim();
        el.replaceWith(a);
      });
    }else{
      // normalize hrefs
      let i=0;
      Array.from(row.querySelectorAll('a')).forEach(a=>{
        const href = a.getAttribute('href') || '';
        if(!href.startsWith('#')) a.setAttribute('href', '#' + (sections[i] || 'home'));
        i++;
      });
    }

    // 3) Let links navigate natively; then close the menu AFTER a short delay (so exit animation runs)
    const links = Array.from(row.querySelectorAll('a'));
    function closeSafely(){
      if(typeof window.closeMenu === 'function'){
        setTimeout(window.closeMenu, 80);
      }else{
        // fallback: hide the container if no closeMenu global exists
        menu.setAttribute('hidden','');
      }
    }
    const bind = (el) => {
      el.addEventListener('click', closeSafely, {passive:true});
      el.addEventListener('touchend', closeSafely, {passive:true});
    };
    links.forEach(bind);
  }catch(e){
    console.error('menu-links-hotfix error', e);
  }
})();
