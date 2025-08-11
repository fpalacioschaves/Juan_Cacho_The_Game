import { showToast, inRect } from '../ui/utils.js';

export class Scene {
  constructor(canvas, ctx, apiUrl, state) {
    this.canvas = canvas; this.ctx = ctx; this.apiUrl = apiUrl; this.state = state;
    this.bg = null; this.model = null; this.hotspots = [];
    this.listeners = {};
    canvas.addEventListener('click', (e)=>this.onClick(e));
  }

  async loadAndRender(id, chapter) {
    const url = `${this.apiUrl}?id=${encodeURIComponent(id)}${chapter?`&chapter=${chapter}`:''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('scene load failed');
    this.model = await res.json();
    this.bg = await this.loadImage(this.model.background);
    this.hotspots = this.model.hotspots || [];
    await this.render();
  }

  async render() {
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.ctx.drawImage(this.bg, 0, 0, this.canvas.width, this.canvas.height);
    // (Opcional: dibujar rects debug) this.drawDebug();
  }

  drawDebug() {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(0,255,0,.35)';
    for (const h of this.hotspots) {
      const [x,y,w,hg] = h.rect;
      this.ctx.strokeRect(x,y,w,hg);
    }
    this.ctx.restore();
  }

  async onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    const hs = this.hotspots.find(h => inRect(x, y, h.rect));
    if (!hs) return;
    await this.runActions(hs.onClick || []);
  }

  async runActions(actions) {
    for (const a of actions) {
      if (a.action === 'addItem') {
        if (a.ifMissing && this.state.hasItem(a.item)) continue;
        await this.state.addItem(a.item);
        this.emit('toast', 'Objeto añadido');
      }
      if (a.action === 'showToast') this.emit('toast', a.text || '');
      if (a.action === 'flagSet') await this.state.setFlag(a.flag, a.value ?? true);
      if (a.action === 'requireItem') {
        if (!this.state.hasItem(a.item)) {
          this.emit('toast', a.failText || 'Te falta algo.');
          return; // corta la cadena si falta requisito
        }
      }
      if (a.action === 'gotoScene') {
        await this.state.patch({ scene: a.scene });
        await this.loadAndRender(a.scene, this.state.cache.player.chapter);
        return; // termina cadena tras cambiar escena
      }
    }
  }

  on(evt, cb){ (this.listeners[evt]??=[]).push(cb); }
  emit(evt, data){ (this.listeners[evt]||[]).forEach(cb=>cb(data)); }

  loadImage(src) {
    return new Promise((res, rej)=>{
      const img = new Image(); img.onload=()=>res(img); img.onerror=rej; img.src = src;
    });
  }
}
