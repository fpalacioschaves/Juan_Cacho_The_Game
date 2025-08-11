export class State {
  constructor(getUrl, setUrl) {
    this.getUrl = getUrl; this.setUrl = setUrl;
    this.cache = null;
    this.listeners = {};
  }
  async load() {
    const res = await fetch(this.getUrl);
    if (!res.ok) throw new Error('state-get failed');
    this.cache = await res.json();
    return this.cache;
  }
  async patch(delta) {
    const res = await fetch(this.setUrl, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(delta)
    });
    if (!res.ok) throw new Error('state-set failed');
    this.cache = await res.json();
    this.emit('changed', this.cache);
    return this.cache;
  }
  hasItem(id) { return this.cache?.player?.inventory?.includes(id); }
  async addItem(id) { if (!this.hasItem(id)) await this.patch({ addItem: id }); }
  setFlag(k, v) { return this.patch({ flags: { [k]: v } }); }
  on(evt, cb){ (this.listeners[evt]??=[]).push(cb); }
  emit(evt, data){ (this.listeners[evt]||[]).forEach(cb=>cb(data)); }
}
