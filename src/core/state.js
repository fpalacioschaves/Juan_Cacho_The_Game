// src/core/state.js
import { Storage } from './storage.js'

const DEFAULT_DATA = {
  currentScene: null,      // si es null, main establece la escena de inicio por defecto
  inventory: [],
  selectedItem: null
}

export const State = {
  data: { ...DEFAULT_DATA },

  addItem(id){
    if(!this.data.inventory.includes(id)) this.data.inventory.push(id)
    this.persist()
  },
  hasItem(id){ return this.data.inventory.includes(id) },
  selectItem(id){ this.data.selectedItem = id; this.persist() },
  clearSelection(){ this.data.selectedItem = null; this.persist() },
  goTo(sceneId){ this.data.currentScene = sceneId; this.persist() },

  reset(){
    this.data = { ...DEFAULT_DATA }
    try{ Storage.clear() }catch(e){ /* ignore */ }
    this.persist()
  },

  persist(){ Storage.save(this.data) },
  load(){
    const saved = Storage.load()
    if(saved && typeof saved === 'object'){
      this.data = { ...DEFAULT_DATA, ...saved }
    }
  }
}
