export function showToast(text) {
  const el = document.getElementById('toast');
  el.textContent = text;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>{ el.textContent=''; }, 2000);
}
export function inRect(x, y, [rx, ry, rw, rh]) {
  return x >= rx && y >= ry && x <= rx+rw && y <= ry+rh;
}
