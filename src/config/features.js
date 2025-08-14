/**
 * src/config/features.js
 * Feature flags (v1). TODO: activar explícitamente por capítulo cuando toque.
 */
const features = {
  hotspotBlink: false,   // Parpadeo de hotspot tras inactividad
  autosave: false,       // Autosave centralizado (si tu build ya guarda, dejar en false)
  analytics: false,      // Telemetría local (sin red)
  debugHUD: false,       // Overlay de debug
};
export default features;
