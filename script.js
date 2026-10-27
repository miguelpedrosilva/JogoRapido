import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, doc, setDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

/* ===================== FIREBASE ===================== */
const firebaseConfig = {
  apiKey: "AIzaSyCV9cT05AdtOl2jMg4hSlVNaq5RR80fDYE",
  authDomain: "jogo-rapido-2e228.firebaseapp.com",
  projectId: "jogo-rapido-2e228",
  storageBucket: "jogo-rapido-2e228.firebasestorage.app",
  messagingSenderId: "249528555021",
  appId: "1:249528555021:web:ed9440a947e09c77d6a744"
};
const fbApp = initializeApp(firebaseConfig);
const fdb = getFirestore(fbApp);
const STATE_REF = doc(fdb, 'jogorapido', 'state');

/* ===================== CONFIGURAÇÃO ===================== */
const TESTE = true; // true = modo teste. Na versão oficial, coloque false.

const PINS = {
  jogador: ['JR-482','JR-917','JR-305','JR-661','JR-128','JR-774','JR-239','JR-590','JR-846','JR-013','JR-708','JR-364','JR-955','JR-472','JR-281','JR-619','JR-837','JR-156','JR-694','JR-421','JR-073','JR-530'],
  tecnico: ['TEC-X7Q2','TEC-P4W9'],
  arbitro: ['JUIZ-Q7M4']
};
const DEVK = 'jr_device_t1', SEENK = 'jr_seen_t1', ATTK = 'jr_att_t1', THEMEK = 'jr_theme_t1';
const BANNED = ['idiota','burro','imbecil','otario','lixo','merda','porra','caralho','fdp'];
const POS = ['Goleiro','Zagueiro','Lateral direito','Lateral esquerdo','Volante','Meia',
             'Meia-atacante','Ponta esquerda','Ponta direita','Centroavante'];
const COMPAT = {
  'Goleiro': ['GOL'], 'Zagueiro': ['ZAG','LD','LE','VOL'], 'Lateral direito': ['LD','ZAG','LE'],
  'Lateral esquerdo': ['LE','ZAG','LD'], 'Volante': ['VOL','MEI','ZAG'], 'Meia': ['MEI','VOL','MAT'],
  'Meia-atacante': ['MAT','MEI','PE','PD','CA'], 'Ponta esquerda': ['PE','PD','MAT','CA'],
  'Ponta direita': ['PD','PE','MAT','CA'], 'Centroavante': ['CA','MAT','PE','PD']
};
const FORM = {
  Campo: {
    '4-3-3':   [['GOL'],['LD','ZAG','ZAG','LE'],['VOL','MEI','MEI'],['PE','CA','PD']],
    '4-4-2':   [['GOL'],['LD','ZAG','ZAG','LE'],['PE','VOL','VOL','PD'],['CA','CA']],
    '4-2-3-1': [['GOL'],['LD','ZAG','ZAG','LE'],['VOL','VOL'],['PE','MAT','PD'],['CA']],
    '3-5-2':   [['GOL'],['ZAG','ZAG','ZAG'],['LD','VOL','MEI','VOL','LE'],['CA','CA']],
    '3-4-3':   [['GOL'],['ZAG','ZAG','ZAG'],['LD','VOL','VOL','LE'],['PE','CA','PD']]
  },
  Quadra: {
    '2-2':   [['GOL'],['LD','LE'],['MEI','CA']],
    '1-2-1': [['GOL'],['ZAG','ZAG'],['MEI'],['CA']]
  }
};
const DEF_FORM = { Campo: '4-3-3', Quadra: '2-2' };
const PAGE_TITLES = { inicio:'Tela Inicial', jogador:'Jogador', tecnico:'Técnico', arbitro:'Árbitro', torcida:'Torcida & Votação' };
const JANELA_PRE_MIN = 30;

/* ===================== ÍCONES ===================== */
const SVG = inner => `<svg viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
const IC = {
  gol: SVG('<circle cx="12" cy="12" r="10.5" fill="#fff" stroke="#111" stroke-width="1.2"/><polygon points="12,7.6 15.6,10.2 14.2,14.4 9.8,14.4 8.4,10.2" fill="#111"/><path d="M12 7.6V2.6M15.6 10.2L20.4 8.6M14.2 14.4L17.6 19M9.8 14.4L6.4 19M8.4 10.2L3.6 8.6" stroke="#111" stroke-width="1" fill="none"/>'),
  ass: SVG('<path d="M4 4.5h5.5l1.2 7.2 8.3 1.5c1.6.3 2.5 1.3 2.5 2.8V18H4z" fill="#fff" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/><path d="M4 18h17" stroke="#111" stroke-width="1.4"/>'),
  am: SVG('<rect x="6.5" y="3" width="11" height="18" rx="2" fill="#facc15" stroke="#111" stroke-width=".8"/>'),
  ve: SVG('<rect x="6.5" y="3" width="11" height="18" rx="2" fill="#ef4444" stroke="#111" stroke-width=".8"/>'),
  arb: SVG('<rect x="6" y="3" width="12" height="11" rx="1" fill="#e5e7eb"/><rect x="3" y="13.5" width="18" height="3.2" rx="1.6" fill="#e5e7eb"/><rect x="6" y="10" width="12" height="2.2" fill="#111"/>'),
  vot: SVG('<path d="M3 20.5h18M3.5 3v17.5" stroke="#94a3b8" stroke-width="1.6" fill="none"/><polyline points="5.5,16 10,10.5 14,13.5 20,6" fill="none" stroke="#facc15" stroke-width="2.4" stroke-linejoin="round"/>'),
  jog: SVG('<circle cx="12" cy="12" r="10" fill="#22c55e"/><circle cx="12" cy="9.5" r="3.2" fill="#fff"/><path d="M6.5 19c1-3 3-4.5 5.5-4.5s4.5 1.5 5.5 4.5" fill="#fff"/>'),
  tec: SVG('<rect x="5" y="4" width="14" height="17" rx="2" fill="#f97316"/><rect x="9" y="2.5" width="6" height="3" rx="1" fill="#e5e7eb"/><path d="M8 10h8M8 14h8" stroke="#fff" stroke-width="1.4"/>'),
  star: SVG('<polygon points="12,3 14.6,9 21,9.3 16,13.3 17.7,19.6 12,16.2 6.3,19.6 8,13.3 3,9.3 9.4,9" fill="#facc15"/>'),
  heart: SVG('<path d="M12 21s-7.5-4.6-9.5-9C1.2 8.4 3.2 4.5 7 4.5c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3.8 0 5.8 3.9 4.5 7.5C19.5 16.4 12 21 12 21z" fill="#f43f5e"/>'),
  trofeu: SVG('<path d="M7 4h10v4a5 5 0 0 1-10 0z" fill="#facc15"/><path d="M5 5H3v2a4 4 0 0 0 4 4M19 5h2v2a4 4 0 0 1-4 4M10 14h4v4h2v2H8v-2h2z" fill="#facc15"/>')
};
const icon = k => IC[k] || '';
function badges(s) {
  const out = [];
  if (s.gols) out.push(`<span class="bd">${IC.gol}${s.gols}</span>`);
  if (s.ass) out.push(`<span class="bd">${IC.ass}${s.ass}</span>`);
  if (s.am) out.push(`<span class="bd">${IC.am}${s.am}</span>`);
  if (s.ve) out.push(`<span class="bd">${IC.ve}${s.ve}</span>`);
  return out.join(' ');
}

/* ===================== UTILITÁRIOS ===================== */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pick = a => a[Math.floor(Math.random() * a.length)];
const dname = p => p.nick || p.name;
const initial = p => (dname(p) || '?').trim().charAt(0).toUpperCase();
const pad = n => String(n).padStart(2, '0');
const fmt = s => { s = Math.floor(s); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); };
const avatar = (p, cls = '') => p.photo
  ? `<img class="av ${cls}" src="${p.photo}" alt="">`
  : `<span class="av ${cls}">${esc(initial(p))}</span>`;
const otherTeam = t => t === 'A' ? 'B' : 'A';
const teamOf = t => (db.teams[t] && db.teams[t].nome) || 'Time ' + t;
const notaTxt = n => n == null ? '—' : n.toFixed(1);
const nameOf = id => { const p = findP(id); return p ? dname(p) : '—'; };
const dev = () => device();
function pickBtn(p, id) {
  return `<button class="pick" data-id="${esc(id)}">${avatar(p, 'sm')}<span>${esc(dname(p))}<small>#${p.shirt} · ${esc(p.pos)}</small></span></button>`;
}
function bindPick(scope, fn) {
  document.querySelectorAll(`${scope} [data-id]`).forEach(b => { b.onclick = () => fn(b.dataset.id); });
}
const PELES = ['#f1c27d','#e0ac69','#c68642','#8d5524','#ffdbac'];
const CABELOS = ['#1c1917','#3f2a1d','#78350f','#0f0f0f','#a16207'];
function fakeFoto(num, cor) {
  const pele = pick(PELES), cab = pick(CABELOS);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#1e293b"/>
    <path d="M14 100 Q16 64 50 62 Q84 64 86 100Z" fill="${cor}"/>
    <rect x="44" y="52" width="12" height="12" fill="${pele}"/>
    <circle cx="50" cy="38" r="17" fill="${pele}"/>
    <path d="M33 36 Q50 12 67 36 Q62 24 50 24 Q38 24 33 36Z" fill="${cab}"/>
    <circle cx="44" cy="39" r="2" fill="#111"/><circle cx="56" cy="39" r="2" fill="#111"/>
    ${num ? `<text x="50" y="92" font-size="18" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="bold">${num}</text>` : ''}
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function toast(msg, type = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  $('toastBox').appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2800);
}
function openModal(html) { $('modalBody').innerHTML = html; $('modal').showModal(); }
function closeModal() { $('modal').close(); }
function compress(file) {
  return new Promise(res => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 160 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => { URL.revokeObjectURL(url); res(null); };
    img.src = url;
  });
}

/* ===================== BANCO DE DADOS (FIRESTORE) ===================== */
function emptyLineup(mod) { return { formation: DEF_FORM[mod], slots: [] }; }
function emptyTeam() { return { nome: '', lineup: { Campo: emptyLineup('Campo'), Quadra: emptyLineup('Quadra') } }; }
function defaultDb() {
  return {
    players: [], techs: [], ref: null, fans: [],
    pinsUsed: {},
    teams: { A: emptyTeam(), B: emptyTeam() },
    matches: [],
    votes: {},       // chave (pre-ID ou ID da partida) -> { device: { picks: { playerId: nota }, naoViu?: bool } }
    comments: [],    // {id, text, at, device, likes: { h: [devices], g: [devices] }}
    escMod: 'Campo',
    tutorialDone: false
  };
}
function normalize(d) {
  if (!d) return defaultDb();
  const out = { ...defaultDb(), ...d };
  ['A','B'].forEach(t => {
    const src = (d.teams && d.teams[t]) || {};
    out.teams[t] = {
      nome: src.nome || '',
      lineup: {
        Campo:  { ...emptyLineup('Campo'),  ...((src.lineup && src.lineup.Campo)  || {}) },
        Quadra: { ...emptyLineup('Quadra'), ...((src.lineup && src.lineup.Quadra) || {}) }
      }
    };
  });
  return out;
}
let db = defaultDb();
let synced = false;
function save() {
  const clean = JSON.parse(JSON.stringify(db));
  setDoc(STATE_REF, clean).catch(() => toast('Sem conexão com o banco. Tente de novo.', 'bad'));
}
function device() {
  let d = localStorage.getItem(DEVK);
  if (!d) {
    d = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(DEVK, d);
  }
  return d;
}
function me() {
  const d = device();
  const p = db.players.find(x => x.device === d); if (p) return { role: 'jogador', rec: p };
  const t = db.techs.find(x => x.device === d);   if (t) return { role: 'tecnico', rec: t };
  if (db.ref && db.ref.device === d) return { role: 'arbitro', rec: db.ref };
  const f = db.fans.find(x => x.device === d);    if (f) return { role: 'torcedor', rec: f };
  return null;
}
const ROLE_NAME = { jogador:'jogador', tecnico:'técnico', arbitro:'árbitro', torcedor:'torcedor' };
const findP = id => db.players.find(p => p.id === id);
const myTeam = () => { const r = me(); return r && r.role === 'tecnico' ? r.rec.team : null; };

