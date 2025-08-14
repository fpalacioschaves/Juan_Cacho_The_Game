/**
 * src/ui/overlay.js
 * Overlay/modal ligero sin dependencias. Singleton accesible via getOverlay().
 */

class Overlay {
  constructor(){
    this.root = null;
    this._ensureRoot();
    this._bindGlobal();
  }

  _ensureRoot(){
    if (this.root) return;
    const root = document.createElement('div');
    root.id = 'overlay-root';
    root.innerHTML = `
      <div class="ov-wrap" data-overlay>
        <div class="ov-dialog" role="dialog" aria-modal="true">
          <div class="ov-header" data-ov-title></div>
          <div class="ov-body">
            <img class="ov-img" data-ov-img alt="">
            <div class="ov-desc" data-ov-desc></div>
          </div>
          <div class="ov-footer" data-ov-footer></div>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    this.root = root;
    this.wrap = root.querySelector('[data-overlay]');
    this.title = root.querySelector('[data-ov-title]');
    this.desc = root.querySelector('[data-ov-desc]');
    this.img  = root.querySelector('[data-ov-img]');
    this.footer = root.querySelector('[data-ov-footer]');
    this.body = root.querySelector('.ov-body');
  }

  _bindGlobal(){
    // Cerrar con ESC o clic en backdrop
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape') this.close();
    });
    this.wrap?.addEventListener('click', (e)=>{
      if(e.target === this.wrap) this.close();
    });
  }

  /**
   * Abre el overlay.
   * @param {Object} cfg
   * @param {string} cfg.title
   * @param {string} cfg.description
   * @param {string} [cfg.image]
   * @param {Array<{label:string,variant?:'primary'|'muted'|'destructive',onClick:Function}>} cfg.buttons
   */
  open(cfg){
    this._ensureRoot();

    this.title.textContent = cfg.title ?? '';
    this.desc.textContent = cfg.description ?? '';

    if (cfg.image){
      this.img.src = cfg.image;
      this.img.style.display = '';
      this.body.classList.remove('noimg');
    } else {
      this.img.removeAttribute('src');
      this.img.style.display = 'none';
      this.body.classList.add('noimg');
    }

    // Botonera
    this.footer.innerHTML = '';
    const makeBtn = (b)=>{
      const el = document.createElement('button');
      el.className = 'ov-btn ' + (b.variant || '');
      el.textContent = b.label;
      el.addEventListener('click', async ()=>{
        try{ await b.onClick?.(); }
        finally{ /* el onClick decide si cierra o no */ }
      });
      return el;
    };
    (cfg.buttons||[]).forEach(b => this.footer.appendChild(makeBtn(b)));

    this.wrap.classList.add('show');
  }

  close(){
    this.wrap?.classList.remove('show');
  }
}

let _overlay;
export function getOverlay(){
  if(!_overlay) _overlay = new Overlay();
  return _overlay;
}
export default getOverlay;
