/* /public/js/ui.js — UI para Pistas y Resolver */
const UI = (()=>{
  // refs
  const elToast = ()=> document.getElementById('toast');
  const elDlg = ()=> document.getElementById('dialogue');
  const elDlgText = ()=> document.getElementById('dlg-text');
  const elDlgOpts = ()=> document.getElementById('dlg-opts');
  const elNotebook = ()=> document.getElementById('notebook');
  const elNotebookList = ()=> document.getElementById('notebook-list');
  const elCluesbar = ()=> document.getElementById('cluesbar');
  const btnSolve = ()=> document.getElementById('btn-solve');
  const elSolver = ()=> document.getElementById('solver');

  // Toast
  let toastTimer;
  function toast(msg){
    const el = elToast(); el.textContent = msg; el.classList.remove('hidden');
    clearTimeout(toastTimer); toastTimer = setTimeout(()=> el.classList.add('hidden'), 1800);
  }

  // Notebook
  function toggleNotebook(force){
    const el = elNotebook();
    const want = (typeof force==='boolean') ? force : el.classList.contains('hidden');
    el.classList.toggle('hidden', !want);
  }
  function updateNotebook(lines){
    const ul = elNotebookList(); ul.innerHTML=''; lines.forEach(t=>{ const li=document.createElement('li'); li.textContent=t; ul.appendChild(li); });
  }

  // Clues bar
  function updateClues(clueIds, meta){
    const bar = elCluesbar(); bar.innerHTML='';
    clueIds.forEach(id=>{
      const c = document.createElement('div'); c.className='clue';
      const dot = document.createElement('span'); dot.className='dot';
      const name = document.createElement('span'); name.textContent = meta[id]?.name || id;
      c.appendChild(dot); c.appendChild(name); bar.appendChild(c);
    });
  }

  // Dialogue
  function showDialogue(){ elDlg().classList.remove('hidden'); }
  function hideDialogue(){ elDlg().classList.add('hidden'); }
  function setDialogueText(t){ elDlgText().textContent = t; }
  function setDialogueOptions(opts){
    const wrap = elDlgOpts(); wrap.innerHTML='';
    (opts||[]).forEach(o=>{ const b=document.createElement('button'); b.textContent=o.text; b.onclick=o.onClick; wrap.appendChild(b); });
  }

  // Solve panel
  function setSolveEnabled(v){ btnSolve().disabled = !v; }
  function showSolver({spec, clues, onSubmit}){
    const el = elSolver();
    const form = document.getElementById('solve-form');
    const instructions = document.getElementById('solve-instructions');
    // build form
    form.innerHTML='';
    const slots = spec.solve?.slots || [];
    instructions.textContent = spec.solve?.hint || 'Ordena las pistas correctas en su lugar.';
    // Build one select per slot
    const options = clues.map(c=> ({value:c.id, label:c.name}));
    const selects = [];
    slots.forEach((slot,i)=>{
      const row = document.createElement('div'); row.className='solve-slot';
      const label = document.createElement('label'); label.textContent = slot.label || `Paso ${i+1}`;
      const sel = document.createElement('select'); sel.setAttribute('data-slot', slot.id||`slot_${i}`);
      // placeholder
      const ph = document.createElement('option'); ph.value=''; ph.textContent='— elige una pista —'; sel.appendChild(ph);
      options.forEach(o=>{ const op=document.createElement('option'); op.value=o.value; op.textContent=o.label; sel.appendChild(op); });
      row.appendChild(label); row.appendChild(sel); form.appendChild(row); selects.push(sel);
    });
    // buttons
    document.getElementById('solve-submit').onclick = ()=>{
      const selected = selects.map(s=> s.value).filter(Boolean);
      onSubmit(selected);
    };
    document.getElementById('solve-cancel').onclick = ()=> hideSolver();
    el.classList.remove('hidden');
  }
  function hideSolver(){ elSolver().classList.add('hidden'); }

  return {
    toast, toggleNotebook, updateNotebook,
    updateClues, setSolveEnabled,
    showDialogue, hideDialogue, setDialogueText, setDialogueOptions,
    showSolver, hideSolver
  };
})();
