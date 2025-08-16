"use strict";

/* global SceneManager, State */

const UI = (function(){
  const divTooltip = document.getElementById("tooltip");
  const divInventory = document.getElementById("inventory");
  const verbBar = document.getElementById("verb-bar");

  // Diálogo
  const dlg = document.getElementById("dialog");
  const dlgText = document.getElementById("dialog-text");
  const dlgNext = document.getElementById("dialog-next");

  let tooltipTimer = null;
  let dialogResolver = null;
  let dialogAutoTimer = null;

  // ===== Verbos =====
  function setVerb(v){
    [...verbBar.querySelectorAll("button[data-verb]")].forEach(b => {
      b.setAttribute("aria-pressed", b.getAttribute("data-verb") === v ? "true" : "false");
    });
  }

  function mountVerbBar({ verbs, onSelect }){
    verbBar.textContent = "";
    verbs.forEach(v => {
      const btn = document.createElement("button");
      btn.textContent = v === "look" ? "Mirar" : "Usar";
      btn.setAttribute("data-verb", v);
      btn.setAttribute("aria-pressed", v === "use" ? "true" : "false");
      btn.addEventListener("click", () => onSelect(v));
      verbBar.appendChild(btn);
    });
  }

  // ===== Tooltip & cursor =====
  function setTooltip(text){
    divTooltip.textContent = text || "";
  }

  function flashTooltip(text, ms = 2600){
    clearTimeout(tooltipTimer);
    setTooltip(text);
    tooltipTimer = setTimeout(() => setTooltip(""), ms);
  }

  function setHotCursor(on){
    document.body.classList.toggle("hot", !!on);
  }

  // ===== Diálogo =====
  function isDialogOpen(){ return !dlg.hasAttribute("hidden"); }
  function clickDialogNext(){ if (!isDialogOpen()) return; dlgNext.click(); }
  function showDialog(){ dlg.removeAttribute("hidden"); }
  function hideDialog(){ dlg.setAttribute("hidden", ""); }

  /**
   * UI.showText admite:
   *  - string
   *  - { text: string, autoCloseMs?: number }
   */
  function showText(input){
    const opts = (typeof input === "object" && input) ? input : { text: String(input || "") };
    const text = String(opts.text || "");
    const autoCloseMs = Number(opts.autoCloseMs || 0);

    return new Promise((resolve) => {
      dialogResolver = resolve;
      dlgText.textContent = text;
      showDialog();

      // Cerrar con click en cualquier parte del cuadro
      const handler = () => {
        dlgNext.removeEventListener("click", handler);
        dlg.removeEventListener("click", handler);
        if (dialogAutoTimer) { clearTimeout(dialogAutoTimer); dialogAutoTimer = null; }
        hideDialog();
        dialogResolver = null;
        resolve(true);
      };
      dlgNext.addEventListener("click", handler);
      dlg.addEventListener("click", handler);

      // Autocierre opcional (para [gl:...] versión corta)
      if (autoCloseMs > 0) {
        dialogAutoTimer = setTimeout(() => {
          if (isDialogOpen()) handler();
        }, autoCloseMs);
      }
    });
  }

  function fatal(msg){ showText(`Error: ${msg}`); }

  // ===== HUD / Inventario =====
  function renderHUD(state){
    divInventory.textContent = "";
    for (const id of state.inventory) {
      const it = SceneManager.getItem(id);
      const btn = document.createElement("button");
      btn.dataset.itemId = id;
      const img = document.createElement("img");
      img.src = it ? it.icon : "";
      img.alt = it ? it.name : id;
      img.width = 32; img.height = 32;
      btn.appendChild(img);
      btn.title = it ? it.name : id; // tooltip de QA
      divInventory.appendChild(btn);
    }
  }

  function refreshInventoryTitles(){
    const inv = (window.State && State.get().inventory) || [];
    [...divInventory.querySelectorAll("button")].forEach((btn, idx) => {
      const id = inv[idx] || "";
      const it = SceneManager.getItem(id);
      btn.title = it ? it.name : id;
    });
  }

  // Mini-animación visual al recibir un ítem
  function bumpInventory(itemId){
    const btn = divInventory.querySelector(`button[data-item-id="${itemId}"], button[data-itemid="${itemId}"], button[data-item-id]`);
    // fallback: último botón
    const target = btn || divInventory.querySelector("button:last-of-type");
    if (!target) return;
    target.classList.remove("bump");
    // forzar reflow para reiniciar animación
    // eslint-disable-next-line no-unused-expressions
    target.offsetWidth;
    target.classList.add("bump");
  }

  return {
    // verbos
    setVerb, mountVerbBar,
    // tooltip & cursor
    setTooltip, flashTooltip, setHotCursor,
    // diálogo
    isDialogOpen, clickDialogNext, showText, fatal,
    // HUD
    renderHUD, refreshInventoryTitles, bumpInventory
  };
})();
