// src/scenes/SceneBase.js
import { Hotspot } from '../engine/hotspot.js'
import { Config } from '../game/config.js'

export class SceneBase {
  constructor({id, bgKey, hud, inventory, assets}){
    this.id = id
    this.bgKey = bgKey
    this.hud = hud
    this.inventory = inventory
    this.assets = assets
    this.hotspots = []
    this.objective = ''
    this._normalized = false
  }

  async onEnter(renderer){
    this._normalized = false
    this.hud.setObjective(this.objective || 'Explora el entorno.')
  }

  _ensureInstances(){
    if (this._normalized) return
    this.hotspots = this.hotspots.map(h => (h && typeof h.contains === 'function') ? h : new Hotspot(h))
    this._normalized = true
  }

  render(renderer){
    renderer.drawImage(this.bgKey)
    this._ensureInstances()
    if (Config.debug?.hotspots) {
      this.hotspots.forEach(h => renderer.drawHotspotRect(h))
    }
  }

  handleClick(x,y){
    this._ensureInstances()
    for (const h of this.hotspots){
      if (h.contains(x,y)){
        if (h.requires && !this.inventory.has(h.requires)){
          this.hud.toast('Te falta algo…')
          return
        }
        if (h.once && h.hit) return
        h.hit = true
        try { h.onClick?.({scene:this, x, y}) }
        catch(e){ console.error('Error en onClick hotspot', e) }
        return
      }
    }
    this.hud.toast('Nada interesante aquí.')
  }
}
