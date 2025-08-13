// src/core/storage.js
const KEY = 'juan_cacho_save_v1'
export const Storage = {
  save(data){
    try{ localStorage.setItem(KEY, JSON.stringify(data)) }catch(e){ console.warn('No se pudo guardar', e) }
  },
  load(){
    try{ return JSON.parse(localStorage.getItem(KEY) || 'null') }catch(e){ return null }
  },
  clear(){ try{ localStorage.removeItem(KEY) }catch(e){} }
}
