// src/core/events.js
export class Events {
  constructor(){ this.map = new Map() }
  on(name, fn){ if(!this.map.has(name)) this.map.set(name, new Set()); this.map.get(name).add(fn) }
  off(name, fn){ this.map.get(name)?.delete(fn) }
  emit(name, payload){ this.map.get(name)?.forEach(fn => { try{ fn(payload) }catch(e){ console.error('Listener error', e) } }) }
}
