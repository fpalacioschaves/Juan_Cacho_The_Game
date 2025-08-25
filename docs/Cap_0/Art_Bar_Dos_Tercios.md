Guía de arte — Bar Dos Tercios del Quinto (id: bar_dostercios)
Key art / mood

Bar castizo de barrio, madera gastada y neón tímido. Ambiente cálido, humo fantasma y vasos marcados. Trinchera social: medio ruido, mucha confidencia.

Color-key

Madera oscura: #6b513f

Azulejo pared baja: #988c7c

Metal (nevera/maquinaria): #7e858b

Piel barra (barniz): #3c2e26

Acentos: oro apagado #a58d5f (lámparas), verde botella #1c6b4a (vidrio), rojo #d7263d (neón/letrero)

Luz

Principal: tungsteno cálido desde lámparas colgantes sobre la barra; sombras duras pero no negras.

Secundaria: fuga fría desde la puerta a la calle (izquierda).

Contraluz suave detrás de botelleros para perfilar siluetas de los camareros.

Horizonte ~1,55 m; 2 puntos compatibles con el resto de escenas.

Props ancla

Barra corrida con botellero y tiradores, tres camareros (Dudu centro, el Moro junto a tiradores, el Gollina cerca de cafetera), pizarra de menú, máquina (tragaperras o dardos), tele alta con fútbol, mesas de mármol, puerta a baños.

Plano / colocación (1280×720) — zonas limpias para hotspots

(Coordenadas guía para que el overlay encaje sin pelearte. Ajusta ±10–20 px si lo necesitas; cambia solo ids si difieren en tu JSON.)

puerta_calle — rect (80, 320, 160, 280) · hoja de madera con vidrio; fuga fría hacia fuera.

maquina_juego — rect (230, 340, 130, 220) · tragaperras o diana; fondo liso.

mesa_esquina — rect (300, 540, 220, 120) · tablero claro, cenicero y dos vasos.

barra — rect (430, 470, 740, 210) · frontal de la barra (área general).

camarero_dudu — rect (620, 360, 120, 160) · de frente, silueta clara.

camarero_moro — rect (840, 360, 120, 160) · junto tiradores (ver abajo).

camarero_gollina — rect (1030, 360, 120, 160) · cerca de cafetera.

tiradores_cerveza — rect (780, 420, 90, 80) · metal brillante, espuma en jarra.

cafetera — rect (990, 415, 110, 80) · cromados y tazas apiladas.

pizarra_menu — rect (960, 200, 200, 120) · tiza insinuada, sin texto legible.

tele_bar — rect (980, 120, 160, 70) · brillo tenue, sin logos.

puerta_banos — rect (1160, 300, 100, 280) · señal pictográfica simple (sin letras).

Detrás de cada rect deja planos de color o textura suave (barniz, azulejo) para que el overlay sea claro. Para los camareros, usa siluetas y color bloque; sin rasgos finos.

Señales diegéticas (para invitar al clic)

Dudu/Moro/Gollina: manos ocupadas (trapo, jarra, taza). Pequeña aureola cálida de la lámpara les separa del fondo.

Tiradores: brillo en la palanca y vaso con espuma.

Cafetera: un pilotito y vapor leve.

Pizarra: esquina de papel pegado, una línea de tiza mal borrada.

Tele: reflejo móvil; cable colgando sutil.

Puerta baños: icono redondeado, tirador mate.

Puerta calle: franja de luz fría en el suelo marcando salida.

Archivo y técnica

Exporta images/backgrounds/bar_dostercios.jpg, 1280×720, sRGB, calidad 80–85.

Línea 1–2 px; aguada con bordes irregulares. Nada de texto legible (solo masas y símbolos).

Evita negro puro (<5%) para que el fade respire.

Checklist de integración

Pinta el JPG con la disposición anterior.

Sustituye el placeholder; pulsa F2 y confirma que todas las cajas calzan.

Ajusta al píxel con F8 (editor de hotspots) y copia el shape al JSON si hace falta.

Lógica típica:

Al hablar con Dudu/Moro/Gollina: setFlag oyó_parte1/2/3 y, si las tres están, showText [gl:rumor_compila] + setFlag rumor_vecino=true.

Primer diálogo largo + réplica corta la segunda vez (glosario).

Al tocar barra/mesa: textos cortos personalizados (nada de “No puedo usar eso”).

puerta_banos/puerta_calle → gotoScene correspondiente; primera vez en bar marca visita_bar=true.

Haz una pasada en modo foto (F6) para ver que la pizarra y la tele se leen sin HUD.