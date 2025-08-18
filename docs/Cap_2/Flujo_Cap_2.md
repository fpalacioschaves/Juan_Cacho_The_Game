Flujo de Capítulo 1 (canónico)

Salón de Juan → “prepararse para salir”

Puzzle breve de casa (sin items):

reloj_pared.onLook → setFlag reloj_visto=true (línea sarcástica).

agenda_postit.onUse → setFlag agenda_revisada=true.

salir_casa.onUse:

si reloj_visto && agenda_revisada ⇒ setFlag puzzle_casa_superado=true y sales normal.

si no ⇒ sales igual pero quedas “potencialmente tarde” (lo castiga el jefe cuando vuelvas).

Comentario: así cumples el “si no superas un puzzle en casa ⇒ bronca del jefe al volver”.

Portal

Nieves (flirteo): nieves.onUse ⇒ setFlag hablo_con_nieves=true y setFlag acceso_gimnasio=true.

Sin esta charla, la puerta_gimnasio en calle no abre (condición).

Portera: solo conversación y pullas; si mareo=true → réplica “tienes mala cara”.

Subir_piso_odon: NO se puede aún. Más tarde exigirá vitaminas_compradas=true y horario_entregado=true.

Gimnasio del barrio

Monitor: monitor_gym.onUse ⇒ setFlag cinta_sugerida=true.

Cinta: requiere cinta_sugerida=true. Al usar ⇒ setFlag mareo=true + setFlag urgente_vitaminas=true.

Si no hay mareo, farmacia no vende (ver abajo).

Farmacia

Mostrador: solo si mareo=true || urgente_vitaminas=true ⇒ setFlag vitaminas_compradas=true.

Si no, línea de “aquí solo placebos”.

Academia La Milagrosa (recepción)

Primera visita al jefe: setFlag oferta_trabajo=true (charla larga y te dice “vuelve para el horario”).

Vuelta al jefe (cuando tú quieras):

Si puzzle_casa_superado=false ⇒ bronca setFlag bronca_jefe=true (no entrega horario).

Si puzzle_casa_superado=true ⇒ da horario setFlag horario_entregado=true.

(No necesitamos “aceptar trabajo” aún si no quieres; el gating real es horario_entregado.)

Piso de Odón / Reunión de vecinos

Entrada desde Portal solo si ambas: vitaminas_compradas=true y horario_entregado=true.

En escena: diálogos costumbristas; tetera_barro.onUse dispara evento:

setFlag reunion_ok=true + setFlag remedios_muerte=true.

Salida a Portal/Calle.

Fin de capítulo: al volver a calle_barrio con remedios_muerte=true ⇒ [gl:cap1_fin] + setFlag cap1_fin=true.