// public/assets/js/main.js
import { apiUrl } from './config.js';
import { State } from './state.js';
import { Scene } from './scene.js';
import { InventoryUI } from './inventory.js';

const canvas = document.getElementById('scene-canvas');
const ctx = canvas.getContext('2d');

let state, scene, inventoryUI;

async function boot() {
  state = new State(apiUrl('state-get.php'), apiUrl('state-set.php'));
  await state.load();

  inventoryUI = new InventoryUI(state);
  inventoryUI.render();

  scene = new Scene(canvas, ctx, apiUrl('scene.php'), state, {
    onStateChanged: () => {
      inventoryUI.render();
    }
  });

  await scene.loadAndRender({ id: 'piso-juan', chapter: 'c1' });

  window.addEventListener('goto-scene', async (e) => {
    try {
      scene?.destroy();
      await scene.loadAndRender(e.detail);
    } catch (err) {
      console.error(err);
      showToast('No se pudo cargar la escena.', true);
    }
  });
}

function showToast(text, isError = false) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.className = isError ? 'error show' : 'show';
  el.textContent = text;
  setTimeout(() => { el.className = ''; el.textContent = ''; }, 1600);
}

boot().catch(err => {
  console.error(err);
  showToast('Error inicializando juego. Revisa la consola.', true);
});
