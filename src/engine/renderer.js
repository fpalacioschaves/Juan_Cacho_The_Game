// src/engine/renderer.js
import { log } from '../core/logger.js'

export class Renderer {
  constructor(canvas, assets, overlay){
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.overlay = overlay || document.getElementById('overlayCanvas')
    this.octx = this.overlay?.getContext('2d') || null
    this.assets = assets
    if(!this.ctx){ alert('Tu navegador no soporta Canvas 2D'); return }
    this.fitToContainer()
  }

  fitToContainer(){
    const parent = this.canvas.parentElement || document.body
    const maxW = Math.min(parent.clientWidth || 960, 960)
    const targetW = Math.max(320, maxW)
    const targetH = Math.round(targetW * 9 / 16)
    this.canvas.width = targetW
    this.canvas.height = targetH
    if(this.overlay){
      this.overlay.width = targetW
      this.overlay.height = targetH
    }
  }

  clear(){ this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height) }
  clearOverlay(){ if(this.octx) this.octx.clearRect(0,0,this.overlay.width, this.overlay.height) }

  drawImage(key){
    const img = this.assets.get(key)
    if(!img){ log.warn('drawImage: asset no encontrado', key); return }
    this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
  }

  drawHotspotRect(h){
    const ctx = this.octx || this.ctx
    ctx.save()
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(255,255,0,.9)'
    ctx.strokeRect(h.x, h.y, h.w, h.h)
    ctx.restore()
  }

  toLocalCoords(evt){
    const rect = this.canvas.getBoundingClientRect()
    const x = (evt.clientX - rect.left) * (this.canvas.width / rect.width)
    const y = (evt.clientY - rect.top) * (this.canvas.height / rect.height)
    return {x,y}
  }
}
