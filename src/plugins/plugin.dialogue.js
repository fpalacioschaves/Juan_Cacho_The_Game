// src/plugins/plugin.dialogue.js
// Runner de diálogos branching sobre el overlay estándar.
// API: runDialogue(tree, ctx) -> Promise<{ end: true, outcome?: string }>
import getOverlay from '../ui/overlay.js';

/**
 * ctx:
 *  - state: State.data
 *  - inventory: instancia de Inventory (opcional)
 *  - hud: HUD (opcional, para toast)
 *  - addItem?: (id | {id,name,icon}) => void   // si no hay inventory.add(string)
 *  - hasItem?: (id) => boolean                  // si no hay API de inventario
 */
export async function runDialogue(tree, ctx = {}) {
  const overlay = getOverlay();
  let nodeKey = tree.start;
  const visited = new Set();

  function hasItem(id){
    if (typeof ctx.hasItem === 'function') return !!ctx.hasItem(id);
    // fallback: State.data.inventory con objetos {id}
    const inv = ctx?.state?.inventory;
    return Array.isArray(inv) ? inv.some(it => (it?.id ?? it) === id) : false;
  }

  function addItem(item){
    const id = item?.id ?? item;
    if (!id) return;

    // Inventario del juego (preferido)
    try{
      if (ctx.inventory && typeof ctx.inventory.addById === 'function') {
        ctx.inventory.addById(id, item);
      } else if (ctx.inventory && typeof ctx.inventory.add === 'function') {
        ctx.inventory.add(id);
      } else if (typeof ctx.addItem === 'function') {
        ctx.addItem(item);
      } else {
        // fallback: muta State.data.inventory
        if (!Array.isArray(ctx.state.inventory)) ctx.state.inventory = [];
        if (!hasItem(id)) ctx.state.inventory.push({ id, name: item?.name, icon: item?.icon });
      }
      ctx.hud?.toast?.(`Has cogido: ${item?.name || id}`);
    }catch(e){
      console.warn('[dialogue] addItem fallback', e);
    }
  }

  function takeItem(id){
    // quita 1 por id en State.data.inventory (fallback)
    const list = ctx?.state?.inventory;
    if (!Array.isArray(list)) return;
    const i = list.findIndex(it => (it?.id ?? it) === id);
    if (i >= 0) list.splice(i, 1);
  }

  function evalCond(cond){
    try{
      if (!cond) return true;
      return !!cond({ state: ctx.state, hasItem });
    }catch(e){
      console.warn('[dialogue] cond error', e);
      return false;
    }
  }

  async function showNode(nk){
    if (!nk) return { end: true };
    const node = tree.nodes[nk];
    if (!node) return { end: true };

    // Guardas opcionales
    if (node.guard && !evalCond(node.guard)) {
      return { end: true }; // no accesible ahora
    }

    // Acciones onEnter del nodo
    if (node.takeItem) takeItem(node.takeItem);
    if (node.giveItem) addItem(node.giveItem);
    if (node.setFlag && ctx.state) {
      ctx.state.flags = ctx.state.flags || {};
      Object.assign(ctx.state.flags, node.setFlag);
    }

    // ¿Nodo terminal?
    if (node.end) return { end: true, outcome: node.outcome };

    // Render
    const choices = (node.choices || []).filter(ch => evalCond(ch.cond));
    return new Promise(resolve => {
      overlay.open({
        title: node.title || tree.title || 'Diálogo',
        description: node.text || '',
        image: node.image || '',
        buttons: choices.map(ch => ({
          label: ch.label,
          variant: ch.variant || (ch.primary ? 'primary' : 'muted'),
          onClick: async () => {
            // Acciones por elección
            if (ch.takeItem) takeItem(ch.takeItem);
            if (ch.giveItem) addItem(ch.giveItem);
            if (ch.setFlag && ctx.state) {
              ctx.state.flags = ctx.state.flags || {};
              Object.assign(ctx.state.flags, ch.setFlag);
            }
            if (ch.end) {
              overlay.close();
              resolve({ end: true, outcome: ch.outcome });
            } else {
              overlay.close();
              resolve({ goto: ch.goto });
            }
          }
        }))
      });
    });
  }

  // Bucle
  let hop = 0;
  while (hop++ < 200) {
    visited.add(nodeKey);
    const res = await showNode(nodeKey);
    if (res?.end) return res;
    nodeKey = res?.goto;
    if (!nodeKey || visited.has(nodeKey)) return { end: true };
  }
  return { end: true };
}

export default runDialogue;