/* ===================== SEGURANÇA: PIN ===================== */
function attState() { try { return JSON.parse(localStorage.getItem(ATTK)) || { n: 0, until: 0 }; } catch (e) { return { n: 0, until: 0 }; } }
function lockSecs() { const s = attState(); return s.until > Date.now() ? Math.ceil((s.until - Date.now()) / 1000) : 0; }
function failAttempt() {
  const s = attState(); s.n++;
  if (s.n >= 5) { s.n = 0; s.until = Date.now() + 60000; }
  localStorage.setItem(ATTK, JSON.stringify(s));
}
function validPin(pin, lista) {
  if (TESTE) return null;
  const l = lockSecs();
  if (l) return `Muitas tentativas. Aguarde ${l}s.`;
  if (!lista.includes(pin)) { failAttempt(); return 'PIN inválido para este perfil.'; }
  if (db.pinsUsed[pin]) return 'Este PIN já foi usado em outro aparelho.';
  localStorage.removeItem(ATTK);
  return null;
}

/* ===================== ESCALAÇÃO ===================== */
function curMod() { return db.escMod === 'Quadra' ? 'Quadra' : 'Campo'; }
function slotsOf(f, mod) {
  const lines = FORM[mod][f] || FORM[mod][DEF_FORM[mod]];
  const m = lines.length, out = [];
  lines.forEach((line, i) => {
    const y = i === 0 ? 90 : 72 - (i - 1) * (56 / (m - 2));
    line.forEach((code, k) => out.push({ code, x: (k + 1) * 100 / (line.length + 1), y }));
  });
  return out;
}
function tm(team, mod = curMod()) {
  const L = db.teams[team].lineup[mod];
  if (!FORM[mod][L.formation]) L.formation = DEF_FORM[mod];
  const n = slotsOf(L.formation, mod).length;
  if (!Array.isArray(L.slots) || L.slots.length !== n) L.slots = Array(n).fill(null);
  return L;
}
function membersOf(team, mod = curMod()) {
  return db.players.filter(p => p.team === team && (p.mod === 'Os dois' || p.mod === mod)).map(p => p.id);
}
function placeAuto(team, p, mod = curMod()) {
  const L = tm(team, mod);
  const codes = slotsOf(L.formation, mod).map(s => s.code);
  for (const c of (COMPAT[p.pos] || [])) {
    const i = codes.findIndex((cc, k) => cc === c && !L.slots[k]);
    if (i >= 0) { L.slots[i] = p.id; return true; }
  }
  return false;
}
function reflow(team, mod = curMod()) {
  const L = tm(team, mod);
  L.slots = Array(slotsOf(L.formation, mod).length).fill(null);
  membersOf(team, mod).forEach(id => { const p = findP(id); if (p) placeAuto(team, p, mod); });
}

/* ===================== PARTIDA ===================== */
const cur = () => { const m = db.matches[db.matches.length - 1]; return m && m.status !== 'finished' ? m : null; };
const lastMatch = () => db.matches[db.matches.length - 1] || null;
const lastFinished = () => [...db.matches].reverse().find(m => m.status === 'finished') || null;
function statusTxt(m) {
  if (!m) return 'Nenhum jogo cadastrado';
  return { idle: 'Aguardando início', live: m.current === 2 ? '2º tempo' : '1º tempo',
           paused: 'Pausado', break: 'Intervalo', finished: 'Partida encerrada' }[m.status];
}
function rosterOf(m, team) {
  if (m && m.roster) return m.roster[team];
  return membersOf(team, m ? m.info.mod : curMod());
}
function startersOf(m, team) {
  if (m && m.starters) return m.starters[team];
  return tm(team, m ? m.info.mod : curMod()).slots;
}
function formOf(m, team) {
  if (m && m.form) return m.form[team];
  return tm(team, m ? m.info.mod : curMod()).formation;
}
function elapsedCur(m) {
  return m.status === 'live' && m.startedAt ? m.base + (Date.now() - m.startedAt) / 1000 : m.base;
}
function totalSecs(m) { return m.current === 2 ? (m.h1 || 0) + elapsedCur(m) : elapsedCur(m); }
function curMinute(m) { return Math.floor(totalSecs(m) / 60) + 1; }
function scoreOf(m) {
  const s = { A: 0, B: 0 };
  (m.events || []).forEach(e => { if (e.tipo === 'goal') s[e.team]++; });
  return s;
}
function matchStats(m, pid) {
  const s = { gols: 0, ass: 0, am: 0, ve: 0 };
  if (!m) return s;
  (m.events || []).forEach(e => {
    if (e.tipo === 'goal' && e.jog === pid) s.gols++;
    if (e.tipo === 'goal' && e.ass === pid) s.ass++;
    if (e.tipo === 'yellow' && e.jog === pid) s.am++;
    if (e.tipo === 'red' && e.jog === pid) s.ve++;
  });
  return s;
}

/* ===================== VOTAÇÃO ===================== */
function preState() {
  const m = cur();
  if (!m || m.status !== 'idle') return 'sem';
  if (!m.info.date) return 'aberta';
  const t = new Date(m.info.date).getTime();
  const agora = Date.now();
  if (agora < t - JANELA_PRE_MIN * 60000) return 'antes';
  if (agora < t) return 'aberta';
  return 'fechada';
}
function postState() {
  const lf = lastFinished();
  const c = cur();
  if (!lf || (c && c.status === 'live')) return 'sem';
  const v = (db.votes[lf.id] || {})[dev()];
  if (!v) return 'post';
  return v.naoViu ? 'naoviu' : 'votou';
}
function preVotes() {
  const m = cur();
  if (!m) return {};
  return (db.votes['pre-' + m.id] || {})[dev()] || { picks: {} };
}
function votePre(pid, nota) {
  const m = cur(); if (!m) return;
  const key = 'pre-' + m.id;
  if (!db.votes[key]) db.votes[key] = {};
  if (!db.votes[key][dev()]) db.votes[key][dev()] = { picks: {} };
  const v = db.votes[key][dev()];
  if (v.picks[pid] != null) return toast('Você já votou neste jogador.', 'bad');
  v.picks[pid] = nota;
  save();
  toast('Voto registrado!', 'ok');
}
function votePost(pid, nota) {
  const lf = lastFinished(); if (!lf) return;
  if (!db.votes[lf.id]) db.votes[lf.id] = {};
  db.votes[lf.id][dev()] = { picks: { [pid]: nota } };
  save();
  toast('Voto registrado!', 'ok');
}
function voteNaoViu() {
  const lf = lastFinished(); if (!lf) return;
  if (!db.votes[lf.id]) db.votes[lf.id] = {};
  db.votes[lf.id][dev()] = { naoViu: true, picks: {} };
  save();
  toast('Ok! Você volta no próximo jogo.', 'ok');
}
/* Contador: soma os votos de todas as fases. Nota oficial: só a votação depois do jogo */
function votosDe(pid) {
  let n = 0, soma = 0, qtd = 0;
  Object.entries(db.votes).forEach(([key, mv]) => {
    Object.values(mv).forEach(v => {
      if (!v.picks || v.picks[pid] == null) return;
      n++;
      if (!key.startsWith('pre-')) { qtd++; soma += v.picks[pid]; }
    });
  });
  return { n, media: qtd ? soma / qtd : null };
}

/* ===================== ESTATÍSTICAS E CONQUISTAS ===================== */
function statsOf(pid) {
  const s = { gols: 0, ass: 0, am: 0, ve: 0, jogos: 0, notaTec: null, notaFan: null, nota: null, votos: 0 };
  db.matches.forEach(m => {
    const ms = matchStats(m, pid);
    s.gols += ms.gols; s.ass += ms.ass; s.am += ms.am; s.ve += ms.ve;
    if (m.roster && (m.roster.A.includes(pid) || m.roster.B.includes(pid))) s.jogos++;
  });
  const tec = [];
  db.matches.forEach(m => { if (m.techRatings && m.techRatings[pid] != null) tec.push(m.techRatings[pid]); });
  const vt = votosDe(pid);
  s.votos = vt.n;
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  s.notaTec = avg(tec);
  s.notaFan = vt.media;
  s.nota = s.notaTec != null && s.notaFan != null ? (s.notaTec + s.notaFan) / 2
         : s.notaTec != null ? s.notaTec : s.notaFan;
  return s;
}
const PONTOS = { goal: 3, yellow: -1, red: -3 };
/* Ranking no período: 'pts' (craque) ou 'ass' (garçom) */
function rankingPeriodo(dias, tipo) {
  const corte = Date.now() - dias * 86400000;
  const pts = {};
  db.matches.forEach(m => {
    if (m.status !== 'finished' || (m.createdAt || 0) < corte) return;
    (m.events || []).forEach(e => {
      if (tipo === 'ass') { if (e.tipo === 'goal' && e.ass) pts[e.ass] = (pts[e.ass] || 0) + 1; }
      else {
        pts[e.jog] = (pts[e.jog] || 0) + (PONTOS[e.tipo] || 0);
        if (e.tipo === 'goal' && e.ass) pts[e.ass] = (pts[e.ass] || 0) + 2;
      }
    });
  });
  const arr = Object.entries(pts).filter(([id, v]) => v > 0 && findP(id)).sort((a, b) => b[1] - a[1]);
  return arr.length ? { p: findP(arr[0][0]), v: arr[0][1] } : null;
}
function conquistasOf(p) {
  const lista = [...(p.conq || [])];
  const g = statsOf(p.id).gols;
  if (g >= 10) lista.push('10 gols');
  if (g >= 50) lista.push('50 gols');
  if (g >= 300) lista.push('300 gols');
  const cs = rankingPeriodo(7, 'pts'), cm = rankingPeriodo(30, 'pts');
  const gs = rankingPeriodo(7, 'ass'), gm = rankingPeriodo(30, 'ass');
  if (cs && cs.p.id === p.id) lista.push('Craque da semana');
  if (cm && cm.p.id === p.id) lista.push('Craque do mês');
  if (gs && gs.p.id === p.id) lista.push('Garçom da semana');
  if (gm && gm.p.id === p.id) lista.push('Garçom do mês');
  return lista;
}

