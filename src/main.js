// src/main.js
import { log } from './core/logger.js'
import { Assets } from './core/assetLoader.js'
import { Renderer } from './engine/renderer.js'
import { SceneManager } from './engine/sceneManager.js'
import { HUD } from './ui/hud.js'
import { Inventory } from './engine/inventory.js'
import { State } from './core/state.js'
import { Config } from './game/config.js'
import { SceneFromData } from './scenes/SceneFromData.js'

// Overlay de hotspots (SIEMPRE activo)
import initHotspotOverlay from './plugins/plugin.hotspotOverlay.js'

async function boot(){
  const canvas = document.getElementById('gameCanvas')
  const overlay = document.getElementById('overlayCanvas')
  const hudEl = document.getElementById('hud')
  if(!canvas || !hudEl){ alert('Faltan elementos base'); return }

  // Assets
  let manifest = null
  try{
    const res = await fetch('src/data/assets.json', {cache:'no-store'})
    manifest = await res.json()
  }catch(err){
    console.error('No se pudo leer assets.json', err)
    return alert('Error cargando assets.json')
  }
  await Assets.loadManifest(manifest)

  // Items meta (opcional, tolerante a fallo)
  let itemsMeta = {}
  try{
    const r = await fetch('src/data/items.json', {cache:'no-store'})
    if(r.ok) itemsMeta = await r.json()
  }catch(e){
    console.warn('items.json no disponible; continúo sin metadatos.')
  }

  // Scenes
  let sceneDefs = null
  try{
    const res = await fetch('src/data/scenes.json', {cache:'no-store'})
    sceneDefs = await res.json()
  }catch(err){
    console.error('No se pudo leer scenes.json', err)
    return alert('Error cargando scenes.json')
  }

  const renderer = new Renderer(canvas, Assets, overlay)
  const hud = new HUD()
  const inventory = new Inventory(hud, itemsMeta)
  const sceneManager = new SceneManager(renderer, hud, inventory)

  // === INTEGRACIÓN DEL OVERLAY (siempre activo) ============================
  // Compatibilidad con tu Inventory: sus add(...) esperan STRING id.
  // Evita el error: id.replace is not a function (getMeta en inventory.js).
  function addToInventoryCompat(_state, item){
    try{
      const id = item?.id ?? item
      if (!id) throw new Error('item.id no definido')

      if (inventory && typeof inventory.addById === 'function') {
        // addById(id, meta?) — si la tienes disponible
        inventory.addById(id, item)
      } else if (inventory && typeof inventory.add === 'function') {
        // add(stringId)
        inventory.add(id)
      } else if (inventory && typeof inventory.addItem === 'function') {
        // addItem(stringId)
        inventory.addItem(id)
      } else {
        // Fallback inofensivo: solo muta State.data
        if (!Array.isArray(State.data.inventory)) State.data.inventory = []
        if (!State.data.inventory.find(it => it.id === id)) {
          State.data.inventory.push({ id, name: item?.name, icon: item?.icon })
        }
      }
      hud?.toast?.(`Has cogido: ${item?.name || id}`)
    }catch(e){
      console.warn('addToInventoryCompat falló; el HUD/Inventory puede no reflejar el cambio', e)
    }
  }

  // Inicializa el plugin (abre overlay al clicar .hotspot o al invocarlo)
  const hotspotOverlay = initHotspotOverlay({
    state: State.data,
    sceneManager,                 // si no implementa .emit, el plugin usa modo DOM
    addToInventory: addToInventoryCompat
  })
  // ========================================================================

  const map = sceneDefs?.defs || {}
  const ids = new Set()
  for (const [id, url] of Object.entries(map)){
    sceneManager.register(id, new SceneFromData({ id, jsonUrl: url, assets: Assets, hud, inventory }))
    ids.add(id)
  }

  const params = new URLSearchParams(location.search)
  State.load()
  if (params.has('reset')) State.reset()

  let target = State.data.currentScene
  const defaultStart = sceneDefs?.start || Object.keys(map)[0] || null
  if (!ids.has(target)) {
    if (target) console.warn('Escena guardada no registrada:', target, '→ Fallback al start.')
    target = ids.has(defaultStart) ? defaultStart : (ids.values().next().value || null)
  }
  if (!target) return alert('No hay escenas registradas.')

  // Modo debug: helpers a mano (no afectan producción)
  if (params.has('debug')){
    window.sceneManager = sceneManager
    window.hud = hud
    window.state = State.data
    window.hotspotOverlay = hotspotOverlay
    // Helper para probar el overlay sin DOM
    window.emitHotspot = (data) => {
      if (window.hotspotOverlay && typeof window.hotspotOverlay.show === 'function'){
        window.hotspotOverlay.show(data)
      } else {
        console.warn('hotspotOverlay no disponible.')
      }
    }
  }

  await sceneManager.change(target)

  // UX
  window.addEventListener('resize', () => { renderer.fitToContainer(); sceneManager.render() })
  if (params.has('debug')) Config.debug.hotspots = true
  window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase()
    if (k === 'escape'){ hud.closeInspector?.(); return }
    if (k === 'h'){ Config.debug.hotspots = !Config.debug.hotspots; sceneManager.render(); hud.toast(`Hotspots: ${Config.debug.hotspots ? 'ON' : 'OFF'}`) }
    if (k === 'r'){ newGame(sceneManager, hud) }
  })
  document.getElementById('btnReset')?.addEventListener('click', () => newGame(sceneManager, hud))
}

function newGame(sceneManager, hud){
  State.reset()
  sceneManager.change('cap1_salon')
  hud.toast('Nuevo juego iniciado.')
}

boot().catch(err => {
  console.error('Error fatal en boot()', err)
  alert('Error fatal en boot(). Ver consola.')
})
