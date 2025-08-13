// src/main.js
import { Assets } from './core/assetLoader.js'
import { Renderer } from './engine/renderer.js'
import { SceneManager } from './engine/sceneManager.js'
import { HUD } from './ui/hud.js'
import { Inventory } from './engine/inventory.js'
import { State } from './core/state.js'
import { Config } from './game/config.js'
import { SceneFromData } from './scenes/SceneFromData.js'
async function boot(){const canvas=document.getElementById('gameCanvas');const overlay=document.getElementById('overlayCanvas');const hudEl=document.getElementById('hud');if(!canvas||!hudEl){alert('Faltan elementos base');return}
  let manifest=null;try{const r=await fetch('src/data/assets.json',{cache:'no-store'});manifest=await r.json()}catch(e){alert('Error cargando assets.json');return}
  await Assets.loadManifest(manifest)
  const renderer=new Renderer(canvas,Assets,overlay);const hud=new HUD();const inventory=new Inventory(hud);const sceneManager=new SceneManager(renderer,hud,inventory)
  let sceneDefs=null;try{const r=await fetch('src/data/scenes.json',{cache:'no-store'});sceneDefs=await r.json()}catch(e){alert('Error cargando scenes.json');return}
  const map=sceneDefs?.defs||{};for(const [id,url] of Object.entries(map)){sceneManager.register(id,new SceneFromData({id,jsonUrl:url,assets:Assets,hud,inventory}))}
  const params=new URLSearchParams(location.search);State.load();if(params.has('reset'))State.reset();const start=State.data.currentScene||(sceneDefs?.start||Object.keys(map)[0]);await sceneManager.change(start)
  window.addEventListener('resize',()=>{renderer.fitToContainer();sceneManager.render()})
  if(params.has('debug'))Config.debug.hotspots=true
  window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='escape'){hud.closeInspector?.();return}if(k==='h'){Config.debug.hotspots=!Config.debug.hotspots;sceneManager.render();hud.toast(`Hotspots: ${Config.debug.hotspots?'ON':'OFF'}`)}else if(k==='r'){State.reset();sceneManager.change('cap1_salon');hud.toast('Nuevo juego iniciado.')}})
  const btn=document.getElementById('btnReset');btn?.addEventListener('click',()=>{State.reset();sceneManager.change('cap1_salon');hud.toast('Nuevo juego iniciado.')})
}
boot().catch(e=>{console.error('Error fatal en boot()',e)})