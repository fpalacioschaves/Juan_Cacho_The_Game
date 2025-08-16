"use strict";

/* global State, SceneManager, UI */

const Actions = (function(){
  // --- Glosario [gl:key] Largo ::: Corto  (+autocierre si ya visto)
  function resolveGlossary(text){
    if (typeof text !== "string") return { text: "" };
    const m = text.match(/^\s*\[gl:([a-zA-Z0-9_\-\.]+)\]\s*(.*)$/);
    if (!m) return { text }; // no glosario

    const key = m[1];
    const rest = m[2] || "";
    const parts = rest.split(":::");
    const longText = (parts[0] || "").trim();
    const shortText = (parts[1] || parts[0] || "").trim();

    const seenFlag = `gl_${key}_seen`;
    const seen = !!State.get().flags[seenFlag];

    if (!seen) {
      State.setFlag(seenFlag, true);
      return { text: longText || shortText };
    } else {
      // Autocierre SOLO si hay versión corta distinta y es realmente breve
      const isDistinct = shortText && shortText !== longText;
      const len = shortText.length;
      const autoCloseMs = isDistinct ? Math.min(3200, Math.max(900, 30 * len)) : 0;
      return { text: shortText || longText, autoCloseMs };
    }
  }

  async function act_showText(a){
    const payload = resolveGlossary(a.text || "");
    await UI.showText(payload);
  }

  async function act_giveItem(a){
    const it = SceneManager.getItem(a.itemId);
    if (!it) throw new Error(`giveItem: item inexistente '${a.itemId}'`);
    State.addItem(a.itemId);
    UI.refreshInventoryTitles();
    // Bump cuando ya esté pintado el HUD (siguiente frame)
    requestAnimationFrame(() => UI.bumpInventory(a.itemId));
  }

  async function act_removeItem(a){
    State.removeItem(a.itemId);
    UI.refreshInventoryTitles();
  }

  async function act_setFlag(a){ State.setFlag(a.name, a.value); }

  async function act_gotoScene(a){
    if (!window.Engine || !window.Engine.gotoScene) throw new Error("gotoScene: Engine no disponible");
    await window.Engine.gotoScene(a.id);
  }

  async function act_disableHotspot(a){
    const scId = State.get().currentSceneId;
    SceneManager.disableHotspot(scId, a.id);
  }

  async function act_enableHotspot(a){
    const scId = State.get().currentSceneId;
    SceneManager.enableHotspot(scId, a.id);
  }

  async function act_if(a){
    const cond = a.condition || {};
    let ok = true;
    if (Object.prototype.hasOwnProperty.call(cond, "hasItem")) {
      ok = State.hasItem(cond.hasItem);
    }
    if (ok && Object.prototype.hasOwnProperty.call(cond, "flag")) {
      const v = State.get().flags[cond.flag];
      if (Object.prototype.hasOwnProperty.call(cond, "equals")) ok = (v === cond.equals);
      else ok = !!v;
    }
    if (ok) await run(a.then || []);
    else await run(a.else || []);
  }

  async function run(actions){
    for (const a of actions){
      if (!a || typeof a.type !== "string") continue;
      switch (a.type) {
        case "showText":       await act_showText(a); break;
        case "giveItem":       await act_giveItem(a); break;
        case "removeItem":     await act_removeItem(a); break;
        case "setFlag":        await act_setFlag(a); break;
        case "gotoScene":      await act_gotoScene(a); break;
        case "disableHotspot": await act_disableHotspot(a); break;
        case "enableHotspot":  await act_enableHotspot(a); break;
        case "if":             await act_if(a); break;
        default: throw new Error(`Acción desconocida '${a.type}'`);
      }
    }
  }

  return { run };
})();
