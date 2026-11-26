// Minimal Supabase client (Auth + PostgREST) over fetch, so the app has no external JS dependencies.
import { SUPABASE_URL as URL_, SUPABASE_KEY as KEY } from './config.js';
import * as idb from './idb.js';

let session = null;
export const getSession = () => session;
export const userId = () => session?.user?.id;

async function saveSession(s) {
  session = s ? { ...s, expires_at: s.expires_at || Math.floor(Date.now() / 1000) + (s.expires_in || 3600) } : null;
  await idb.put('kv', 'session', session);
}
export async function loadSession() { session = (await idb.get('kv', 'session')) || null; return session; }

async function authCall(path, body) {
  const r = await fetch(`${URL_}/auth/v1/${path}`, {
    method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.msg || j.error_description || j.message || `Auth error ${r.status}`);
  return j;
}

export async function signIn(email, password) {
  const j = await authCall('token?grant_type=password', { email, password });
  await saveSession(j); return j;
}
export async function signUp(email, password) {
  const redirect = encodeURIComponent(location.origin + location.pathname);
  const j = await authCall(`signup?redirect_to=${redirect}`, { email, password });
  if (j.access_token) { await saveSession(j); return { session: true }; }
  return { session: false };
}
export async function signOut() {
  try { if (session) await fetch(`${URL_}/auth/v1/logout`, { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${session.access_token}` } }); } catch {}
  await saveSession(null);
}
let refreshing = null;
async function refresh() {
  if (!session?.refresh_token) throw new Error('Not signed in');
  if (!refreshing) refreshing = authCall('token?grant_type=refresh_token', { refresh_token: session.refresh_token })
    .then(saveSession).finally(() => { refreshing = null; });
  return refreshing;
}

/** REST call against PostgREST with auto token refresh. */
export async function rest(path, { method = 'GET', body, prefer, retry = true } = {}) {
  if (!session) throw new Error('Not signed in');
  if (session.expires_at - 60 < Date.now() / 1000) await refresh();
  const headers = { apikey: KEY, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' };
  if (prefer) headers.Prefer = prefer;
  const r = await fetch(`${URL_}/rest/v1/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (r.status === 401 && retry) { await refresh(); return rest(path, { method, body, prefer, retry: false }); }
  if (!r.ok) { const t = await r.text(); throw new Error(`${r.status} ${t.slice(0, 200)}`); }
  if (r.status === 204) return null;
  const t = await r.text(); return t ? JSON.parse(t) : null;
}
