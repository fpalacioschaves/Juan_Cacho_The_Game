Guía de arte — Cocina de Juan (id: cocina_juan)
Key art / mood

Cocina pequeña y vivida. Azulejo viejo verdoso, encimera con migas y una taza que promete. Luz fría por la ventana y bombilla cálida que no llega a todo.

Color-key

Azulejo: #bfcac6

Junta/sombra base: #2a2e35

Encimera (madera clara/laminado): #9a8f7e

Electrodomésticos: #7e858b

Acento de escena: oro apagado #a58d5f (taza, paño, imán)

Luz

Principal: ventana derecha (luz fría, difusa).

Secundaria: bombilla/ campana cálida sobre encimera.

Horizonte ~1,55 m; 2 puntos alineados con salón/baño.

Props ancla

Puerta al salón, nevera con imanes, microondas, cafetera/taza sobre mesa o encimera, fregadero insinuado, ventana con cortina.

Plano / colocación (1280×720) — zonas limpias para hotspots

(Coordenadas guía para pintar y que el overlay calce a la primera. Ajusta ±10–20 px si hace falta.)

puerta_salon — rect (70, 290, 160, 300) · hoja de madera izquierda.

nevera — rect (220, 360, 150, 260) · frontal limpio, deja espacio para imanes.

nota_academia (o rota_academia) — rect (360, 360, 200, 90) · post-it/hoja pegada en la nevera o con imán; fondo plano detrás.

cafe — rect (560, 560, 110, 90) · taza humeante en mesa/encimera; superficie lisa.

microondas — rect (760, 450, 150, 100) · cromado discreto, puerta con reflejo.

ventana_cocina — rect (980, 210, 220, 160) · cortina ligera; halo frío entrando.

Si colocas la nota en la nevera, evita patrones fuertes detrás: color plano o textura muy suave.

Señales diegéticas (para invitar al clic)

Nota: imán dorado (acento) y hoja ligeramente torcida.

Café: un hilo de vapor y un anillo de poso en la encimera.

Microondas: piloto encendido; reflejo suave.

Nevera: un imán más y otro caído en el canto.

Ventana: banda de luz en diagonal sobre encimera.

Puerta: pomo brillante, felpudo insinuado en el umbral.

Archivo y técnica

Exporta images/backgrounds/cocina_juan.jpg, 1280×720, sRGB, calidad 80–85.

Línea 1–2 px; aguada con bordes irregulares suaves. Evita negro puro (<5%).

Checklist de integración

Pinta el JPG con las zonas de arriba y súbelo como images/backgrounds/cocina_juan.jpg.

Activa F2 y confirma que puerta_salon, nevera, nota_academia/rota_academia, microondas, cafe, ventana_cocina encajan.

Ajusta fino con el modo editor (F8) y copia los shapes al JSON si hace falta.

Verifica la lógica: la nota se puede recoger (giveItem nota_academia + setFlag nota_academia=true + disableHotspot).

Pasa por F6 (modo foto) y comprueba legibilidad sin HUD, sobre todo en nota y ventana.