/* ===================== GOLEIROS ===================== */
function goleirosStats() {
  const map = {};
  db.matches.forEach(m => {
    if (m.status === 'idle' || !m.starters) return;
    const sc = scoreOf(m);
    ['A','B'].forEach(t => {
      const gk = m.starters[t][0];
      if (!gk) return;
      const r = map[gk] = map[gk] || { jogos: 0, sof: 0 };
      r.jogos++; r.sof += sc[otherTeam(t)];
    });
  });
  return Object.entries(map).map(([id, v]) => ({ p: findP(id), jogos: v.jogos, sof: v.sof, media: v.sof / v.jogos })).filter(x => x.p);
}
function craqueDoJogo(m) {
  if (!m || !m.events || !m.events.length) return null;
  const pts = {};
  m.events.forEach(e => {
    pts[e.jog] = (pts[e.jog] || 0) + (PONTOS[e.tipo] || 0);
    if (e.tipo === 'goal' && e.ass) pts[e.ass] = (pts[e.ass] || 0) + 2;
  });
  const arr = Object.entries(pts).map(([id, pt]) => ({ p: findP(id), pt })).filter(x => x.p);
  if (!arr.length) return null;
  arr.sort((a, b) => b.pt - a.pt || (statsOf(b.p.id).nota || 0) - (statsOf(a.p.id).nota || 0));
  return arr[0];
}
function snapshotRosters(m) {
  const mod = m.info.mod;
  m.roster = { A: membersOf('A', mod), B: membersOf('B', mod) };
  m.starters = { A: tm('A', mod).slots.slice(), B: tm('B', mod).slots.slice() };
  m.form = { A: tm('A', mod).formation, B: tm('B', mod).formation };
}
function orderedRoster(m, team) {
  const ids = rosterOf(m, team);
  const starters = startersOf(m, team) || [];
  const coords = slotsOf(formOf(m, team), m ? m.info.mod : curMod());
  const out = [];
  starters.forEach((id, i) => {
    if (id && ids.includes(id) && !out.some(o => o.id === id)) out.push({ id, tit: true, code: coords[i] ? coords[i].code : '' });
  });
  ids.forEach(id => { if (!out.some(o => o.id === id)) out.push({ id, tit: false, code: 'Banco' }); });
  return out.map(o => ({ ...o, p: findP(o.id) })).filter(o => o.p);
}

/* ===================== ROTAS ===================== */
let homeTab = 'entrar';
let voteSel = null;
let refTeam = 'A';
let cdTimer = null;

function route() {
  const h = location.hash.replace('#/', '') || 'inicio';
  const page = PAGE_TITLES[h] ? h : 'inicio';
  document.querySelectorAll('.page').forEach(s => s.classList.toggle('hidden', s.dataset.page !== page));
  $('btnBack').classList.toggle('hidden', page === 'inicio');
  document.title = 'JR — ' + PAGE_TITLES[page];
  window.scrollTo(0, 0);
  clearInterval(cdTimer); cdTimer = null;
  const R = { inicio: renderInicio, jogador: renderJogador, tecnico: renderTecnico,
              arbitro: renderArbitro, torcida: renderTorcida };
  R[page]();
  if (page === 'torcida') cdTimer = setInterval(renderCountdown, 1000);
  syncLive();
}
function syncLive() {
  const m = cur();
  $('liveBadge').classList.toggle('hidden', !(m && m.status === 'live'));
}

/* ===================== TEMA ===================== */
function applyTheme() {
  document.body.classList.toggle('light', localStorage.getItem(THEMEK) === 'light');
}

