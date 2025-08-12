// public/assets/js/main.js
import { State } from './state.js';
import { Scene } from './scene.js';
import { DialogueManager } from './dialogue.js';

const CANVAS_W = 1024;
const CANVAS_H = 576;

async function boot() {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');

  const base = window.GAME_BASE || '/Juan_Cacho_The_Game/public';
  const state = new State(`${base}/api/state-get.php`, `${base}/api/state-set.php`);

  await state.load();

  // Gestor de diálogos y puente de acciones (reusa las de Scene)
  let sceneInstance = null;
  const runner = async (actions) => {
    if (!sceneInstance) return true;
    return await sceneInstance._runActions(actions);
  };
  const dialogue = new DialogueManager(`${base}/api/dialogue.php`, runner);

  const scene = new Scene(
    canvas,
    ctx,
    `${base}/api/scene.php`,
    state,
    {
      onStateChanged: renderInventory,
      dialogue
    }
  );
  sceneInstance = scene;

  // Navegación entre escenas vía evento
  window.addEventListener('goto-scene', async (e) => {
    const { id, chapter } = e.detail;
    await scene.loadAndRender({ id, chapter });
  });

  // Cargar escena actual del estado
  await scene.loadAndRender({ id: state.get('scene'), chapter: state.get('chapter') });
  renderInventory();

  function renderInventory() {
    const box = document.getElementById('inventory');
    box.innerHTML = '';
    const inv = state.get('inventory', []);
    inv.forEach(name => {
      const btn = document.createElement('button');
      btn.className = 'item';
      btn.textContent = name;
      btn.addEventListener('click', () => {
        const selected = btn.classList.toggle('selected');
        const item = selected ? name : null;
        document.querySelectorAll('.inv .item').forEach(el => { if (el !== btn) el.classList.remove('selected'); });
        const ev = new CustomEvent('use-item-selected', { detail: { item } });
        window.dispatchEvent(ev);
      });
      box.appendChild(btn);
    });
  }
}

boot().catch(err => {
  console.error(err);
  const t = document.getElementById('toast');
  if (t) { t.className = 'error show'; t.textContent = String(err.message || err); }
});
