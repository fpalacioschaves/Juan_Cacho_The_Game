Guía de arte — Dormitorio (id: dormitorio_juan)
Key art / mood

Cuarto pequeño de estudiante: cama deshecha, libros apilados, luz fría entrando por la ventana, una lámpara cálida que apenas compensa. Orden aparente sobre desorden real.

Color-key

Pared: #d7d9df (gris azulado)

Sombra base: #2a2e35

Madera: #6b5645

Tela cama: #4b6074

Acento de escena: azul #3a86ff (libro, post-it, cojín)

Luz

Principal: ventana derecha (fría, difusa, mañana nublada).

Secundaria: mesilla con luz cálida muy baja.

Horizonte ~1,55 m; 2 puntos de fuga coherentes con el salón.

Props ancla (sí o sí)

Cama individual deshecha, mesilla con cajón (lugar lógico de llaves), armario empotrado/mueble alto, ventana con cortina ligera, póster de matemáticos y retrato de la madre en pared. Montón de ropa en el suelo.

Plano / colocación (1280×720) — zonas pensadas para hotspots

(Valores guía para que pintar y cajas casen a la primera. Ajusta ±10-20 px si hace falta.)

puerta_salon — rect (80, 250, 150, 300) · en pared izquierda.

armario — rect (260, 230, 220, 320) · mueble alto centrado en pared del fondo.

cama — rect (720, 480, 420, 180) · a la derecha, vista 3/4.

mesita — rect (650, 520, 100, 110) · junto a la cama.

cajon_mesita — rect (650, 560, 100, 60) · frente del cajón (las llaves viven aquí).

ventana_dormitorio — rect (980, 210, 210, 170) · luz fría entrando.

poster_matematicos — rect (340, 140, 130, 160) · pared del fondo, simple (sin texto).

retrato_madre — rect (520, 150, 120, 150) · pared, marco sencillo.

ropa_suelo — rect (480, 600, 180, 90) · montón cerca de los pies de la cama.

Paredes y muebles detrás de cada rect en color liso o textura muy suave para que el overlay no “lucha” con patrones.

Señales diegéticas (para reforzar el clic)

Cajón de la mesita: rendija un pelín abierta y tirador brillante → “aquí hay algo”.

Llaves: no visibles; su pista vive en el texto y el cajón abierto (cuando toque).

Ropa en el suelo: arrugas con sombras claras, un calcetín azul acento.

Retrato: pequeño destello en el cristal.

Ventana: banda de luz diagonal suave sobre cama/mesa.

Archivo y técnica

Exporta images/backgrounds/dormitorio_juan.jpg, 1280×720, sRGB, calidad 80–85.

Línea 1–2 px; aguada con bordes algo irregulares. Evita negro 100% para que el fade respire.

Checklist de integración

Pinta el JPG siguiendo coordenadas de arriba.

Sustituye el placeholder y F2 para revisar cajas.

Si algo baila, corrige con el modo editor (F8) y copia el shape al JSON.

Verifica que cajon_mesita permite “pickup” de llaves_casa según tu scenes.json.

Comprueba legibilidad con F6 modo foto (sin HUD/overlay).