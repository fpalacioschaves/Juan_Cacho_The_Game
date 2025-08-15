"use strict";

/* global SceneManager, State, UI, Actions */

(function () {
  const canvas = document.getElementById("scene");
  const ctx = canvas.getContext("2d");
  let hoveredHotspotId = null;

  // Verb actual: "use" por defecto
  let currentVerb = "use";

  // Debug overlay de hotspots (ON por defecto). Toggle con F2.
  let DEBUG_SHOW_HOTSPOTS = true;

  // Transiciones
  let isTransitioning = false;
  let fadeAlpha = 0; // 0..1 (0 = sin overlay, 1 = negro completo)

  function setVerb(v) {
    currentVerb = v;
    UI.setVerb(v);
  }

  function getVerb() {
    return currentVerb;
  }

  // Utilidades de geometría
  function pointInRect(px, py, r) {
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }
  function pointInCircle(px, py, c) {
    const dx = px - c.x, dy = py - c.y;
    return dx * dx + dy * dy <= c.r * c.r;
  }
  function pointInPolygon(px, py, poly) {
    // Ray casting
    const pts = poly.points;
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1];
      const xj = pts[j][0], yj = pts[j][1];
      const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi + 0.0000001) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }
  function hitTest(hs, x, y) {
    const shape = hs.shape;
    if (shape.type === "rect") return pointInRect(x, y, shape);
    if (shape.type === "circle") return pointInCircle(x, y, shape);
    if (shape.type === "polygon") return pointInPolygon(x, y, shape);
    return false;
  }

  function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY
    };
  }

  function allHotspotsUnderCursor(x, y) {
    const sc = SceneManager.getScene(State.get().currentSceneId);
    if (!sc) return [];
    const enabledHotspots = sc.hotspots.filter(h => SceneManager.isHotspotEnabled(sc.id, h.id));
    return enabledHotspots.filter(h => hitTest(h, x, y));
  }

  async function onClick(evt) {
    if (isTransitioning) return; // bloquear input durante fade
    const { x, y } = getMousePos(evt);
    const matches = allHotspotsUnderCursor(x, y);
    if (matches.length === 0) return;

    const hs = matches[0];
    const verb = getVerb();

    // Si está deshabilitado, no responde
    if (!SceneManager.isHotspotEnabled(SceneManager.currentSceneId(), hs.id)) return;

    if (verb === "use") {
      const ok = SceneManager.evaluateConditions(hs.conditions || []);
      if (ok) {
        if (Array.isArray(hs.onUse) && hs.onUse.length) {
          await Actions.run(hs.onUse);
        } else if (Array.isArray(hs.onPickup) && hs.onPickup.length) {
          await Actions.run(hs.onPickup);
        } else {
          // Sin fallback genérico: si no hay onUse/onPickup, no decimos nada.
        }
      } else {
        if (Array.isArray(hs.onUseFail) && hs.onUseFail.length) {
          await Actions.run(hs.onUseFail);
        } else {
          // Sin fallback genérico cuando falla condición y no hay onUseFail.
        }
      }
    } else if (verb === "look") {
      if (Array.isArray(hs.onLook) && hs.onLook.length) {
        await Actions.run(hs.onLook);
      } else {
        await Actions.run([{ type: "showText", text: "Nada especial a simple vista." }]);
      }
    }

    renderAll(); // re-render tras acciones que cambien el estado
  }

  function onMouseMove(evt) {
    if (isTransitioning) return; // sin hover durante fade
    const { x, y } = getMousePos(evt);
    const matches = allHotspotsUnderCursor(x, y);
    const newId = matches.length ? matches[0].id : null;

    if (newId !== hoveredHotspotId) {
      hoveredHotspotId = newId;
      if (hoveredHotspotId) {
        UI.setTooltip(`${currentVerb === "look" ? "Mirar" : "Usar"}: ${hoveredHotspotId}`);
        UI.setHotCursor(true);
      } else {
        UI.setTooltip("");
        UI.setHotCursor(false);
      }
    }
  }

  function drawBackground() {
    const scId = State.get().currentSceneId;
    const img = SceneManager.getBackgroundImage(scId);
    if (!img) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  // -------- Overlay de hotspots (debug) --------
  function drawHotspotShape(hs, stroke, fill) {
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;

    const sh = hs.shape;
    if (sh.type === "rect") {
      ctx.fillRect(sh.x, sh.y, sh.w, sh.h);
      ctx.strokeRect(sh.x, sh.y, sh.w, sh.h);
    } else if (sh.type === "circle") {
      ctx.beginPath();
      ctx.arc(sh.x, sh.y, sh.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (sh.type === "polygon") {
      const pts = sh.points;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function centroidOf(hs) {
    const sh = hs.shape;
    if (sh.type === "rect") return { x: sh.x + sh.w / 2, y: sh.y + sh.h / 2 };
    if (sh.type === "circle") return { x: sh.x, y: sh.y };
    if (sh.type === "polygon") {
      let x = 0, y = 0;
      for (const p of sh.points) { x += p[0]; y += p[1]; }
      return { x: x / sh.points.length, y: y / sh.points.length };
    }
    return { x: 0, y: 0 };
  }

  function drawHotspotsOverlay() {
    if (!DEBUG_SHOW_HOTSPOTS) return;

    const scId = State.get().currentSceneId;
    const sc = SceneManager.getScene(scId);
    if (!sc) return;

    ctx.save();
    ctx.font = "14px system-ui, sans-serif";
    ctx.textBaseline = "top";

    for (const hs of sc.hotspots) {
      const enabled = SceneManager.isHotspotEnabled(scId, hs.id);
      const conds = SceneManager.evaluateConditions(hs.conditions || []);

      // Colores:
      // - Verde: habilitado y condiciones OK
      // - Naranja: habilitado pero condiciones NO OK (fallará onUse)
      // - Gris: deshabilitado
      let stroke, fill, labelColor;
      if (!enabled) {
        stroke = "rgba(160,160,160,0.9)";
        fill = "rgba(160,160,160,0.20)";
        labelColor = "rgba(220,220,220,0.9)";
      } else if (!conds) {
        stroke = "rgba(255,165,0,0.95)";
        fill = "rgba(255,165,0,0.18)";
        labelColor = "rgba(255,230,200,0.95)";
      } else {
        stroke = "rgba(50,220,130,0.95)";
        fill = "rgba(50,220,130,0.18)";
        labelColor = "rgba(230,255,240,0.95)";
      }

      drawHotspotShape(hs, stroke, fill);

      // Etiqueta
      const c = centroidOf(hs);
      const tag = `${hs.id}`;
      const pad = 4;
      const metrics = ctx.measureText(tag);
      const tw = metrics.width;
      const th = 16;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(c.x - tw / 2 - pad, c.y - th / 2 - pad, tw + pad * 2, th + pad * 2);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.strokeRect(c.x - tw / 2 - pad, c.y - th / 2 - pad, tw + pad * 2, th + pad * 2);
      ctx.fillStyle = labelColor;
      ctx.fillText(tag, c.x - tw / 2, c.y - th / 2);
    }

    // Leyenda
    const legendX = 16, legendY = 16;
    const lines = [
      ["Habilitado + OK", "rgba(50,220,130,0.95)"],
      ["Habilitado + condiciones NO", "rgba(255,165,0,0.95)"],
      ["Deshabilitado", "rgba(160,160,160,0.9)"],
      ["F2: mostrar/ocultar overlay", "rgba(200,220,255,0.95)"]
    ];
    let y = legendY;
    for (const [txt, col] of lines) {
      ctx.fillStyle = col;
      ctx.fillRect(legendX, y + 3, 14, 14);
      ctx.fillStyle = "rgba(240,240,255,0.95)";
      ctx.fillText(txt, legendX + 22, y);
      y += 20;
    }

    ctx.restore();
  }
  // --------------------------------------------

  // -------- Fade overlay --------
  function drawFadeOverlay() {
    if (fadeAlpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, fadeAlpha));
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function easeInOut(t) { // t: 0..1
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function animateFade(toAlpha, durationMs) {
    return new Promise((resolve) => {
      const from = fadeAlpha;
      const start = performance.now();
      function step(now) {
        const t = Math.min(1, (now - start) / durationMs);
        fadeAlpha = from + (toAlpha - from) * easeInOut(t);
        renderAll();
        if (t < 1) requestAnimationFrame(step);
        else resolve(true);
      }
      requestAnimationFrame(step);
    });
  }
  // --------------------------------------------

  function renderAll() {
    drawBackground();
    drawHotspotsOverlay(); // <- overlay de depuración
    drawFadeOverlay();     // <- overlay de transición
    UI.renderHUD(State.get(), SceneManager.getScene(State.get().currentSceneId));
  }

  async function init() {
    try {
      await SceneManager.loadAll("data/items.json", "data/scenes.json");

      // --- FIX: si la escena guardada no existe en el JSON actual, usa initialScene ---
      const saved = State.get().currentSceneId;
      const exists = saved && SceneManager.getScene(saved);
      if (!exists) {
        console.warn(`Engine: escena guardada inválida '${saved}', reseteo a initialScene.`);
        State.setScene(SceneManager.initialSceneId());
      }
      // Si no había nada guardado, inicializa a initialScene
      if (!State.get().currentSceneId) {
        State.setScene(SceneManager.initialSceneId());
      }
      // -------------------------------------------------------------------------------

      UI.mountVerbBar({
        verbs: ["look", "use"],
        onSelect: setVerb
      });
      setVerb("use"); // por defecto

      canvas.addEventListener("click", onClick);
      canvas.addEventListener("mousemove", onMouseMove);

      // Teclado: Enter/Esc para diálogos
      document.addEventListener("keydown", (e) => {
        if (!UI.isDialogOpen()) return;
        if (e.key === "Enter") UI.clickDialogNext();
        if (e.key === "Escape") UI.clickDialogNext();
      });

      // Toggle overlay con F2 (no interfiere con juego)
      document.addEventListener("keydown", (e) => {
        if (e.key === "F2") {
          DEBUG_SHOW_HOTSPOTS = !DEBUG_SHOW_HOTSPOTS;
          renderAll();
        }
      });

      renderAll();
    } catch (err) {
      console.error(err);
      UI.fatal(err.message || String(err));
    }
  }

  // API pública para acciones
  const Engine = {
    gotoScene: async function (sceneId) {
      const sc = SceneManager.getScene(sceneId);
      if (!sc) throw new Error(`actions.gotoScene: escena inexistente '${sceneId}'`);

      // Fade-out → cambio de escena → Fade-in
      isTransitioning = true;
      await animateFade(1, 280);
      State.setScene(sceneId);
      renderAll(); // mostrar nueva escena con overlay al 100%
      await animateFade(0, 320);
      isTransitioning = false;
      return true;
    },
    rerender: renderAll
  };
  window.Engine = Engine;

  // Arranque
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
