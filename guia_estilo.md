Guía corta de estilo (para seguirla siempre)

Técnica: línea negra fina (1–2 px a 1280×720) + manchas de color “acuarela/guache” con bordes algo irregulares; texturas muy sutiles (el grano fuerte ya lo aporta el overlay CSS).

Perspectiva: 2 puntos, horizonte a ~1,55 m (ojo del jugador). Mantén coherente la altura entre estancias. Evita picados/contrapicados salvo momentos dramáticos.

Composición: tercio central despejado para interacción; masas grandes en los laterales. Deja aire a 24 px de los bordes para no “aplastar” hotspots.

Luz: base cálida (tungsteno) con sombras frías y definidas (tarde/noche de barrio). Una fuente principal; reflejos mínimos.

Paleta global (desaturada, +1 acento por escena):
Fondo: #2a2a2a · Sombras: #0f1012 · Luces: #e8e6df
Acentos de UI/historia (consistentes con temas): rojo #d7263d, verde botella #1c6b4a, oro apagado #a58d5f, azul #3a86ff.

Nivel de detalle: primer plano 80%, fondo 60%. Nada de micro-texto: rótulos >16 px equivalentes a 1280×720.

Mood: sucio simpático. Señales de vida (tazas, colillas, cinta americana), pero sin ruido visual gratuito.

Claves por localización

Casa (dormitorio/salón/baño/cocina): interiores estrechos, fluorescentes cálidos, objetos cotidianos. Acento por estancia
Dormitorio: azul #3a86ff · Salón: verde #1c6b4a · Baño: gris verdoso · Cocina: oro apagado #a58d5f.

Portería: luz de tubo, baldosín antiguo, tablón de anuncios legible (pocas notas grandes). Acento rojo #d7263d en el cartel de la reunión.

Bar Dos Tercios: madera oscura, neón tenue, contraluz desde barra. Acentos alternos rojo/verde. Deja huecos “clicables” en barra, máquina y mesas.

Academia La Milagrosa: fosfo blanco/azulado, posters escolares simples, cristal con reflejo suave. Acento azul.

Entrega técnica

Resolución: 1280×720 px, sRGB, JPG calidad 80–85.

Nombre: images/backgrounds/<id_escena>.jpg (exacto al id en scenes.json).

Exposición: leve curva en S; no más de 60% negro absoluto (para que el fade no “crushe”).

Guías internas (opcional al pintar): cuadrícula 32 px y líneas de fuga guardadas como capa oculta.

Reglas de legibilidad para hotspots

Evita patrones de alto contraste donde vaya un hotspot.

Bordea superficies planas para rects (puertas, cajones); curvas claras para circles (platos, relojes).

Deja símbolos diegéticos donde haya puzzles (post-its, marcas, manchas) — ayudan a recordar sin repetir texto.

Mini “style-bible” por escena (plantilla)

Key art/mood (1 frase).

Color-key (3–4 swatches + 1 acento).

Luz (fuente, dirección, dureza).

Lista de props “ancla” (3–5).

Zona de interacción (dónde queremos que miren primero).