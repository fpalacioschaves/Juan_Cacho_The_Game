"use strict";

(function () {
  const STORAGE_KEY = "STATE_V1";
  const VERSION = 1;

  function defaultState() {
    return {
      version: VERSION,
      currentSceneId: "",
      inventory: [],
      flags: {}
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const data = JSON.parse(raw);
      if (data.version !== VERSION) {
        console.warn("STATE_V1: versión incompatible. Reset.");
        return defaultState();
      }
      if (!Array.isArray(data.inventory)) data.inventory = [];
      if (typeof data.flags !== "object" || !data.flags) data.flags = {};
      if (typeof data.currentSceneId !== "string") data.currentSceneId = "";
      return data;
    } catch {
      return defaultState();
    }
  }

  let state = load();

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const api = {
    get() { return state; },
    setScene(id) { state.currentSceneId = id; save(); },
    addItem(id) {
      if (!state.inventory.includes(id)) {
        state.inventory.push(id);
        save();
      }
    },
    removeItem(id) {
      const idx = state.inventory.indexOf(id);
      if (idx >= 0) {
        state.inventory.splice(idx, 1);
        save();
      }
    },
    hasItem(id) { return state.inventory.includes(id); },
    setFlag(name, value) { state.flags[name] = value; save(); },
    getFlag(name) { return state.flags[name]; },

    isHotspotEnabled(sceneId, hsId) {
      const key = `hs_disabled:${sceneId}:${hsId}`;
      return state.flags[key] !== true;
    },
    setHotspotEnabled(sceneId, hsId, enabled) {
      const key = `hs_disabled:${sceneId}:${hsId}`;
      if (enabled) delete state.flags[key];
      else state.flags[key] = true;
      save();
    }
  };

  window.State = api;
})();