/* ===================== INÍCIO ===================== */
function renderInicio() {
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === homeTab));
  ['entrar','quem','craques','escalacao'].forEach(t => {
    const el = t === 'entrar' ? $('tab-entrar') : $('tab-' + t);
    el.classList.toggle('hidden', t !== homeTab);
  });
  $('tutorial').classList.toggle('hidden', db.tutorialDone);
  renderStatusCard();
  if (homeTab === 'quem') renderQuem();
  if (homeTab === 'craques') renderCraques();
  if (homeTab === 'escalacao') renderEscalacao();
}
function renderStatusCard() {
  const m = cur() || lastMatch();
  const sc = m ? scoreOf(m) : null;
  $('matchStatus').innerHTML = `<h3>Jogo atual</h3>` + (m
    ? `<p><b>${m.status === 'live' ? '<span class="dot-live"></span>AO VIVO · ' : ''}${esc(statusTxt(m))}</b></p>
       <p class="muted">${esc(m.info.local)} · ${esc(m.info.tipo)} · ${esc(m.info.mod)}</p>
       <p><b>${esc(teamOf('A'))} ${sc.A} × ${sc.B} ${esc(teamOf('B'))}</b></p>`
    : '<p class="muted">Nenhum jogo cadastrado ainda.</p>');
}
function renderQuem() {
  const lf = lastFinished();
  const votaram = new Set();
  Object.values(db.votes).forEach(mv => Object.keys(mv).forEach(d => votaram.add(d)));
  const rows = [
    ...db.players.map(p => ({ n: dname(p), r: 'Jogador · ' + teamOf(p.team), p, ic: icon('jog') })),
    ...db.techs.map(t => ({ n: t.name, r: 'Técnico · ' + teamOf(t.team), p: t, ic: icon('tec') })),
    ...(db.ref ? [{ n: db.ref.name, r: 'Árbitro', p: db.ref, ic: icon('arb') }] : []),
    ...db.fans.map(f => ({ n: f.name, r: 'Torcedor', p: f, ic: icon('vot') }))
  ];
  $('tab-quem').innerHTML = `
    <div class="card">
      <h3>Quem entrou</h3>
      <div class="counts">
        <div class="count"><b>${db.players.length}</b><span>Jogadores</span></div>
        <div class="count"><b>${db.techs.length}</b><span>Técnicos</span></div>
        <div class="count"><b>${db.ref ? 1 : 0}</b><span>Árbitro</span></div>
        <div class="count"><b>${db.fans.length}</b><span>Torcedores</span></div>
      </div>
      <p class="muted" style="margin-top:12px">Aparelhos que já votaram: <b>${votaram.size}</b></p>
    </div>
    <div class="card">
      <h3>Todos cadastrados</h3>
      <div class="list">${rows.map(r => `
        <div class="item">${r.p.photo ? avatar(r.p, 'sm') : `<span class="av sm">${esc((r.n || '?')[0].toUpperCase())}</span>`}
          <div><b>${esc(r.n)}</b><small>${r.ic} ${esc(r.r)}</small></div></div>`).join('') || '<p class="muted">Ninguém cadastrado ainda.</p>'}
      </div>
    </div>`;
}
function pod(list, valor, ic, rotulo) {
  if (!list.length) return '<p class="muted">Sem dados ainda.</p>';
  const ord = list.length >= 3 ? [list[1], list[0], list[2]] : list;
  return `<div class="podium">${ord.map(r => {
    const first = list.indexOf(r) === 0;
    return `<div class="pod ${first ? 'first' : ''}">
      <div>${avatar(r.p, 'sm')}</div>
      <div class="ico-row">${ic}</div>
      <b>${esc(dname(r.p))}</b>
      <div class="n">${valor(r)}</div>
      <small>${rotulo}</small>
    </div>`;
  }).join('')}</div>`;
}
function renderCraques() {
  const rows = db.players.map(p => ({ p, s: statsOf(p.id) }));
  const artilharia = rows.filter(r => r.s.gols > 0).sort((a, b) => b.s.gols - a.s.gols).slice(0, 3);
  const garcons = rows.filter(r => r.s.ass > 0).sort((a, b) => b.s.ass - a.s.ass).slice(0, 3);
  const craques = rows.filter(r => r.s.nota != null).sort((a, b) => b.s.nota - a.s.nota).slice(0, 3);
  const mais = rows.filter(r => r.s.votos > 0).sort((a, b) => b.s.votos - a.s.votos).slice(0, 3);
  const gk = goleirosStats();
  const melhor = gk.length ? gk.slice().sort((a, b) => a.media - b.media || a.sof - b.sof)[0] : null;
  const pior = gk.length ? gk.slice().sort((a, b) => b.media - a.media || b.sof - a.sof)[0] : null;
  const ult = craqueDoJogo(cur() || lastMatch());
  const ds = rankingPeriodo(7, 'pts');
  const tabela = rows.slice().sort((a, b) => b.s.gols - a.s.gols || b.s.ass - a.s.ass || (b.s.nota || 0) - (a.s.nota || 0));

  $('tab-craques').innerHTML = `
    <div class="card">
      <h3>${icon('trofeu')} Destaque da semana</h3>
      <p>${ds ? `<b>${esc(dname(ds.p))}</b> · ${ds.v} pontos nos últimos 7 dias` : 'Ainda não há destaque nesta semana.'}</p>
    </div>
    <div class="card"><h3>Artilharia</h3>${pod(artilharia, r => r.s.gols, icon('gol'), 'gols')}</div>
    <div class="card"><h3>Garçons</h3>${pod(garcons, r => r.s.ass, icon('ass'), 'assistências')}</div>
    <div class="card"><h3>Mais votados</h3>${pod(mais, r => r.s.votos, icon('vot'), 'votos')}</div>
    <div class="card"><h3>Craques (nota final)</h3>${pod(craques, r => notaTxt(r.s.nota), icon('star'), 'nota')}</div>
    <div class="card">
      <h3>Goleiros</h3>
      <div class="list">
        <div class="item"><span>Melhor (menos gols sofridos)</span><b style="margin-left:auto">${melhor ? esc(dname(melhor.p)) + ' · ' + melhor.sof + ' gol(s) em ' + melhor.jogos + ' jogo(s)' : '—'}</b></div>
        <div class="item"><span>Mão de alface (mais gols sofridos)</span><b style="margin-left:auto">${pior ? esc(dname(pior.p)) + ' · ' + pior.sof + ' gol(s) em ' + pior.jogos + ' jogo(s)' : '—'}</b></div>
      </div>
    </div>
    <div class="card">
      <h3>Craque do jogo (partida atual ou última)</h3>
      <p>${ult ? `<b>${esc(dname(ult.p))}</b> · ${ult.pt} pontos` : 'Ainda não há lances nesta partida.'}</p>
    </div>
    <div class="card">
      <h3>Tabela de jogadores</h3>
      <div class="tablewrap"><table class="tab-jog">
        <thead><tr>
          <th>#</th><th>Jogador</th>
          <th class="c">Jogos</th>
          <th class="c">${icon('gol')}</th>
          <th class="c">${icon('ass')}</th>
          <th class="c">${icon('am')}</th>
          <th class="c">${icon('ve')}</th>
          <th class="c">Votos</th>
          <th class="c">Técnico</th><th class="c">Torcida</th><th class="c">Final</th>
        </tr></thead>
        <tbody>${tabela.map((r, i) => `
          <tr>
            <td class="neon">${i + 1}</td>
            <td><div class="who">${avatar(r.p, 'sm')}<div>
              <b>${esc(dname(r.p))}</b>
              <small class="muted" style="display:block">${esc(teamOf(r.p.team))} · ${esc(r.p.pos)} · #${r.p.shirt}</small>
            </div></div></td>
            <td class="c">${r.s.jogos}</td>
            <td class="c"><b>${r.s.gols}</b></td>
            <td class="c"><b>${r.s.ass}</b></td>
            <td class="c">${r.s.am}</td>
            <td class="c">${r.s.ve}</td>
            <td class="c"><b>${r.s.votos}</b></td>
            <td class="c">${notaTxt(r.s.notaTec)}</td>
            <td class="c">${notaTxt(r.s.notaFan)}</td>
            <td class="c"><b>${notaTxt(r.s.nota)}</b></td>
          </tr>`).join('') || '<tr><td colspan="11" class="muted">Nenhum jogador cadastrado.</td></tr>'}
        </tbody>
      </table></div>
    </div>`;
}
function tabelaJogos() {
  const fin = db.matches.filter(m => m.status === 'finished');
  const st = { A: { j:0, v:0, e:0, d:0, gp:0, gc:0 }, B: { j:0, v:0, e:0, d:0, gp:0, gc:0 } };
  fin.forEach(m => {
    const s = scoreOf(m);
    st.A.j++; st.B.j++;
    st.A.gp += s.A; st.A.gc += s.B; st.B.gp += s.B; st.B.gc += s.A;
    if (s.A > s.B) { st.A.v++; st.B.d++; }
    else if (s.B > s.A) { st.B.v++; st.A.d++; }
    else { st.A.e++; st.B.e++; }
  });
  const pts = t => t.v * 3 + t.e;
  const linhas = ['A','B'].sort((a, b) => pts(st[b]) - pts(st[a]) || (st[b].gp - st[b].gc) - (st[a].gp - st[a].gc))
    .map(t => `<tr><td><b>${esc(teamOf(t))}</b></td><td>${st[t].j}</td><td>${st[t].v}</td><td>${st[t].e}</td><td>${st[t].d}</td><td>${st[t].gp}:${st[t].gc}</td><td><b>${pts(st[t])}</b></td></tr>`).join('');
  const jogos = fin.slice().reverse().map(m => {
    const s = scoreOf(m);
    return `<tr><td>${esc(m.info.date ? new Date(m.info.date).toLocaleDateString('pt-BR') : '-')}</td>
      <td>${esc(teamOf('A'))} <b>${s.A} x ${s.B}</b> ${esc(teamOf('B'))}</td><td>${esc(m.info.mod)}</td></tr>`;
  }).join('');
  return `
    <h3>Classificação entre os times</h3>
    <div class="tablewrap"><table>
      <thead><tr><th>Time</th><th>J</th><th>V</th><th>E</th><th>D</th><th>Gols</th><th>Pts</th></tr></thead>
      <tbody>${linhas}</tbody></table></div>
    <h3 style="margin-top:16px">Tabela de jogos</h3>
    ${fin.length ? `<div class="tablewrap"><table><thead><tr><th>Data</th><th>Placar</th><th>Modalidade</th></tr></thead><tbody>${jogos}</tbody></table></div>`
      : '<p class="muted">Nenhum jogo encerrado ainda.</p>'}`;
}
function renderEscalacao() {
  const m = cur() || lastMatch();
  const sc = m ? scoreOf(m) : { A: 0, B: 0 };
  const info = m ? `
    <div class="card">
      <div class="row between"><h3 style="margin:0">Jogo</h3>${m.status === 'live' ? '<span class="tag-live">AO VIVO</span>' : ''}</div>
      <p style="margin-top:10px"><b>${esc(m.info.local)}</b></p>
      <p class="muted">${m.info.date ? new Date(m.info.date).toLocaleString('pt-BR') : 'Horário a definir'} · ${esc(m.info.periodo)} · ${esc(m.info.clima)} · gramado ${esc(m.info.gram)}</p>
      <p class="muted">${esc(m.info.tipo)} · ${esc(m.info.mod)} · ${esc(statusTxt(m))} · ${fmt(elapsedCur(m))}</p>
      <p style="font-size:22px;margin:12px 0"><b>${esc(teamOf('A'))} ${sc.A} x ${sc.B} ${esc(teamOf('B'))}</b></p>
      ${m.info.veredito ? `<div class="veredito ${m.info.veredito.ok ? 'ok' : 'no'}">${esc(m.info.veredito.texto)}${m.info.veredito.r.length ? `<small>${esc(m.info.veredito.r.join(' · '))}</small>` : ''}</div>` : ''}
      <h3 style="margin-top:12px">Lances</h3>
      ${listaLances(m)}
    </div>` : `<div class="card"><p class="muted">O árbitro ainda não cadastrou o jogo.</p></div>`;
  const campo = t => {
    const mod = m ? m.info.mod : curMod();
    const coords = slotsOf(formOf(m, t), mod);
    const ids = startersOf(m, t) || [];
    const tec = db.techs.find(x => x.team === t);
    const itens = ids.map((id, i) => ({ p: findP(id), c: coords[i] })).filter(x => x.p && x.c).map(({ p, c }) => {
      const s = statsOf(p.id);
      const nota = s.nota;
      const cls = nota != null && nota >= 70 ? 'ok' : 'warn';
      return `<div class="pl" style="left:${c.x}%;top:${c.y}%">
        ${nota != null ? `<span class="nota ${cls}">${(nota / 10).toFixed(2).replace('.', ',')}</span>` : ''}
        ${avatar(p, 'dot')}
        <div class="pbd">${badges(s)}</div>
        <div class="pn">${p.shirt} ${esc(dname(p))}</div>
      </div>`;
    }).join('');
    const banco = rosterOf(m, t).map(findP).filter(p => p && !ids.includes(p.id));
    return `<div class="card">
      <div class="lineup-title">
        ${tec ? avatar(tec, 'sm') : '<span class="av sm">?</span>'}
        <div><h3 style="margin:0">${esc(teamOf(t))} · ${esc(formOf(m, t))}</h3>
        <small>Técnico: ${esc(tec ? tec.name : 'ainda não cadastrado')}</small></div>
      </div>
      <div class="pitch-esc">${itens || '<p style="position:absolute;top:45%;width:100%;text-align:center;color:#fff">Escalação ainda não montada</p>'}</div>
      ${banco.length ? '<h3>Banco</h3>' + banco.map(p => `<div class="lu-row">${avatar(p, 'sm')}<b>${esc(dname(p))}</b><span class="shirt">${p.shirt}</span></div>`).join('') : ''}
    </div>`;
  };
  $('tab-escalacao').innerHTML = info + `<div class="grid2">${campo('A')}${campo('B')}</div><div class="card">${tabelaJogos()}</div>`;
}
function listaLances(m) {
  const ev = m && m.events ? m.events.slice().reverse() : [];
  if (!ev.length) return '<p class="muted">Nenhum lance ainda.</p>';
  return `<div class="feed">${ev.map(e => {
    const ic = e.tipo === 'goal' ? icon('gol') : e.tipo === 'yellow' ? icon('am') : icon('ve');
    const label = e.tipo === 'goal' ? 'Gol' : e.tipo === 'yellow' ? 'Amarelo' : 'Vermelho';
    return `<div class="ev"><div><span class="lic">${ic}</span> <b>${label}</b> · ${esc(nameOf(e.jog))}
      ${e.ass ? ` <span class="muted">(assist. ${esc(nameOf(e.ass))})</span>` : ''}
      <div class="muted" style="font-size:12px">${esc(teamOf(e.team))}${e.note ? ` · <span class="note">${esc(e.note)}</span>` : ''}</div></div>
      <small>${e.min}'</small></div>`;
  }).join('')}</div>`;
}

/* ===================== JOGADOR ===================== */
function fillSelects() {
  $('cPos').innerHTML = POS.map(p => `<option>${p}</option>`).join('');
  $('cCamisa').innerHTML = Array.from({ length: 99 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
}
function renderJogador() {
  const r = me();
  $('jogAviso').classList.add('hidden');
  $('formJog').classList.add('hidden');
  $('jogPerfil').classList.add('hidden');
  if (r && r.role === 'jogador') return renderPerfil(r.rec);
  if (r) {
    $('jogAviso').classList.remove('hidden');
    $('jogAviso').innerHTML = `<p>Este aparelho já está cadastrado como <b>${ROLE_NAME[r.role]}</b>. Para se cadastrar como jogador, use outro aparelho.</p>`;
    return;
  }
  $('formJog').classList.remove('hidden');
}
function renderPerfil(rec) {
  const p = findP(rec.id) || rec;
  const s = statsOf(p.id);
  const colegas = db.players.filter(x => x.team === p.team && x.id !== p.id);
  const conq = conquistasOf(p);
  $('jogPerfil').classList.remove('hidden');
  $('jogPerfil').innerHTML = `
    <div class="card">
      <div class="who" style="gap:16px">
        ${avatar(p, 'lg')}
        <div>
          <h2 style="margin:0">${esc(dname(p))}</h2>
          ${p.nick ? `<p class="muted" style="margin:2px 0">${esc(p.name)}</p>` : ''}
          <p style="margin:6px 0"><span class="pill">#${p.shirt}</span><span class="pill">${esc(p.pos)}</span><span class="pill">${esc(p.mod)}</span></p>
          <p class="muted" style="margin:0">${esc(teamOf(p.team))}</p>
        </div>
      </div>
      <div class="counts" style="margin-top:16px">
        <div class="count"><b>${s.gols}</b><span>Gols</span></div>
        <div class="count"><b>${s.ass}</b><span>Assistências</span></div>
        <div class="count"><b>${s.am}</b><span>Amarelos</span></div>
        <div class="count"><b>${s.ve}</b><span>Vermelhos</span></div>
      </div>
      <p class="muted" style="margin-top:12px">Votos: <b>${s.votos}</b> · Nota do técnico: <b>${notaTxt(s.notaTec)}</b> · Nota da torcida: <b>${notaTxt(s.notaFan)}</b> · Nota final: <b>${notaTxt(s.nota)}</b></p>
    </div>
    <div class="card">
      <h3>Conquistas</h3>
      ${conq.length ? `<div class="conq">${conq.map(c => `<span>${esc(c)}</span>`).join('')}</div>` : '<p class="muted">Ainda sem conquistas.</p>'}
    </div>
    <div class="card">
      <h3>Elenco de ${esc(teamOf(p.team))}</h3>
      <div class="picks">${colegas.map(c => `<div class="pick">${avatar(c, 'sm')}<span>${esc(dname(c))}<small>#${c.shirt} · ${esc(c.pos)}</small></span></div>`).join('') || '<p class="muted">Você é o primeiro deste time.</p>'}</div>
    </div>`;
}
function atualizaSlotPorModalidade() {}
$('formJog').onsubmit = async e => {
  e.preventDefault();
  if (me()) return toast('Este aparelho já tem cadastro.', 'bad');
  const pin = $('cPin').value.trim().toUpperCase();
  const erro = validPin(pin, PINS.jogador);
  if (erro) return toast(erro, 'bad');
  const nome = $('cNome').value.trim();
  if (!nome) return toast('Informe o nome completo.', 'bad');
  const temApelido = document.querySelector('input[name=apelidoSN]:checked').value === 'sim';
  const apelido = temApelido ? $('cApelido').value.trim() : '';
  if (temApelido && !apelido) return toast('Digite o apelido ou marque "Não".', 'bad');
  const team = $('cTime').value;
  const shirt = +$('cCamisa').value;
  if (db.players.some(p => p.team === team && p.shirt === shirt))
    return toast(`A camisa ${shirt} já é de outro jogador do ${teamOf(team)}.`, 'bad');
  let photo = null;
  const f = $('cFoto').files[0];
  if (f && $('cAuth').checked) photo = await compress(f);
  const novo = {
    id: 'p' + Date.now().toString(36), pin, name: nome, nick: apelido,
    pos: $('cPos').value, mod: $('cMod').value, shirt, team, photo,
    device: device(), conq: ['Estreante']
  };
  db.players.push(novo);
  if (pin) db.pinsUsed[pin] = novo.device;
  ['Campo','Quadra'].forEach(mod => { if (membersOf(team, mod).includes(novo.id)) placeAuto(team, novo, mod); });
  save();
  toast('Perfil criado! Você ganhou a conquista Estreante.', 'ok');
  renderJogador();
};

/* ===================== TÉCNICO ===================== */
function renderTecnico() {
  const r = me();
  $('tecAviso').classList.add('hidden');
  $('formTec').classList.add('hidden');
  $('tecBoard').classList.add('hidden');
  if (r && r.role === 'tecnico') { $('tecBoard').classList.remove('hidden'); return drawTecBoard(r.rec.team); }
  if (r) {
    $('tecAviso').classList.remove('hidden');
    $('tecAviso').innerHTML = `<p>Este aparelho já está cadastrado como <b>${ROLE_NAME[r.role]}</b>.</p>`;
    return;
  }
  $('tTime').innerHTML = ['A','B'].map(t => {
    const ocupado = db.techs.some(x => x.team === t);
    return `<option value="${t}" ${ocupado ? 'disabled' : ''}>${esc(teamOf(t))}${ocupado ? ' (já tem técnico)' : ''}</option>`;
  }).join('');
  $('formTec').classList.remove('hidden');
}
$('formTec').onsubmit = async e => {
  e.preventDefault();
  if (me()) return toast('Este aparelho já tem cadastro.', 'bad');
  const pin = $('tPin').value.trim().toUpperCase();
  const erro = validPin(pin, PINS.tecnico);
  if (erro) return toast(erro, 'bad');
  const team = $('tTime').value;
  if (db.techs.some(t => t.team === team)) return toast(`${teamOf(team)} já tem técnico.`, 'bad');
  const nome = $('tNome').value.trim();
  if (!nome) return toast('Informe seu nome.', 'bad');
  let photo = null;
  const f = $('tFoto').files[0];
  if (f) photo = await compress(f);
  const d = device();
  db.techs.push({ id: 't' + Date.now().toString(36), pin, name: nome, team, photo, device: d });
  if (pin) db.pinsUsed[pin] = d;
  save();
  toast('Técnico cadastrado!', 'ok');
  renderTecnico();
};
function drawTecBoard(team) {
  const mod = curMod();
  const L = tm(team, mod);
  const tec = db.techs.find(x => x.team === team);
  $('tTitulo').textContent = `${teamOf(team)} · Técnico: ${tec ? tec.name : ''}`;
  $('tNomeTime').value = db.teams[team].nome || '';
  $('tMod').value = mod;
  $('tFormation').innerHTML = Object.keys(FORM[mod]).map(f => `<option ${f === L.formation ? 'selected' : ''}>${f}</option>`).join('');
  drawMembers(team, mod);
  drawPitch(team, mod);
  drawBench(team, mod);
  drawRatings(team);
}
function drawMembers(team, mod) {
  const L = tm(team, mod);
  $('tMembers').innerHTML = membersOf(team, mod).map(findP).filter(Boolean).map(p => {
    const titular = L.slots.includes(p.id);
    return `<div class="pick ${titular ? 'on' : ''}">${avatar(p, 'sm')}
      <span>${esc(dname(p))}<small>#${p.shirt} · ${esc(p.pos)}${titular ? ' · titular' : ' · banco'}</small></span></div>`;
  }).join('') || `<p class="muted">Nenhum jogador deste time joga ${mod === 'Quadra' ? 'quadra' : 'campo'} ainda.</p>`;
}
function drawPitch(team, mod) {
  const L = tm(team, mod);
  const coords = slotsOf(L.formation, mod);
  const pitch = $('tPitch');
  pitch.innerHTML = '<div class="mid"></div><div class="area"></div><div class="circle"></div>';
  coords.forEach((s, i) => {
    const p = findP(L.slots[i]);
    const b = document.createElement('button');
    b.className = 'slot';
    b.style.left = s.x + '%';
    b.style.top = s.y + '%';
    b.innerHTML = p
      ? `${avatar(p, 'dot')}<span class="nm">${esc(dname(p))}</span><span class="rl">${s.code} · #${p.shirt}</span>`
      : `<span class="av dot empty">+</span><span class="rl">${s.code}</span>`;
    b.onclick = () => slotModal(team, i, mod);
    pitch.appendChild(b);
  });
}
function drawBench(team, mod) {
  const L = tm(team, mod);
  const banco = membersOf(team, mod).map(findP).filter(p => p && !L.slots.includes(p.id));
  $('tBench').innerHTML = banco.length
    ? banco.map(p => `<span class="chip">${esc(dname(p))} · #${p.shirt} · ${esc(p.pos)}</span>`).join('')
    : '<span class="muted">Ninguém no banco.</span>';
}
function drawRatings(team) {
  const lf = lastFinished();
  if (!lf) { $('tRatings').innerHTML = '<p class="muted">As notas aparecem depois que a partida terminar.</p>'; return; }
  const rows = rosterOf(lf, team).map(findP).filter(Boolean);
  $('tRatings').innerHTML = rows.map(p => {
    const v = lf.techRatings && lf.techRatings[p.id] != null ? lf.techRatings[p.id] : 50;
    return `<div class="who" style="margin:8px 0">
      <span style="width:120px;font-weight:700">${esc(dname(p))}</span>
      <input type="range" min="0" max="100" value="${v}" data-rate="${p.id}" style="flex:1">
      <b style="width:36px;text-align:right">${v}</b></div>`;
  }).join('') || '<p class="muted">Sem jogadores nesta partida.</p>';
}
function slotModal(team, i, mod) {
  const L = tm(team, mod);
  const codes = slotsOf(L.formation, mod);
  const atual = L.slots[i];
  const cands = membersOf(team, mod).map(findP).filter(p => p && p.id !== atual);
  openModal(`
    <h3>Vaga ${codes[i].code}</h3>
    <div class="grid-names">${cands.map(p => pickBtn(p, p.id)).join('') || '<p class="muted">Ninguém disponível.</p>'}</div>
    <div class="row wrap">
      <button class="btn-danger" data-id="">Tirar desta vaga</button>
      <button class="btn-ghost" id="mClose">Fechar</button>
    </div>`);
  bindPick('#modalBody', id => {
    if (id) {
      const j = L.slots.indexOf(id);
      if (j >= 0) L.slots[j] = atual || null;
      L.slots[i] = id;
    } else {
      L.slots[i] = null;
    }
    save(); closeModal(); drawTecBoard(team);
  });
  $('mClose').onclick = closeModal;
}
function setupTecnicoEvents() {
  $('tFormation').onchange = () => {
    const team = myTeam(); if (!team) return;
    const mod = curMod();
    tm(team, mod).formation = $('tFormation').value;
    reflow(team, mod); save(); drawTecBoard(team);
  };
  $('tMod').onchange = () => {
    const team = myTeam(); if (!team) return;
    db.escMod = $('tMod').value;
    save(); drawTecBoard(team);
  };
  $('btnZerar').onclick = () => {
    const team = myTeam(); if (!team) return;
    if (!confirm('Zerar a escalação? Os jogadores continuam no elenco, no banco.')) return;
    const L = tm(team); L.slots = Array(L.slots.length).fill(null);
    save(); drawTecBoard(team);
  };
  $('btnEmbaralhar').onclick = () => {
    const team = myTeam(); if (!team) return;
    const mod = curMod();
    tm(team, mod).formation = pick(Object.keys(FORM[mod]));
    reflow(team, mod); save(); drawTecBoard(team);
    toast('Esquema embaralhado.', 'ok');
  };
  $('tNomeTime').onchange = () => {
    const team = myTeam(); if (!team) return;
    db.teams[team].nome = $('tNomeTime').value.trim().slice(0, 30);
    save(); drawTecBoard(team);
  };
  $('tRatings').oninput = e => {
    const pid = e.target.dataset.rate;
    if (!pid) return;
    const lf = lastFinished(); if (!lf) return;
    lf.techRatings = lf.techRatings || {};
    lf.techRatings[pid] = +e.target.value;
    e.target.nextElementSibling.textContent = e.target.value;
    save();
  };
}

