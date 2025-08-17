Guía de arte — Academia La Milagrosa (id: academia_milagrosa)
Key art / mood

Recepción de academia barata pero digna: fluorescente frío, vinilos azules, carteles de cursos. Orden correcto con algún desgaste. Se huele a fotocopia.

Color-key

Paredes: #dde3ea

Sombra base: #2a2e35

Suelo (terrazo claro): #c8c9cc

Madera/DM mostrador: #8a8f94 con canto oscuro #5a6068

Acento de escena: azul #3a86ff (logos, cartel, vinilos)

Luz

Principal: fluorescente lineal sobre mostrador (fría, dura media).

Secundaria: entrada acristalada con luz día desde la calle (lateral).

Horizonte ~1,55 m; perspectiva a 2 puntos (coherente con calle/portal).

Props ancla

Mostrador con ordenador y teléfono, jefe de la academia detrás (postura de “evaluarte”), tablón de cursos y cartel de horarios, impresora láser, puerta a despacho/aulas, sillas de sala de espera, estantería con archivadores, expositor con folletos.

Plano / colocación (1280×720) — zonas para hotspots (limpias detrás)

Ajusta ±10–20 px si te lo pide el cuerpo; los ids están en snake_case como en el resto.

puerta_calle — rect (90, 300, 160, 290) · puerta de vidrio con vinilo azul; deja halo frío en el suelo.

mostrador — rect (520, 480, 520, 190) · frontal limpio para hacer “look/use” genérico.

jefe_academia — rect (710, 350, 140, 160) · silueta clara tras el mostrador.

ordenador — rect (900, 410, 130, 90) · monitor+teclado; cromas fríos.

impresora — rect (1040, 420, 110, 90) · a media altura, bandeja visible.

folletos — rect (640, 540, 110, 70) · expositor bajo en el canto del mostrador.

tablon_cursos — rect (340, 220, 220, 150) · corcho con 3–4 carteles de color plano (sin texto).

cartel_horarios — rect (980, 210, 170, 90) · vinilo azul/blanco, legible por masa.

sala_espera — rect (260, 540, 220, 110) · 2–3 sillas metálicas; suelo liso detrás.

puerta_despacho — rect (1120, 300, 120, 280) · hoja con ventanuco esmerilado (posibles futuras escenas).

Mantén planos uniformes detrás de tablon_cursos, cartel_horarios y mostrador para que el overlay verde sea legible. Evita estampados finos cerca de jefe_academia.

Señales diegéticas (invitan al clic)

Jefe: lámpara superior dejando aureola sobre él; bolígrafo en mano.

Mostrador: campanilla o bandeja de matrícula.

Ordenador: led encendido; reflejo frío.

Impresora: hoja medio asomada.

Folletos: uno torcido (acento azul).

Tablón: chinchetas visibles; una hoja mal alineada.

Puerta despacho: pomo mate y etiqueta cuadrada (sin texto).

Puerta calle: fuga de luz azulada marcando la salida.

Archivo y técnica

Exporta images/backgrounds/academia_milagrosa.jpg, 1280×720, sRGB, calidad 80–85.

Línea 1–2 px; aguada con bordes suaves. Evita negro absoluto (<5%) para respetar el fade.

Checklist de integración

Pinta el JPG siguiendo la colocación.

Sustituye el placeholder y revisa con F2 que cada hotspot calza.

Ajusta finísimo con F8 (editor) y copia el shape al JSON si hace falta.

Reglas de juego que ya tienes:

jefe_academia: primer contacto → setFlag oferta_trabajo=true; si vuelves → rama que permite aceptar (→ acepta_trabajo=true).

folletos/mostrador: textos cortos vía glosario (2ª vez, versión breve).

puerta_calle vuelve a calle_barrio.

Pasa por F6 (modo foto) y verifica legibilidad de tablon_cursos y cartel_horarios.