// src/ui/hud.js
export class HUD {
  setObjective(text){
    const el = document.getElementById('objective')
    if(el) el.textContent = text || ''
  }
  toast(text, ms=1600){
    const el = document.getElementById('toast')
    if(!el) return
    el.textContent = text
    el.hidden = false
    clearTimeout(this._t)
    this._t = setTimeout(()=> el.hidden = true, ms)
  }
  inspect(text){
    const root = document.getElementById('inspector')
    const body = document.getElementById('inspectorBody')
    const close = document.getElementById('inspectorClose')
    if(!root || !body) return this.toast(text, 2200)
    body.innerHTML = text || ''
    root.hidden = false
    const hide = ()=> { root.hidden = true; body.innerHTML = '' }
    close?.addEventListener('click', hide, { once: true })
    root.addEventListener('click', (e)=> { if(e.target === root) hide() }, { once: true })
    this._hideInspector = hide
  }
  closeInspector(){
    if(this._hideInspector) this._hideInspector()
    else {
      const root = document.getElementById('inspector')
      const body = document.getElementById('inspectorBody')
      if(root){ root.hidden = true }
      if(body){ body.innerHTML = '' }
    }
  }
}
