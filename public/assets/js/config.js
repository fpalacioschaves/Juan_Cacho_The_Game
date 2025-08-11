// Resuelve la base a partir del <base href> si existe
export const BASE_HREF =
  document.querySelector('base')?.href ?? new URL('./', location.href).href;

// Construye URLs absolutas a partir de la base
export const urlFromBase = (path) => new URL(path, BASE_HREF).href;

// Helper para la API
export const apiUrl = (endpoint) => urlFromBase(`api/${endpoint}`);
