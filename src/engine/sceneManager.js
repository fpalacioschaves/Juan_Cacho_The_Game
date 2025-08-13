// src/engine/sceneManager.js
import { State } from '../core/state.js'

export class SceneManager {
  constructor(renderer, hud, inventory){
    this.renderer = renderer
    this.hud = hud
    this.inventory = inventory
    this.scenes = new Map()
    this.current = null

    renderer.canvas.addEventListener('click', (evt)=>{
      if(!this.current) return
      const {x,y} = this.renderer.toLocalCoords(evt)
      this.current.handleClick(x,y)
      this.render()
    })
  }
  register(id, scene){ this.scenes.set(id, scene) }
  async change(id){
    const next = this.scenes.get(id)
    if(!next) throw new Error('Scene desconocida: ' + id)
    if(this.current?.onExit) await this.current.onExit()
    this.current = next
    // Inyecta referencia circular segura para acciones data-driven
    this.current._sceneManager = this
    State.goTo(id)
    await next.onEnter(this.renderer, this.hud, this.inventory)
    this.render()
  }
  render(){
    if(!this.current) return
    this.renderer.clear()
    this.renderer.clearOverlay?.()
    this.current.render(this.renderer)
  }
}
