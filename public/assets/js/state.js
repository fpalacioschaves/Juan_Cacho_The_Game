// public/assets/js/state.js
export class State {
  constructor(getUrl, setUrl) {
    this.getUrl = getUrl;
    this.setUrl = setUrl;
    this.data = {
      chapter: 'c1',
      scene: 'piso-juan',
      inventory: [],
      flags: {}
    };
  }

  async load() {
    const res = await fetch(this.getUrl, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('state-get failed');
    const json = await res.json();
    // Fusionamos por si el backend devuelve parcial/incompleto
    if (json && typeof json === 'object') {
      this.data = {
        chapter: json.chapter ?? this.data.chapter,
        scene: json.scene ?? this.data.scene,
        inventory: Array.isArray(json.inventory) ? json.inventory : this.data.inventory,
        flags: (json.flags && typeof json.flags === 'object') ? json.flags : this.data.flags
      };
    }
  }

  async save(partial = {}) {
    // Mezcla superficial de propiedades "top-level"
    const merged = {
      ...this.data,
      ...partial
    };
    // Asegurar estructura
    if (!Array.isArray(merged.inventory)) merged.inventory = this.data.inventory;
    if (!merged.flags || typeof merged.flags !== 'object') merged.flags = this.data.flags;

    const res = await fetch(this.setUrl, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged)
    });
    if (!res.ok) throw new Error('state-set failed');
    this.data = merged;
    return this.data;
  }

  get(path, fallback = undefined) {
    // Soporta keys simples: 'inventory', 'flags', 'scene'...
    if (!path) return this.data;
    return (path in this.data) ? this.data[path] : fallback;
  }

  set(path, value) {
    this.data[path] = value;
    return this.data[path];
  }

  // ---------- FLAGS ----------
  getFlag(name, defaultVal = false) {
    return !!(this.data.flags?.[name] ?? defaultVal);
  }

  hasFlag(name) {
    return !!(this.data.flags && this.data.flags[name]);
  }

  setFlag(name, val = true) {
    if (!this.data.flags || typeof this.data.flags !== 'object') this.data.flags = {};
    this.data.flags[name] = !!val;
    return this.data.flags[name];
  }

  toggleFlag(name) {
    const next = !this.getFlag(name);
    this.setFlag(name, next);
    return next;
  }
}
