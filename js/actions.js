"use strict";

/* global UI, State, SceneManager, Engine */

(function () {
  function parseGlossaryPayload(raw) {
    if (typeof raw !== "string") return null;
    const m = raw.match(/^\s*\[gl:([a-z0-9_\-:.]+)\]\s*([\s\S]*)$/i);
    if (!m) return null;
    const id = m[1];
    const rest = m[2] || "";
    const parts = rest.split(/\s*:::\s*/); // "Largo ::: Corto"
    const longText = (parts[0] || "").trim();
    const shortText = (parts[1] || "").trim();
    return { id, longText, shortText: shortText || null };
  }

  async function runAction(action) {
    switch (action.type) {
      case "showText": {
        const raw = String(action.text ?? "");
        const gl = parseGlossaryPayload(raw);
        if (!gl) {
          await UI.showDialog(raw);
          return;
        }
        const flagName = `gl:${gl.id}`;
        const seen = State.getFlag(flagName) === true;
        const toShow = seen ? (gl.shortText || gl.longText) : gl.longText;
        if (toShow && toShow.length > 0) {
          await UI.showDialog(toShow);
        }
        if (!seen) State.setFlag(flagName, true);
        return;
      }

      case "giveItem":
        State.addItem(action.itemId);
        return;

      case "removeItem":
        State.removeItem(action.itemId);
        return;

      case "setFlag":
        State.setFlag(action.name, action.value);
        return;

      case "gotoScene":
        await Engine.gotoScene(action.id);
        return;

      case "disableHotspot":
        State.setHotspotEnabled(State.get().currentSceneId, action.id, false);
        return;

      case "enableHotspot":
        State.setHotspotEnabled(State.get().currentSceneId, action.id, true);
        return;

      case "if": {
        const cond = action.condition || {};
        let ok = false;
        if (typeof cond.hasItem === "string") ok = State.hasItem(cond.hasItem);
        else if (typeof cond.flag === "string" && "equals" in cond) ok = (State.getFlag(cond.flag) === cond.equals);
        if (ok) await run(action.then || []);
        else if (Array.isArray(action.else)) await run(action.else);
        return;
      }

      default:
        throw new Error(`Acción no permitida: '${action.type}'`);
    }
  }

  async function run(list) {
    for (const a of list) {
      await runAction(a);
    }
    Engine.rerender();
  }

  window.Actions = { run };
})();
