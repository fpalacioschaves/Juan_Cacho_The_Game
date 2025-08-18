Guía de arte para ítems (v1)

Propósito

Que todos los íconos se lean en 64×64 px (base) y escalen limpios a 128×128 px.

Estilo coherente con los escenarios: sobrio, con humor seco, pero sin caricatura.

Lienzo & exportación

Tamaño maestro: 64×64 px, PNG con fondo transparente.

Doble resolución opcional: 128×128 px para pantallas densas (mismo encuadre).

Área segura: deja 4 px de margen mínimo (no tocar los bordes).

Alineación a grid de 2 px para contornos y detalles pequeños.

Luz y volumen

Iluminación fija desde arriba-izquierda (≈ 320°).

Sombreado suave (una sombra interior y un brillo suave). Nada de texturas realistas.

Sin sombras proyectadas externas ni brillos especulares agresivos.

Trazo y forma

Contorno exterior: 1–2 px (según la forma), color #2B2B2B al 80–100% opacidad.

Esquinas redondeadas ligeras (no 100% circles unless needed).

Evitar detalle fino <2 px: se rompe al escalar.

Color

Paleta base corta, mate:

Metales cálidos (latón): #D4A53F base, sombra #B4832E, luz #F5D279.

Metales fríos (acero): #B7C1C9 base, sombra #8E9AA3, luz #E4EDF4.

Plástico oscuro: #3D3D3D / Luz #6A6A6A.

Saturación contenida; el contraste lo aporta el contorno y los planos.

Perspectiva / orientación

Iconos en plano frontal o inclinación sutil (±20–30°) para dinamismo.

Nada “isométrico” complejo. Legibilidad primero.

Estados

Un único PNG por ítem. El “hover/selección” se resuelve en UI (no en el asset).

Nomenclatura

images/items/<id_item>.png (ya lo cumples).

Mantener color/material consistente entre ítems del mismo tipo.

Guía de arte — Ítems (base común)

Lienzo y exportación

Maestro 64×64 px, PNG transparente. Export opcional 128×128 px 1:1.

Margen seguro: 4 px alrededor (nada toca borde).

Alineación a grid de 2 px para contornos/detalle fino.

Estilo

Flat con volumen leve: una luz suave y una sombra interior sutil.

Sin texturas fotográficas ni sombras proyectadas externas.

Luz

Dirección fija arriba-izquierda. El brillo cae en el tercio superior/izquierdo del objeto.

Contorno

2 px continuos, #2B2B2B (100% opacidad).

Esquinas ligeramente redondeadas (cuando aplique).

Color (paletas base)

Acero: base #B7C1C9, sombra #8E9AA3, luz #E4EDF4.

Latón: base #D4A53F, sombra #B4832E, luz #F5D279.

Papel: base #F4F1EA, sombra #D9D3C5, luz #FFFFFF.

Post-it: base #F2E56B, sombra #D6C955, luz #FFF7A9.

Plástico/batería: cuerpo #3D3D3D / #666; casquillos #D8D8D8/#AFAFAF; símbolo #2B2B2B.

Perspectiva

Frontal o inclinación moderada (±20–30°) para dinamismo y lectura.

QC rápido

A 64 px: forma reconocible, highlights no “queman”, contorno limpio, huecos (agujeros) legibles.

llaves_casa

Composición

Haz dos llaves cruzadas (frontal y trasera) con aro partido pequeño.

Inclinaciones: -22° (frontal), +18° (trasera).

Cabeza rectangular redondeada con agujero circular claro; vástago recto; 3 dientes escalonados legibles.

Paleta

Acero (ver base común). Trasera ligeramente más oscura/menos opaca para dar prioridad a la frontal.

Geometría (aprox)

Cabeza: 24×14 px; radio 4 px. Agujero Ø 6 px.

Vástago: 28×8 px.

Dientes: pasos visibles de 4–6 px.

Archivo

images/items/llaves_casa.png

pilas_aa

Composición

Par de pilas AA cruzadas; la frontal manda.

Cada pila: cilindro con cabeza positiva (“+”) clara y casquillos metálicos en ambos extremos.

Inclinaciones

Frontal -25°, trasera +30°.

Paleta

Cuerpo plástico oscuro (#3D3D3D → luz #6A6A6A).

Casquillos metálicos (gris claro).

Símbolo + en el polo positivo (contorno oscuro).

Geometría (aprox)

Cuerpo cilindro 36×12 px (sin casquillos).

Casquillos: 3 px de largo, tono metálico; el positivo con “+” de 6 px.

Archivo

images/items/pilas_aa.png

nota_academia

Composición

Post-it cuadrado con ligera oreja doblada (triangulito en una esquina).

Un par de líneas “escritas” abstractas (2–3 trazos rectos, 1 px, opacidad 70%) para legibilidad sin texto.

Paleta

Post-it (amarillo): base #F2E56B, sombra #D6C955, luz #FFF7A9.

“Tinta”: #2B2B2B al 70%.

Geometría (aprox)

Cuerpo 44×44 px, centrado.

Oreja: triángulo 8×8 px en esquina superior derecha.

Archivo

images/items/nota_academia.png

nota_comunidad

Composición

Hoja oficial A5 recortada: rectángulo vertical con membrete (barra superior) y sellito cuadrado.

3 líneas falsas de texto (1 px) bajo el membrete.

Paleta

Papel: #F4F1EA (sombra #D9D3C5, luz #FFFFFF).

Membrete: #376AA0 (o el color que uses en la UI para “institucional”).

Sello: cuadro #9E3B3B al 80% opacidad.

Geometría (aprox)

Hoja 44×54 px; margen inferior 6 px.

Membrete: franja 44×6 px.

Sello: 10×10 px, esquina inferior derecha.

Archivo

images/items/nota_comunidad.png