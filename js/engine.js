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

  // Leyenda del overlay: posición (izq / dcha), se recuerda
  let LEGEND_RIGHT = false;
  try { LEGEND_RIGHT = localStorage.getItem("LEGEND_POS_RIGHT") === "1"; } catch(_) {}

  // Modo foto: oculta HUD y overlay (F6)
  let PHOTO_MODE = false;

  // Transiciones
  let isTransitioning = false;
  let fadeAlpha = 0; // 0..1 (0 = sin overlay, 1 = negro completo)

  function setVerb(v) { currentVerb = v; UI.setVerb(v); }
  function getVerb() { return currentVerb; }

  // ====== MODO EDITOR (F8) ======
  let EDIT_MODE = false;
  let EDIT_SNAP = 8;               // tamaño de rejilla (0 = sin snap). Toggle con G.
  let EDIT_VERBOSE = true;         // muestra datos numéricos
  let editSelected = { id: null, polyIndex: -1 }; // hotspot seleccionado, y vértice si es polígono
  let isMouseDown = false;
  let dragStart = { x: 0, y: 0 };
  let originalShape = null;

  function isEdit() { return EDIT_MODE; }
  function getCurrentScene() { return SceneManager.getScene(State.get().currentSceneId); }

  function snap(v) {
    if (!EDIT_SNAP || EDIT_SNAP <= 1) return Math.round(v);
    return Math.round(v / EDIT_SNAP) * EDIT_SNAP;
  }

  function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        UI.flashTooltip("Copiado al portapapeles.");
      } else {
        // fallback
        window.prompt("Copia con Ctrl+C y Enter:", text);
      }
    } catch {
      window.prompt("Copia con Ctrl+C y Enter:", text);
    }
  }

  function selectHotspotAt(x, y) {
    const sc = getCurrentScene();
    if (!sc) return null;
    // Prioridad: vértice de polígono cercano, si no, primer hotspot bajo el cursor
    const enabled = sc.hotspots.filter(h => SceneManager.isHotspotEnabled(sc.id, h.id));

    // ¿clic sobre un vértice?
    for (const h of enabled) {
      if (h.shape.type === "polygon") {
        for (let i = 0; i < h.shape.points.length; i++) {
          const p = h.shape.points[i];
          const dx = p[0] - x, dy = p[1] - y;
          if (dx*dx + dy*dy <= 12*12) {
            editSelected = { id: h.id, polyIndex: i };
            return h;
          }
        }
      }
    }

    // ¿sobre el shape?
    for (const h of enabled) {
      if (hitTest(h, x, y)) {
        editSelected = { id: h.id, polyIndex: -1 };
        return h;
      }
    }
    editSelected = { id: null, polyIndex: -1 };
    return null;
  }

  function getSelected() {
    const sc = getCurrentScene();
    if (!sc || !editSelected.id) return null;
    return sc.hotspots.find(h => h.id === editSelected.id) || null;
  }

  function serializeSelectedShape() {
    const h = getSelected();
    if (!h) return "";
    const payload = { id: h.id, shape: h.shape };
    return JSON.stringify(payload, null, 2);
  }

  function serializeAllShapes() {
    const sc = getCurrentScene();
    if (!sc) return "";
    const out = sc.hotspots.map(h => ({ id: h.id, shape: h.shape }));
    return JSON.stringify(out, null, 2);
  }

  // ===== Geometría =====
  function pointInRect(px, py, r) {
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }
  function pointInCircle(px, py, c) {
    const dx = px - c.x, dy = py - c.y;
    return dx * dx + dy * dy <= c.r * c.r;
  }
  function pointInPolygon(px, py, poly) {
    const pts = poly.points;
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1];
      const xj = pts[j][0], yj = pts[j][1];
      const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi + 1e-7) + xi);
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
    const sc = getCurrentScene();
    if (!sc) return [];
    const enabledHotspots = sc.hotspots.filter(h => SceneManager.isHotspotEnabled(sc.id, h.id));
    return enabledHotspots.filter(h => hitTest(h, x, y));
  }

  // ===== Input =====
  async function onClick(evt) {
    if (isTransitioning) return;
    const { x, y } = getMousePos(evt);

    if (isEdit()) {
      const h = selectHotspotAt(x, y);
      originalShape = h ? JSON.parse(JSON.stringify(h.shape)) : null;
      renderAll();
      return;
    }

    const matches = allHotspotsUnderCursor(x, y);
    if (matches.length === 0) return;

    const hs = matches[0];
    const verb = getVerb();

    if (!SceneManager.isHotspotEnabled(SceneManager.currentSceneId(), hs.id)) return;

    if (verb === "use") {
      const ok = SceneManager.evaluateConditions(hs.conditions || []);
      if (ok) {
        if (Array.isArray(hs.onUse) && hs.onUse.length) {
          await Actions.run(hs.onUse);
        } else if (Array.isArray(hs.onPickup) && hs.onPickup.length) {
          await Actions.run(hs.onPickup);
        } else {
          await Actions.run([{ type: "showText", text: "No puedes usar eso ahora." }]);
        }
      } else {
        if (Array.isArray(hs.onUseFail) && hs.onUseFail.length) {
          await Actions.run(hs.onUseFail);
        } else {
          await Actions.run([{ type: "showText", text: "Está bloqueado por ahora." }]);
        }
      }
    } else if (verb === "look") {
      if (Array.isArray(hs.onLook) && hs.onLook.length) {
        await Actions.run(hs.onLook);
      } else {
        await Actions.run([{ type: "showText", text: "Nada especial a simple vista." }]);
      }
    }

    renderAll();
  }

  function onMouseDown(evt) {
    if (!isEdit()) return;
    const { x, y } = getMousePos(evt);
    const h = getSelected();
    if (!h) return;

    // Solo “agarra” si clicas dentro del shape (o punto en polígono)
    if (h.shape.type === "polygon" && editSelected.polyIndex >= 0) {
      isMouseDown = true;
      dragStart = { x, y };
      originalShape = JSON.parse(JSON.stringify(h.shape));
      return;
    }
    if (hitTest(h, x, y)) {
      isMouseDown = true;
      dragStart = { x, y };
      originalShape = JSON.parse(JSON.stringify(h.shape));
    }
  }

  function onMouseUp() {
    if (!isEdit()) return;
    isMouseDown = false;
  }

  function onMouseMove(evt) {
    if (isTransitioning) return;
    const { x, y } = getMousePos(evt);

    if (isEdit()) {
      if (isMouseDown) {
        const h = getSelected();
        if (!h) return;
        const dx = x - dragStart.x;
        const dy = y - dragStart.y;

        if (h.shape.type === "rect") {
          h.shape.x = snap(originalShape.x + dx);
          h.shape.y = snap(originalShape.y + dy);
        } else if (h.shape.type === "circle") {
          h.shape.x = snap(originalShape.x + dx);
          h.shape.y = snap(originalShape.y + dy);
        } else if (h.shape.type === "polygon") {
          if (editSelected.polyIndex >= 0) {
            const p = h.shape.points[editSelected.polyIndex];
            p[0] = snap(originalShape.points[editSelected.polyIndex][0] + dx);
            p[1] = snap(originalShape.points[editSelected.polyIndex][1] + dy);
          } else {
            for (let i = 0; i < h.shape.points.length; i++) {
              h.shape.points[i][0] = snap(originalShape.points[i][0] + dx);
              h.shape.points[i][1] = snap(originalShape.points[i][1] + dy);
            }
          }
        }
        renderAll();
        return;
      }

      // Hover/tooltip en editor
      const sc = getCurrentScene();
      const matches = allHotspotsUnderCursor(x, y);
      const newId = matches.length ? matches[0].id : null;
      if (newId !== hoveredHotspotId) {
        hoveredHotspotId = newId;
        if (hoveredHotspotId) {
          UI.setTooltip(`Editar: ${hoveredHotspotId}  (clic para seleccionar)`);
        } else {
          UI.setTooltip("");
        }
      }
      return;
    }

    // modo normal
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

  // ===== Render =====
  function drawBackground() {
    const scId = State.get().currentSceneId;
    const img = SceneManager.getBackgroundImage(scId);
    if (!img) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
  }

  function pathFromShape(hs) {
    const sh = hs.shape;
    ctx.beginPath();
    if (sh.type === "rect") {
      ctx.rect(sh.x, sh.y, sh.w, sh.h);
    } else if (sh.type === "circle") {
      ctx.arc(sh.x, sh.y, sh.r, 0, Math.PI * 2);
    } else if (sh.type === "polygon") {
      const pts = sh.points;
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
    }
  }

  // Halo suave (solo modo normal)
  function drawHoverHalo() {
    if (PHOTO_MODE || isEdit()) return;
    const sc = getCurrentScene();
    if (!sc || !hoveredHotspotId) return;
    const hs = sc.hotspots.find(h => h.id === hoveredHotspotId);
    if (!hs) return;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(150,220,255,0.85)";
    ctx.lineWidth = 6;
    pathFromShape(hs);
    ctx.stroke();

    ctx.fillStyle = "rgba(150,220,255,0.12)";
    pathFromShape(hs);
    ctx.fill();
    ctx.restore();
  }

  function drawHotspotShape(hs, stroke, fill) {
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    pathFromShape(hs);
    ctx.fill();
    pathFromShape(hs);
    ctx.stroke();
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
    if (!DEBUG_SHOW_HOTSPOTS || PHOTO_MODE) return;

    const scId = State.get().currentSceneId;
    const sc = SceneManager.getScene(scId);
    if (!sc) return;

    ctx.save();
    ctx.font = "14px system-ui, sans-serif";
    ctx.textBaseline = "top";

    for (const hs of sc.hotspots) {
      const enabled = SceneManager.isHotspotEnabled(scId, hs.id);
      const conds = SceneManager.evaluateConditions(hs.conditions || []);

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

    // Leyenda (móvil izq/dcha)
    const lines = [
      ["Habilitado + OK", "rgba(50,220,130,0.95)"],
      ["Habilitado + condiciones NO", "rgba(255,165,0,0.95)"],
      ["Deshabilitado", "rgba(160,160,160,0.9)"],
      ["F1: ayuda", "rgba(200,220,255,0.95)"],
      ["F2: overlay hotspots", "rgba(200,220,255,0.95)"],
      ["F3: leyenda izq/dcha", "rgba(200,255,200,0.95)"],
      ["F6: modo foto", "rgba(255,220,220,0.95)"],
      ["F8: editor hotspots", "rgba(200,255,255,0.95)"]
    ];

    // medir ancho máximo
    let maxTw = 0;
    for (const [txt] of lines) { maxTw = Math.max(maxTw, ctx.measureText(txt).width); }
    const P = 16; // padding lateral
    const legendWidth = 22 + maxTw + 10; // cuadrito + gap + texto + margen
    const legendX = LEGEND_RIGHT ? (canvas.width - legendWidth - P) : P;
    let y = P;

    for (const [txt, col] of lines) {
      ctx.fillStyle = col;
      ctx.fillRect(legendX, y + 3, 14, 14);
      ctx.fillStyle = "rgba(240,240,255,0.95)";
      ctx.fillText(txt, legendX + 22, y);
      y += 20;
    }

    ctx.restore();
  }

  // ===== Editor overlay =====
  function drawEditorOverlay() {
    if (!isEdit()) return;
    const sc = getCurrentScene();
    if (!sc) return;

    // Rejilla
    if (EDIT_SNAP && EDIT_SNAP > 1) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += EDIT_SNAP) {
        ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += EDIT_SNAP) {
        ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(canvas.width, y + 0.5); ctx.stroke();
      }
      ctx.restore();
    }

    // Bounding de selección + vértices
    const sel = getSelected();
    if (sel) {
      ctx.save();
      ctx.strokeStyle = "rgba(80,200,255,0.9)";
      ctx.lineWidth = 2;
      pathFromShape(sel);
      ctx.stroke();

      // vértices para polígono
      if (sel.shape.type === "polygon") {
        for (let i = 0; i < sel.shape.points.length; i++) {
          const p = sel.shape.points[i];
          ctx.fillStyle = (i === editSelected.polyIndex) ? "rgba(80,200,255,0.95)" : "rgba(80,200,255,0.6)";
          ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, Math.PI * 2); ctx.fill();
        }
      }

      // datos
      if (EDIT_VERBOSE) {
        ctx.font = "12px system-ui, sans-serif";
        ctx.textBaseline = "top";
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(16, canvas.height - 64, 520, 48);
        ctx.fillStyle = "rgba(220,245,255,0.95)";
        const sh = sel.shape;
        let text = `${sel.id} · `;
        if (sh.type === "rect") text += `rect x:${sh.x} y:${sh.y} w:${sh.w} h:${sh.h}`;
        if (sh.type === "circle") text += `circle cx:${sh.x} cy:${sh.y} r:${sh.r}`;
        if (sh.type === "polygon") text += `polygon pts:${sh.points.length} (Tab cambia vértice)`;
        ctx.fillText(text, 24, canvas.height - 56);
        ctx.fillText("Arrows mover · Shift×10 · Ctrl ajustar tamaño/radio · G rejilla · C copiar shape · A copiar todos", 24, canvas.height - 38);
        ctx.fillText("Tab vértice (polígono) · Esc salir editor", 24, canvas.height - 20);
      }

      ctx.restore();
    }
  }

  // -------- Fade overlay --------
  function drawFadeOverlay() {
    if (fadeAlpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, fadeAlpha));
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

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

  function renderAll() {
    drawBackground();
    drawHoverHalo();       // halo del hotspot (modo normal)
    drawHotspotsOverlay(); // overlay de depuración
    drawEditorOverlay();   // overlay del editor
    drawFadeOverlay();     // transición
    UI.renderHUD(State.get(), getCurrentScene());
  }

  // ===== Init =====
  async function init() {
    try {
      await SceneManager.loadAll("data/items.json", "data/scenes.json");

      if (!State.get().currentSceneId) {
        State.setScene(SceneManager.initialSceneId());
      }

      UI.mountVerbBar({ verbs: ["look", "use"], onSelect: setVerb });
      setVerb("use");

      canvas.addEventListener("click", onClick);
      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("mousedown", onMouseDown);
      canvas.addEventListener("mouseup", onMouseUp);

      // Diálogo: Enter/Esc (solo si el diálogo está abierto)
      document.addEventListener("keydown", (e) => {
        if (!UI.isDialogOpen()) return;
        if (e.key === "Enter" || e.key === "Escape") UI.clickDialogNext();
      });

      // Teclas globales
      document.addEventListener("keydown", (e) => {
        // Ayuda rápida
        if (e.key === "F1") {
          UI.flashTooltip("F1 Ayuda · F2 Overlay · F3 Leyenda · F6 Foto · F8 Editor · Enter/Esc diálogo");
          e.preventDefault();
          return;
        }
        // Overlay on/off
        if (e.key === "F2") {
          DEBUG_SHOW_HOTSPOTS = !DEBUG_SHOW_HOTSPOTS;
          renderAll();
          return;
        }
        // Mover leyenda
        if (e.key === "F3") {
          LEGEND_RIGHT = !LEGEND_RIGHT;
          try { localStorage.setItem("LEGEND_POS_RIGHT", LEGEND_RIGHT ? "1" : "0"); } catch(_){}
          UI.flashTooltip(`Leyenda: ${LEGEND_RIGHT ? "derecha" : "izquierda"}`);
          renderAll();
          return;
        }
        // Modo foto
        if (e.key === "F6") {
          PHOTO_MODE = !PHOTO_MODE;
          document.body.classList.toggle("photo", PHOTO_MODE);
          UI.flashTooltip(`Modo foto ${PHOTO_MODE ? "activado" : "desactivado"}`);
          renderAll();
          return;
        }
        // Editor
        if (e.key === "F8") {
          EDIT_MODE = !EDIT_MODE;
          editSelected = { id: null, polyIndex: -1 };
          UI.flashTooltip(EDIT_MODE
            ? "EDITOR ON · Clic para seleccionar · Arrows mover · Ctrl para tamaño/radio · G rejilla · C/A copiar"
            : "EDITOR OFF");
          renderAll();
          return;
        }

        // A partir de aquí, si no estamos en editor, salir
        if (!isEdit()) return;

        const sel = getSelected();
        const sc = getCurrentScene();
        if (!sc) return;

        // Editor: controles de teclado
        const step = e.shiftKey ? 10 : 1;
        const ctrl = e.ctrlKey || e.metaKey;

        if (e.key === "Escape") {
          EDIT_MODE = false;
          UI.flashTooltip("EDITOR OFF");
          renderAll();
          return;
        }

        // Selección ciclada de vértices (polígono)
        if (e.key === "Tab") {
          e.preventDefault();
          const h = getSelected();
          if (h && h.shape.type === "polygon") {
            editSelected.polyIndex = (editSelected.polyIndex + 1) % h.shape.points.length;
            renderAll();
          }
          return;
        }

        // Cambiar rejilla
        if (e.key.toLowerCase() === "g") {
          // ciclos: 0 → 8 → 16 → 0
          if (!EDIT_SNAP) EDIT_SNAP = 8;
          else if (EDIT_SNAP === 8) EDIT_SNAP = 16;
          else EDIT_SNAP = 0;
          UI.flashTooltip(`Rejilla: ${EDIT_SNAP ? EDIT_SNAP + "px" : "off"}`);
          renderAll();
          return;
        }

        // Copiar shape seleccionado
        if (e.key.toLowerCase() === "c") {
          const txt = serializeSelectedShape();
          if (txt) copyToClipboard(txt);
          return;
        }
        // Copiar todos
        if (e.key.toLowerCase() === "a") {
          copyToClipboard(serializeAllShapes());
          return;
        }

        // Si no hay selección, intenta seleccionar el primero bajo el cursor
        if (!sel) return;

        // MOVIMIENTO / RESIZE
        const sh = sel.shape;

        // Arrows sin Ctrl: mover shape (o vértice activo en polígono)
        if (!ctrl) {
          if (sh.type === "rect") {
            if (e.key === "ArrowLeft") sh.x = snap(sh.x - step);
            if (e.key === "ArrowRight") sh.x = snap(sh.x + step);
            if (e.key === "ArrowUp") sh.y = snap(sh.y - step);
            if (e.key === "ArrowDown") sh.y = snap(sh.y + step);
          } else if (sh.type === "circle") {
            if (e.key === "ArrowLeft") sh.x = snap(sh.x - step);
            if (e.key === "ArrowRight") sh.x = snap(sh.x + step);
            if (e.key === "ArrowUp") sh.y = snap(sh.y - step);
            if (e.key === "ArrowDown") sh.y = snap(sh.y + step);
          } else if (sh.type === "polygon") {
            if (editSelected.polyIndex >= 0) {
              const p = sh.points[editSelected.polyIndex];
              if (e.key === "ArrowLeft") p[0] = snap(p[0] - step);
              if (e.key === "ArrowRight") p[0] = snap(p[0] + step);
              if (e.key === "ArrowUp") p[1] = snap(p[1] - step);
              if (e.key === "ArrowDown") p[1] = snap(p[1] + step);
            } else {
              // mover todo el polígono
              if (e.key.startsWith("Arrow")) {
                const dx = (e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0);
                const dy = (e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0);
                for (let i = 0; i < sh.points.length; i++) {
                  sh.points[i][0] = snap(sh.points[i][0] + dx);
                  sh.points[i][1] = snap(sh.points[i][1] + dy);
                }
              }
            }
          }
          renderAll();
          e.preventDefault();
          return;
        }

        // Ctrl + Arrows: cambiar tamaño (rect), radio (circle), mover vértice (polygon)
        if (ctrl) {
          if (sh.type === "rect") {
            if (e.key === "ArrowLeft")  sh.w = Math.max(1, snap(sh.w - step));
            if (e.key === "ArrowRight") sh.w = Math.max(1, snap(sh.w + step));
            if (e.key === "ArrowUp")    sh.h = Math.max(1, snap(sh.h - step));
            if (e.key === "ArrowDown")  sh.h = Math.max(1, snap(sh.h + step));
          } else if (sh.type === "circle") {
            if (e.key === "ArrowUp")    sh.r = Math.max(1, snap(sh.r + step));
            if (e.key === "ArrowDown")  sh.r = Math.max(1, snap(sh.r - step));
          } else if (sh.type === "polygon") {
            // Ctrl+arrows: mueve vértice (si no hay, mueve todo)
            const idx = editSelected.polyIndex >= 0 ? editSelected.polyIndex : -1;
            if (idx >= 0) {
              const p = sh.points[idx];
              if (e.key === "ArrowLeft")  p[0] = snap(p[0] - step);
              if (e.key === "ArrowRight") p[0] = snap(p[0] + step);
              if (e.key === "ArrowUp")    p[1] = snap(p[1] - step);
              if (e.key === "ArrowDown")  p[1] = snap(p[1] + step);
            } else {
              if (e.key.startsWith("Arrow")) {
                const dx = (e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0);
                const dy = (e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0);
                for (let i = 0; i < sh.points.length; i++) {
                  sh.points[i][0] = snap(sh.points[i][0] + dx);
                  sh.points[i][1] = snap(sh.points[i][1] + dy);
                }
              }
            }
          }
          renderAll();
          e.preventDefault();
          return;
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

      isTransitioning = true;
      await animateFade(1, 280);
      State.setScene(sceneId);
      renderAll();
      await animateFade(0, 320);
      isTransitioning = false;
      return true;
    },
    rerender: renderAll
  };
  window.Engine = Engine;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
