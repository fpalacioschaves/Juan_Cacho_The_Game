// public/assets/js/inventory.js
export class InventoryUI {
  constructor(state) {
    this.state = state;
    this.root = document.getElementById('inventory');
    this.selected = null;
    this._onClickItem = this._onClickItem.bind(this);
  }

  render() {
    if (!this.root) return;
    const items = this.state.get('inventory', []);
    this.root.innerHTML = '';

    if (!items.length) {
      const empty = document.createElement('div');
      empty.style.opacity = '0.75';
      empty.textContent = 'Inventario vacío';
      this.root.appendChild(empty);
      this._emitSelection(null);
      return;
    }

    for (const id of items) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'inv-chip';
      chip.dataset.id = id;
      chip.textContent = this._label(id);
      if (this.selected === id) chip.classList.add('selected');
      chip.addEventListener('click', this._onClickItem);
      this.root.appendChild(chip);
    }
  }

  _onClickItem(e) {
    const id = e.currentTarget.dataset.id;
    this.selected = (this.selected === id) ? null : id;
    this.render();
    this._emitSelection(this.selected);
  }

  _emitSelection(id) {
    const ev = new CustomEvent('use-item-selected', { detail: { item: id } });
    window.dispatchEvent(ev);
  }

  // Etiquetas legibles (puedes mapear aquí nombres bonitos)
  _label(id) {
    const map = {
      'llaves-juan': 'Llaves de Juan'
    };
    return map[id] || id;
  }
}
