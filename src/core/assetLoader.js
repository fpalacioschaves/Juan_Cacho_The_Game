// src/core/assetLoader.js
function timeout(ms){ return new Promise(res => setTimeout(res, ms)) }

function createPlaceholder(label='MISSING', w=320, h=180){
  const c = document.createElement('canvas')
  c.width=w; c.height=h
  const ctx = c.getContext('2d')
  ctx.fillStyle='#3a2332'; ctx.fillRect(0,0,w,h)
  ctx.strokeStyle='#903'; ctx.strokeRect(0,0,w-1,h-1)
  ctx.fillStyle='#fff'; ctx.font='20px sans-serif'
  const tw = ctx.measureText(label).width
  ctx.fillText(label, (w-tw)/2, h/2)
  const img = new Image()
  img.src = c.toDataURL('image/png')
  return img
}

export const Assets = {
  images: new Map(),
  async loadManifest(manifest){
    const entries = Object.entries(manifest?.images || {})
    const tasks = entries.map(([key, url]) => this._loadImage(key, url))
    await Promise.all(tasks)
  },
  async _loadImage(key, url){
    const img = new Image()
    img.decoding = 'async'
    img.loading = 'eager'
    img.src = url
    const loadP = new Promise((resolve)=>{
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
    })
    const ok = await Promise.race([loadP, timeout(8000).then(()=>false)])
    if(!ok){
      console.warn('Fallo al cargar', key, url, '→ usando placeholder')
      this.images.set(key, createPlaceholder(key, 480, 270))
    }else{
      this.images.set(key, img)
    }
  },
  get(key){ return this.images.get(key) },
  summary(){ return [...this.images.keys()] }
}
