// src/engine/inventory.js
import { State } from '../core/state.js'

export class Inventory {
  constructor(hud, itemsMeta = {}){
    this.hud = hud
    this.itemsMeta = itemsMeta || {}
    this.render()
  }

  add(id){
    State.addItem(id)
    this.render()
  }

  has(id){
    return State.hasItem(id)
  }

  select(id){
    if(State.data.selectedItem === id){
      State.clearSelection()
    } else {
      State.selectItem(id)
    }
    this.render()
  }

  getMeta(id){
    const meta = this.itemsMeta[id] || {}
    // valores por defecto seguros
    const name = meta.name || id.replace(/^item_/, '').replace(/_/g,' ').replace(/\b\w/g,s=>s.toUpperCase())
    const img  = meta.img  || `./assets/images/items/${id.replace(/^item_/,'')}.png`
    const desc = meta.desc || '<p>Un objeto útil, ya veremos para qué.</p>'
    return { id, name, img, desc }
  }

  showInfo(id){
    const { name, img, desc } = this.getMeta(id)
    const bodyId = 'inspectorBody'
    const html = `
      <div class="inv-info">
        <div style="display:flex; gap:16px; align-items:flex-start;">
          <img alt="${name}" src="${img}" width="72" height="72" style="border-radius:8px;border:1px solid #2a2f3a; background:#141722"/>
          <div>
            <div data-title style="font-weight:700;margin-bottom:.25rem">${name}</div>
            ${desc}
          </div>
        </div>
        <div style="display:flex; gap:8px; margin-top:12px;">
          <button class="btn" id="invUseBtn">Usar</button>
          <button class="btn" id="invCloseBtn">Cerrar</button>
        </div>
      </div>
    `
    this.hud.inspect(html)
    // enganchar botones
    const root = document.getElementById(bodyId)
    const useBtn = root?.querySelector('#invUseBtn')
    const closeBtn = root?.querySelector('#invCloseBtn')
    useBtn?.addEventListener('click', ()=>{
      State.selectItem(id)
      this.hud.toast(`${name}: seleccionado`)
      this.hud.closeInspector?.()
      this.render()
    })
    closeBtn?.addEventListener('click', ()=> this.hud.closeInspector?.())
  }

  render(){
    const root = document.getElementById('inventory')
    if(!root) return
    root.innerHTML = ''

    for(const id of State.data.inventory){
      const meta = this.getMeta(id)
      const b = document.createElement('button')
      b.className = 'inv-item' + (State.data.selectedItem === id ? ' selected' : '')
      b.title = meta.name
      // click -> ficha informativa
      b.addEventListener('click', ()=> this.showInfo(id))

      const img = document.createElement('img')
      img.alt = meta.name
      img.width = 40
      img.height = 40
      img.src = meta.img
      b.appendChild(img)

      root.appendChild(b)
    }
  }
}
