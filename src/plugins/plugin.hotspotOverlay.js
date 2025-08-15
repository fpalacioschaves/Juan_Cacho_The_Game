/**
 * src/plugins/plugin.hotspotOverlay.js
 * Overlay para hotspots con descripción e interacción "Coger".
 * No produce efectos si no lo inicializas desde tu boot/main.
 *
 * Integra tanto DOM (delegación en .hotspot) como event-bus opcional:
 *  - DOM: elementos con clase .hotspot y data-atributos.
 *  - Bus: sceneManager.on('hotspot:click', payload)
 *
 * Atributos DOM soportados en el hotspot:
 *  data-title="..."                 (título del modal)
 *  data-description="..."           (texto descriptivo)
 *  data-image="/ruta/opcional.png"  (imagen para el overlay)
 *  data-pickable="true|false"       (si se puede coger)
 *  data-item-id="llaves"            (id de inventario)
 *  data-item-name="Llaves"          (nombre visible)
 *  data-item-icon="/assets/llaves.png" (icono inventario, opcional)
 */

import getOverlay from '../ui/overlay.js';

/** Dev helper (no rompe si falta) */
function hasEventBus(sceneManager){
  return !!(sceneManager && typeof sceneManager.on === 'function' && typeof sceneManager.emit === 'function');
}

function alreadyInInventory(state, id){
  return !!(state?.inventory || []).find(it => it.id === id);
}

function addItemToInventory({ state, item, addToInventory }){
  if (addToInventory && typeof addToInventory === 'function'){
    // Integra con tu propia función si existe
    addToInventory(state, item);
  } else {
    // Fallback mínimo, no rompe si no hay sistema propio
    if(!state.inventory) state.inventory = [];
    if(!alreadyInInventory(state, item.id)){
      state.inventory.push(item);
    }
  }
}

function normalizePayloadFromElement(el){
  const d = el.dataset || {};
  return {
    title: d.title || d.name || 'Objeto',
    description: d.description || d.desc || '...',
    image: d.image || '',
    pickable: String(d.pickable).toLowerCase() === 'true' || d.itemId, // si trae itemId lo tratamos como pickable
    item: d.itemId ? {
      id: d.itemId,
      name: d.itemName || d.title || d.name || d.itemId,
      icon: d.itemIcon || ''
    } : null
  };
}

/**
 * API pública
 * @param {Object} ctx
 * @param {Object} ctx.state            - Estado global (inventario, flags...)
 * @param {Object} ctx.sceneManager     - SceneManager (opcional, para bus)
 * @param {Function} [ctx.addToInventory] - Tu función propia si la tienes
 * @param {string} [ctx.selector='.hotspot'] - Selector DOM para hotspots
 */
export default function initHotspotOverlay(ctx){
  const { state, sceneManager, addToInventory, selector = '.hotspot' } = ctx || {};
  const overlay = getOverlay();

  // ——— Integración por EventBus, si existe ———
  if (hasEventBus(sceneManager)){
    sceneManager.on('hotspot:click', (payload = {})=>{
      showOverlay({
        state, overlay, sceneManager, addToInventory,
        title: payload.title,
        description: payload.description,
        image: payload.image,
        pickable: !!payload.pickable,
        item: payload.item || null
      });
    });
  }

  // ——— Delegación DOM (fallback y soporte estándar .hotspot) ———
  document.addEventListener('click', (e)=>{
    const el = e.target.closest(selector);
    if(!el) return;

    // Evita que otros handlers procesen la navegación si es <a>
    if(el.tagName === 'A') e.preventDefault();

    const data = normalizePayloadFromElement(el);
    showOverlay({
      state, overlay, sceneManager, addToInventory,
      ...data
    });
  });

  /** Lógica de apertura */
  function showOverlay({ state, overlay, sceneManager, addToInventory, title, description, image, pickable, item }){
    const buttons = [];

    if (pickable && item && state){
      const disabled = alreadyInInventory(state, item.id);
      if (!disabled){
        buttons.push({
          label: 'Coger',
          variant: 'primary',
          onClick: async ()=>{
            addItemToInventory({ state, item, addToInventory });
            // Notificar por bus si existe
            if (hasEventBus(sceneManager)) {
              try { sceneManager.emit('inventory:add', item); } catch(_){}
            }
            overlay.close();
          }
        });
      } else {
        // ya en inventario
        buttons.push({
          label: 'Ya lo tienes',
          variant: 'muted',
          onClick: ()=> overlay.close()
        });
      }
      buttons.push({ label: 'Cancelar', variant: 'muted', onClick: ()=> overlay.close() });

    } else {
      // No pickable
      buttons.push({ label: 'Cerrar', variant: 'muted', onClick: ()=> overlay.close() });
    }

    // Nota contextual si no es cogible
    const note = (!pickable)
      ? 'Este objeto no se puede coger.'
      : '';

    overlay.open({
      title,
      description,
      image,
      buttons: note
        ? [{ label: note, variant: 'muted', onClick: ()=>{} }, ...buttons]
        : buttons
    });
  }

  // API opcional por si quieres invocarlo manualmente desde escenas
  return {
    show(data){ return showOverlay({ state, overlay, sceneManager, addToInventory, ...data }); }
  };
}
