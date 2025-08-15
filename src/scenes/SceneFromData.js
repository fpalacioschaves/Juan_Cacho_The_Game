// src/scenes/SceneFromData.js
import { SceneBase } from './SceneBase.js'
import { Hotspot } from '../engine/hotspot.js'
import { Actions } from '../engine/actions.js'
import getOverlay from '../ui/overlay.js'   // ← NUEVO

async function loadJSON(url){
  if(!url || typeof url !== 'string') throw new Error('No se pudo cargar '+String(url));
  const res = await fetch(url, {cache:'no-store'});
  if(!res.ok) throw new Error('No se pudo cargar '+url+' · HTTP '+res.status);
  return await res.json();
}

/** Extensión local: soporta acción "overlay" sin romper Actions.run */
async function runActionExtended(ctx, act){
  if(!act || typeof act !== 'object') return;

  // === NUEVO: overlay ======================================================
  if (act.type === 'overlay'){
    const overlay = getOverlay();
    const buttons = [];

    // Botón por defecto para coger un ítem
    if (act.pickable && act.item && act.item.id){
      buttons.push({
        label: act.pickLabel || 'Coger',
        variant: 'primary',
        onClick: async ()=>{
          try{
            const id = act.item.id;
            const inv = ctx.inventory;
            if (inv && typeof inv.addById === 'function')      inv.addById(id, act.item);
            else if (inv && typeof inv.add === 'function')      inv.add(id);
            else if (inv && typeof inv.addItem === 'function')  inv.addItem(id);
            ctx.hud?.toast?.(`Has cogido: ${act.item.name || id}`);
          }catch(e){
            console.warn('[overlay] no se pudo añadir item', e);
          }
          overlay.close();

          // Sub-acciones tras coger (opcionales)
          if (Array.isArray(act.afterPick)){
            for (const sub of act.afterPick){
              if (sub?.type === 'requireItems'){
                const ok = Actions.requireItems(ctx, sub);
                if(!ok) return;
                continue;
              }
              await runActionExtended(ctx, sub);
            }
          }
        }
      });
    }

    // Botones extra declarados en JSON
    if (Array.isArray(act.buttons)){
      for (const b of act.buttons){
        buttons.push({
          label: b.label || 'Continuar',
          variant: b.variant || (b.primary ? 'primary' : 'muted'),
          onClick: async ()=>{
            if (Array.isArray(b.requireItems) && b.requireItems.length){
              const ok = Actions.requireItems(ctx, { ids: b.requireItems, toast: b.toast });
              if(!ok) return;
            }
            overlay.close();
            if (Array.isArray(b.actions)){
              for (const sub of b.actions){
                if (sub?.type === 'requireItems'){
                  const ok2 = Actions.requireItems(ctx, sub);
                  if(!ok2) return;
                  continue;
                }
                await runActionExtended(ctx, sub);
              }
            }
          }
        });
      }
    }

    if (buttons.length === 0){
      buttons.push({ label: act.closeLabel || 'Cerrar', variant:'muted', onClick: ()=> getOverlay().close() });
    }

    overlay.open({
      title: act.title || '',
      description: act.description || '',
      image: act.image || '',
      buttons
    });

    return; // overlay consume el turno
  }
  // ========================================================================

  // Resto de acciones → tu sistema actual
  await Actions.run(ctx, act);
}

export class SceneFromData extends SceneBase{
  constructor({id,jsonUrl,assets,hud,inventory}){
    super({id,bgKey:null,assets,hud,inventory});
    this.jsonUrl=jsonUrl;
    this.def=null;
  }
  async _loadDef(){
    if(this.def)return;
    this.def=await loadJSON(this.jsonUrl);
    this.bgKey=this.def.bg||null;
    this.objective=this.def.objectives?.default||'';
  }
  _applyObjectiveRules(){
    if(!this.def?.objectives)return;
    const inv=this.inventory;
    const rules=this.def.objectives.rules||[];
    for(const r of rules){
      const all=r.whenAll||[];
      const ok=all.every(id=>inv.has(id));
      if(ok){ this.hud.setObjective(r.text); return }
    }
    const def=this.def.objectives.default;
    if(def) this.hud.setObjective(def);
  }
  async onEnter(renderer){
    await this._loadDef();
    await super.onEnter(renderer);
    const W=renderer.canvas.width, H=renderer.canvas.height;

    this.hotspots=(this.def.hotspots||[]).map(h=>{
      const r=h.rect||{x:0,y:0,w:0,h:0};
      const rect={x:W*(r.x||0), y:H*(r.y||0), w:W*(r.w||0), h:H*(r.h||0)};
      return new Hotspot({
        x:rect.x, y:rect.y, w:rect.w, h:rect.h, once:!!h.once,
        onClick:async()=>{
          for(const act of (h.actions||[])){
            if(act.type==='requireItems'){
              const ok=Actions.requireItems(this._ctx(),act);
              if(!ok) return;
              continue;
            }
            await runActionExtended(this._ctx(),act);
          }
          this._applyObjectiveRules();
        }
      })
    });

    this._applyObjectiveRules();
  }
  _ctx(){ return { scene:this, hud:this.hud, inventory:this.inventory, sceneManager:this._sceneManager } }
}
