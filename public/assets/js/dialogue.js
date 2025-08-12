// public/assets/js/dialogue.js
export class DialogueManager {
  constructor(apiEndpoint, runActions) {
    this.apiEndpoint = apiEndpoint; // /api/dialogue.php
    this.runActions = runActions;   // función para ejecutar acciones del juego

    this.$root = document.getElementById('dialogue');
    this.$speaker = document.getElementById('dlg-speaker');
    this.$text = document.getElementById('dlg-text');
    this.$choices = document.getElementById('dlg-choices');
    this.$continue = document.getElementById('dlg-continue');

    this.current = null;     // diálogo cargado
    this.pointer = 0;        // índice en script
    this.isOpen = false;

    this._onContinue = this._onContinue.bind(this);
    this.$continue.addEventListener('click', this._onContinue);
    this.$continue.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') this._onContinue();
    });
  }

  async open({ id, chapter }) {
    const url = `${this.apiEndpoint}?id=${encodeURIComponent(id)}&chapter=${encodeURIComponent(chapter)}`;
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('dialogue load failed');
    this.current = await res.json();
    this.pointer = 0;
    this.isOpen = true;
    this.$root.classList.remove('hidden');
    await this._renderStep();
  }

  async close() {
    this.isOpen = false;
    this.current = null;
    this.$root.classList.add('hidden');
    this.$speaker.textContent = '';
    this.$text.textContent = '';
    this.$choices.innerHTML = '';
  }

  async _renderStep() {
    if (!this.current) return;

    const step = this.current.script[this.pointer];
    if (!step) { // fin
      await this.close();
      return;
    }

    // --- CONDICIONES POR PASO (opcionales) ---
    if (step.requireFlag) {
      const ok = await this.runActions([{ action: 'requireFlag', flag: step.requireFlag }]);
      if (ok === false) { this.pointer++; return this._renderStep(); }
    }
    if (step.requireNotFlag) {
      const ok = await this.runActions([{ action: 'requireNotFlag', flag: step.requireNotFlag }]);
      if (ok === false) { this.pointer++; return this._renderStep(); }
    }
    // ------------------------------------------

    this.$choices.innerHTML = '';
    this.$continue.style.display = 'none';

    if (step.type === 'say') {
      this.$speaker.textContent = step.speaker || '';
      this.$text.textContent = step.text || '';
      if (Array.isArray(step.onShow) && step.onShow.length) {
        await this.runActions(step.onShow);
      }

      if (Array.isArray(step.choices) && step.choices.length) {
        this.$continue.style.display = 'none';
        step.choices.forEach((c, idx) => {
          const btn = document.createElement('button');
          btn.className = 'choice';
          btn.textContent = c.text || `Opción ${idx+1}`;
          btn.addEventListener('click', async () => {
            if (Array.isArray(c.actions) && c.actions.length) {
              const ok = await this.runActions(c.actions);
              if (ok === false) return;
            }
            if (typeof c.goto === 'number') {
              this.pointer = c.goto;
            } else {
              this.pointer++;
            }
            await this._renderStep();
          });
          this.$choices.appendChild(btn);
        });
      } else {
        this.$continue.style.display = 'block';
      }
    } else if (step.type === 'actions') {
      await this.runActions(step.actions || []);
      if (typeof step.goto === 'number') {
        this.pointer = step.goto;
      } else {
        this.pointer++;
      }
      await this._renderStep();
    } else {
      this.pointer++;
      await this._renderStep();
    }
  }

  async _onContinue() {
    if (!this.current) return;
    this.pointer++;
    await this._renderStep();
  }
}
