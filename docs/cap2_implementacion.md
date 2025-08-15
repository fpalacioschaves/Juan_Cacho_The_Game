# Capítulo 2 — Integración técnica

## Requisitos previos
- Existen:
  - `src/ui/overlay.js` (overlay base)
  - `styles/overlay.css` enlazado en `index.html`
- Añadir:
  - `src/plugins/plugin.dialogue.js` (este repo)
  - `src/puzzles/cap2.js` (este repo)

## Cómo llamar a los puzzles desde una escena
En el handler del hotspot (o en la acción de `SceneFromData`, donde actualmente resuelves clicks), importa y llama:

```js
// Dentro de tu módulo de escena o del resolver de acciones:
import { startPuzzleFarmacia, startPuzzleFolleto } from '../puzzles/cap2.js';
import { State } from '../core/state.js';

async function onHotspotFarmacia({ inventory, hud }){
  const ctx = { state: State.data, inventory, hud };
  const res = await startPuzzleFarmacia(ctx);
  // res.outcome: 'ok_dialogo' | 'ok_intercambio' | undefined
}

async function onHotspotBarFolleto({ inventory, hud }){
  const ctx = { state: State.data, inventory, hud };
  await startPuzzleFolleto(ctx);
}
