/**
 * src/plugins/plugin.template.js
 * Plantilla de plugin v1: no hace nada si la feature está OFF.
 * No importar hasta que se vaya a usar (así no hay side-effects).
 *
 * Uso futuro:
 *   import features from '../config/features.js';
 *   import initHints from '../plugins/plugin.hints.js';
 *   if (features.hotspotBlink) initHints({ state, sceneManager, features });
 */
export default function initPluginTemplate(ctx){
  const { features } = ctx || {};
  // Sin feature → no hacemos nada
  if (!features || features.__disabled__) return;

  // Ejemplo de suscripción no intrusiva (solo si el host expone un bus)
  // if (ctx.sceneManager?.on) ctx.sceneManager.on('scene:enter', (scene)=>{ /* ... */ });

  // Mantener todos los efectos dentro de este closure. Sin tocar Scene ni HUD.
}
