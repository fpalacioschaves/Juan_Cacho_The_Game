// remote-saves.js (versión robusta)
// Guarda/carga remoto con PHP+MySQL y no peta si faltan flags/pistas/inventory en el capítulo.

(()=> {
  const API_BASE = (typeof window.__API_BASE__ === 'string') ? window.__API_BASE__ : '';

  // --- helpers UI/sfx ---
  const note = (m)=>{ try{ window.ui?.note?.(m); }catch{} };
  const okS  = ()=>{ try{ window.sfx?.ok?.(); }catch{} };
  const errS = ()=>{ try{ window.sfx?.err?.(); }catch{} };

  // Asegura contenedores de estado aunque el capítulo aún no los haya creado
  function ensureState(){
    if (!window.flags || typeof window.flags !== 'object') window.flags = {};
    if (!Array.isArray(window.pistas)) window.pistas = [];
    if (!Array.isArray(window.inventory)) window.inventory = [];
    if (!window.i18n) window.i18n = { lang:'es' };
  }
  // Sustituye el contenido de un array global sin cambiar su referencia
  function replaceArray(globalName, arr){
    ensureState();
    const a = Array.isArray(arr) ? arr : [];
    if (!Array.isArray(window[globalName])) window[globalName] = [];
    window[globalName].length = 0;
    window[globalName].push(...a);
  }

  function getUserId(){
    let id = localStorage.getItem('cacho_user');
    if(!id){
      const raw = (crypto.randomUUID ? crypto.randomUUID() : ('u_'+Math.random().toString(36).slice(2)));
      id = 'u_'+String(raw).replace(/[^a-z0-9]/gi,'').slice(0,24);
      localStorage.setItem('cacho_user', id);
    }
    return id;
  }
  const USER_ID = getUserId();

  function getChapterId(){
    const meta = document.querySelector('meta[name="chapter-id"]')?.content;
    if (meta && meta.trim()) return meta.trim();
    const m = location.pathname.match(/capitulo(\d+)/i);
    return m ? ('cap'+m[1]) : 'cap';
  }
  const CHAPTER = getChapterId();

  async function saveRemote(slot, payload){
    const r = await fetch(API_BASE + 'save.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ user_id: USER_ID, chapter: CHAPTER, slot, payload })
    });
    if(!r.ok){
      const txt = await r.text().catch(()=>String(r.status));
      throw new Error('save_http_'+r.status+' '+txt);
    }
    const j = await r.json().catch(()=>({ok:false,err:'bad_json'}));
    if(!j.ok) throw new Error('save_api_'+(j.err||'unknown'));
    return j;
  }

  async function loadRemote(slot){
    const url = `${API_BASE}load.php?user_id=${encodeURIComponent(USER_ID)}&chapter=${encodeURIComponent(CHAPTER)}&slot=${slot}`;
    const r = await fetch(url);
    if(!r.ok){
      const txt = await r.text().catch(()=>String(r.status));
      throw new Error('load_http_'+r.status+' '+txt);
    }
    const j = await r.json().catch(()=>({ok:false,err:'bad_json'}));
    if(!j.ok) throw new Error('load_api_'+(j.err||'unknown'));
    return j.payload || null;
  }

  async function listRemote(){
    const url = `${API_BASE}slots.php?user_id=${encodeURIComponent(USER_ID)}&chapter=${encodeURIComponent(CHAPTER)}`;
    const r = await fetch(url);
    if(!r.ok) return {ok:false,slots:[]};
    return r.json().catch(()=>({ok:false,slots:[]}));
  }

  async function latestRemote(){
    const url = `${API_BASE}latest.php?user_id=${encodeURIComponent(USER_ID)}`;
    const r = await fetch(url);
    if(!r.ok) return {ok:false,latest:null};
    return r.json().catch(()=>({ok:false,latest:null}));
  }

  // Exponer por si el launcher quiere usarlo
  window.remoteSaves = { USER_ID, CHAPTER, saveRemote, loadRemote, listRemote, latestRemote };

  // Redibujo seguro de escena actual (si el cap aún no tiene todo montado, reintenta un frame)
  function refreshAllSafe(){
    const tryOnce = ()=>{
      try{
        window.ui?.refreshInventory?.();
        window.ui?.applyLang?.();
        window.ui?.renderPistas?.();
        const target = (window.nav?.current) || (window.sceneNames && Object.keys(window.sceneNames)[0]) || null;
        if (target && window.nav?.go) window.nav.go(target);
        window.bindAreas?.();
        window.refreshAll?.();
      }catch{
        requestAnimationFrame(tryOnce);
      }
    };
    tryOnce();
  }

  const attach = ()=>{
    if (!window.persist) { requestAnimationFrame(attach); return; }
    ensureState();

    const origSave = (typeof window.persist.saveSlot === 'function') ? window.persist.saveSlot.bind(window.persist) : null;
    const origLoad = (typeof window.persist.loadSlot === 'function') ? window.persist.loadSlot.bind(window.persist) : null;

    window.persist.saveSlot = async function(slot){
      ensureState();
      try { if(origSave) await origSave(slot); } catch(e){ console.warn('[remote-saves] orig saveSlot error:', e); }
      const payload = {
        flags: window.flags || {},
        pistas: Array.isArray(window.pistas) ? window.pistas : [],
        inventory: Array.isArray(window.inventory) ? window.inventory : [],
        lang: (window.i18n?.lang || 'es')
      };
      try{
        await saveRemote(slot, payload);
        okS(); note((window.i18n?.lang==='en') ? 'Remote save ok.' : 'Guardado remoto ok.');
      }catch(e){
        console.error('[remote-saves] saveRemote failed:', e);
        errS(); note((window.i18n?.lang==='en') ? 'Remote save failed.' : 'Fallo guardado remoto.');
      }
    };

    window.persist.loadSlot = async function(slot){
      ensureState();
      // 1) intenta local original
      let changed = false;
      if (origLoad){
        try{
          const before = JSON.stringify(window.flags||{});
          await origLoad(slot);
          ensureState();
          const after  = JSON.stringify(window.flags||{});
          changed = (before !== after);
        }catch(e){
          console.warn('[remote-saves] orig loadSlot error:', e);
        }
      }
      if (changed){
        okS(); note((window.i18n?.lang==='en') ? 'Local load ok.' : 'Cargado local ok.');
        return;
      }
      // 2) remoto
      try{
        const data = await loadRemote(slot);
        if(!data){
          errS(); note((window.i18n?.lang==='en') ? 'No remote data in slot.' : 'No hay datos remotos en el slot.');
          return;
        }
        ensureState();
        try{
          // flags
          if (!window.flags || typeof window.flags !== 'object') window.flags = {};
          Object.assign(window.flags, (data.flags && typeof data.flags==='object') ? data.flags : {});
          // arrays
          replaceArray('pistas', data.pistas);
          replaceArray('inventory', data.inventory);
          // idioma
          if (window.i18n) window.i18n.lang = data.lang || window.i18n.lang || 'es';
        }catch(e){
          console.error('[remote-saves] apply payload error:', e);
        }
        refreshAllSafe();
        okS(); note((window.i18n?.lang==='en') ? 'Remote load ok.' : 'Cargado remoto ok.');
      }catch(e){
        console.error('[remote-saves] loadRemote failed:', e);
        errS(); note((window.i18n?.lang==='en') ? 'Remote load failed.' : 'Fallo carga remota.');
      }
    };
  };

  attach();
})();
