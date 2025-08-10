// core/drag.js
// Gestor de drag & drop ligero: mouse + touch, ghost, enter/leave de hotspots.

;(function(){
  const Drag = {
    active: null,   // {el, data, ghost, x, y}
    onMove: null,   // opcional callback global
    start(el, data={}) {
      stopActive();
      const s = Drag.active = {
        el, data,
        ghost: makeGhost(el),
        x: 0, y: 0,
        over: null // hotspot actual (lo marca Hotspots)
      };
      document.addEventListener('pointermove', onPointerMove, {passive:false});
      document.addEventListener('pointerup', onPointerUp, {passive:false});
      el.setPointerCapture?.(lastPointerId);
      return s;
    },
    registerDraggable(el, dataGetter){
      if (!el) return;
      el.style.touchAction = 'none';
      el.addEventListener('pointerdown', (ev)=>{
        lastPointerId = ev.pointerId;
        ev.preventDefault();
        const data = (typeof dataGetter === 'function') ? dataGetter(el) : (dataGetter || {});
        Drag.start(el, data);
        moveTo(ev.clientX, ev.clientY);
        Hotspots && Hotspots._enterLeave(ev.clientX, ev.clientY, Drag.active);
      });
    }
  };

  let lastPointerId = 0;

  function onPointerMove(ev){
    if (!Drag.active) return;
    ev.preventDefault();
    moveTo(ev.clientX, ev.clientY);
    Hotspots && Hotspots._enterLeave(ev.clientX, ev.clientY, Drag.active);
    Drag.onMove && Drag.onMove(Drag.active);
  }

  function onPointerUp(ev){
    if (!Drag.active) return;
    ev.preventDefault();
    const s = Drag.active;
    let dropped = false;
    if (window.Hotspots) {
      dropped = Hotspots._drop(ev.clientX, ev.clientY, s);
    }
    stopActive();
    // si quieres: callback global según dropped
  }

  function stopActive(){
    const s = Drag.active;
    if (!s) return;
    s.el.releasePointerCapture?.(lastPointerId);
    s.ghost?.remove?.();
    Drag.active = null;
    document.removeEventListener('pointermove', onPointerMove, {passive:false});
    document.removeEventListener('pointerup', onPointerUp, {passive:false});
    // Limpia hover residual
    Hotspots && Hotspots._clearHover();
  }

  function moveTo(x,y){
    const s = Drag.active; if(!s) return;
    s.x = x; s.y = y;
    const g = s.ghost;
    g.style.left = (x + 12) + 'px';
    g.style.top  = (y + 12) + 'px';
  }

  function makeGhost(src){
    const g = src.cloneNode(true);
    g.classList.add('drag-ghost');
    Object.assign(g.style,{
      position:'fixed', left:'-9999px', top:'-9999px',
      pointerEvents:'none', opacity:'0.8', transform:'scale(.95)',
      zIndex:'99999', filter:'drop-shadow(0 6px 20px rgba(0,0,0,.3))'
    });
    document.body.appendChild(g);
    // si el src es muy grande, acótalo
    const rect = src.getBoundingClientRect();
    if (rect.width>200) g.style.width = '200px';
    return g;
  }

  // estilos base (una vez)
  if (!document.getElementById('drag-style')) {
    const css = document.createElement('style');
    css.id = 'drag-style';
    css.textContent = `
      .hotspot{outline:2px dashed rgba(255,255,255,.2); transition:background .15s, outline-color .15s}
      .hotspot.hotspot--active{outline-color: rgba(148,163,184,.6);}
      .hotspot.hotspot--hover{outline-color: rgba(34,197,94,.95); background: rgba(34,197,94,.08);}
      .drag-ghost{user-select:none}
    `;
    document.head.appendChild(css);
  }

  window.Drag = Drag;
})();
