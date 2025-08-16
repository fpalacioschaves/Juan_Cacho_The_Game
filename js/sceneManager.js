"use strict";

/* global State */

const SceneManager = (function(){
  let itemsCatalog = null;
  let scenes = [];
  let initialScene = null;

  const bgImages = new Map();               // sceneId -> Image
  const disabledByScene = new Map();        // sceneId -> Set(hotspotId)

  function initialSceneId(){ return initialScene; }

  function getScene(id){
    return scenes.find(s => s.id === id) || null;
  }

  function currentSceneId(){
    return State.get().currentSceneId;
  }

  function isHotspotEnabled(sceneId, hotspotId){
    const set = disabledByScene.get(sceneId);
    if (!set) return true;
    return !set.has(hotspotId);
  }

  function disableHotspot(sceneId, hotspotId){
    if (!disabledByScene.has(sceneId)) disabledByScene.set(sceneId, new Set());
    disabledByScene.get(sceneId).add(hotspotId);
  }

  function enableHotspot(sceneId, hotspotId){
    if (!disabledByScene.has(sceneId)) disabledByScene.set(sceneId, new Set());
    disabledByScene.get(sceneId).delete(hotspotId);
  }

  function getBackgroundImage(sceneId){
    return bgImages.get(sceneId);
  }

  function getItem(itemId){
    if (!itemsCatalog) return null;
    return itemsCatalog.items.find(i => i.id === itemId) || null;
  }

  // ---- Conditions
  function evaluateConditions(conditions){
    if (!conditions || !conditions.length) return true;
    for (const c of conditions){
      // { flag: "name", equals: true/false/number/string }
      if (Object.prototype.hasOwnProperty.call(c, "flag")) {
        const v = State.get().flags[c.flag];
        if (c.equals !== undefined) {
          if (v !== c.equals) return false;
        } else if (!v) {
          return false;
        }
      }
      // { hasItem: "itemId" }
      if (Object.prototype.hasOwnProperty.call(c, "hasItem")) {
        if (!State.get().inventory.includes(c.hasItem)) return false;
      }
    }
    return true;
  }

  // ---- Validation helpers
  function assert(cond, msg){ if (!cond) throw new Error(msg); }

  async function loadJSON(url){
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo cargar ${url} (${res.status})`);
    return res.json();
  }

  function validateItems(json){
    assert(json && Array.isArray(json.items), "items.json inválido: falta array 'items'");
    const ids = new Set();
    for (const it of json.items){
      assert(typeof it.id === "string" && it.id, "Item sin 'id'");
      assert(!ids.has(it.id), `Item duplicado '${it.id}'`);
      ids.add(it.id);
      assert(typeof it.icon === "string" && it.icon.startsWith("images/items/"), `Icono inválido en '${it.id}'`);
    }
  }

  function validateScenes(json){
    assert(typeof json.initialScene === "string" && json.initialScene, "scenes.json inválido: falta 'initialScene'");
    assert(Array.isArray(json.scenes), "scenes.json inválido: falta array 'scenes'");
    const ids = new Set();
    for (const sc of json.scenes){
      assert(sc.id && typeof sc.id === "string", "Escena sin 'id'");
      assert(!ids.has(sc.id), `Escena duplicada '${sc.id}'`);
      ids.add(sc.id);
      assert(typeof sc.background === "string" && sc.background.startsWith("images/backgrounds/"), `Background inválido en escena '${sc.id}'`);
      assert(Array.isArray(sc.hotspots), `Escena '${sc.id}' sin 'hotspots' array`);
      for (const hs of sc.hotspots){
        assert(hs.id && typeof hs.id === "string", `Hotspot sin id en escena '${sc.id}'`);
        assert(hs.shape && typeof hs.shape.type === "string", `Hotspot '${hs.id}' sin 'shape.type'`);
        const t = hs.shape.type;
        if (t === "rect") {
          assert(["x","y","w","h"].every(k => typeof hs.shape[k] === "number"), `Rect mal definido en '${hs.id}'`);
        } else if (t === "circle") {
          assert(["x","y","r"].every(k => typeof hs.shape[k] === "number"), `Circle mal definido en '${hs.id}'`);
        } else if (t === "polygon") {
          assert(Array.isArray(hs.shape.points) && hs.shape.points.length >= 3, `Polygon mal definido en '${hs.id}'`);
        } else {
          throw new Error(`shape.type desconocido '${t}' en '${hs.id}'`);
        }
        // verbs
        assert(Array.isArray(hs.verb), `Hotspot '${hs.id}' sin 'verb' array`);
      }
    }
  }

  async function preloadImage(path){
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`No se pudo cargar imagen: ${path}`));
      img.src = path;
    });
  }

  async function loadAll(itemsUrl, scenesUrl){
    const [items, scn] = await Promise.all([loadJSON(itemsUrl), loadJSON(scenesUrl)]);
    validateItems(items);
    validateScenes(scn);
    itemsCatalog = items;
    scenes = scn.scenes;
    initialScene = scn.initialScene;

    // preload backgrounds
    await Promise.all(scenes.map(sc =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => { bgImages.set(sc.id, img); resolve(true); };
        img.onerror = () => reject(new Error(`Falta background '${sc.background}' para escena '${sc.id}'`));
        img.src = sc.background;
      })
    ));

    // init disabled sets
    scenes.forEach(sc => disabledByScene.set(sc.id, new Set()));

    console.log("%cCarga OK", "color: #1bdc7a", { items, scenesCount: scenes.length });
    return true;
  }

  return {
    loadAll,
    initialSceneId,
    currentSceneId,
    getScene,
    getBackgroundImage,
    isHotspotEnabled,
    disableHotspot,
    enableHotspot,
    getItem,
    evaluateConditions
  };
})();
