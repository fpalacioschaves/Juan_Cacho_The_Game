// src/core/state.js
import { Storage } from './storage.js'

const DEFAULT_DATA = {
  currentScene: null,
  inventory: [],
  selectedItem: null,
  flags: []
}

export const State = {
  data: { ...DEFAULT_DATA },

  addItem(id){ if(!this.data.inventory.includes(id)) this.data.inventory.push(id); this.persist() },
  hasItem(id){ return this.data.inventory.includes(id) },

  selectItem(id){ this.data.selectedItem = id; this.persist() },
  clearSelection(){ this.data.selectedItem = null; this.persist() },

  goTo(sceneId){ this.data.currentScene = sceneId; this.persist() },

  // Flags (presentaciones, anuncios, etc.)
  hasFlag(id){ return Array.isArray(this.data.flags) && this.data.flags.includes(id) },
  setFlag(id){
    if(!Array.isArray(this.data.flags)) this.data.flags = []
    if(!this.hasFlag(id)) this.data.flags.push(id)
    this.persist()
  },
  clearFlag(id){
    if(!Array.isArray(this.data.flags)) return
    this.data.flags = this.data.flags.filter(f => f !== id)
    this.persist()
  },

  reset(){ this.data = { ...DEFAULT_DATA }; try{ Storage.clear() }catch(e){} this.persist() },
  persist(){ Storage.save(this.data) },
  load(){
    const saved = Storage.load()
    if(saved && typeof saved === 'object'){
      this.data = { ...DEFAULT_DATA, ...saved }
    }
  }
}
