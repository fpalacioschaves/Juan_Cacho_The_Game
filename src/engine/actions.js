// src/engine/actions.js
import { State } from '../core/state.js'

export const Actions = {
  async run(ctx, action){
    const t = action?.type
    switch(t){
      case 'inspect': return Actions.inspect(ctx, action)
      case 'toast': return Actions.toast(ctx, action)
      case 'pickup': return Actions.pickup(ctx, action)
      case 'requireItems': return Actions.requireItems(ctx, action)
      case 'requireFlags': return Actions.requireFlags(ctx, action)
      case 'setObjective': return Actions.setObjective(ctx, action)
      case 'goto': return Actions.goto(ctx, action)
      case 'setFlag': return Actions.setFlag(ctx, action)
      case 'dialog': return Actions.dialog(ctx, action)
      default: console.warn('Acción desconocida:', t, action)
    }
  },

  inspect({hud}, {html}){ if(html) hud.inspect(html) },
  toast({hud}, {text, ms}){ if(text) hud.toast(text, ms || 1600) },

  pickup({inventory, hud}, {item, onSuccess, onAlready}){
    if(!item) return
    if(inventory.has(item)){ if(onAlready) hud.toast(onAlready); return }
    inventory.add(item); if(onSuccess) hud.toast(onSuccess)
  },

  requireItems({inventory, hud}, {allOf=[], onMissing, onMissingMap}){
    const missing = (allOf || []).filter(id => !inventory.has(id))
    if(missing.length === 0) return true
    if(onMissingMap && typeof onMissingMap === 'object'){
      for(const id of missing){ const msg = onMissingMap[id]; if(msg){ hud.toast(msg); return false } }
    }
    if(onMissing){ hud.toast(onMissing) }
    return false
  },

  requireFlags({hud}, {allOf=[], onMissing, onMissingMap}){
    const missing = (allOf || []).filter(flag => !State.hasFlag(flag))
    if(missing.length === 0) return true
    if(onMissingMap && typeof onMissingMap === 'object'){
      for(const f of missing){ const msg = onMissingMap[f]; if(msg){ hud.toast(msg); return false } }
    }
    if(onMissing){ hud.toast(onMissing) }
    return false
  },

  setObjective({hud}, {text}){ if(text) hud.setObjective(text) },
  goto({sceneManager}, {to}){ if(to) return sceneManager.change(to) },
  setFlag(_,{flag}){ if(flag) State.setFlag(flag) },

  dialog({hud, scene}, def){
    hud.dialog(def, (action)=> Actions.run({hud, scene, inventory: scene.inventory, sceneManager: scene._sceneManager}, action))
  }
}
