/**
 * src/api/v1/contracts.js
 * Tipos y validadores ligeros (sin side-effects). Útil para desarrollo
 * y como contrato estable. No hace nada si no lo importas.
 */

/**
 * @typedef {Object} Item
 * @property {string} id
 * @property {string} [name]
 * @property {string} [icon]
 */

/**
 * @typedef {Object} GameState
 * @property {Array<Item>} inventory
 * @property {Object<string,any>} flags
 * @property {string} [goal]
 * @property {string} [version]
 */

/** HUD v1: firma esperada por las escenas */
export const HUDContract = {
  methods: ['setObjective','addItem','setInventory','render'],
};

/** SaveManager v1 */
export const SaveContract = {
  methods: ['save','load'],
  optional: ['migrate'],
};

/** Dev-time: validador no intrusivo (NO lanza en producción) */
export function devValidateContract(obj, contract, label='contract'){
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') return true;
  const missing = contract.methods.filter(m => typeof obj?.[m] !== 'function');
  if (missing.length){
    console.warn(`[dev] ${label} incompleto: faltan métodos`, missing);
    return false;
  }
  return true;
}
