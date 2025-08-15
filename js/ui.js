"use strict";

/* global SceneManager, State */

(function () {
  const $verbBar = document.getElementById("verb-bar");
  const $inventory = document.getElementById("inventory");
  const $tooltip = document.getElementById("tooltip");
  const $dialog = document.getElementById("dialog");
  const $dialogText = document.getElementById("dialog-text");
  const $dialogNext = document.getElementById("dialog-next");

  let currentVerb = "use";
  let dialogResolver = null;

  function setVerb(v) {
    currentVerb = v;
    [...$verbBar.querySelectorAll("button")].forEach(b => {
      b.classList.toggle("active", b.dataset.verb === v);
    });
    setTooltip("");
  }

  function mountVerbBar({ verbs, onSelect }) {
    $verbBar.innerHTML = "";
    verbs.forEach(v => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.verb = v;
      btn.textContent = v === "look" ? "Mirar" : "Usar";
      btn.addEventListener("click", () => onSelect(v));
      $verbBar.appendChild(btn);
    });
    setVerb(currentVerb);
  }

  function renderInventory(state, scene) {
    $inventory.innerHTML = "";
    state.inventory.forEach((itemId, idx) => {
      const it = SceneManager.getItem(itemId);
      if (!it) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("role", "listitem");
      btn.setAttribute("aria-label", `${it.name}: ${it.description}`);
      btn.tabIndex = 0;

      // Tooltip nativo con el nombre del ítem
      btn.title = it.name;

      const img = document.createElement("img");
      img.src = it.icon;
      img.alt = it.name;
      btn.appendChild(img);

      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          showDialog(`${it.name}\n\n${it.description}`);
        }
      });

      btn.addEventListener("click", () => showDialog(`${it.name}\n\n${it.description}`));

      $inventory.appendChild(btn);

      if (idx === 0) btn.focus({ preventScroll: true });
    });
  }

  function setTooltip(msg) {
    $tooltip.textContent = msg || "";
  }

  function setHotCursor(on) {
    document.body.classList.toggle("hot", !!on);
  }

  function showDialog(text) {
    $dialogText.textContent = String(text || "");
    $dialog.hidden = false;
    $dialogNext.focus({ preventScroll: true });

    return new Promise((resolve) => {
      dialogResolver = resolve;
    });
  }

  function clickDialogNext() {
    if ($dialog.hidden) return;
    $dialog.hidden = true;
    const res = dialogResolver;
    dialogResolver = null;
    if (typeof res === "function") res(true);
  }

  function isDialogOpen() { return !$dialog.hidden; }

  function renderHUD(state, scene) {
    renderInventory(state, scene);
  }

  function fatal(message) {
    const c = document.getElementById("scene");
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#ff4d4f";
    ctx.font = "20px system-ui, sans-serif";
    ctx.fillText("Error crítico:", 20, 40);
    ctx.fillStyle = "#ffdede";
    wrapText(ctx, message, 20, 70, c.width - 40, 22);
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text).split(/\s+/);
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxWidth) {
        ctx.fillText(line, x, y);
        line = w;
        y += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, y);
  }

  document.getElementById("dialog-next").addEventListener("click", clickDialogNext);

  window.UI = {
    setVerb, mountVerbBar, renderHUD, setTooltip, setHotCursor,
    showDialog, clickDialogNext, isDialogOpen, fatal
  };
})();