/* ===================== ÁRBITRO: PRÉ-JOGO ===================== */
function renderArbitro() {
  const r = me();
  $('refAviso').classList.add('hidden');
  $('formRef').classList.add('hidden');
  $('refPanel').classList.add('hidden');
  if (r && r.role === 'arbitro') {
    $('refPanel').classList.remove('hidden');
    fillPre();
    return drawAll();
  }
  if (r) {
    $('refAviso').classList.remove('hidden');
    $('refAviso').innerHTML = `<p>Este aparelho já está cadastrado como <b>${ROLE_NAME[r.role]}</b>.</p>`;
    return;
  }
  $('formRef').classList.remove('hidden');
}
$('formRef').onsubmit = e => {
  e.preventDefault();
  if (me()) return toast('Este aparelho já tem cadastro.', 'bad');
  if (db.ref) return toast('Já existe um árbitro cadastrado.', 'bad');
  const pin = $('rPin').value.trim().toUpperCase();
  const erro = validPin(pin, PINS.arbitro);
  if (erro) return toast(erro, 'bad');
  const nome = $('rNome').value.trim();
  if (!nome) return toast('Informe seu nome.', 'bad');
  const d = device();
  db.ref = { pin, name: nome, device: d };
  if (pin) db.pinsUsed[pin] = d;
  save();
  toast('Bem-vindo, árbitro!', 'ok');
};
function readPre() {
  return {
    local: $('pLocal').value.trim(), date: $('pDate').value,
    clima: $('pClima').value, gram: $('pGram').value, periodo: $('pPeriodo').value,
    ilum: $('pIlum').checked, mod: $('pMod').value, tipo: $('pTipo').value,
    tempo: Math.min(60, Math.max(5, +$('pTempo').value || 20)),
    nextDate: $('pProx').value
  };
}
function veredito(i) {
  const r = []; let ok = true;
  if (i.clima === 'Chuva') { ok = false; r.push('está chovendo'); }
  if (i.gram === 'Molhado') { ok = false; r.push('gramado molhado'); }
  if (i.periodo === 'Noite' && !i.ilum) { ok = false; r.push('à noite sem iluminação'); }
  if (i.clima === 'Calor forte') r.push('calor forte, hidratação reforçada');
  if (i.gram === 'Seco') r.push('gramado seco, bola mais rápida');
  return { ok, texto: ok ? 'Dia top para amistoso' : 'Não recomendado para amistoso', r };
}
function drawVeredito() {
  const v = veredito(readPre());
  $('pVeredito').className = 'veredito ' + (v.ok ? 'ok' : 'no');
  $('pVeredito').innerHTML = `${esc(v.texto)}${v.r.length ? `<small>${esc(v.r.join(' · '))}</small>` : ''}`;
  return v;
}
function fillPre() {
  const m = cur() || lastMatch();
  if (m && cur()) {
    $('pLocal').value = m.info.local;
    $('pDate').value = m.info.date;
    $('pClima').value = m.info.clima;
    $('pGram').value = m.info.gram;
    $('pPeriodo').value = m.info.periodo;
    $('pIlum').checked = !!m.info.ilum;
    $('pMod').value = m.info.mod;
    $('pTipo').value = m.info.tipo;
    $('pTempo').value = m.info.tempo;
    $('pProx').value = m.info.nextDate || '';
  } else {
    $('pMod').value = curMod();
  }
  drawVeredito();
}
$('btnSalvarPre').onclick = () => {
  const info = readPre();
  if (!info.local) return toast('Informe o local.', 'bad');
  info.veredito = veredito(info);
  db.escMod = info.mod;
  let m = cur();
  if (!m) {
    m = { id: 'm' + Date.now().toString(36), info, status: 'idle', current: 1, base: 0,
          startedAt: null, h1: 0, extra: 0, events: [], notes: '', link: '', techRatings: {}, createdAt: Date.now() };
    db.matches.push(m);
  }
  m.info = info;
  if (m.status === 'idle') snapshotRosters(m);
  save();
  toast('Pré-jogo salvo.', 'ok');
};

