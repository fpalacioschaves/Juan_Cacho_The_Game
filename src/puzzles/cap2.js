// src/puzzles/cap2.js
// Puzzles del Capítulo 2 (ampliables). Sin efectos hasta que se llamen.
// Usa plugin.dialogue sobre el overlay.

import runDialogue from '../plugins/plugin.dialogue.js';

/** Helpers genéricos */
function hasItemInState(state, id){
  const inv = state?.inventory;
  return Array.isArray(inv) ? inv.some(it => (it?.id ?? it) === id) : false;
}

/**
 * Puzle 1: Convencer al farmacéutico.
 * Gana si sigues el diálogo correcto o si entregas un objeto aceptado (p.ej. formulario).
 * Variante futura: exigir flag 'tiene_receta' o evento previo.
 */
export async function startPuzzleFarmacia(ctx){
  const { state } = ctx;
  state.flags = state.flags || {};

  const tree = {
    id: 'cap2_farmacia',
    title: 'Farmacia',
    start: 's_intro',
    nodes: {
      s_intro: {
        text: '— Buenas. ¿Tiene ampollas de vitaminas?\n— Depende. ¿Para quién son?',
        choices: [
          { label: 'Para mí, ando exhausto.', goto:'s_dudas' },
          { label: 'Mi médico me las recomendó.', goto:'s_medico' },
          { label: 'Tengo aquí el formulario / justificante.', goto:'s_objeto' },
          { label: 'Dejarlo.', end:true }
        ]
      },
      s_dudas: {
        text: '— Mmm… sin receta no suelo venderlas.\n— ¿Algo que pueda enseñarme?',
        choices: [
          { label: 'Insistir con educación', goto:'s_persuasivo' },
          { label: 'Ofrecer justificante/formulario', goto:'s_objeto' },
          { label: 'Mejor otro día', end:true }
        ]
      },
      s_persuasivo: {
        text: '— Vale, te daré un pack, pero cuidado con la dosis.',
        giveItem: { id:'vitaminas', name:'Ampollas de vitaminas', icon:'assets/item_vitaminas.png' },
        setFlag: { cap2_vitaminas: true },
        end: true, outcome: 'ok_dialogo'
      },
      s_medico: {
        text: '— ¿Traes receta o justificante?',
        choices: [
          { label:'Sí, aquí', goto:'s_objeto' },
          { label:'No la traje', goto:'s_dudas' }
        ]
      },
      s_objeto: {
        // Aceptamos entregar 'formulario' como llave suave. Puedes cambiarlo.
        text: '— Déjamelo ver…',
        cond: ({state}) => hasItemInState(state, 'formulario'),
        takeItem: 'formulario',
        giveItem: { id:'vitaminas', name:'Ampollas de vitaminas', icon:'assets/item_vitaminas.png' },
        setFlag: { cap2_vitaminas: true },
        end: true, outcome: 'ok_intercambio'
      },
    }
  };

  // Nodo alternativo si NO tiene el objeto aceptado
  if (!hasItemInState(state, 'formulario')){
    tree.nodes.s_objeto = {
      text: '— Sin receta ni justificante no puedo. Lo siento.',
      choices: [
        { label:'Insistir (educado)', goto:'s_persuasivo' },
        { label:'Entiendo', end:true }
      ]
    };
  }

  const res = await runDialogue(tree, ctx);
  return res; // { end:true, outcome?: 'ok_dialogo' | 'ok_intercambio' }
}

/**
 * Puzle 2 (opcional): Folleto de obra en el bar/academia.
 * Si acepta, entrega el folleto; si ya lo tiene, lo indica.
 */
export async function startPuzzleFolleto(ctx){
  const { state } = ctx;
  state.flags = state.flags || {};

  const yaLoTiene = hasItemInState(state, 'folleto_obra');

  const tree = {
    id: 'cap2_folleto',
    title: 'Mostrador',
    start: yaLoTiene ? 's_ya' : 's_intro',
    nodes: {
      s_intro: {
        text: '— ¿Tienes alguno de esos folletos de obra?\n— Nos quedan pocos, ¿para qué lo quieres?',
        choices: [
          { label: 'Curiosidad por un tema del bloque', goto:'s_entrega' },
          { label: 'Da igual', end:true }
        ]
      },
      s_entrega: {
        text: '— Toma uno. No lo pierdas.',
        giveItem: { id:'folleto_obra', name:'Folleto de obra', icon:'assets/item_folleto.png' },
        setFlag: { cap2_folleto: true },
        end: true, outcome: 'ok_folleto'
      },
      s_ya: {
        text: '— Ya te di uno antes, ¿recuerdas?',
        choices: [
          { label: 'Cierto, gracias.', end:true }
        ]
      }
    }
  };

  return runDialogue(tree, ctx);
}
