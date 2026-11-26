// Named, password-free profiles on this device. Existing private sync codes are optional.
import { SUPABASE_URL as URL_, SUPABASE_KEY as KEY } from './config.js';
import * as idb from './idb.js';

const MAP_KEY='hsk5-named-profiles-v1', START_KEY='hsk5-start-profile-v1', LEGACY_KEY='hsk5-legacy-profile-v1';
export const PROFILE_NAMES=['Boyfriend','Girlfriend'];
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let profile=null, name=null;
export const userId=()=>profile;
export const profileName=()=>name;
export const getSession=()=>profile?{profile,name}:null;
export function namedProfiles(){
  try {const v=JSON.parse(localStorage.getItem(MAP_KEY)||'{}');return Object.fromEntries(PROFILE_NAMES.filter(n=>UUID.test(v?.[n]||'')).map(n=>[n,v[n].toLowerCase()]));}
  catch{return {};}
}
const writeMap=m=>localStorage.setItem(MAP_KEY,JSON.stringify(m));
export async function legacyProfile(){
  let id=localStorage.getItem(LEGACY_KEY)||localStorage.getItem('hsk5-profile');
  if(!id){id=await idb.get('kv','profile');}
  if(!UUID.test(id||''))return null;
  id=id.toLowerCase();localStorage.setItem(LEGACY_KEY,id);return id;
}
async function checkCode(code){
  const id=code.trim().toLowerCase();
  if(!UUID.test(id))throw new Error("That doesn't look like a sync code.");
  const r=await fetch(URL_+'/rest/v1/settings?select=user_id&user_id=eq.'+id,{headers:{apikey:KEY}});
  if(!r.ok)throw new Error("Couldn't reach the server ("+r.status+").");
  if(!(await r.json()).length)throw new Error('No saved progress was found for that code.');
  return id;
}
export async function chooseProfile(n,{code='',legacy=false}={}){
  if(!PROFILE_NAMES.includes(n))throw new Error('Choose a profile.');
  const map=namedProfiles(),old=await legacyProfile();
  if((code||legacy)&&map[n])throw new Error('This profile is already set up on this device.');
  const id=map[n]||(legacy?old:code?await checkCode(code):crypto.randomUUID());
  if(!id)throw new Error('No previous progress was found on this device.');
  if(Object.entries(map).some(([k,v])=>k!==n&&v===id))throw new Error('That progress is already linked to the other profile.');
  map[n]=id;writeMap(map);
  sessionStorage.setItem(START_KEY,JSON.stringify({name:n}));
}
export async function loadSession(){
  const pending=sessionStorage.getItem(START_KEY);sessionStorage.removeItem(START_KEY);
  if(!pending)return null;
  let n;try{n=JSON.parse(pending).name;}catch{return null;}
  const id=namedProfiles()[n];if(!id)return null;
  const old=await legacyProfile();
  idb.selectProfile(id,id===old);profile=id;name=n;return profile;
}
export async function forgetProfile(){
  if(!profile)return;
  const map=namedProfiles();delete map[name];writeMap(map);
  if(localStorage.getItem(LEGACY_KEY)===profile){localStorage.removeItem(LEGACY_KEY);localStorage.removeItem('hsk5-profile');}
  profile=null;name=null;sessionStorage.removeItem(START_KEY);
}

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
