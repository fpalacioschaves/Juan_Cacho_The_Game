export class State {
  constructor(getUrl, setUrl) {
    this.getUrl = getUrl;
    this.setUrl = setUrl;
    this.data = null;
  }

  async load() {
    const res = await fetch(this.getUrl, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('state-get failed');
    this.data = await res.json();
    return this.data;
  }

  async save(patch) {
    const body = JSON.stringify(patch ?? this.data ?? {});
    const res = await fetch(this.setUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body
    });
    if (!res.ok) throw new Error('state-set failed');
    this.data = await res.json();
    return this.data;
  }

  get(key, fallback = null) {
    return (this.data && key in this.data) ? this.data[key] : fallback;
  }

  set(key, value) {
    if (!this.data) this.data = {};
    this.data[key] = value;
  }
}
