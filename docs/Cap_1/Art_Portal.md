Guía de arte — Portal (id: portal)
Key art / mood

Entrada de bloque antiguo, luz verdosa de tubo, brillo de baldosa gastada. La portera vigila desde la garita. Eco leve, olor a lejía y tabaco frío.

Color-key

Baldosa: #b6b0a6

Junta/sombra base: #2a2a2a

Pintura pared: #d9d2c7 (algo sucia)

Metal (ascensor / buzones): #7e858b

Madera puertas: #6b513f

Acento de escena: rojo #d7263d (cartel de reunión en tablón / detalle de la garita)

Luz

Principal: fluorescente central (fría, dura media) con caída hacia el fondo.

Secundaria: fuga cálida desde la puerta a la calle (derecha).

Horizonte ~1,55 m; perspectiva a 2 puntos, paralela a salón/baño.

Props ancla

Garita/ventanilla de la portera, buzones alineados, tablón de anuncios con el aviso de reunión, ascensor, escalera a pisos, puerta a la calle con cristal esmerilado, dos vecinos charlando en el rellano.

Plano / colocación (1280×720) — zonas pensadas para hotspots

(Coordenadas guía para que el arte calce a la primera. Ajusta ±10–20 px si hace falta.)

portera — rect (120, 300, 220, 170) · garita izquierda con ventanilla abierta y silla detrás.

buzones — rect (360, 280, 220, 160) · panel metálico a la izquierda del centro.

tablon_anuncios — rect (630, 210, 180, 140) · cartel rojo de reunión bien visible; fondo liso.

vecinos_nieves_angel — rect (520, 430, 220, 160) · pareja hermana/hermano en conversación, siluetas suaves.

vecinos_odon — rect (760, 440, 190, 150) · Odón y su mujer, más hacia el fondo.

ascensor — rect (930, 270, 160, 260) · puertas metálicas con luz tenue del panel.

escalera — rect (1020, 420, 200, 220) · arranque de peldaños al fondo-derecha.

puerta_calle — rect (1060, 260, 180, 290) · vidrio esmerilado con fuga de luz cálida.

portero_automatico (opcional) — rect (330, 470, 80, 100) · placa con botones, pared lisa detrás.

Deja planos limpios detrás de tablon_anuncios y buzones para que el overlay sea legible. En vecinos_*, prioriza siluetas y color bloque (sin rasgos finos).

Señales diegéticas (para invitar al clic)

Garita: persiana medio subida y un timbrecito; reflejo cálido en el mostrador.

Tablón: el cartel rojo destaca; un pin torcido sugiere interacción.

Buzones: una puerta de buzón mal cerrada.

Ascensor: LED encendido; raya de luz entre hojas.

Escalera: huella de paso (sombra) que dirige la vista hacia arriba.

Vecinos: globos de charla sugeridos por poses/gestos, sin texto.

Archivo y técnica

Exporta images/backgrounds/portal.jpg, 1280×720, sRGB, calidad 80–85.

Línea 1–2 px; aguada con bordes irregulares suaves. Evita negro puro (<5%).

Mantén rejilla mental de 32 px para alinear buzones/tablón/azulejo.

Checklist de integración

Pinta el JPG siguiendo la colocación de arriba.

Sustituye el placeholder y verifica con F2 los hotspots.

Si baila algo, ajusta con el modo editor (F8) y copia el shape al JSON.

Recuerda la lógica:

portera → marca hablo_con_portera=true; si no nota_comunidad, omite réplica de reunión y pon necesita_aviso=true.

vecinos_nieves_angel → si rumor_vecino=true, rama extra graciosa.

puerta_calle → camino a “calle” (desde ahí eliges bar o academia).