Guía de Arte — calle_gimnasio
Propósito y tono

Función narrativa: Conectar la calle principal del barrio con el gimnasio y la farmacia. Debe sugerir “ruta de recados” de Juan: práctico, de barrio, con un punto de ironía cotidiana.

Tono visual: Misma línea que el resto de escenarios: pintura digital semi-realista con pincel texturizado, bordes suaves, sin contornos negros puros; detalle creíble pero no hiperreal, guiños sutiles (pegatinas, carteles) para humor.

Formato técnico

Resolución final: 1280 × 720 px, sRGB, PNG opaco (sin transparencia).

Safe area para UI: dejar ~20 px libres en todo el perímetro (evita colocar texto/carteles esenciales pegados al borde).

Escala: puertas ≈ 190–220 px de alto; altura de personaje jugable ≈ 140–160 px cuando esté a media escena.

Cámara, perspectiva y luz

Perspectiva: 2.5D con horizonte bajo (≈ y: 420–460) y leve fuga hacia el centro. Fachada de farmacia (izquierda) en 3/4; gimnasio (derecha) casi frontal para clara lectura de puertas.

Iluminación: Diurna templada (tarde suave). Sombras a 30° desde la izquierda (dirección SO→NE). Contraste moderado; evita negros 100%.

Atmósfera: Ligero calima/grano pictórico muy sutil para cohesionar planos.

Paleta

Base barrio: grises y beiges cálidos para pavimento y fachada (H 30–45°, S 10–20%).

Acentos:

Farmacia: cruz verde (#1DB954–#26C281), neón apagado de día (halo suave).

Gimnasio: rotulación en azul profundo (#224C9A) o borgoña (#8C2F39) (elige uno y sé consistente).

Toques verdosos en árboles maceta o jardineras para romper la piedra.

No usar saturaciones extremas salvo en señales/accentos.

Composición (coherente con hotspots)

Izquierda (farmacia) — Hotspot ir_farmacia:
Escaparate con estanterías, cartel “FARMACIA”, cruz verde en rótulo, puerta de vidrio con tirador metálico. Coloca elementos principales dentro de x:100–360, y:220–460.

Centro: acera amplia y paso peatonal; una papelera baja y una señal direccional hacia “Gimnasio / Polideportivo”.

Derecha (gimnasio) — Hotspot ir_gimnasio:
Doble puerta de cristal, vinilo con siluetas de mancuerna/corredor, cartel “Cuota verano”. Elementos principales dentro de x:900–1160, y:220–460.

Borde izquierdo (salida) — Hotspot volver_calle_c1:
Deja un chaflán o callejón con perspectiva hacia fuera (oscurece ligeramente) ocupando x:0–80, y:360–660 para que se lea como continuidad hacia calle_c1.

Detallado y props (opcionales pero útiles)

Baldosas de acera en módulos de 40–60 px; grietas y manchas suaves (no “ruido” repetitivo).

Poste de señal vertical con flecha “Gimnasio →” cerca del centro.

Cartelería en gimnasio: “Horario 8–22 h”, “¡Cintas nuevas!” (guiño al puzzle del mareo).

Escaparate farmacia: cajas genéricas, cartel “Vitaminas B12 – Promo”.

Un banco metálico y una rejilla de alcantarilla para romper monotonía del suelo.

Grafiti discreto (humor blanco) en una persiana lateral, del tipo “X^2 + café = ánimo”.

Estilo y acabados

Pincel texturizado, edge control suave en planos lejanos; más nitidez en marcos de puertas/rotulación.

No usar líneas negras puras; define con contraste de valores y cambios de temperatura.

Dithering mínimo; usa ruido sutil solo para integrar superficies grandes (pared/acera).

“Zonas libres” para pathfinding/lectura

Mantén despejada la franja y: 540–700 en el centro para que el personaje “camine” sin solaparse con elementos críticos.

Evita carteles o elementos finos justo en los rectángulos de hotspots para que la lectura y el click sean limpios.

Entregables

images/backgrounds/calle_gimnasio.png (1280×720, aplanado).

Fuente editable (PSD/Krita/XCF) con capas nombradas:
00_bg, 10_suelo, 20_farmacia, 30_gimnasio, 40_props, 50_sombras, 60_luces, 90_color_grade, 99_guides_hotspots (esta última con rectángulos guía y NO se exporta).

(Opcional) Overlay debug con hotspots: images/debug/hotspots_calle_gimnasio.png (semi-transparente) para QA.

Checklist de coherencia

 Cruz verde y rótulo farmacia legibles a 70% de escala.

 Puertas con tiradores visibles y reflexión suave (no espejo).

 Sombras coherentes a 30°.

 Paleta y grano consistentes con calle_c1 y bar_dostercios.

 Chaflán/salida izquierda se “lee” claramente como conexión.