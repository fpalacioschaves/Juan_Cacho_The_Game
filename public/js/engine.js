/* /public/js/engine.js — versión estable (auto-cura #inventory y demás) */
const Game = (() => {
  const DATA = { scenes: {}, items: {}, dialogue: [], chapters: [] };
  const STATE = {
    chapter: 1,
    location: 'piso_juan_salon',
    inventory: [],
    flags: {},
    notebook: []
  };
  let selectedItem = null;

  // ---------- Utilidades DOM ----------
  const $ = s => document.querySelector(s);
  function ensureInventory() {
    let inv = document.getElementById('inventory');
    if (inv) return inv;
    // Crea HUD si tampoco existiera (raro, pero definitivo)
    let hud = document.getElementById('hud');
    if (!hud) {
      const game = document.getElementById('game') || document.body;
      hud = document.createElement('div');
      hud.id = 'hud';
      hud.style.display = 'flex';
      hud.style.justifyContent = 'space-between';
      hud.style.gap = '12px';
      game.appendChild(hud);
    }
    inv = document.createElement('div');
    inv.id = 'inventory';
    inv.style.display = 'flex';
    inv.style.gap = '8px';
    inv.style.padding = '6px';
    hud.prepend(inv);
    return inv;
  }

  // ---------- Estado ----------
  const hasItem = id => STATE.inventory.includes(id);
  const addItem = id => {
    if (!id || hasItem(id)) return;
    STATE.inventory.push(id);
    UI.toast(`Has conseguido: ${DATA.items[id]?.name || id}`);
    renderHUD();
    saveLocal();
  };
  const removeItem = id => {
    STATE.inventory = STATE.inventory.filter(x => x !== id);
    renderHUD();
    saveLocal();
  };
  const hasFlag = k => !!STATE.flags[k];
  const setFlag = (k, v = true) => { STATE.flags[k] = v; saveLocal(); };
  const note = t => { if (!t) return; STATE.notebook.push(t); UI.updateNotebook(STATE.notebook); saveLocal(); };
  const moveTo = loc => { if (!loc) return; STATE.location = loc; renderScene(loc); saveLocal(); };

  // ---------- Persistencia ----------
  const saveLocal = () => localStorage.setItem('jc_state', JSON.stringify(STATE));
  const loadLocal = () => { const s = localStorage.getItem('jc_state'); if (s) { try { Object.assign(STATE, JSON.parse(s)); } catch {} } };
  const saveRemote = async () => {
    try {
      await fetch(`${window.JC_CONFIG.apiBase}/save.php`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ id: window.JC_CONFIG.userId, state: STATE })
      });
      UI.toast('Partida guardada');
    } catch { UI.toast('No se pudo guardar en servidor'); }
  };
  const loadRemote = async () => {
    try {
      const r = await fetch(`${window.JC_CONFIG.apiBase}/load.php?id=${encodeURIComponent(window.JC_CONFIG.userId)}`);
      if (!r.ok) throw 0;
      const data = await r.json();
      Object.assign(STATE, data);
      renderAll();
      UI.toast('Partida cargada');
    } catch { UI.toast('No hay partida remota'); }
  };

  // ---------- Carga de datos ----------
  async function loadData(){
    const base = window.JC_CONFIG.apiBase;
    const [scenes, dialogue, items, chapters] = await Promise.all([
      fetch(`${base}/scenes.json`).then(r=>r.json()),
      fetch(`${base}/dialogue.json`).then(r=>r.json()),
      fetch(`${base}/items.json`).then(r=>r.json()),
      fetch(`${base}/chapters.json`).then(r=>r.json()),
    ]);
    DATA.scenes = indexById(scenes);
    DATA.dialogue = dialogue;
    DATA.items = indexById(items);
    DATA.chapters = chapters;
  }
  const indexById = arr => Array.isArray(arr) ? arr.reduce((m,o)=>(m[o.id]=o,m),{}) : {};

  // ---------- Render ----------
  function renderAll(){
    renderScene(STATE.location);
    renderHUD();                 // ahora nunca rompe: garantiza #inventory
    UI.updateNotebook(STATE.notebook);
  }

  function renderHUD(){
    const inv = ensureInventory();
    inv.innerHTML = '';
    STATE.inventory.forEach(id=>{
      const btn = document.createElement('button');
      btn.className = 'inv-item' + (selectedItem===id ? ' selected':'');
      btn.textContent = DATA.items[id]?.name || id;
      btn.title = DATA.items[id]?.desc || '';
      btn.onclick = ()=>{ selectedItem = selectedItem===id? null : id; renderHUD(); };
      inv.appendChild(btn);
    });
  }

  function sceneVisibleIf(cond){
    if(!cond) return true;
    if(cond.chapterGte && !(STATE.chapter >= cond.chapterGte)) return false;
    if(cond.requires){
      return cond.requires.every(req=>{
        if(req.startsWith('item:')) return hasItem(req.split(':')[1]);
        if(req.startsWith('flag:')) return hasFlag(req.split(':')[1]);
        return hasFlag(req);
      });
    }
    return true;
  }

  function renderScene(id){
    const scene = DATA.scenes[id];
    if(!scene){ console.warn('Escena no encontrada', id); return; }
    const elScene = $('#scene');
    if (elScene) elScene.style.backgroundImage = `url('${scene.bg}')`;
    const hs = $('#hotspots');
    if (!hs) return;
    hs.innerHTML = '';
    (scene.hotspots||[]).forEach(h=>{
      if(!sceneVisibleIf(h.visibleIf)) return;
      const d = document.createElement('button');
      d.className = 'hotspot';
      if(scene.debug) d.classList.add('debug');
      positionHotspot(d, h.shape);
      d.onclick = ()=> handleHotspot(h);
      d.oncontextmenu = ev=>{ ev.preventDefault(); handleHotspotContext(h); };
      d.title = h.id;
      hs.appendChild(d);
    });
  }

  function positionHotspot(el, shape){
    if(!shape) return;
    if(shape.type==='rect'){
      el.style.left = shape.x+'px';
      el.style.top = shape.y+'px';
      el.style.width = shape.w+'px';
      el.style.height = shape.h+'px';
    }
  }

  // ---------- Interacción ----------
  function handleHotspot(h){
    // Usar item seleccionado > Coger > Hablar > Mirar
    if(selectedItem && h.onUse){
      if(canSatisfy(h.onUse.requires||[])){
        applyEffects(h.onUse.effect||[]);
        UI.toast('Usado.');
      } else {
        UI.toast('No parece servir.');
      }
      return;
    }
    if(h.onPick && h.onPick.gainItem){ addItem(h.onPick.gainItem); return; }
    if(h.onTalk){ startDialogue(h.onTalk); return; }
    if(h.onLook){ UI.toast(h.onLook); return; }
    UI.toast('Nada que rascar.');
  }

  function handleHotspotContext(h){
    if(h.onLook){ UI.toast(h.onLook); }
  }

  function canSatisfy(reqs){
    return reqs.every(r=>{
      if(r.startsWith('item:')) return hasItem(r.split(':')[1]);
      if(r.startsWith('flag:')) return hasFlag(r.split(':')[1]);
      return hasFlag(r);
    });
  }

  function applyEffects(effects){
    effects.forEach(e=>{
      if(e.type==='setFlag') setFlag(e.key, e.val);
      if(e.type==='addItem') addItem(e.id);
      if(e.type==='removeItem') removeItem(e.id);
      if(e.type==='moveTo') moveTo(e.id);
      if(e.type==='appendNotebook' || e.type==='note') note(e.text);
      if(e.type==='startCutscene' && e.id){ /* hook futuro */ }
      if(e.type==='setChapter'){ STATE.chapter = e.val ?? STATE.chapter; saveLocal(); }
    });
  }

  // ---------- Diálogo ----------
  function startDialogue(id){
    const dlg = DATA.dialogue.find(d=> d.id===id || d.npc===id);
    if(!dlg){ UI.toast('…'); return; }
    UI.showDialogue();
    renderDialogueNode(dlg, 'root');
  }
  function renderDialogueNode(dlg, nodeId){
    const node = (dlg.nodes||[]).find(n=>n.id===nodeId) || dlg.nodes?.[0];
    if(!node) return UI.hideDialogue();
    UI.setDialogueText(node.text||'');
    UI.setDialogueOptions((node.opts||[]).filter(opt=> optionVisible(opt)).map(opt=>({
      text: opt.txt,
      onClick: ()=>{
        if(opt.effect) applyEffects(opt.effect);
        if(opt.gainItem) addItem(opt.gainItem);
        if(opt.setFlag) setFlag(opt.setFlag, true);
        if(opt.end) return UI.hideDialogue();
        renderDialogueNode(dlg, opt.go);
      }
    })));
  }
  function optionVisible(opt){
    if(!opt.req) return true;
    return Object.entries(opt.req).every(([k,v])=>{
      if(k==='flag') return hasFlag(v);
      if(k==='item') return hasItem(v);
      return true;
    });
  }

  // ---------- Bootstrap ----------
  async function init(){
    loadLocal();
    await loadData();
    bindUI();
    renderAll();
    if(STATE.chapter===1 && STATE.notebook.length===0){
      note('Clic izquierdo: ACCIONAR. Clic derecho: MIRAR.');
    }
  }
  function bindUI(){
    const nb = $('#btn-notebook'); if (nb) nb.onclick = ()=> UI.toggleNotebook();
    const nbClose = $('#notebook .close'); if (nbClose) nbClose.onclick = ()=> UI.toggleNotebook(false);
    const bs = $('#btn-save'); if (bs) bs.onclick = ()=> saveRemote();
    const bl = $('#btn-load'); if (bl) bl.onclick = ()=> loadRemote();
  }

  return { init };
})();

window.addEventListener('DOMContentLoaded', Game.init);
