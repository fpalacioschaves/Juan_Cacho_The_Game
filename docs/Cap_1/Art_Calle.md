Guía de arte — Calle (id: calle_barrio)
Key art / mood

Tarde en barrio castizo. Acera estrecha, tres portales protagonistas: bar a la izquierda (neón tímido), portal en el centro, academia a la derecha (cartel azul). Suelo con losas gastadas; charco fino que refleja un poco el cielo.

Color-key

Fachadas: #cbbfae · Sombra base: #2a2a2a · Piedra suelo: #9d9388

Carpinterías: #6b513f (madera) y #7e858b (metal)

Acentos: rojo #d7263d (bar/neón) y azul #3a86ff (academia)

Luz

Principal: cielo nublado cálido (tarde) + reflejo en los cristales.

Secundaria: fuga cálida del bar (interior rojizo).

Horizonte ~1,55 m; 2 puntos, alineado con el resto de escenas.

Props ancla

Rótulo del bar con luz tenue, puerta del portal con buzón/placa, entrada de la academia con cartel azul, farola, banco de calle, tablón o marquesina con carteles (sin texto legible).

Plano / colocación (1280×720) — zonas pensadas para hotspots

(Coordenadas guía para pintar y que el overlay cuadre a la primera. Ajusta ±10–20 px si lo ves necesario.)

puerta_bar — rect (150, 320, 180, 260) · hoja de madera, interior cálido visible.

rotulo_bar — rect (130, 230, 220, 70) · letrero/ban­dó sin texto legible (solo color rojo/acento).

puerta_portal — rect (480, 300, 160, 280) · puerta central con vidrio esmerilado y pomo.

buzones_portal (opcional) — rect (460, 260, 110, 80) · junto a la puerta.

puerta_academia — rect (950, 300, 160, 280) · vidrio con vinilo azul; limpia detrás.

cartel_academia — rect (940, 220, 180, 70) · banda azul, sin texto.

banco — rect (620, 520, 240, 80) · tablones de madera, espacio claro detrás.

farola — rect (720, 240, 36, 300) · mástil oscuro; base libre.

tablón_marquesina — rect (770, 300, 130, 170) · dos carteles de color plano (sin texto).

Detrás de cada rect deja superficie lisa o textura suave para que el overlay verde sea legible.

Señales diegéticas (para invitar al clic)

Bar: luz cálida derramándose por el dintel; moqueta oscura tras el cristal.

Portal: placa del portero y felpudo gastado.

Academia: reflejo frío en el vidrio; vinilo azul “limpio”.

Farola: halo muy tenue sobre el suelo.

Bancos/tablón: una esquina de cartel levantada; tornillos brillando.

Archivo y técnica

Exporta images/backgrounds/calle_barrio.jpg, 1280×720, sRGB, calidad 80–85.

Línea 1–2 px, aguada con bordes irregulares. Evita negro 100% para que el fade respire.

Checklist de integración

Pinta el JPG siguiendo la colocación.

Activa F2 y verifica que puerta_bar, puerta_portal y puerta_academia coinciden.

Ajusta al píxel con el modo editor (F8) si hace falta y copia los shapes al JSON.

Lógica típica:

puerta_bar → gotoScene: "bar_dostercios" + marca visita_bar=true.

puerta_academia → condicional nota_academia=true; si no, réplica corta con [gl:].

puerta_portal → vuelve a "portal".

Comprueba legibilidad con F6 modo foto.