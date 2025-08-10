// core/migration.js
// Pegamento de migración: enlaza inventario con Drag, auto-registra hotspots
// por atributos data-* y aplica acciones (reveal/flag/pista/consume/goto/...).

;(function(){
  // ===== Utils estado/UI =====
  function ensureState(){
    if (!window.flags || typeof window.flags!=='object') window.flags = {};
    if (!Array.isArray(window.pistas)) window.pistas = [];
    if (!Array.isArray(window.inventory)) window.inventory = [];
    if (!window.i18n) window.i18n = { lang:'es' };
    if (!window.ui) window.ui = {};
    if (typeof window.ui.note !== 'function') window.ui.note = (t)=>console.log('[note]', t);
    if (!window.sfx) window.sfx = { ok:()=>{}, err:()=>{} };
  }
  ensureState();

  // Normaliza id de item desde un nodo inventario
  function inferItemIdFromNode(el){
    return (el?.dataset?.itemId) ||
           el?.getAttribute?.('data-item') ||
           el?.id ||
           String(el?.textContent||'').trim().toLowerCase().replace(/\s+/g,'_');
  }

  // ===== Inventario: bind automágico y rebind tras cambios =====
  function bindInventory(selector='.inventory .item'){
    // anota data-item-id si falta
    document.querySelectorAll(selector).forEach(el=>{
      if (!el.dataset.itemId) el.dataset.itemId = inferItemIdFromNode(el);
    });
    Hotspots?.bindInventory(selector);
  }

  // Observa cambios en el DOM para rebind del inventario
  const invObserver = new MutationObserver((muts)=>{
    let needs = false;
    for(const m of muts){
      if (m.type==='childList' && (m.target?.classList?.contains('inventory') || Array.from(m.addedNodes).some(n=>n?.classList?.contains?.('item')))) {
        needs = true; break;
      }
    }
    if (needs) bindInventory();
  });
  window.addEventListener('DOMContentLoaded', ()=>{
    const inv = document.querySelector('.inventory');
    if (inv) invObserver.observe(inv, {childList:true, subtree:true});
    bindInventory();
  });

  // ===== Hotspots por atributos =====
  // data-hotspot                       -> marca el elemento
  // data-accept="tiza|llave_portal|*"  -> qué items acepta (| separa)
  // data-consume="tiza|any"            -> consume el item
  // data-reveal="#sel1,#sel2"          -> quita .hidden / muestra
  // data-hide="#sel1,#sel2"            -> añade .hidden / oculta
  // data-flag="flag_name"              -> flags.flag_name = true
  // data-unflag="flag_name"            -> flags.flag_name = false
  // data-pista="id_pista"              -> añade a pistas
  // data-toast="texto"                 -> ui.note
  // data-goto="escena"                 -> nav.go('escena')
  // data-give="item_id"                -> añade ítem al inventario
  // data-remove="item_id"              -> quita ítem del inventario
  // data-setlang="es|en"               -> cambia idioma

  function parseListAttr(el, name){
    const raw = el.getAttribute(name);
    if (!raw) return [];
    return raw.split(',').map(s=>s.trim()).filter(Boolean);
  }

  function acceptFrom(el){
    const raw = el.getAttribute('data-accept') || '';
    if (raw==='*') return ()=>true;
    const allow = raw.split('|').map(s=>s.trim()).filter(Boolean);
    return (data)=> !!(data && data.type==='item' && allow.includes(data.itemId));
  }

  function applyActions(el, data){
    ensureState();
    const itemId = data?.itemId;

    // consume
    const consume = el.getAttribute('data-consume');
    if (consume){
      if (consume==='any' && itemId) removeItem(itemId);
      else if (consume && itemId===consume) removeItem(consume);
    }
    // reveal
    parseListAttr(el, 'data-reveal').forEach(sel=>{
      const n = document.querySelector(sel);
      if (n) {
        n.classList?.remove('hidden');
        if (n.style) n.style.display = '';
      }
    });
    // hide
    parseListAttr(el, 'data-hide').forEach(sel=>{
      const n = document.querySelector(sel);
      if (n) {
        n.classList?.add('hidden');
        if (n.style) n.style.display = 'none';
      }
    });
    // flag / unflag
    const flag = el.getAttribute('data-flag');
    if (flag) window.flags[flag] = true;
    const unflag = el.getAttribute('data-unflag');
    if (unflag) window.flags[unflag] = false;

    // pista
    const pista = el.getAttribute('data-pista');
    if (pista && !window.pistas.includes(pista)) window.pistas.push(pista);

    // give/remove
    const give = el.getAttribute('data-give');
    if (give) addItem(give);
    const rem = el.getAttribute('data-remove');
    if (rem) removeItem(rem);

    // idioma
    const lang = el.getAttribute('data-setlang');
    if (lang && window.i18n) window.i18n.lang = lang;

    // goto
    const go = el.getAttribute('data-goto');
    if (go && window.nav?.go) window.nav.go(go);

    // toast + ok
    const toast = el.getAttribute('data-toast');
    if (toast) window.ui?.note?.(toast);
    window.sfx?.ok?.();

    // refrescos
    window.ui?.refreshInventory?.();
    window.ui?.renderPistas?.();
    window.ui?.applyLang?.();
  }

  function addItem(id){
    if (!window.inventory.some(x=> (typeof x==='string' ? x===id : x?.id===id))) {
      window.inventory.push(id);
    }
  }
  function removeItem(id){
    const idx = window.inventory.findIndex(x=> (typeof x==='string' ? x===id : x?.id===id));
    if (idx>=0) window.inventory.splice(idx,1);
  }

  function registerAllHotspots(){
    ensureState();
    document.querySelectorAll('[data-hotspot]').forEach(el=>{
      if (el.dataset.boundHotspot==='1') return;
      el.dataset.boundHotspot = '1';
      Hotspots.register(el, {
        accept: acceptFrom(el),
        onDrop: (data)=> applyActions(el, data)
      });
    });
  }

  // Restauración en base a flags al cargar
  function restoreFromFlags(){
    document.querySelectorAll('[data-flag]').forEach(el=>{
      const k = el.getAttribute('data-flag');
      if (k && window.flags[k]) {
        // si estaba ya resuelto, aplica reveal/hide
        parseListAttr(el, 'data-reveal').forEach(sel=>{
          const n = document.querySelector(sel);
          if (n) { n.classList?.remove('hidden'); if (n.style) n.style.display = ''; }
        });
        parseListAttr(el, 'data-hide').forEach(sel=>{
          const n = document.querySelector(sel);
          if (n) { n.classList?.add('hidden'); if (n.style) n.style.display = 'none'; }
        });
      }
    });
  }

  // Hooks arranque
  document.addEventListener('DOMContentLoaded', ()=>{
    registerAllHotspots();
    restoreFromFlags();
  });

  // Exponer utilidades por si hay re-render manual
  window.migrate = {
    bindInventory,
    registerAllHotspots,
    restoreFromFlags
  };
})();
