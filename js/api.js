// Minimal Supabase REST client over fetch. No login: data is keyed by a profile id
// generated on this device. The sync code (= profile id) restores progress on another device.
import { SUPABASE_URL as URL_, SUPABASE_KEY as KEY } from './config.js';
import * as idb from './idb.js';

let profile = null;
export const userId = () => profile;
export const getSession = () => (profile ? { profile } : null);

export async function loadSession() {
  profile = (await idb.get('kv', 'profile')) || localStorage.getItem('hsk5-profile') || null;
  if (profile) localStorage.setItem('hsk5-profile', profile);
  return profile;
}
async function setProfile(id) {
  profile = id;
  await idb.put('kv', 'profile', id);
  if (id) localStorage.setItem('hsk5-profile', id); else localStorage.removeItem('hsk5-profile');
}
export const newProfile = () => setProfile(crypto.randomUUID());

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Restore from a sync code. Returns false if the code has no data on the server. */
export async function useSyncCode(code) {
  const id = code.trim().toLowerCase();
  if (!UUID.test(id)) throw new Error("That doesn't look like a sync code.");
  const r = await fetch(`${URL_}/rest/v1/settings?select=user_id&user_id=eq.${id}`, { headers: { apikey: KEY } });
  if (!r.ok) throw new Error(`Couldn't reach the server (${r.status}).`);
  const rows = await r.json();
  if (!rows.length) throw new Error('No saved progress was found for that code.');
  await setProfile(id);
  return true;
}
export const forgetProfile = () => setProfile(null);

/** REST call against PostgREST. */
export async function rest(path, { method = 'GET', body, prefer } = {}) {
  if (!profile) throw new Error('No profile');
  const headers = { apikey: KEY, 'Content-Type': 'application/json' };
  if (prefer) headers.Prefer = prefer;
  const r = await fetch(`${URL_}/rest/v1/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) { const t = await r.text(); throw new Error(`${r.status} ${t.slice(0, 200)}`); }
  if (r.status === 204) return null;
  const t = await r.text(); return t ? JSON.parse(t) : null;
}
