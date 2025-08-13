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

async function boot(){
  const canvas = document.getElementById('gameCanvas')
  const overlay = document.getElementById('overlayCanvas')
  const hudEl = document.getElementById('hud')
  if(!canvas || !hudEl){ alert('Faltan elementos base'); return }

  // Cargar assets
  let manifest = null
  try{
    const res = await fetch('src/data/assets.json', {cache:'no-store'})
    manifest = await res.json()
  }catch(err){
    console.error('No se pudo leer assets.json', err)
    return alert('Error cargando assets.json')
  }
  await Assets.loadManifest(manifest)

  // Cargar escenas JSON
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
  const inventory = new Inventory(hud)
  const sceneManager = new SceneManager(renderer, hud, inventory)

  // Registrar escenas data-driven
  const map = sceneDefs?.defs || {}
  const ids = new Set()
  for (const [id, url] of Object.entries(map)){
    sceneManager.register(id, new SceneFromData({ id, jsonUrl: url, assets: Assets, hud, inventory }))
    ids.add(id)
  }

  // Estado + reset por query
  const params = new URLSearchParams(location.search)
  State.load()
  if (params.has('reset')) State.reset()

  // Elegir escena de arranque con validación
  let target = State.data.currentScene
  const defaultStart = sceneDefs?.start || Object.keys(map)[0] || null
  if (!ids.has(target)) {
    if (target) console.warn('Escena guardada no registrada:', target, '→ Fallback al start.')
    target = ids.has(defaultStart) ? defaultStart : (ids.values().next().value || null)
  }
  if (!target) return alert('No hay escenas registradas.')

  await sceneManager.change(target)

  // Controles
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
