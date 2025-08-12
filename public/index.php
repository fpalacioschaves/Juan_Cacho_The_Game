<?php
// public/index.php
?><!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Juan Cacho — El Juego</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preload" href="assets/js/main.js" as="script" />
  <link rel="stylesheet" href="assets/css/app.css" />
</head>
<body>
  <div id="game-root">
    <header class="topbar">
      <div class="title">Juan Cacho — El Juego</div>
      <div class="inv" id="inventory"></div>
    </header>

    <main class="stage">
      <canvas id="scene" width="1024" height="576"></canvas>
    </main>

    <div id="toast"></div>

    <!-- CONTENEDOR DE DIÁLOGO -->
    <div id="dialogue" class="dialogue hidden" aria-live="polite" aria-atomic="true">
      <div class="dialogue-box">
        <div class="dialogue-speaker" id="dlg-speaker"></div>
        <div class="dialogue-text" id="dlg-text"></div>
        <div class="dialogue-choices" id="dlg-choices"></div>
        <div class="dialogue-continue" id="dlg-continue" role="button" tabindex="0">Continuar ▸</div>
      </div>
    </div>
  </div>

  <script type="module" src="assets/js/main.js"></script>
</body>
</html>
