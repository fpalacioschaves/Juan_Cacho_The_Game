export class Inventory {
  constructor(root, state) { this.root = root; this.state = state; state.on('changed', ()=>this.render()); }
  render() {
    const inv = this.state.cache?.player?.inventory || [];
    this.root.innerHTML = '';
    inv.forEach(id => {
      const el = document.createElement('div');
      el.className = 'inv-item';
      const img = document.createElement('img');
      img.alt = id; img.src = this.iconFor(id);
      el.title = id; el.appendChild(img);
      this.root.appendChild(el);
    });
  }
  iconFor(id) {
    // Mapear id → icono; en producción, leer de /data/items.json si hace falta
    if (id === 'llaves-juan') return '/assets/img/items/llaves.png';
    return '/assets/img/items/unknown.png';
  }
}
