import { apiUrl } from './config.js';
import { State } from './state.js';
import { Scene } from './scene.js';

const canvas = document.getElementById('scene-canvas');
const ctx = canvas.getContext('2d');

let state, scene;

async function boot() {
  state = new State(apiUrl('state-get.php'), apiUrl('state-set.php'));
  await state.load();

  scene = new Scene(canvas, ctx, apiUrl('scene.php'), state);

  // Escena inicial (capítulo 1, piso de Juan)
  await scene.loadAndRender({ id: 'piso-juan', chapter: 'c1' });

  // Navegación declarativa
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
