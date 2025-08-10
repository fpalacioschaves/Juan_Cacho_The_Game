/* ui.js — funciones de interfaz y overlays */
const UI = (()=>{
  const elDlg = ()=> document.getElementById('dialogue');
  const elDlgText = ()=> document.getElementById('dlg-text');
  const elDlgOpts = ()=> document.getElementById('dlg-opts');
  const elNotebook = ()=> document.getElementById('notebook');
  const elNotebookList = ()=> document.getElementById('notebook-list');
  const elToast = ()=> document.getElementById('toast');

  function showDialogue(){ elDlg().classList.remove('hidden'); }
  function hideDialogue(){ elDlg().classList.add('hidden'); }
  function setDialogueText(t){ elDlgText().textContent = t; }
  function setDialogueOptions(opts){
    const wrap = elDlgOpts(); wrap.innerHTML = '';
    opts.forEach(o=>{ const b=document.createElement('button'); b.textContent=o.text; b.onclick=o.onClick; wrap.appendChild(b); });
  }

  function toggleNotebook(force){
    const el = elNotebook();
    const want = (typeof force==='boolean') ? force : el.classList.contains('hidden');
    el.classList.toggle('hidden', !want);
  }
  function updateNotebook(lines){
    const ul = elNotebookList(); ul.innerHTML = '';
    lines.forEach(t=>{ const li=document.createElement('li'); li.textContent=t; ul.appendChild(li); });
  }

  let toastTimer;
  function toast(msg){
    const el = elToast();
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> el.classList.add('hidden'), 1800);
  }

  return { showDialogue, hideDialogue, setDialogueText, setDialogueOptions, toggleNotebook, updateNotebook, toast };
})();