/* ===================== ÁRBITRO: CRONÔMETRO ===================== */
let ticker = null;
function startTicker() { if (!ticker) ticker = setInterval(tickLoop, 1000); }
function stopTicker() { clearInterval(ticker); ticker = null; }
function tickLoop() { drawClock(); syncLive(); notifyCheck(); }
function pausePlay() {
  const m = cur(); if (!m || m.status !== 'live') return;
  m.base = elapsedCur(m); m.status = 'paused'; m.startedAt = null;
  save(); stopTicker();
}
function togglePlay() {
  const m = cur();
  if (!m) return toast('Salve o pré-jogo primeiro.', 'bad');
  if (m.status === 'live') return pausePlay();
  if (m.status === 'break') return toast('Use o Recomeçar 2º tempo.', 'bad');
  if (m.status === 'idle') { m.current = 1; m.base = 0; }
  m.status = 'live';
  m.startedAt = Date.now();
  save(); startTicker();
}
function intervalo() {
  const m = cur();
  if (!m || m.current !== 1 || !['live', 'paused'].includes(m.status))
    return toast('O intervalo só vale durante o 1º tempo.', 'bad');
  if (m.status === 'live') m.base = elapsedCur(m);
  m.h1 = m.base;
  m.current = 2; m.base = 0; m.startedAt = null; m.status = 'break';
  save(); stopTicker();
  toast('Intervalo.', 'ok');
}
function recomecar() {
  const m = cur();
  if (!m || m.status !== 'break') return toast('O recomeço vale depois do intervalo.', 'bad');
  m.status = 'live'; m.startedAt = Date.now();
  save(); startTicker();
  toast('2º tempo iniciado.', 'ok');
}
function acrescimo() {
  const m = cur(); if (!m) return toast('Não há jogo em andamento.', 'bad');
  m.extra = (m.extra || 0) + 300;
  save();
  toast('+5 minutos de acréscimo.', 'ok');
}
function encerrar() {
  const m = cur(); if (!m) return;
  if (!confirm('Encerrar a partida? A torcida poderá votar.')) return;
  if (m.status === 'live') m.base = elapsedCur(m);
  m.status = 'finished'; m.startedAt = null;
  save(); stopTicker(); stopSim();
  toast('Partida encerrada.', 'ok');
}
function drawClock() {
  const m = lastMatch();
  $('clock').textContent = m ? fmt(elapsedCur(m)) : '00:00';
  let txt = statusTxt(m);
  if (m && m.status === 'live') {
    const previsto = (m.info.tempo || 20) * 60 + (m.extra || 0);
    if (elapsedCur(m) > previsto) txt = 'Tempo previsto acabou: acrescente +5 ou encerre';
  }
  $('halfLabel').textContent = txt;
  const m2 = cur();
  $('bPlay').textContent = m2 && m2.status === 'live' ? 'Pausar' : 'Iniciar';
}
function drawScore() {
  const m = lastMatch(); const s = m ? scoreOf(m) : { A: 0, B: 0 };
  $('scoreA').textContent = s.A;
  $('scoreB').textContent = s.B;
  $('lblA').textContent = teamOf('A');
  $('lblB').textContent = teamOf('B');
  $('lblRA').textContent = teamOf('A');
  $('lblRB').textContent = teamOf('B');
}

/* ===================== ÁRBITRO: PLACAR ===================== */
function podeLancar() {
  const m = cur();
  if (!m) { toast('Salve o pré-jogo primeiro.', 'bad'); return null; }
  if (!['live', 'paused', 'break'].includes(m.status)) { toast('Inicie o jogo para lançar.', 'bad'); return null; }
  return m;
}
function startGoal(team) {
  const m = podeLancar(); if (!m) return;
  const list = rosterOf(m, team).map(findP).filter(Boolean);
  if (!list.length) return toast(`${teamOf(team)} não tem jogadores escalados.`, 'bad');
  openModal(`<h3>Gol do ${esc(teamOf(team))}</h3><p class="muted">Quem marcou?</p>
    <div class="grid-names">${list.map(p => pickBtn(p, p.id)).join('')}</div>
    <button class="btn-ghost" id="mClose">Cancelar</button>`);
  bindPick('#modalBody', scorer => goalAssist(team, scorer));
  $('mClose').onclick = closeModal;
}
function goalAssist(team, scorer) {
  const m = cur();
  const outros = rosterOf(m, team).filter(x => x !== scorer).map(findP).filter(Boolean);
  openModal(`<h3>Teve assistência?</h3><p class="muted">Gol de ${esc(nameOf(scorer))}</p>
    <div class="grid-names">${outros.map(p => pickBtn(p, p.id)).join('')}</div>
    <div class="row wrap">
      <button class="btn-ghost" data-id="">Sem assistência</button>
      <button class="btn-ghost" id="mBack">Voltar</button>
    </div>`);
  bindPick('#modalBody', ass => goalConfirm(team, scorer, ass || null));
  $('mBack').onclick = () => startGoal(team);
}
function goalConfirm(team, scorer, ass) {
  openModal(`<h3>Confirmar gol?</h3>
    <p><b>${esc(nameOf(scorer))}</b> marcou para ${esc(teamOf(team))}</p>
    <p class="muted">${ass ? 'Assistência: ' + esc(nameOf(ass)) : 'Sem assistência'}</p>
    <label>Minuto (opcional, vazio = agora)<input id="gMin" type="number" min="0" max="200"></label>
    <div class="row wrap">
      <button class="btn-small" id="gOk">Confirmar gol</button>
      <button class="btn-ghost" id="gNo">Cancelar</button>
    </div>`);
  $('gOk').onclick = () => {
    const min = $('gMin').value;
    closeModal();
    addEvent({ tipo: 'goal', team, jog: scorer, ass, min });
  };
  $('gNo').onclick = closeModal;
}
function removeLastGoal(team) {
  const m = cur(); if (!m) return toast('Não há jogo em andamento.', 'bad');
  const gols = (m.events || []).filter(e => e.tipo === 'goal' && e.team === team);
  if (!gols.length) return toast(`${teamOf(team)} ainda não tem gols.`, 'bad');
  const last = gols[gols.length - 1];
  if (!confirm(`Remover o gol de ${nameOf(last.jog)} (${last.min}')?`)) return;
  m.events = m.events.filter(e => e.id !== last.id);
  save();
  toast('Gol removido.', 'ok');
}

/* ===================== ÁRBITRO: ELENCOS, CARTÕES E LANCES ===================== */
function drawRosters() {
  const m = cur() || lastMatch();
  ['A','B'].forEach(t => {
    const rows = orderedRoster(m, t);
    $(t === 'A' ? 'rosterA' : 'rosterB').innerHTML = rows.length
      ? rows.map(r => rowJog(m, r, t)).join('')
      : '<p class="muted">Nenhum jogador escolheu este time ainda.</p>';
  });
}
function rowJog(m, r, team) {
  const s = matchStats(m, r.id);
  return `<button class="jrow ${r.tit ? 'tit' : 'ban'}" data-pid="${esc(r.id)}" data-team="${team}">
    ${avatar(r.p, 'sm')}
    <span class="jn"><b>${esc(dname(r.p))}</b><small>#${r.p.shirt} · ${esc(r.p.pos)} · ${esc(r.code)}</small></span>
    <span class="jb">${badges(s)}</span></button>`;
}
function onRosterClick(e) {
  const b = e.target.closest('[data-pid]'); if (!b) return;
  const m = cur();
  if (!m || m.status === 'idle') return toast('Inicie o jogo para lançar cartão.', 'bad');
  cardModal(b.dataset.team, b.dataset.pid);
}
function cardModal(team, pid) {
  const p = findP(pid); if (!p) return;
  openModal(`<h3>${esc(dname(p))} <span class="muted">#${p.shirt}</span></h3>
    <div class="row wrap">
      <button class="btn-ghost" id="cAm">${icon('am')} Amarelo</button>
      <button class="btn-danger" id="cVe">${icon('ve')} Vermelho</button>
      <button class="btn-ghost" id="cX">Cancelar</button>
    </div>`);
  $('cAm').onclick = () => { closeModal(); addEvent({ tipo: 'yellow', team, jog: pid, ass: null, min: '' }); };
  $('cVe').onclick = () => { closeModal(); addEvent({ tipo: 'red', team, jog: pid, ass: null, min: '' }); };
  $('cX').onclick = closeModal;
}
function addEvent({ tipo, team, jog, ass, min }) {
  const m = podeLancar(); if (!m) return;
  const agora = curMinute(m);
  const minute = (min === '' || min == null) ? agora : parseInt(min, 10);
  if (isNaN(minute) || minute < 0) return toast('Minuto inválido.', 'bad');
  if (minute > agora) return toast(`O minuto não pode passar de ${agora}'.`, 'bad');
  const note = minute < agora ? `Registrado com atraso: lance aos ${minute}' (registrado aos ${agora}').` : '';
  m.events.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), tipo, team, jog, ass: ass || null, min: minute, note });
  save();
  toast(tipo === 'goal' ? 'Gol registrado.' : 'Cartão registrado.', 'ok');
}
function drawFeed() {
  const m = lastMatch();
  const list = m ? (m.events || []).slice().reverse() : [];
  $('feed').innerHTML = list.length ? list.map(e => `
    <div class="ev">
      <div><span class="lic">${e.tipo === 'goal' ? icon('gol') : e.tipo === 'yellow' ? icon('am') : icon('ve')}</span>
        <b>${e.tipo === 'goal' ? 'Gol' : e.tipo === 'yellow' ? 'Amarelo' : 'Vermelho'}</b> · ${esc(nameOf(e.jog))}
        ${e.ass ? `<span class="muted">(assist. ${esc(nameOf(e.ass))})</span>` : ''}
        <div class="muted" style="font-size:12px">${esc(teamOf(e.team))}</div>
        ${e.note ? `<div class="note">${esc(e.note)}</div>` : ''}
      </div>
      <div class="row">
        <small>${e.min}'</small>
        <button class="btn-ghost" data-edit="${e.id}">Editar</button>
        <button class="btn-danger" data-del="${e.id}">Apagar</button>
      </div>
    </div>`).join('') : '<p class="muted">Nenhum lance registrado ainda.</p>';
}
function findEvent(id) {
  const m = lastMatch();
  return { m, e: m ? (m.events || []).find(x => x.id === id) : null };
}
function removeEvent(id) {
  const { m, e } = findEvent(id);
  if (!e) return;
  if (!confirm(`Apagar este lance (${e.min}' · ${nameOf(e.jog)})?`)) return;
  m.events = m.events.filter(x => x.id !== id);
  save();
  toast('Lance apagado.', 'ok');
}
function editModal(id) {
  const { m, e } = findEvent(id);
  if (!e) return;
  const roster = rosterOf(m, e.team).map(findP).filter(Boolean);
  const opts = (arr, sel, vazio) => (vazio ? `<option value="">${vazio}</option>` : '') +
    arr.map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(dname(p))} #${p.shirt}</option>`).join('');
  openModal(`
    <h3>Editar lance</h3>
    <label>Tipo
      <select id="eTipo">
        <option value="goal" ${e.tipo === 'goal' ? 'selected' : ''}>Gol</option>
        <option value="yellow" ${e.tipo === 'yellow' ? 'selected' : ''}>Amarelo</option>
        <option value="red" ${e.tipo === 'red' ? 'selected' : ''}>Vermelho</option>
      </select>
    </label>
    <label>Jogador<select id="eJog">${opts(roster, e.jog)}</select></label>
    <label>Assistência (só gol)<select id="eAss">${opts(roster.filter(p => p.id !== e.jog), e.ass, 'Sem assistência')}</select></label>
    <label>Minuto<input id="eMin" type="number" min="0" max="200" value="${e.min}"></label>
    <div class="row wrap">
      <button class="btn-small" id="eSave">Salvar</button>
      <button class="btn-danger" id="eDel">Apagar</button>
      <button class="btn-ghost" id="mClose">Cancelar</button>
    </div>`);
  $('eSave').onclick = () => {
    const tipo = $('eTipo').value;
    const jog = $('eJog').value;
    let ass = tipo === 'goal' ? ($('eAss').value || null) : null;
    if (ass === jog) ass = null;
    const min = parseInt($('eMin').value, 10);
    if (isNaN(min) || min < 0) return toast('Minuto inválido.', 'bad');
    Object.assign(e, { tipo, jog, ass, min });
    save(); closeModal(); toast('Lance atualizado.', 'ok');
  };
  $('eDel').onclick = () => { closeModal(); removeEvent(id); };
  $('mClose').onclick = closeModal;
}
function drawSeguranca() {
  const pins = Object.keys(db.pinsUsed);
  $('segList').innerHTML = pins.length ? pins.map(pin => {
    const p = db.players.find(x => x.pin === pin) || db.techs.find(x => x.pin === pin) || (db.ref && db.ref.pin === pin ? db.ref : null);
    const quem = p ? (p.nick || p.name) : '—';
    const papel = db.players.some(x => x.pin === pin) ? 'Jogador' : db.techs.some(x => x.pin === pin) ? 'Técnico' : 'Árbitro';
    return `<div class="item"><span class="av sm">${esc(pin.slice(0, 2))}</span>
      <div><b>${esc(pin)}</b><small>${papel} · ${esc(quem)}</small></div></div>`;
  }).join('') : '<p class="muted">Nenhum PIN usado ainda.</p>';
}
function drawRostersAndAll() {
  drawScore(); drawClock(); drawRosters(); drawFeed(); drawSeguranca(); syncLive();
}
function drawAll() { drawRostersAndAll(); }
function setupArbitroEvents() {
  $('btnMaisA').onclick = () => startGoal('A');
  $('btnMaisB').onclick = () => startGoal('B');
  $('btnMenosA').onclick = () => removeLastGoal('A');
  $('btnMenosB').onclick = () => removeLastGoal('B');
  $('bPlay').onclick = togglePlay;
  $('bInt').onclick = intervalo;
  $('bRec').onclick = recomecar;
  $('bAcr').onclick = acrescimo;
  $('bEnd').onclick = encerrar;
  $('rosterA').onclick = onRosterClick;
  $('rosterB').onclick = onRosterClick;
  $('feed').onclick = e => {
    const ed = e.target.closest('[data-edit]');
    const dl = e.target.closest('[data-del]');
    if (ed) return editModal(ed.dataset.edit);
    if (dl) return removeEvent(dl.dataset.del);
  };
  $('btnDesfazer').onclick = () => {
    const m = cur(); if (!m || !m.events.length) return;
    if (!confirm('Desfazer o último lance?')) return;
    m.events.pop(); save();
  };
  $('btnSalvarNotas').onclick = () => {
    const m = cur() || lastMatch();
    if (!m) return toast('Cadastre o jogo primeiro.', 'bad');
    m.notes = $('notas').value.slice(0, 800);
    m.link = $('link').value.trim();
    save(); toast('Salvo.', 'ok');
  };
  $('btnZap').onclick = () => {
    const m = lastMatch(); if (!m) return toast('Sem jogo para enviar.', 'bad');
    window.open('https://wa.me/?text=' + encodeURIComponent(resumo(m)), '_blank');
  };
  $('btnPrint').onclick = () => {
    const m = lastMatch(); if (!m) return toast('Sem jogo para imprimir.', 'bad');
    $('printArea').innerHTML = `<h1>Súmula Oficial — JR</h1><pre style="white-space:pre-wrap">${esc(resumo(m))}</pre>`;
    window.print();
  };
}
function resumo(m) {
  const sym = { goal: 'Gol', yellow: 'Amarelo', red: 'Vermelho' };
  const linhas = (m.events || []).map(e => `${e.min}' ${sym[e.tipo]} · ${nameOf(e.jog)}${e.ass ? ' (assist. ' + nameOf(e.ass) + ')' : ''}`);
  const s = scoreOf(m);
  const data = m.info.date ? new Date(m.info.date).toLocaleString('pt-BR') : '-';
  return `*JR — Súmula*\n${m.info.local} | ${m.info.tipo}\n${data}\n${teamOf('A')} ${s.A} x ${s.B} ${teamOf('B')}\n\n` +
    `${linhas.join('\n') || 'Sem lances'}\n${m.notes ? '\n' + m.notes : ''}${m.link ? '\n' + m.link : ''}\n\n@jogorapido`;
}

