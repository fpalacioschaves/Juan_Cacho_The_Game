Guía de arte — Salón (id: salon_juan)
Key art / mood

Tarde de barrio, persiana medio bajada, lámpara de pie encendida. Caos doméstico simpático, no mugre.

Color-key

Pared: #d9d4c7

Sombra base: #2a2a2a

Madera: #6d513f

Tela sofá: #4a5c66 (azulado, paleta “minimal”)

Acento de escena: verde botella #1c6b4a (planta, portada de libro, cojín)

Luz

Principal: lámpara de pie a la izquierda (cálida, dura media).

Secundaria: rebotada fría desde ventana derecha (10–15%).

Horizonte ~1,55 m; perspectiva a 2 puntos.

Props ancla (sí o sí)

Sofá con manta, mesa baja con cenicero y revistas, mueble TV con tele apagada, estantería con libros desordenados, ventana con cortina, al menos una puerta a otra estancia (coherente con tus escenas).

Plano / colocación (1280×720)

Te marco zonas limpias para que quepan los hotspots sin ruido detrás. Si tus ids difieren, dime y ajusto, pero como referencia práctica:

puerta_cocina — rect (80, 250, 140, 280) · pared izquierda, jambas claras.

puerta_dormitorio — rect (260, 255, 140, 285) · misma pared, a la derecha de cocina.

ventana_salon — rect (970, 190, 220, 150) · derecha, cortina clara.

sofa — rect (640, 480, 400, 170) · frontal, tela azul grisácea.

mesa_centro — rect (540, 520, 180, 95) · tapa de madera limpia (deja hueco).

cenicero — circle (615, 560, r=22) · vidrio/metal; brillo sutil.

revistas — rect (740, 560, 100, 60) · lomos legibles sin texto real.

televisor — rect (960, 380, 160, 110) · pantalla negra, bisel claro.

estanteria — rect (90, 200, 190, 300) · baldas claras, lomos simples.

poster_escher (opcional) — rect (320, 120, 120, 140) · patrón geométrico sin letras.

Nota: mantén detrás de cada rectángulo superficies de color plano (o textura muy suave) para que el overlay verde no choque con patrones.

Señales diegéticas (para reforzar hotspots)

Mesa: posavasos marcado + sombra del cenicero → invita a click.

Ventana: una motita de polvo iluminada.

Puertas: picaportes bien brillados, a la altura correcta.

Estantería: libro “verde botella” colocado raro (acento de escena).

Tele: LED rojo apagado (puntito).

Archivo y técnica

Exporta como images/backgrounds/salon_juan.jpg, 1280×720, sRGB, calidad 80–85.

Evita negros 100% (deja mínimo 5%) para que el fade no “crushee”.

Línea 1–2 px a tamaño final; manchas de color tipo “aguada”.

Checklist de integración

Pinta el JPG con las zonas anteriores.

Cárgalo: el sistema de placeholders lo sustituirá.

Pulsa F2 para ver el overlay: comprueba que cada hotspot cae donde toca.

Si ves solapes, ajusto coordenadas en scenes.json (o me pasas tus ids y los coloco exactos).

Revisa legibilidad con modo foto (F6): nada importante debería quedar justo detrás del diálogo.