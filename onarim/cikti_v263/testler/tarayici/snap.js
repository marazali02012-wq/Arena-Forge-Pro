// YALNIZ TEST: profilin düz sayısal alanlarının anlık görüntüsü (window.__SNAP[ad]) ve farkı
const flat = (o, p, out, depth) => {
  if (depth > 4 || o == null) return out;
  if (typeof o === 'number' || typeof o === 'boolean' || typeof o === 'string') { if (String(o).length < 60) out[p] = o; return out; }
  if (Array.isArray(o)) { out[p + '.length'] = o.length; return out; }
  if (typeof o === 'object') for (const k of Object.keys(o)) flat(o[k], p ? p + '.' + k : k, out, depth + 1);
  return out;
};
window.__SNAP = window.__SNAP || {};
window.__snap = name => { window.__SNAP[name] = flat(JSON.parse(JSON.stringify(window.__AFE('profile'))), '', {}, 0); let ls = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!/arenaForgePro(Profile|Clock)/.test(k)) ls['LS:' + k] = (localStorage.getItem(k) || '').slice(0, 50); } } catch (e) { } Object.assign(window.__SNAP[name], ls); return Object.keys(window.__SNAP[name]).length; };
window.__diff = (a, b) => { const A = window.__SNAP[a], B = window.__SNAP[b], out = {}; for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) { if (A[k] !== B[k] && !/^(lastSeen|af328.*\.at|.*Clock|.*[tT]ime|.*\.at$|.*At$|LS:arenaForgeClock)/.test(k)) out[k] = [A[k], B[k]]; } return out; };
return 'snap hazır';
