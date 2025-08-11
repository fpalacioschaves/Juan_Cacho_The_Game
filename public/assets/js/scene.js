export class Scene {
  constructor(canvas, ctx, apiEndpoint, state) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.apiEndpoint = apiEndpoint; // endpoint completo (con base)
    this.state = state;
    this.data = null;
    this.hotspots = [];
    this._bindedOnClick = this._onClick.bind(this);
  }

  async loadAndRender({ id, chapter }) {
    // Carga datos de escena
    const url = `${this.apiEndpoint}?id=${encodeURIComponent(id)}&chapter=${encodeURIComponent(chapter)}`;
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('scene load failed');
    this.data = await res.json();

    // Fondo
    const bg = await this._loadImage(this.data.background);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(bg, 0, 0, this.canvas.width, this.canvas.height);

    // Hotspots
    this.hotspots = Array.isArray(this.data.hotspots) ? this.data.hotspots : [];
    this._installEvents();
  }

  destroy() {
    this.canvas.removeEventListener('click', this._bindedOnClick);
  }

  _installEvents() {
    this.canvas.removeEventListener('click', this._bindedOnClick);
    this.canvas.addEventListener('click', this._bindedOnClick);
  }

  _pointInRect(x, y, rect) {
    const [rx, ry, rw, rh] = rect;
    return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
  }

  _canvasCoords(evt) {
    const r = this.canvas.getBoundingClientRect();
    const x = Math.round((evt.clientX - r.left) * (this.canvas.width / r.width));
    const y = Math.round((evt.clientY - r.top) * (this.canvas.height / r.height));
    return { x, y };
  }

  async _onClick(evt) {
    if (!this.hotspots?.length) return;
    const { x, y } = this._canvasCoords(evt);
    const hit = this.hotspots.find(h => this._pointInRect(x, y, h.rect));
    if (!hit) return;

    // Ejecutar acciones declarativas simples
    if (Array.isArray(hit.onClick)) {
      for (const act of hit.onClick) {
        const type = act.action;
        if (type === 'showToast') {
          this._toast(act.text || '');
        } else if (type === 'addItem') {
          const inv = this.state.get('inventory', []);
          if (act.ifMissing && inv.includes(act.item)) continue;
          if (!inv.includes(act.item)) inv.push(act.item);
          this.state.set('inventory', inv);
          await this.state.save({ inventory: inv });
        } else if (type === 'requireItem') {
          const inv = this.state.get('inventory', []);
          if (!inv.includes(act.item)) {
            this._toast(act.failText || 'Te falta algo…', true);
            return;
          }
        } else if (type === 'gotoScene') {
          // Emite un evento simple; main decide
          const ev = new CustomEvent('goto-scene', { detail: { id: act.scene, chapter: act.chapter || this.data.chapter } });
          window.dispatchEvent(ev);
        }
      }
    }
  }

  _toast(text, isError = false) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.className = isError ? 'error show' : 'show';
    el.textContent = text;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { el.className = ''; el.textContent = ''; }, 1600);
  }

  _loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Fallback visual si falla la imagen
        const c = document.createElement('canvas');
        c.width = this.canvas.width; c.height = this.canvas.height;
        const cx = c.getContext('2d');
        cx.fillStyle = '#1f2228'; cx.fillRect(0,0,c.width,c.height);
        cx.fillStyle = '#9fd76a'; cx.font = '16px system-ui';
        cx.fillText('Fondo no encontrado:', 24, 40);
        cx.fillText(src, 24, 64);
        const fallback = new Image();
        fallback.onload = () => resolve(fallback);
        fallback.src = c.toDataURL('image/png');
      };
      img.src = src; // Debe ser relativo al <base> o absoluto válido
    });
  }
}
