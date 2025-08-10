// core/engine.js
// Micro-motor compartido: asegura objetos globales, helpers de UI y persistencia básica.
// Se diseña para NO romper tus capítulos: sólo crea lo que falte.

;(function(){
  const Engine = {
    boot(opts={}){
      const chapterId = opts.chapterId || getChapterId();
      ensureGlobals();
      wireToasts();
      // Si no hay persist del capítulo, crea uno básico (localStorage)
      if (!window.persist) window.persist = {};
      if (typeof window.persist.saveSlot !== 'function') {
        window.persist.saveSlot = async function(slot){
          const payload = snapshot();
          localStorage.setItem(chKey(chapterId, slot), JSON.stringify(payload));
          window.ui?.note?.('Guardado local ok.');
          window.sfx?.ok?.();
        };
      }
      if (typeof window.persist.loadSlot !== 'function') {
        window.persist.loadSlot = async function(slot){
          const raw = localStorage.getItem(chKey(chapterId, slot));
          if(!raw){ window.ui?.note?.('No hay datos en ese slot.'); window.sfx?.err?.(); return; }
          apply(JSON.parse(raw));
          softRefresh();
          window.ui?.note?.('Cargado local ok.');
          window.sfx?.ok?.();
        };
      }
      // Evita que falte actions (errores previos)
      if (!window.actions) window.actions = {};
      // Evita que falte nav básico
      if (!window.nav) window.nav = {
        current: null,
        go: function(name){
          this.current = name;
          // Si el capítulo define drawScene(name), llámalo
          if (typeof window.drawScene === 'function') window.drawScene(name);
        }
      };
      // Slots overlay rápido (si el capítulo no trae UI de slots)
      if (!document.querySelector('#engine-slots')) injectSlotOverlay(chapterId);

      // Teclado rápido para test: 1..3 guardan/cargan
      document.addEventListener('keydown', (e)=>{
        if (e.altKey && e.key>='1' && e.key<='3'){
          const n = Number(e.key);
          if (e.shiftKey) { window.persist.loadSlot(n); }
          else { window.persist.saveSlot(n); }
        }
      });

      console.log('[Engine] booted', {chapterId});
    }
  };

  function getChapterId(){
    const meta = document.querySelector('meta[name="chapter-id"]')?.content;
    if (meta) return meta;
    const m = location.pathname.match(/capitulo(\d+)/i);
    return m ? ('cap'+m[1]) : 'cap';
  }
  function ensureGlobals(){
    if (!window.flags || typeof window.flags!=='object') window.flags = {};
    if (!Array.isArray(window.pistas)) window.pistas = [];
    if (!Array.isArray(window.inventory)) window.inventory = [];
    if (!window.i18n) window.i18n = { lang:'es' };
    if (!window.ui) window.ui = {};
    if (typeof window.ui.note !== 'function') window.ui.note = mkToast;
    if (typeof window.ui.refreshInventory !== 'function') window.ui.refreshInventory = ()=>{};
    if (typeof window.ui.renderPistas !== 'function') window.ui.renderPistas = ()=>{};
    if (typeof window.ui.applyLang !== 'function') window.ui.applyLang = ()=>{};
    if (!window.sfx) window.sfx = { ok:()=>{}, err:()=>{} };
  }
  function snapshot(){
    return {
      flags: window.flags,
      pistas: window.pistas,
      inventory: window.inventory,
      lang: window.i18n?.lang || 'es'
    };
  }
  function apply(data){
    if (!data || typeof data!=='object') return;
    if (!window.flags || typeof window.flags!=='object') window.flags = {};
    Object.assign(window.flags, data.flags || {});
    if (!Array.isArray(window.pistas)) window.pistas = [];
    window.pistas.length = 0; window.pistas.push(...(data.pistas || []));
    if (!Array.isArray(window.inventory)) window.inventory = [];
    window.inventory.length = 0; window.inventory.push(...(data.inventory || []));
    if (window.i18n) window.i18n.lang = data.lang || window.i18n.lang || 'es';
  }
  function chKey(chapterId, slot){ return `${chapterId}_slot_${slot}`; }

  // Toasts mínimos
  function wireToasts(){
    if (document.getElementById('engine-toasts')) return;
    const div = document.createElement('div');
    div.id='engine-toasts';
    div.style.cssText='position:fixed;right:14px;bottom:14px;display:flex;flex-direction:column;gap:8px;z-index:99999';
    document.body.appendChild(div);
  }
  function mkToast(msg){
    const host = document.getElementById('engine-toasts') || (wireToasts(), document.getElementById('engine-toasts'));
    const n = document.createElement('div');
    n.textContent = msg;
    n.style.cssText = 'background:#111827;color:#e5e7eb;border:1px solid #374151;padding:10px 12px;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.25);opacity:0;transform:translateY(6px);transition:.2s';
    host.appendChild(n);
    requestAnimationFrame(()=>{ n.style.opacity='1'; n.style.transform='translateY(0)'; });
    setTimeout(()=>{ n.style.opacity='0'; n.style.transform='translateY(6px)'; setTimeout(()=>n.remove(),200); }, 2000);
  }

  function injectSlotOverlay(chapterId){
    const box = document.createElement('div');
    box.id = 'engine-slots';
    box.style.cssText='position:fixed;left:14px;bottom:14px;display:flex;gap:8px;z-index:99999';
    for (let i=1;i<=3;i++){
      const save = document.createElement('button');
      save.textContent = `S${i}`;
      save.title = `Guardar en slot ${i}`;
      styleBtn(save);
      save.onclick = ()=> window.persist.saveSlot(i);
      const load = document.createElement('button');
      load.textContent = `L${i}`;
      load.title = `Cargar slot ${i}`;
      styleBtn(load,true);
      load.onclick = ()=> window.persist.loadSlot(i);
      const group = document.createElement('div');
      group.style.display='flex'; group.style.gap='4px';
      group.append(save,load);
      box.appendChild(group);
    }
    document.body.appendChild(box);
  }
  function styleBtn(btn, ghost=false){
    btn.style.cssText = `appearance:none;border:1px solid ${ghost?'#374151':'#2563eb'};background:${ghost?'#0b0f17':'#2563eb'};color:#e5e7eb;padding:6px 8px;border-radius:8px;cursor:pointer;font:600 12px/1 system-ui`;
    btn.onmouseenter = ()=> btn.style.filter='brightness(1.1)';
    btn.onmouseleave = ()=> btn.style.filter='none';
  }

  function softRefresh(){
    try{
      window.ui?.refreshInventory?.();
      window.ui?.renderPistas?.();
      window.ui?.applyLang?.();
      if (window.nav?.current && window.nav?.go) window.nav.go(window.nav.current);
    }catch{}
  }

  // Auto-boot si el archivo se incluye en un capítulo
  document.addEventListener('DOMContentLoaded', ()=> {
    // Evita arrancar en el launcher
    const isLauncher = /index\.html$/i.test(location.pathname);
    if (isLauncher) return;
    Engine.boot({ chapterId: getChapterId() });
  });

  window.Engine = Engine;
})();