/* ===================== NOTIFICAÇÕES DE LANCE ===================== */
function notifyCheck() {
  const m = lastMatch(); if (!m || !m.events) return;
  const ids = m.events.map(e => e.id);
  const seen = JSON.parse(localStorage.getItem(SEENK) || 'null');
  if (!seen) { localStorage.setItem(SEENK, JSON.stringify(ids)); return; }
  const fresh = m.events.filter(e => !seen.includes(e.id));
  if (!fresh.length) return;
  localStorage.setItem(SEENK, JSON.stringify(ids));
  const r = me();
  const mine = r && r.role === 'jogador' ? r.rec : null;
  if (mine && mine.mod !== 'Os dois' && mine.mod !== m.info.mod) return;
  const e = fresh[fresh.length - 1];
  const html = e.tipo === 'goal'
    ? `${icon('gol')} Gol de ${esc(nameOf(e.jog))}${e.ass ? ' · ' + icon('ass') + ' ' + esc(nameOf(e.ass)) : ' · sem assistência'} (${e.min}')`
    : `${e.tipo === 'yellow' ? icon('am') + ' Amarelo' : icon('ve') + ' Vermelho'} para ${esc(nameOf(e.jog))} (${e.min}')`;
  showNotify(html);
}
let notifyTimer = null;
function showNotify(html) {
  const b = $('notifyBar');
  b.innerHTML = html;
  b.classList.remove('hidden');
  clearTimeout(notifyTimer);
  notifyTimer = setTimeout(() => b.classList.add('hidden'), 5000);
}

/* ===================== TORCIDA ===================== */
function proximoMs() {
  const m = lastMatch();
  const d = m && m.info && m.info.nextDate;
  if (!d) return null;
  const t = new Date(d).getTime();
  return isNaN(t) ? null : t;
}
function renderCountdown() {
  const box = $('cdBox');
  const ps = preState();
  if (ps === 'aberta') {
    const m = cur();
    const t = m.info.date ? new Date(m.info.date).getTime() : null;
    box.innerHTML = t
      ? `<div class="cd-label">Votação antes do jogo fecha em</div><div class="cdbig">${contagem(t - Date.now())}</div>`
      : '<p class="cd-msg">Votação antes do jogo aberta!</p>';
    return;
  }
  if (ps === 'antes') {
    const t = new Date(cur().info.date).getTime() - JANELA_PRE_MIN * 60000;
    box.innerHTML = `<div class="cd-label">Votação antes do jogo abre em</div><div class="cdbig">${contagem(t - Date.now())}</div>`;
    return;
  }
  const t = proximoMs();
  if (!t) { box.innerHTML = '<p class="cd-msg">Você volta no próximo jogo.</p>'; return; }
  const diff = t - Date.now();
  box.innerHTML = diff > 0
    ? `<div class="cd-label">Próximo jogo em</div><div class="cdbig">${contagem(diff)}</div>`
    : '<p class="cd-msg">O próximo jogo é agora! Volte para acompanhar.</p>';
}
function contagem(ms) {
  if (ms <= 0) return '00:00:00';
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms % 86400000 / 3600000);
  const mi = Math.floor(ms % 3600000 / 60000);
  const s = Math.floor(ms % 60000 / 1000);
  return (d ? d + 'd ' : '') + pad(h) + ':' + pad(mi) + ':' + pad(s);
}
function drawFanColumns() {
  const mine = preVotes().picks || {};
  ['A','B'].forEach(t => {
    const tec = db.techs.find(x => x.team === t);
    $(t === 'A' ? 'fLblA' : 'fLblB').textContent = teamOf(t);
    const jogadores = db.players.filter(p => p.team === t).sort((a, b) => a.shirt - b.shirt);
    const tecHtml = tec ? `<div class="fan-tec">${avatar(tec, 'sm')}<div><b>${esc(tec.name)}</b><small>Técnico</small></div></div>` : '<p class="muted">Sem técnico cadastrado.</p>';
    $(t === 'A' ? 'fColA' : 'fColB').innerHTML = tecHtml + (jogadores.length
      ? jogadores.map(p => {
          const v = votosDe(p.id);
          const ja = ps() === 'aberta' && mine[p.id] != null;
          const sel = voteSel === p.id ? ' sel' : '';
          return `<button class="fan-row${sel}${ja ? ' ja' : ''}" data-pid="${esc(p.id)}">${avatar(p, 'sm')}
            <span class="fn"><b>#${p.shirt} ${esc(dname(p))}</b><small>${esc(p.pos)}${ja ? ' · você já votou' : ''}</small></span>
            <span class="vc ${v.n ? '' : 'zero'}">${v.n}</span></button>`;
        }).join('')
      : '<p class="muted">Nenhum jogador neste time ainda.</p>');
  });
}
function ps() { return preState(); }
function drawFanRank() {
  const ordenado = db.players.map(p => ({ p, v: votosDe(p.id) })).sort((a, b) => b.v.n - a.v.n || (b.v.media || 0) - (a.v.media || 0));
  $('fRank').innerHTML = ordenado.length
    ? `<table><thead><tr><th>#</th><th>Jogador</th><th>Time</th><th class="c">Votos</th><th class="c">Nota da torcida</th></tr></thead><tbody>
        ${ordenado.map((r, i) => `<tr>
          <td class="neon">${i + 1}</td>
          <td><b>${esc(dname(r.p))}</b> <span class="muted">#${r.p.shirt}</span></td>
          <td>${esc(teamOf(r.p.team))}</td>
          <td class="c"><b>${r.v.n}</b></td>
          <td class="c">${r.v.media == null ? '—' : r.v.media.toFixed(1)}</td></tr>`).join('')}
      </tbody></table>`
    : '<p class="muted">Nenhum jogador cadastrado ainda.</p>';
}
function renderTorcida() {
  const r = me();
  $('formFan').classList.toggle('hidden', !!r);
  $('fanBox').classList.toggle('hidden', !r);
  if (!r) return;
  const m = cur() || lastMatch();
  $('fLances').innerHTML = m
    ? `<p><b>${esc(teamOf('A'))} ${scoreOf(m).A} x ${scoreOf(m).B} ${esc(teamOf('B'))}</b> <span class="muted">· ${esc(statusTxt(m))}</span></p>${listaLances(m)}`
    : '<p class="muted">Ainda não há jogo cadastrado.</p>';
  $('fQ').classList.add('hidden');
  $('fVote').classList.add('hidden');
  const pre = preState();
  const post = postState();
  if (pre === 'aberta') {
    $('fStatus').innerHTML = 'Votação antes do jogo: toque num jogador e dê a nota. Cada jogador pode ser votado uma vez.';
    $('fVote').classList.toggle('hidden', !voteSel);
    $('fVoteTitulo').textContent = 'Votação antes do jogo';
  } else if (post === 'post') {
    $('fStatus').textContent = 'Partida encerrada. Você assistiu o jogo?';
    $('fQ').classList.remove('hidden');
    $('fVoteTitulo').textContent = 'Votação depois do jogo';
  } else if (post === 'votou') {
    $('fStatus').textContent = 'Você já votou depois deste jogo. Obrigado!';
  } else if (post === 'naoviu') {
    $('fStatus').textContent = 'Você não assistiu este jogo. Volte no próximo jogo.';
  } else if (pre === 'antes') {
    $('fStatus').textContent = 'A votação antes do jogo abre 30 minutos antes do horário marcado.';
  } else if (pre === 'fechada') {
    $('fStatus').textContent = 'A votação antes do jogo já fechou. Volte depois do jogo.';
  } else {
    $('fStatus').textContent = 'Os times estão aqui. A votação abre quando o próximo jogo for marcado.';
  }
  if (post === 'post' && $('fVote').classList.contains('hidden') === false) {}
  drawFanColumns();
  drawFanRank();
  renderCountdown();
  renderMural();
}
function setupTorcidaEvents() {
  $('formFan').onsubmit = e => {
    e.preventDefault();
    if (me()) return;
    const nome = $('fNome').value.trim();
    if (!nome) return toast('Informe seu nome.', 'bad');
    db.fans.push({ id: 'f' + Date.now().toString(36), name: nome.slice(0, 60), device: device() });
    save(); toast('Bem-vindo!', 'ok');
  };
  $('btnSim').onclick = () => {
    $('fQ').classList.add('hidden');
    $('fVote').classList.remove('hidden');
    $('fStatus').textContent = 'Escolha um jogador e dê a nota.';
  };
  $('btnNao').onclick = voteNaoViu;
  document.addEventListener('click', e => {
    const b = e.target.closest('.fan-row'); if (!b) return;
    voteSel = b.dataset.pid;
    if (preState() === 'aberta' && (preVotes().picks || {})[voteSel] != null) {
      toast('Você já votou neste jogador.', 'bad');
    }
    $('fVote').classList.remove('hidden');
    $('fEscolhido').textContent = 'Escolhido: ' + nameOf(voteSel);
    drawFanColumns();
  });
  $('fRange').oninput = () => { $('fNota').textContent = $('fRange').value; };
  $('btnVotar').onclick = () => {
    if (!voteSel) return toast('Toque num jogador acima para escolhê-lo.', 'bad');
    const nota = +$('fRange').value;
    if (preState() === 'aberta') votePre(voteSel, nota);
    else if (postState() === 'post') votePost(voteSel, nota);
    else return toast('A votação não está aberta agora.', 'bad');
    voteSel = null;
    $('fVote').classList.add('hidden');
    drawFanColumns();
  };
  $('btnComentar').onclick = () => {
    const t = $('comment').value.trim().slice(0, 200);
    if (!t) return;
    const n = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (BANNED.some(w => new RegExp('(^|\\W)' + w + '(\\W|$)').test(n)))
      return toast('Comentário bloqueado: linguagem inadequada.', 'bad');
    db.comments.push({ id: Date.now().toString(36), text: t, at: Date.now(), device: device(), likes: { h: [], g: [] } });
    save(); $('comment').value = '';
  };
  $('mural').onclick = e => {
    const b = e.target.closest('[data-like]'); if (!b) return;
    const c = db.comments.find(x => x.id === b.dataset.cid); if (!c) return;
    const tipo = b.dataset.like;
    c.likes = c.likes || { h: [], g: [] };
    c.likes[tipo] = c.likes[tipo] || [];
    const d = device();
    c.likes[tipo] = c.likes[tipo].includes(d) ? c.likes[tipo].filter(x => x !== d) : [...c.likes[tipo], d];
    save();
  };
}
function renderMural() {
  $('mural').innerHTML = db.comments.length
    ? db.comments.slice(-50).reverse().map(c => {
        const L = c.likes || { h: [], g: [] };
        const eu = d => (L[d] || []).includes(device());
        return `<div class="msg">${esc(c.text)}
          <div class="react">
            <button data-like="h" data-cid="${c.id}" class="${eu('h') ? 'on' : ''}">${IC.heart} ${(L.h || []).length}</button>
            <button data-like="g" data-cid="${c.id}" class="${eu('g') ? 'on' : ''}">${IC.gol} ${(L.g || []).length}</button>
          </div></div>`;
      }).join('')
    : '<p class="muted">Seja o primeiro a comentar.</p>';
}

