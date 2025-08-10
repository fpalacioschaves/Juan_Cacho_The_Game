<?php /* /public/index.php */ ?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Juan Cacho — El Juego</title>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <div id="game">
    <div id="scene">
      <div id="hotspots"></div>
    </div>

    <div id="hud">
      <div id="inventory"></div>
      <div id="hud-buttons">
        <button id="btn-notebook" title="Cuaderno">Cuaderno</button>
        <button id="btn-map" title="Mapa">Mapa</button>
        <button id="btn-save" title="Guardar">Guardar</button>
        <button id="btn-load" title="Cargar">Cargar</button>
      </div>
    </div>

    <div id="dialogue" class="overlay hidden">
      <div class="panel">
        <div class="portrait" id="dlg-portrait"></div>
        <div class="text" id="dlg-text"></div>
        <div class="options" id="dlg-opts"></div>
      </div>
    </div>

    <div id="notebook" class="overlay hidden">
      <div class="panel">
        <h2>Cuaderno de Juan</h2>
        <ul id="notebook-list"></ul>
        <button class="close">Cerrar</button>
      </div>
    </div>

    <div id="toast" class="hidden"></div>
  </div>

  <script>window.JC_CONFIG = { apiBase: '../engine', userId: 'dev' };</script>
  <script src="js/ui.js"></script>
  <script src="js/engine.js"></script>
</body>
</html>