// core/hotspots.js
// Administra hotspots: register/unregister, enter/leave, drop y binding rápido de inventario.

;(function(){
  const _spots = new Set();
  let _hover = null;

  const Hotspots = {
    register(el, cfg){
      if (!el) return null;
      const spot = {
        el,
        accept: cfg?.accept || (()=>false),
        onEnter: cfg?.onEnter || (()=>{}),
        onLeave: cfg?.onLeave || (()=>{}),
        onDrop:  cfg?.onDrop  || (()=>{})
      };
      el.classList.add('hotspot','hotspot--active');
      _spots.add(spot);
      return spot;
    },
    unregister(el){
      for (const s of Array.from(_spots)) {
        if (s.el === el) { _spots.delete(s); el.classList.remove('hotspot','hotspot--active','hotspot--hover'); }
      }
    },
    // Helper: vincula items del inventario como draggables
    bindInventory(selector='.inventory .item'){
      const nodes = document.querySelectorAll(selector);
      nodes.forEach(el=>{
        if (el.dataset.boundDrag === '1') return;
        el.dataset.boundDrag = '1';
        Drag.registerDraggable(el, ()=>{
          const id = el.dataset.itemId || el.getAttribute('data-item') || el.id || 'item';
          return { type:'item', itemId:id, source:'inventory', el };
        });
      });
    },
    // === Internas usadas por Drag ===
    _enterLeave(x, y, state){
      const target = findHit(x, y, state?.data);
      if (target !== _hover) {
        if (_hover) { _hover.el.classList.remove('hotspot--hover'); safe(_hover.onLeave, state?.data, _hover.el); }
        _hover = target;
        if (_hover) { _hover.el.classList.add('hotspot--hover'); safe(_hover.onEnter, state?.data, _hover.el); }
      }
    },
    _clearHover(){
      if (_hover) { _hover.el.classList.remove('hotspot--hover'); _hover = null; }
    },
    _drop(x, y, state){
      const t = findHit(x, y, state?.data);
      if (!t) return false;
      safe(t.onDrop, state?.data, t.el);
      return true;
    }
  };

  function safe(fn, ...args){ try{ fn && fn(...args); }catch(e){ console.warn('[hotspot]', e); } }

  function findHit(x, y, data){
    // prueba colisión punto-en-rect con aceptación
    for (const s of _spots) {
      const r = s.el.getBoundingClientRect();
      const hit = (x>=r.left && x<=r.right && y>=r.top && y<=r.bottom);
      if (hit && s.accept(data)) return s;
    }
    return null;
  }

  window.Hotspots = Hotspots;
})();