/* ===================== ENTRAR COMO (TESTE) ===================== */
function refreshWho() {
  const opts = [
    ...db.players.map(p => ({ d: p.device, l: 'Jogador: ' + dname(p) })),
    ...db.techs.map(t => ({ d: t.device, l: 'Técnico: ' + t.name + ' (' + teamOf(t.team) + ')' })),
    ...(db.ref ? [{ d: db.ref.device, l: 'Árbitro: ' + db.ref.name }] : []),
    ...db.fans.map(f => ({ d: f.device, l: 'Torcedor: ' + f.name }))
  ].filter(o => o.d);
  const atual = device();
  $('whoSel').innerHTML = '<option value="">Entrar como…</option>' +
    opts.map(o => `<option value="${esc(o.d)}" ${o.d === atual ? 'selected' : ''}>${esc(o.l)}</option>`).join('');
}

/* ===================== NOTIFICAÇÕES E BOTÕES GERAIS ===================== */
function setupGerais() {
  $('btnTheme').onclick = () => {
    localStorage.setItem(THEMEK, document.body.classList.contains('light') ? 'dark' : 'light');
    applyTheme();
  };
  $('btnTut').onclick = () => {
    db.tutorialDone = true; save();
    openModal(`
      <h3>Como usar</h3>
      <ol>
        <li><b>Jogador:</b> cadastre-se com o PIN JR- uma vez, escolha o time e a modalidade.</li>
        <li><b>Técnico:</b> cadastre-se com o PIN TEC-, escolha o time e monte a escalação.</li>
        <li><b>Árbitro:</b> salve o pré-jogo, inicie o jogo e lance gols (+) e cartões.</li>
        <li><b>Torcida:</b> vote antes do jogo e de novo depois dele.</li>
      </ol>
      <button class="btn" id="mClose">Entendi</button>`);
    $('mClose').onclick = closeModal;
  };
  $('btnSkip').onclick = () => { db.tutorialDone = true; save(); };
  $('brandHome').onclick = () => { location.hash = '#/inicio'; };
  $('btnBack').onclick = () => { location.hash = '#/inicio'; };
  $('liveBadge').onclick = () => { homeTab = 'escalacao'; location.hash = '#/inicio'; route(); };
  document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { homeTab = b.dataset.tab; renderInicio(); });
  document.querySelectorAll('input[name=apelidoSN]').forEach(r => r.onchange = () =>
    $('boxApelido').classList.toggle('hidden', document.querySelector('input[name=apelidoSN]:checked').value !== 'sim'));
  $('whoSel').onchange = () => {
    const v = $('whoSel').value; if (!v) return;
    localStorage.setItem(DEVK, v);
    location.hash = '#/inicio';
    location.reload();
  };
  $('btnTeste').onclick = () => { localStorage.removeItem(DEVK); location.hash = '#/inicio'; location.reload(); };
  $('btnZerarTudo').onclick = () => {
    if (!confirm('Apagar TODOS os dados de teste, no banco?')) return;
    localStorage.removeItem(DEVK); localStorage.removeItem(SEENK); localStorage.removeItem(ATTK);
    setDoc(STATE_REF, defaultDb()).then(() => { location.hash = '#/inicio'; location.reload(); });
  };
  $('btnSeed').onclick = seedElenco;
  $('btnSimular').onclick = () => {
    if (simTimer) return stopSim();
    const m = cur();
    if (!m || m.status !== 'live') return toast('Inicie o jogo antes de simular.', 'bad');
    simTimer = setInterval(simStep, 3000);
    $('btnSimular').textContent = 'Parar simulação';
  };
  $('btnGolTeste').onclick = () => {
    const m = cur();
    if (!m || !['live', 'paused', 'break'].includes(m.status)) return toast('Inicie o jogo antes.', 'bad');
    const team = pick(['A', 'B']);
    const ids = rosterOf(m, team);
    if (!ids || !ids.length) return toast('Sem jogadores neste time.', 'bad');
    const jog = pick(ids);
    const outros = ids.filter(x => x !== jog);
    const ass = outros.length && Math.random() < 0.6 ? pick(outros) : null;
    addEvent({ tipo: 'goal', team, jog, ass, min: '' });
  };
  $('btnMaisA');
}
let simTimer = null;
function simStep() {
  const m = cur();
  if (!m || m.status !== 'live') return stopSim();
  const team = Math.random() < 0.5 ? 'A' : 'B';
  const ids = rosterOf(m, team);
  if (!ids || !ids.length) return;
  const jog = pick(ids);
  const s = Math.random();
  if (s < 0.55) {
    const outros = ids.filter(x => x !== jog);
    const ass = Math.random() < 0.6 && outros.length ? pick(outros) : null;
    addEvent({ tipo: 'goal', team, jog, ass, min: '' });
  } else if (s < 0.85) {
    addEvent({ tipo: 'yellow', team, jog, ass: null, min: '' });
  } else if (s < 0.9) {
    addEvent({ tipo: 'red', team, jog, ass: null, min: '' });
  }
}
function stopSim() {
  clearInterval(simTimer); simTimer = null;
  $('btnSimular').textContent = 'Simular lances (teste)';
}
const NOMES = ['Lucas','Rafael','Bruno','Gustavo','Felipe','Diego','Thiago','Matheus','Caio','Vinicius','João','Pedro','Gabriel','Leandro','Renan','Igor','Eduardo','Murilo','Douglas','Wesley','Rodrigo','Kauã'];
const SOBRENOMES = ['Silva','Souza','Oliveira','Costa','Pereira','Lima','Gomes','Ribeiro','Almeida','Nascimento','Carvalho','Rocha','Dias','Barbosa','Moreira','Teixeira','Mendes','Araújo','Cardoso','Correia','Melo','Freitas'];
const POS_TIME = ['Goleiro','Zagueiro','Zagueiro','Lateral direito','Lateral esquerdo','Volante','Volante','Meia','Meia-atacante','Ponta esquerda','Centroavante'];
const COR_TIME = { A: '#2563eb', B: '#16a34a' };
function seedElenco() {
  if (!confirm('Criar elenco de teste?')) return;
  const stamp = Date.now().toString(36);
  ['A','B'].forEach(team => {
    POS_TIME.forEach((pos, k) => {
      const id = 'tp' + team + k + stamp;
      const nome = pick(NOMES) + ' ' + pick(SOBRENOMES);
      const shirt = k * 2 + (team === 'B' ? 2 : 1);
      db.players.push({
        id, pin: '', name: nome, nick: k % 3 === 0 ? nome.split(' ')[0] : '',
        pos, mod: pick(['Campo','Quadra','Os dois','Os dois']), shirt, team,
        photo: fakeFoto(shirt, COR_TIME[team]), device: 'seed_' + id, conq: ['Estreante']
      });
    });
    if (!db.teams[team].nome) db.teams[team].nome = team === 'A' ? 'Time Azul' : 'Time Verde';
    ['Campo','Quadra'].forEach(mod => reflow(team, mod));
  });
  ['A','B'].forEach(team => {
    if (db.techs.some(x => x.team === team)) return;
    db.techs.push({ id: 'st' + team + stamp, pin: '', name: 'Técnico ' + team + ' ' + pick(SOBRENOMES),
                    team, photo: fakeFoto(null, '#0f172a'), device: 'seed_tec_' + team + stamp });
  });
  if (!db.ref) db.ref = { pin: '', name: 'Árbitro Teste', device: 'seed_ref_' + stamp };
  for (let i = 1; i <= 5; i++) {
    db.fans.push({ id: 'sf' + i + stamp, name: 'Torcedor ' + i + ' ' + pick(NOMES), device: 'seed_fan_' + i + stamp });
  }
  save();
  toast('Elenco de teste criado!', 'ok');
}

/* ===================== INICIALIZAÇÃO ===================== */
fillSelects();
setupTecnicoEvents();
setupArbitroEvents();
setupTorcidaEvents();
setupGerais();
document.querySelectorAll('[data-ic]').forEach(el => { el.innerHTML = icon(el.dataset.ic); });
if (TESTE) {
  ['btnTeste','btnZerarTudo','btnSeed','whoSel','btnSimular','btnGolTeste'].forEach(id => $(id).classList.remove('hidden'));
}
applyTheme();
window.addEventListener('hashchange', route);

onSnapshot(STATE_REF, snap => {
  db = snap.exists() ? normalize(snap.data()) : defaultDb();
  synced = true;
  refreshWho();
  const digitando = document.activeElement && ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName);
  if (!digitando) route();
  notifyCheck();
  if (cur() && cur().status === 'live') startTicker(); else stopTicker();
}, () => toast('Não foi possível conectar ao banco.', 'bad'));

route();