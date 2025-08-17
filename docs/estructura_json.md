# Juan Cacho — Cap. 0 · Guía de textos y “glosario”

Este README explica **cómo escribir y mantener los textos** (largos/cortos) y **los mensajes sarcásticos por hotspot**, sin tocar el motor ni inventar acciones nuevas.

---

## 1) Glosario `[gl:...]` (texto largo vs. corto)

**Objetivo:** mostrar un texto **largo** la primera vez y, a partir de entonces, un **resumen corto** para no machacar al jugador.

**Sintaxis dentro de `text`:**


- La **clave** (`<clave>`) identifica la pista/entrada de glosario. Ejemplos: `ropa_desc`, `jefe_oferta`, `cap0_fin`.
- El **separador** ` ::: ` parte el largo del corto.  
- Si **no** pones ` ::: `, se reutiliza el mismo texto en repeticiones.

**Cómo funciona (sin tocar código):**
- La primera vez que se encuentra `[gl:<clave>]`, se muestra el **texto largo** y se marca internamente la clave como ya vista.
- En llamadas siguientes con la **misma** clave, se muestra el **texto corto** (si existe).

> Recomendación de estilo: usa prefijos coherentes en las claves.  
> Por ejemplo: `nota_*` para la comunidad, `jefe_*` para la academia, `use_*` para sarcasmos de “usar”.

**Ejemplo real (de `scenes.json`):**
```json
{ "type": "showText", "text": "[gl:nota_academia_desc] Post-it en la nevera: 'Pasar por la Academia'. ::: Nota de la academia." }

2) Mensajes sarcásticos por hotspot (personalizables)

Hemos eliminado cualquier fallback genérico en engine.js.
Eso significa que tú decides frase por hotspot directamente en scenes.json:

Cuando sí se cumplen condiciones y no hay acción significativa, pon un onUse con tu comentario:

"onUse": [
  { "type": "showText", "text": "[gl:use_sofa] Si te sientas, no te levantas. ::: Mejor no." }
]


Cuando NO se cumplen condiciones (gating) y quieres el sarcasmo ahí:

"onUseFail": [
  { "type": "showText", "text": "[gl:academia_bloqueada] Recuerdas que debías pasar por la Academia... ¿Dónde estaba la nota? ::: Te falta la nota." }
]


Regla de oro:
Si no hay onUse (o onUseFail) no se muestra nada. Así evitas “frases comodín” no deseadas.

3) Dónde escribir cada cosa

Textos de escenas y hotspots: solo en /data/scenes.json.

Iconos/ítems y descripciones: en /data/items.json (solo catálogo, no diálogos).

No crear acciones nuevas; usa únicamente:

showText, giveItem, removeItem, setFlag,
gotoScene, disableHotspot, enableHotspot,
if { condition: { hasItem|flag|equals } }


4) Plantillas rápidas para copiar/pegar
4.1. Hotspot descriptivo (mirar + usar con sarcasmo)
{
  "id": "mi_hotspot",
  "shape": { "type": "rect", "x": 100, "y": 100, "w": 120, "h": 80 },
  "verb": ["look","use"],
  "onLook": [
    { "type": "showText", "text": "[gl:mi_hotspot_desc] Descripción larga. ::: Descripción corta." }
  ],
  "onUse": [
    { "type": "showText", "text": "[gl:use_mi_hotspot] Sarcasmo personalizado de USAR. ::: Variante corta." }
  ]
}

4.2. Hotspot con gating (condiciones + mensaje cuando falla)
{
  "id": "puerta_salida",
  "shape": { "type": "rect", "x": 1100, "y": 520, "w": 140, "h": 160 },
  "verb": ["look","use"],
  "conditions": [ { "hasItem": "llaves_casa" } ],
  "onUse": [ { "type": "gotoScene", "id": "portal" } ],
  "onUseFail": [
    { "type": "showText", "text": "[gl:sin_llaves] No puedes salir sin las llaves. ::: Falta la llave." }
  ]
}

4.3. Pickup con desactivación del hotspot tras cogerlo
{
  "id": "nota_comunidad",
  "shape": { "type": "rect", "x": 640, "y": 420, "w": 160, "h": 80 },
  "verb": ["look","use"],
  "onLook": [
    { "type": "showText", "text": "[gl:nota_comunidad_desc] Un papel con membrete. ::: Nota." }
  ],
  "onUse": [
    { "type": "if", "condition": { "hasItem": "nota_comunidad" }, "then": [
      { "type": "showText", "text": "[gl:nota_comunidad_ya] Ya guardaste la nota. ::: Ya la tienes." }
    ], "else": [
      { "type": "showText", "text": "[gl:nota_comunidad_coge] Coges la nota de la reunión. ::: Nota recogida." },
      { "type": "giveItem", "itemId": "nota_comunidad" },
      { "type": "disableHotspot", "id": "nota_comunidad" }
    ] }
  ]
}

5) Reglas de estilo (recomendadas)

Clave del glosario: snake_case corto y significativo:
poster_escher, use_microondas, jefe_aceptar, cap0_fin.

Tono: seco, cercano, sin chistes internos crípticos; máximo 1–2 frases en el largo.

Corto: 1 fragmento ágil, ideal para lectura rápida en reintentos.

Accesibilidad: evita mayúsculas sostenidas; no abuses de símbolos raros.

6) QA / Depuración rápida

F2 → overlay de hotspots (verde = OK, naranja = condiciones KO, gris = deshabilitado).

Si cambias escenas o assets y algo no pinta, limpia estado:

localStorage.removeItem("STATE_V1")


Asegúrate de servir el proyecto (no file://). Carga data/*.json y images/* con 200.

7) Checklist al añadir o editar textos

¿El hotspot tiene verb: ["look","use"] si quieres ambas rutas?

¿La clave [gl:...] es única y consistente?

¿Has puesto ::: para separar largo/corto cuando procede?

¿Hay onUseFail si esperas que falle por condiciones?

¿Desactivas el hotspot tras recoger un ítem (si aplica) con disableHotspot?

¿El fondo background existe en images/backgrounds/<id_escena>.jpg?

8) Ejemplos ya en el capítulo

Sarcasmo de USAR: use_sofa, use_ventana_cocina, use_traga, etc.

Gating con comentario: academia_bloqueada, sin_llaves.

Narrativa ramificada: jefe_oferta → jefe_aceptar → jefe_ya_en_plantilla.

Epílogo: cap0_fin (se muestra una sola vez al cumplir acepta_trabajo=true).

9) Preguntas frecuentes

¿Puedo reutilizar la misma clave [gl:...] en varios hotspots?
Puedes, pero entonces comparten memoria de “ya visto”. Normalmente conviene claves distintas.

¿Qué pasa si olvido el :::?
Nada grave: verás siempre el mismo texto (se trata como “sin versión corta”).

¿Dónde meto chistes/matices de segunda visita que no sean del glosario?
Hazlo con flags (setFlag) y condiciones (if + flag) directamente en el onUse.