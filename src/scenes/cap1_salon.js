// src/scenes/cap1_salon.js
import { SceneBase } from './SceneBase.js'
import { Hotspot } from '../engine/hotspot.js'

export class Cap1Salon extends SceneBase {
  constructor({assets, hud, inventory}){
    super({ id:'cap1_salon', bgKey:'cap1_salon', assets, hud, inventory })
    this.objective = 'Objetivo: Busca la NOTA de la comunidad y la LLAVE. Luego sal por la puerta.'
  }

  _updateObjective(){
    const tieneNota = this.inventory.has('item_nota')
    const tieneLlave = this.inventory.has('item_llave')
    if (tieneNota && tieneLlave){
      this.objective = 'Objetivo: Todo listo. Sal por la puerta.'
    } else if (tieneNota){
      this.objective = 'Objetivo: Te falta la LLAVE.'
    } else if (tieneLlave){
      this.objective = 'Objetivo: Te falta la NOTA de la comunidad.'
    } else {
      this.objective = 'Objetivo: Busca la NOTA de la comunidad y la LLAVE.'
    }
    this.hud.setObjective(this.objective)
  }

  async onEnter(renderer){
    await super.onEnter(renderer)
    const W = renderer.canvas.width, H = renderer.canvas.height

    // Hotspots (aprox. según el fondo actual)
    this.hotspots = [
      // 1) Mesa de centro -> LLAVE
      new Hotspot({
        x: W*0.52, y: H*0.60, w: W*0.20, h: H*0.16, once:true,
        onClick: () => {
          if(!this.inventory.has('item_llave')){
            this.inventory.add('item_llave')
            this.hud.toast('Has cogido una llave.')
            this._updateObjective()
          } else {
            this.hud.toast('La mesa está ordenada por una vez.')
          }
        }
      }),

      // 2) Librería -> NOTA (dentro de un libro fino)
      new Hotspot({
        x: W*0.73, y: H*0.40, w: W*0.12, h: H*0.38, once:true,
        onClick: () => {
          if(!this.inventory.has('item_nota')){
            this.inventory.add('item_nota')
            this.hud.inspect(`
              <div data-title>Nota doblada</div>
              <p>Entre un tomo torcido y un helecho cansado aparece una hoja con letra apresurada:</p>
              <p><em>“Reunión de comunidad — hoy 19:30. Portal B. Llevar último recibo del agua.”</em></p>
              <p>Juan la lee dos veces. Anota mentalmente: llegar a tiempo por una vez.</p>
            `)
            this._updateObjective()
          } else {
            this.hud.inspect(`<p>Libros viejos, plantas resistentes y polvo con memoria. Nada nuevo.</p>`)
          }
        }
      }),

      // 3) Puerta (requiere llave + nota para permitir salida lógica del capítulo)
      new Hotspot({
        x: W*0.05, y: H*0.32, w: W*0.18, h: H*0.48,
        onClick: () => {
          const tieneLlave = this.inventory.has('item_llave')
          const tieneNota = this.inventory.has('item_nota')
          if(!tieneLlave){
            this.hud.toast('La puerta no cede. Falta la llave.')
            return
          }
          if(!tieneNota){
            this.hud.toast('Mejor no salir sin la nota de la reunión.')
            return
          }
          this.hud.toast('Cerradura gira. Rumbo a la reunión… ¡Fin del capítulo 1!')
        }
      }),

      // 4) Sofá — descripción
      new Hotspot({
        x: W*0.34, y: H*0.49, w: W*0.28, h: H*0.20,
        onClick: () => this.hud.inspect(`<p>El sofá guarda migas de noches largas y siestas a destiempo. Aún huele a café frío.</p>`)
      }),

      // 5) Cuadro — descripción
      new Hotspot({
        x: W*0.43, y: H*0.23, w: W*0.16, h: H*0.14,
        onClick: () => this.hud.inspect(`<p>Un paisaje tranquilo que no se parece en nada al barrio. Quizá por eso está ahí.</p>`)
      }),

      // 6) Ventana — descripción
      new Hotspot({
        x: W*0.83, y: H*0.30, w: W*0.14, h: H*0.28,
        onClick: () => this.hud.inspect(`<p>La calle bosteza luz tibia. Un gato vigila desde el alféizar de enfrente con la paciencia de los que ya lo han visto todo.</p>`)
      }),

      // 7) Perchero — descripción
      new Hotspot({
        x: W*0.26, y: H*0.46, w: W*0.06, h: H*0.28,
        onClick: () => this.hud.inspect(`<p>Perchero flaco. Chaqueta de entretiempo y una bufanda que aún no se ha decidido a irse del todo.</p>`)
      })
    ]

    // Ajustar objetivo según estado actual (si volvemos a entrar)
    this._updateObjective()
  }
}
