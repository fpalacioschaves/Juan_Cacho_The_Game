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
import { Cap1Salon } from './scenes/cap1_salon.js' // Fallback por si falla el JSON

function resolveUrl(url){
  if(!url) return url
  // Normaliza URLs relativas para evitar './' duplicados
  return url.replace(/^\.\//,'')
}

async function boot(){
  const canvas = document.getElementById('gameCanvas')
  const overlay = document.getElementById('overlayCanvas')
  const hudEl = document.getElementById('hud')
  if(!canvas){ alert('Falta el canvas #gameCanvas'); return }
  if(!hudEl){ alert('Falta el contenedor #hud'); return }

  log.info('[BOOT] Comenzando…')

  // Cargar manifiesto de assets
  let manifest = null
  try{
    const res = await fetch('src/data/assets.json', {cache:'no-store'})
    manifest = await res.json()
  }catch(err){
    log.error('No se pudo leer assets.json', err)
    toast('Error cargando assets. Revisa src/data/assets.json')
    return
  }

  try{
    await Assets.loadManifest(manifest)
    log.info('[BOOT] Assets listos:', Assets.summary())
  }catch(err){
    log.error('Fallo cargando assets', err)
    toast('Fallo cargando imágenes. Revisa la consola.')
    return
  }

  // Cargar escenas orientadas a datos
  let sceneDefs = null
  try{
    const res = await fetch('src/data/scenes.json', {cache:'no-store'})
    sceneDefs = await res.json()
  }catch(err){
    log.error('No se pudo leer scenes.json', err)
    toast('Error cargando escenas (scenes.json).')
    return
  }

  const renderer = new Renderer(canvas, Assets, overlay)
  const hud = new HUD()
  const inventory = new Inventory(hud)
  const sceneManager = new SceneManager(renderer, hud, inventory)

  // Registrar escenas data-driven
  const map = sceneDefs?.defs || {}
  let registered = 0
  for(const [id, url] of Object.entries(map)){
    const jsonUrl = resolveUrl(url)
    sceneManager.register(id, new SceneFromData({ id, jsonUrl, assets: Assets, hud, inventory }))
    registered++
  }

  // Fallback: si no hay ninguna (o JSON mal), registra la clásica
  if(registered === 0){
    console.warn('[BOOT] No hay escenas JSON registradas. Usando fallback Cap1Salon.')
    sceneManager.register('cap1_salon', new Cap1Salon({assets: Assets, hud, inventory}))
  }

  // Estado y reset
  const params = new URLSearchParams(location.search)
  State.load()
  if (params.has('reset')) { State.reset() }

  const startScene = State.data.currentScene || (sceneDefs?.start || 'cap1_salon')
  await sceneManager.change(startScene)

  // Controles
  window.addEventListener('resize', () => { renderer.fitToContainer(); sceneManager.render() })

  if (params.has('debug')) Config.debug.hotspots = true
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase()
    if (key === 'escape') { hud.closeInspector?.(); return }
    if (key === 'h') {
      Config.debug.hotspots = !Config.debug.hotspots
      sceneManager.render()
      hud.toast(`Hotspots: ${Config.debug.hotspots ? 'ON' : 'OFF'}`)
    } else if (key === 'r') {
      newGame(sceneManager, hud)
    }
  })

  const btnReset = document.getElementById('btnReset')
  if (btnReset) btnReset.addEventListener('click', () => newGame(sceneManager, hud))

  log.info('[BOOT] OK')
}

function newGame(sceneManager, hud){
  State.reset()
  sceneManager.change('cap1_salon')
  hud.toast('Nuevo juego iniciado.')
}

function toast(msg){
  const el = document.getElementById('toast')
  if(!el) return
  el.textContent = msg
  el.hidden = false
  setTimeout(()=> el.hidden = true, 1800)
}

boot().catch(err => {
  console.error('Error fatal en boot()', err)
  const el = document.getElementById('toast')
  if(el){ el.textContent = 'Error fatal. Ver consola.'; el.hidden = false }
})
