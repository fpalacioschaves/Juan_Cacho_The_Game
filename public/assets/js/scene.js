// public/assets/js/scene.js
export class Scene {
  constructor(canvas, ctx, apiEndpoint, state, opts = {}) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.apiEndpoint = apiEndpoint;
    this.state = state;
    this.data = null;
    this.hotspots = [];
    this.selectedItem = null;
    this.onStateChanged = opts.onStateChanged || (() => {});
    this.dialogue = opts.dialogue || null; // 👈 gestor de diálogos

    const params = new URLSearchParams(location.search);
    this.debug = (params.get('debug') === '1') || (window.GAME_DEBUG === true);

    this._bindedOnClick = this._onClick.bind(this);
    this._bindedOnMove = this._onMove.bind(this);
    this._bindedOnUseItem = this._onUseItem.bind(this);
  }

  async loadAndRender({ id, chapter }) {
    const url = `${this.apiEndpoint}?id=${encodeURIComponent(id)}&chapter=${encodeURIComponent(chapter)}`;
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('scene load failed');
    this.data = await res.json();

    const bg = await this._loadImage(this.data.background);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(bg, 0, 0, this.canvas.width, this.canvas.height);

    this.hotspots = Array.isArray(this.data.hotspots) ? this.data.hotspots : [];
    if (this.debug) this._drawHotspotBounds();

    this._installEvents();

    this.state.set('chapter', this.data.chapter);
    this.state.set('scene', this.data.id);
    await this.state.save({ chapter: this.data.chapter, scene: this.data.id });
  }

  destroy() {
    this.canvas.removeEventListener('click', this._bindedOnClick);
    this.canvas.removeEventListener('mousemove', this._bindedOnMove);
    window.removeEventListener('use-item-selected', this._bindedOnUseItem);
  }

  _installEvents() {
    this.canvas.removeEventListener('click', this._bindedOnClick);
    this.canvas.removeEventListener('mousemove', this._bindedOnMove);
    window.removeEventListener('use-item-selected', this._bindedOnUseItem);

    this.canvas.addEventListener('click', this._bindedOnClick);
    this.canvas.addEventListener('mousemove', this._bindedOnMove);
    window.addEventListener('use-item-selected', this._bindedOnUseItem);
  }

  _onUseItem(e) {
    this.selectedItem = e.detail?.item || null;
  }

  _onMove(evt) {
    if (this.dialogue?.isOpen) { this.canvas.style.cursor = 'default'; return; }
    if (!this.hotspots?.length) return;
    const { x, y } = this._canvasCoords(evt);
    const hit = this.hotspots.find(h => this._pointInRect(x, y, h.rect));
    if (!hit) { this.canvas.style.cursor = 'default'; return; }
    this.canvas.style.cursor = (hit.cursor === 'exit') ? 'pointer' : (hit.cursor || 'pointer');
  }

  async _onClick(evt) {
    if (this.dialogue?.isOpen) return; // bloquear interacción mientras hay diálogo
    if (!this.hotspots?.length) return;
    const { x, y } = this._canvasCoords(evt);
    const hit = this.hotspots.find(h => this._pointInRect(x, y, h.rect));
    if (!hit) return;

    if (this.selectedItem && Array.isArray(hit.accepts) && hit.accepts.includes(this.selectedItem)) {
      if (Array.isArray(hit.onUseSuccess)) {
        const ok = await this._runActions(hit.onUseSuccess);
        if (ok) this._clearSelectedItem();
      }
      return;
    } else if (this.selectedItem && (Array.isArray(hit.accepts) || hit.onUseFail)) {
      if (hit.onUseFail?.text) this._toast(hit.onUseFail.text, true);
      return;
    }

    if (Array.isArray(hit.onClick)) {
      await this._runActions(hit.onClick);
    }
  }

  async _runActions(actions) {
    for (const act of actions) {
      const type = act.action;

      // Condiciones
      if (type === 'requireItem') {
        const inv = this.state.get('inventory', []);
        if (!inv.includes(act.item)) { this._toast(act.failText || 'Te falta algo…', true); return false; }
      } else if (type === 'requireFlag') {
        const val = this.state.getFlag(act.flag, false);
        if (!val) { if (act.failText) this._toast(act.failText, true); return false; }
      } else if (type === 'requireNotFlag') {
        const val = this.state.getFlag(act.flag, false);
        if (val) { if (act.failText) this._toast(act.failText, true); return false; }
      }

      // Efectos
      else if (type === 'showToast') {
        this._toast(act.text || '');
      } else if (type === 'addItem') {
        const inv = this.state.get('inventory', []);
        if (act.ifMissing && inv.includes(act.item)) continue;
        if (!inv.includes(act.item)) inv.push(act.item);
        this.state.set('inventory', inv);
        await this.state.save({ inventory: inv });
        this.onStateChanged();
      } else if (type === 'removeItem') {
        const inv = this.state.get('inventory', []);
        const i = inv.indexOf(act.item);
        if (i >= 0) inv.splice(i, 1);
        this.state.set('inventory', inv);
        await this.state.save({ inventory: inv });
        this.onStateChanged();
      } else if (type === 'setFlag') {
        this.state.setFlag(act.flag, act.value !== undefined ? !!act.value : true);
        await this.state.save({ flags: this.state.get('flags') });
      } else if (type === 'clearFlag') {
        this.state.setFlag(act.flag, false);
        await this.state.save({ flags: this.state.get('flags') });
      } else if (type === 'toggleFlag') {
        this.state.toggleFlag(act.flag);
        await this.state.save({ flags: this.state.get('flags') });
      } else if (type === 'startDialogue') {
        if (!this.dialogue) { console.warn('DialogueManager no disponible'); continue; }
        await this.dialogue.open({ id: act.id, chapter: act.chapter || this.data.chapter });
      }

      // Navegación
      else if (type === 'gotoScene') {
        const ev = new CustomEvent('goto-scene', { detail: { id: act.scene, chapter: act.chapter || this.data.chapter } });
        window.dispatchEvent(ev);
      }
    }
    return true;
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

  _toast(text, isError = false) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.className = isError ? 'error show' : 'show';
    el.textContent = text;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { el.className = ''; el.textContent = ''; }, 1600);
  }

  _clearSelectedItem() {
    this.selectedItem = null;
    const ev = new CustomEvent('use-item-selected', { detail: { item: null } });
    window.dispatchEvent(ev);
  }

  _drawHotspotBounds() {
    if (!this.hotspots?.length) return;
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255,0,0,0.65)';
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = 'rgba(255,0,0,0.10)';
    this.hotspots.forEach(h => {
      const [x, y, w, hgt] = h.rect;
      this.ctx.fillRect(x, y, w, hgt);
      this.ctx.strokeRect(x, y, w, hgt);
      const idText = h.id || 'hotspot';
      this.ctx.fillStyle = 'rgba(0,0,0,0.55)';
      this._labelBox(x, y - 18, idText);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '12px system-ui, sans-serif';
      this.ctx.fillText(idText, x + 6, y - 6);
      this.ctx.fillStyle = 'rgba(255,0,0,0.10)';
    });
    this.ctx.restore();
  }

  _labelBox(x, y, text) {
    const padX = 6, padY = 4;
    const metrics = this.ctx.measureText(text);
    const w = Math.ceil(metrics.width) + padX * 2;
    const h = 16 + padY * 2;
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0,0,0,0.55)';
    this.ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.rect(x, y - h + padY, w, h);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
  }

  _loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
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
      img.src = src;
    });
  }
}
