// Tiny IndexedDB wrapper: stores "cards" (key = word_id:kind), "logs" (key = client_id), "kv".
const DB_NAME = 'hsk5', VER = 1;
let dbp;
function open() {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, VER);
    r.onupgradeneeded = () => {
      const db = r.result;
      for (const s of ['cards', 'logs', 'kv']) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s);
    };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  return dbp;
}
const tx = async (store, mode, fn) => {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(store, mode); const s = t.objectStore(store);
    const out = fn(s);
    t.oncomplete = () => res(out && 'result' in out ? out.result : out);
    t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
  });
};
export const get = (store, key) => tx(store, 'readonly', (s) => s.get(key));
export const put = (store, key, val) => tx(store, 'readwrite', (s) => { s.put(val, key); });
export const putMany = (store, entries) => tx(store, 'readwrite', (s) => { for (const [k, v] of entries) s.put(v, k); });
export const del = (store, key) => tx(store, 'readwrite', (s) => { s.delete(key); });
export const clear = (store) => tx(store, 'readwrite', (s) => { s.clear(); });
export async function all(store) {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(store, 'readonly'); const s = t.objectStore(store);
    const keys = s.getAllKeys(); const vals = s.getAll();
    t.oncomplete = () => res(keys.result.map((k, i) => [k, vals.result[i]]));
    t.onerror = () => rej(t.error);
  });
}
