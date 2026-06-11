// ══════════════════════════════════════════════════════════════════
// recode-db.js — RECODE Training App — Supabase client partagé
// ══════════════════════════════════════════════════════════════════

const SUPABASE_URL  = 'https://ttzxfspjzupefzufgfro.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0enhmc3BqenVwZWZ6dWZnZnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzUzMjEsImV4cCI6MjA5NTAxMTMyMX0.3WA2i1t6QAMxFuIjODrGSgl8T1fufIoxufYbDFTM6GU';

// Supabase doit être chargé avant ce fichier (CDN)
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── UTILS ──────────────────────────────────────────────────────────

async function hashPin(pin) {
  const data = new TextEncoder().encode(pin + 'recode_salt_v1');
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function today() {
  return new Date().toISOString().split('T')[0];
}

// ── SESSION ────────────────────────────────────────────────────────

function getSession() {
  try { return JSON.parse(localStorage.getItem('recode_session')); } catch { return null; }
}

function setSession(data) {
  localStorage.setItem('recode_session', JSON.stringify(data));
}

function clearSession() {
  localStorage.removeItem('recode_session');
}

// Redirige vers login si pas de session. Retourne la session sinon.
function requireAuth() {
  const s = getSession();
  if (!s || !s.client_id) { window.location.href = 'login.html'; return null; }
  return s;
}

// ── AUTH ───────────────────────────────────────────────────────────

async function loginClient(email, pin) {
  const { data, error } = await db
    .rpc('rpc_verify_login', { p_email: email.toLowerCase().trim(), p_pin: pin });

  if (error || !data || !data.length) return { success: false, error: 'Email ou code PIN incorrect.' };

  const row = data[0];
  const session = {
    client_id:      row.id,
    email:          row.email,
    prenom:         row.prenom,
    is_first_login: row.is_first_login
  };
  setSession(session);
  return { success: true, session };
}

async function setNewPin(clientId, newPin) {
  const { data, error } = await db
    .rpc('rpc_set_pin', { p_client_id: clientId, p_pin: newPin });

  if (error || !data) return { success: false };
  const s = getSession();
  if (s) { s.is_first_login = false; setSession(s); }
  return { success: true };
}

function logout() {
  clearSession();
  window.location.href = 'login.html';
}

// ── SÉANCES ────────────────────────────────────────────────────────

async function getSeances(clientId, limit = 30) {
  const { data } = await db
    .from('seances')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: false })
    .limit(limit);
  return data || [];
}

async function getSeanceById(id) {
  const { data } = await db.from('seances').select('*').eq('id', id).single();
  return data || null;
}

async function createSeance(clientId, seance) {
  const { data, error } = await db
    .from('seances')
    .insert({ client_id: clientId, ...seance })
    .select().single();
  return error ? null : data;
}

async function updateSeanceStatut(seanceId, statut) {
  const { error } = await db.from('seances').update({ statut }).eq('id', seanceId);
  return !error;
}

// ── PERFS ──────────────────────────────────────────────────────────

async function getPerfs(clientId, exercice = null) {
  let q = db.from('perfs').select('*').eq('client_id', clientId).order('date', { ascending: false });
  if (exercice) q = q.eq('exercice', exercice);
  const { data } = await q.limit(100);
  return data || [];
}

async function savePerf(clientId, exercice, sets, date = null, notes = '') {
  const { data, error } = await db
    .from('perfs')
    .insert({ client_id: clientId, exercice, sets, date: date || today(), notes })
    .select().single();
  return error ? null : data;
}

// ── MÉTRIQUES ──────────────────────────────────────────────────────

async function getMetriques(clientId, type = null) {
  let q = db.from('metriques').select('*').eq('client_id', clientId).order('date', { ascending: false });
  if (type) q = q.eq('type', type);
  const { data } = await q.limit(200);
  return data || [];
}

async function saveMetrique(clientId, type, valeur, unite = 'kg', date = null, notes = '') {
  const { data, error } = await db
    .from('metriques')
    .insert({ client_id: clientId, type, valeur, unite, date: date || today(), notes })
    .select().single();
  return error ? null : data;
}

// ── HABITUDES ──────────────────────────────────────────────────────

async function getHabitudes(clientId, dateDebut = null) {
  let q = db.from('habitudes').select('*').eq('client_id', clientId).order('date', { ascending: false });
  if (dateDebut) q = q.gte('date', dateDebut);
  const { data } = await q.limit(60);
  return data || [];
}

async function saveHabitude(clientId, date, sommeil, stress, marche) {
  const { data, error } = await db
    .from('habitudes')
    .upsert({ client_id: clientId, date, sommeil, stress, marche }, { onConflict: 'client_id,date' })
    .select().single();
  return error ? null : data;
}

// ── CYCLE ──────────────────────────────────────────────────────────

async function getCycleConfig(clientId) {
  const { data } = await db.from('cycle_config').select('*').eq('client_id', clientId).single();
  return data || null;
}

async function saveCycleConfig(clientId, config) {
  const { data, error } = await db
    .from('cycle_config')
    .upsert({ client_id: clientId, ...config, updated_at: new Date().toISOString() }, { onConflict: 'client_id' })
    .select().single();
  return error ? null : data;
}

async function getCycleLogs(clientId, dateDebut = null) {
  let q = db.from('cycle_logs').select('*').eq('client_id', clientId).order('date', { ascending: false });
  if (dateDebut) q = q.gte('date', dateDebut);
  const { data } = await q.limit(90);
  return data || [];
}

async function saveCycleLog(clientId, date, logData) {
  const { data, error } = await db
    .from('cycle_logs')
    .upsert({ client_id: clientId, date, ...logData }, { onConflict: 'client_id,date' })
    .select().single();
  return error ? null : data;
}

// ── COACH ──────────────────────────────────────────────────────────

async function getAllClients() {
  const { data } = await db
    .from('clients')
    .select('id, email, prenom, created_at, is_first_login, objectif')
    .order('prenom', { ascending: true });
  return data || [];
}

async function createClientDB(prenom, email, pin, objectif = '') {
  const pinHash = await hashPin(pin);
  const { data, error } = await db
    .from('clients')
    .insert({ prenom, email: email.toLowerCase().trim(), pin_hash: pinHash, is_first_login: true, objectif })
    .select('id, email, prenom')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, client: data };
}

async function getClientData(clientId) {
  const { data } = await db
    .from('clients')
    .select('id, email, prenom, objectif, created_at')
    .eq('id', clientId)
    .single();
  return data || null;
}
