// src/ui/hud.js
import { State } from '../core/state.js'

export class HUD{
  setObjective(t){
    const e = document.getElementById('objective')
    if (e) e.textContent = t || ''
  }

  toast(t, ms=1600){
    const e = document.getElementById('toast')
    if (!e) return
    e.textContent = t
    e.hidden = false
    clearTimeout(this._t)
    this._t = setTimeout(()=> e.hidden = true, ms)
  }

  inspect(t){
    const r = document.getElementById('inspector')
    const b = document.getElementById('inspectorBody')
    const c = document.getElementById('inspectorClose')
    if (!r || !b) return this.toast(t, 2200)
    b.innerHTML = t || ''
    r.hidden = false
    const hide = () => { r.hidden = true; b.innerHTML = '' }
    c?.addEventListener('click', hide, { once:true })
    r.addEventListener('click', e => { if(e.target===r) hide() }, { once:true })
    this._hideInspector = hide
  }

  closeInspector(){
    if (this._hideInspector) this._hideInspector()
    else {
      const r = document.getElementById('inspector')
      const b = document.getElementById('inspectorBody')
      if (r) r.hidden = true
      if (b) b.innerHTML = ''
    }
  }

  /**
   * Dialog data format:
   * { title, start, nodes: [{ id, text, enterActions?, options: [
   *    { label, actions?, next, requiresFlags?:[], requiresItems?:[] }
   * ]}]}
   */
  dialog(def, run){
    const r = document.getElementById('inspector')
    const b = document.getElementById('inspectorBody')
    const c = document.getElementById('inspectorClose')
    if (!r || !b) return
    const byId = new Map((def?.nodes||[]).map(n=>[n.id, n]))

    const checkReq = (opt) => {
      if (Array.isArray(opt.requiresFlags) && opt.requiresFlags.length){
        const ok = opt.requiresFlags.every(f => State.hasFlag(f))
        if (!ok) return false
      }
      if (Array.isArray(opt.requiresItems) && opt.requiresItems.length){
        const ok = opt.requiresItems.every(i => State.data.inventory.includes(i))
        if (!ok) return false
      }
      return true
    }

    const render = async (id) => {
      const n = byId.get(id)
      if (!n){ this.closeInspector(); return }
      if (Array.isArray(n.enterActions)){
        for (const a of n.enterActions){ await run?.(a) }
      }

      b.innerHTML = `
        <div style="font-weight:600;margin-bottom:.5rem;">${def?.title||'Diálogo'}</div>
        <div style="margin-bottom:10px;">${n.text||''}</div>
        <div id="dlgOptions" style="display:flex;flex-direction:column;gap:8px;"></div>
      `
      const root = document.getElementById('dlgOptions')
      for (const opt of (n.options||[])){
        if (!checkReq(opt)) continue   // ← filtro por flags/items
        const bt = document.createElement('button')
        bt.className = 'btn'
        bt.textContent = opt.label || '...'
        bt.addEventListener('click', async ()=>{
          if (Array.isArray(opt.actions)){
            for (const a of opt.actions){ await run?.(a) }
          }
          if (opt.next === 'end' || !opt.next){
            r.hidden = true; b.innerHTML = ''
            return
          }
          render(opt.next)
        })
        root.appendChild(bt)
      }
    }

    r.hidden = false
    const hide = () => { r.hidden = true; b.innerHTML = '' }
    c?.addEventListener('click', hide, { once:true })
    r.addEventListener('click', e => { if(e.target===r) hide() }, { once:true })
    this._hideInspector = hide
    render(def?.start || 'start')
  }
}
