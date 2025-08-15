"use strict";

/* global State */

(function () {
  const allowedVerbs = new Set(["look", "use"]);
  const allowedActionTypes = new Set([
    "showText", "giveItem", "removeItem", "setFlag",
    "gotoScene", "disableHotspot", "enableHotspot",
    "if"
  ]);

  let itemsById = new Map();
  let scenesById = new Map();
  let backgrounds = new Map();
  let initialScene = "";

  function currentSceneId() { return State.get().currentSceneId; }

  function assert(cond, message) {
    if (!cond) throw new Error(message);
  }

  function loadImageOrFail(src, kind, id) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Recurso faltante (${kind}): '${src}' (id: ${id})`));
      img.src = src;
    });
  }

  function idIsValid(id) {
    return /^[a-z0-9\-_]+$/.test(id);
  }

  function validateItems(itemsDoc) {
    assert(itemsDoc && itemsDoc.$schema === "items.schema.v1", "items.json: $schema inválido o ausente");
    assert(Array.isArray(itemsDoc.items), "items.json: 'items' debe ser un array");

    const seen = new Set();
    return Promise.all(itemsDoc.items.map(async (it, idx) => {
      assert(typeof it.id === "string" && idIsValid(it.id), `items.json: id inválido en índice ${idx}`);
      assert(!seen.has(it.id), `items.json: id duplicado '${it.id}'`);
      seen.add(it.id);
      assert(typeof it.name === "string" && it.name.length > 0, `items.json: name inválido '${it.id}'`);
      assert(typeof it.icon === "string" && it.icon.startsWith("images/items/"), `items.json: icon debe estar en 'images/items/' (id ${it.id})`);
      assert(typeof it.description === "string", `items.json: description inválida (id ${it.id})`);
      const img = await loadImageOrFail(it.icon, "icono de item", it.id);
      itemsById.set(it.id, { ...it, _img: img });
    }));
  }

  function indexScenes(scDoc) {
    const ids = new Set();
    for (const sc of scDoc.scenes) {
      assert(typeof sc.id === "string" && idIsValid(sc.id), "scenes.json: id de escena inválido");
      assert(!ids.has(sc.id), `scenes.json: id de escena duplicado '${sc.id}'`);
      ids.add(sc.id);
      scenesById.set(sc.id, sc);
    }
  }

  function validateShape(hs) {
    assert(hs && typeof hs.id === "string" && idIsValid(hs.id), "Hotspot: id inválido");
    assert(hs.shape && typeof hs.shape === "object", `Hotspot '${hs.id}': shape ausente`);
    const sh = hs.shape;
    assert(["rect", "circle", "polygon"].includes(sh.type), `Hotspot '${hs.id}': shape.type inválido`);
    if (sh.type === "rect") {
      for (const k of ["x","y","w","h"]) assert(Number.isFinite(sh[k]), `Hotspot '${hs.id}': rect.${k} inválido`);
    } else if (sh.type === "circle") {
      for (const k of ["x","y","r"]) assert(Number.isFinite(sh[k]), `Hotspot '${hs.id}': circle.${k} inválido`);
    } else if (sh.type === "polygon") {
      assert(Array.isArray(sh.points) && sh.points.length >= 3, `Hotspot '${hs.id}': polygon.points inválido`);
      for (const p of sh.points) assert(Array.isArray(p) && p.length === 2 && p.every(Number.isFinite), `Hotspot '${hs.id}': polygon punto inválido`);
    }
  }

  function validateVerbs(hs) {
    assert(Array.isArray(hs.verb), `Hotspot '${hs.id}': verb debe ser array`);
    for (const v of hs.verb) assert(allowedVerbs.has(v), `Hotspot '${hs.id}': verbo no permitido '${v}'`);
  }

  function validateConditions(conds) {
    if (!conds) return;
    assert(Array.isArray(conds), "conditions debe ser array");
    for (const c of conds) {
      const isFlag = typeof c.flag === "string" && ("equals" in c);
      const isHasItem = typeof c.hasItem === "string";
      assert(isFlag || isHasItem, "conditions: condición inválida (usa {flag, equals} o {hasItem})");
    }
  }

  function validateAction(action, sceneId) {
    assert(action && typeof action.type === "string" && allowedActionTypes.has(action.type),
      `Acción inválida en escena '${sceneId}': type='${action?.type}'`);

    if (action.type === "giveItem" || action.type === "removeItem") {
      assert(typeof action.itemId === "string" && itemsById.has(action.itemId),
        `Acción ${action.type}: itemId inexistente '${action.itemId}' en escena '${sceneId}'`);
    }
    if (action.type === "gotoScene") {
      assert(typeof action.id === "string" && scenesById.has(action.id),
        `Acción gotoScene: escena inexistente '${action.id}' referenciada desde '${sceneId}'`);
    }
    if (action.type === "disableHotspot" || action.type === "enableHotspot") {
      assert(typeof action.id === "string", `Acción ${action.type}: requiere 'id' de hotspot`);
      const sc = scenesById.get(sceneId);
      const exists = sc.hotspots.some(h => h.id === action.id);
      assert(exists, `Acción ${action.type}: hotspot inexistente '${action.id}' en escena '${sceneId}'`);
    }
    if (action.type === "if") {
      assert(action.condition && typeof action.condition === "object", "Acción if: condición ausente");
      const cond = action.condition;
      const isHasItem = typeof cond.hasItem === "string";
      const isFlag = typeof cond.flag === "string" && ("equals" in cond);
      assert(isHasItem || isFlag, "Acción if: condición inválida (usa {hasItem} o {flag, equals})");
      if (isHasItem) assert(itemsById.has(cond.hasItem), `Acción if: hasItem a item inexistente '${cond.hasItem}'`);
      assert(Array.isArray(action.then), "Acción if: 'then' debe ser array");
      assert(Array.isArray(action.else) || action.else === undefined, "Acción if: 'else' debe ser array o ausente");
      for (const a of action.then) validateAction(a, sceneId);
      if (Array.isArray(action.else)) for (const a of action.else) validateAction(a, sceneId);
    }
  }

  function validateScene(sc) {
    assert(sc.background && typeof sc.background === "string", `Escena '${sc.id}': background ausente`);
    const expected = `images/backgrounds/${sc.id}.jpg`;
    assert(sc.background === expected, `Escena '${sc.id}': background debe ser '${expected}'`);
    assert(Array.isArray(sc.hotspots), `Escena '${sc.id}': hotspots debe ser array`);

    const seenHs = new Set();
    for (const hs of sc.hotspots) {
      validateShape(hs);
      validateVerbs(hs);
      assert(!seenHs.has(hs.id), `Escena '${sc.id}': hotspot duplicado '${hs.id}'`);
      seenHs.add(hs.id);
      if (hs.conditions) validateConditions(hs.conditions);
    }
  }

  function validateHandlers(sc) {
    const fields = ["onLook", "onUse", "onPickup", "onUseFail"];
    for (const hs of sc.hotspots) {
      for (const f of fields) {
        const arr = hs[f];
        if (arr === undefined) continue;
        assert(Array.isArray(arr), `Escena '${sc.id}', hotspot '${hs.id}': ${f} debe ser array`);
        for (const a of arr) validateAction(a, sc.id);
      }
    }
  }

  function evaluateConditions(conditions) {
    if (!conditions || conditions.length === 0) return true;
    for (const c of conditions) {
      if (typeof c.hasItem === "string") {
        if (!State.hasItem(c.hasItem)) return false;
      } else if (typeof c.flag === "string" && "equals" in c) {
        const v = State.getFlag(c.flag);
        if (v !== c.equals) return false;
      } else {
        return false;
      }
    }
    return true;
  }

  async function loadAll(itemsPath, scenesPath) {
    itemsById.clear(); scenesById.clear(); backgrounds.clear(); initialScene = "";

    const [itemsRes, scenesRes] = await Promise.all([
      fetch(itemsPath),
      fetch(scenesPath)
    ]);
    if (!itemsRes.ok) throw new Error(`No se pudo cargar ${itemsPath}`);
    if (!scenesRes.ok) throw new Error(`No se pudo cargar ${scenesPath}`);

    const itemsDoc = await itemsRes.json();
    await validateItems(itemsDoc);

    const scDoc = await scenesRes.json();
    assert(scDoc && scDoc.$schema === "scenes.schema.v1", "scenes.json: $schema inválido o ausente");
    assert(typeof scDoc.initialScene === "string", "scenes.json: initialScene inválido");
    assert(Array.isArray(scDoc.scenes), "scenes.json: 'scenes' debe ser array");

    indexScenes(scDoc);
    initialScene = scDoc.initialScene;
    assert(scenesById.has(initialScene), `scenes.json: initialScene '${initialScene}' no existe en 'scenes'`);

    for (const sc of scDoc.scenes) validateScene(sc);

    await Promise.all(scDoc.scenes.map(async sc => {
      const img = await loadImageOrFail(sc.background, "fondo de escena", sc.id);
      backgrounds.set(sc.id, img);
    }));

    for (const sc of scDoc.scenes) validateHandlers(sc);
  }

  const api = {
    loadAll,
    getItem: id => itemsById.get(id),
    getScene: id => scenesById.get(id),
    initialSceneId: () => initialScene,
    getBackgroundImage: sceneId => backgrounds.get(sceneId),
    currentSceneId,
    isHotspotEnabled: (sceneId, hsId) => State.isHotspotEnabled(sceneId, hsId),
    evaluateConditions
  };

  window.SceneManager = api;
})();
