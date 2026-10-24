'use strict';

/* ===================== CONFIGURAÇÃO ===================== */
const TESTE = true; // true = modo teste (sem PIN). Coloque false antes de publicar.

const PINS = {
  jogador: ['JR-482','JR-917','JR-305','JR-661','JR-128','JR-774','JR-239','JR-590','JR-846','JR-013','JR-708','JR-364','JR-955','JR-472','JR-281','JR-619','JR-837','JR-156','JR-694','JR-421','JR-073','JR-530'],
  tecnico: ['TEC-X7Q2','TEC-P4W9'],
  arbitro: ['JUIZ-Q7M4']
};
const KEY = 'jogorapido_v3', DEVK = 'jr_device_v3', SEENK = 'jr_seen_v3';
const BANNED = ['idiota','burro','imbecil','otario','lixo','merda','porra','caralho','fdp'];

const POS = ['Goleiro','Zagueiro','Lateral direito','Lateral esquerdo','Volante','Meia',
             'Meia-atacante','Ponta esquerda','Ponta direita','Centroavante'];

const COMPAT = {
  'Goleiro':          ['GOL'],
  'Zagueiro':         ['ZAG','LD','LE','VOL'],
  'Lateral direito':  ['LD','ZAG','LE'],
  'Lateral esquerdo': ['LE','ZAG','LD'],
  'Volante':          ['VOL','MEI','ZAG'],
  'Meia':             ['MEI','VOL','MAT'],
  'Meia-atacante':    ['MAT','MEI','PE','PD','CA'],
  'Ponta esquerda':   ['PE','PD','MAT','CA'],
  'Ponta direita':    ['PD','PE','MAT','CA'],
  'Centroavante':     ['CA','MAT','PE','PD']
};

const FORM = {
  '4-3-3':   [['GOL'],['LD','ZAG','ZAG','LE'],['VOL','MEI','MEI'],['PE','CA','PD']],
  '4-4-2':   [['GOL'],['LD','ZAG','ZAG','LE'],['PE','VOL','VOL','PD'],['CA','CA']],
  '4-2-3-1': [['GOL'],['LD','ZAG','ZAG','LE'],['VOL','VOL'],['PE','MAT','PD'],['CA']],
  '3-5-2':   [['GOL'],['ZAG','ZAG','ZAG'],['LD','VOL','MEI','VOL','LE'],['CA','CA']],
  '3-4-3':   [['GOL'],['ZAG','ZAG','ZAG'],['LD','VOL','VOL','LE'],['PE','CA','PD']]
};

const PAGE_TITLES = { inicio:'Tela Inicial', jogador:'Jogador', tecnico:'Técnico', arbitro:'Árbitro', torcida:'Torcida & Votação' };

/* ===================== ÍCONES ===================== */
const IC = {
  gol: '<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" stroke="#111" stroke-width="1.5"/><polygon points="12,7 16,10 14.5,15 9.5,15 8,10" fill="#111"/></svg>',
  ass: '<svg class="ic" viewBox="0 0 24 24"><path d="M3 15 L3 7 L8 7 L9 11 L15 12 L20 12 L21 16 L21 18 L3 18 Z" fill="#fff" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  am: '🟨',
  ve: '🟥'
};
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
const fmt = s => { s = Math.floor(s); return String(Math.floor(s / 60)).padStart(2,'0') + ':' + String(s % 60).padStart(2,'0'); };
const avatar = (p, cls = '') => p.photo
  ? `<img class="av ${cls}" src="${p.photo}" alt="">`
  : `<span class="av ${cls}">${esc(initial(p))}</span>`;
const otherTeam = t => t === 'A' ? 'B' : 'A';
const teamOf = t => (db.teams[t] && db.teams[t].nome) || 'Time ' + t;

/* Foto fictícia: silhueta com camisa e número (gerada na hora, sem internet) */
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
      const s = Math.min(1, 220 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); res(null); };
    img.src = url;
  });
}

/* ===================== BANCO DE DADOS ===================== */
function emptyTeam() { return { formation: '4-3-3', slots: Array(11).fill(null), members: [], nome: '' }; }
function defaultDb() {
  return {
    players: [],
    techs: [],
    ref: null,
    fans: [],
    pinsUsed: {},
    teams: { A: emptyTeam(), B: emptyTeam() },
    matches: [],
    votes: {},
    comments: [],
    tutorialDone: false
  };
}
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (!d) return defaultDb();
    const base = defaultDb();
    return { ...base, ...d,
      teams: { A: { ...emptyTeam(), ...(d.teams?.A || {}) }, B: { ...emptyTeam(), ...(d.teams?.B || {}) } } };
  } catch (e) { return defaultDb(); }
}
let db = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); }
  catch (e) { toast('Sem espaço no aparelho. Use fotos menores.', 'bad'); }
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
const nameOf = id => { const p = findP(id); return p ? dname(p) : '—'; };

/* ===================== ESQUEMAS E VAGAS ===================== */
function slotsOf(f) {
  const lines = FORM[f], m = lines.length, out = [];
  lines.forEach((line, i) => {
    const y = i === 0 ? 90 : 72 - (i - 1) * (56 / (m - 2));
    line.forEach((code, k) => out.push({ code, x: (k + 1) * 100 / (line.length + 1), y }));
  });
  return out;
}
function placeAuto(team, p) {
  const t = db.teams[team];
  const codes = slotsOf(t.formation).map(s => s.code);
  for (const c of (COMPAT[p.pos] || [])) {
    const i = codes.findIndex((cc, k) => cc === c && !t.slots[k]);
    if (i >= 0) { t.slots[i] = p.id; return true; }
  }
  return false;
}
function reflow(team) {
  const t = db.teams[team];
  t.slots = Array(11).fill(null);
  t.members.forEach(id => { const p = findP(id); if (p) placeAuto(team, p); });
}

/* ===================== PARTIDA ===================== */
const cur = () => { const m = db.matches[db.matches.length - 1]; return m && m.status !== 'finished' ? m : null; };
const lastMatch = () => db.matches[db.matches.length - 1] || null;
const lastFinished = () => [...db.matches].reverse().find(m => m.status === 'finished') || null;

function elapsedCur(m) {
  return m.status === 'live' && m.startedAt ? m.base + (Date.now() - m.startedAt) / 1000 : m.base;
}
function totalSecs(m) {
  return m.current === 2 ? (m.h1 || 0) + elapsedCur(m) : elapsedCur(m);
}
function curMinute(m) { return Math.floor(totalSecs(m) / 60) + 1; }

function scoreOf(m) {
  const s = { A: 0, B: 0 };
  (m.events || []).forEach(e => { if (e.tipo === 'goal') s[e.team]++; });
  return s;
}

function statsOf(pid) {
  const s = { gols: 0, ass: 0, am: 0, ve: 0, jogos: 0, notaTec: null, notaFan: null, nota: null };
  db.matches.forEach(m => {
    (m.events || []).forEach(e => {
      if (e.tipo === 'goal' && e.jog === pid) s.gols++;
      if (e.tipo === 'goal' && e.ass === pid) s.ass++;
      if (e.tipo === 'yellow' && e.jog === pid) s.am++;
      if (e.tipo === 'red' && e.jog === pid) s.ve++;
    });
    if (m.roster && (m.roster.A.includes(pid) || m.roster.B.includes(pid))) s.jogos++;
  });
  const tec = [], fan = [];
  db.matches.forEach(m => { if (m.techRatings && m.techRatings[pid] != null) tec.push(m.techRatings[pid]); });
  Object.values(db.votes).forEach(mv => Object.values(mv).forEach(v => { if (v.player === pid) fan.push(v.score); }));
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  s.notaTec = avg(tec);
  s.notaFan = avg(fan);
  s.nota = s.notaTec != null && s.notaFan != null ? (s.notaTec + s.notaFan) / 2
         : s.notaTec != null ? s.notaTec : s.notaFan;
  return s;
}
const notaTxt = n => n == null ? '—' : n.toFixed(1);

function goleiros() {
  const map = {};
  db.matches.filter(m => m.status === 'finished' && m.starters).forEach(m => {
    ['A','B'].forEach(t => {
      const gk = m.starters[t][0];
      if (!gk) return;
      const sc = scoreOf(m)[otherTeam(t)];
      map[gk] = map[gk] || { jogos: 0, sof: 0 };
      map[gk].jogos++; map[gk].sof += sc;
    });
  });
  return Object.entries(map)
    .map(([id, v]) => ({ p: findP(id), jogos: v.jogos, sof: v.sof, media: v.sof / v.jogos }))
    .filter(x => x.p);
}

const PONTOS = { goal: 3, yellow: -1, red: -3 };
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

/* ===================== ROTAS ===================== */
let homeTab = 'entrar';
let voteSel = null;
let refTeam = 'A';

function route() {
  const h = location.hash.replace('#/', '') || 'inicio';
  const page = PAGE_TITLES[h] ? h : 'inicio';
  document.querySelectorAll('.page').forEach(s => s.classList.toggle('hidden', s.dataset.page !== page));
  $('btnBack').classList.toggle('hidden', page === 'inicio');
  document.title = 'JR — ' + PAGE_TITLES[page];
  window.scrollTo(0, 0);
  const R = { inicio: renderInicio, jogador: renderJogador, tecnico: renderTecnico,
              arbitro: renderArbitro, torcida: renderTorcida };
  R[page]();
  syncLive();
}
function syncLive() {
  const m = cur();
  $('liveBadge').classList.toggle('hidden', !(m && m.status === 'live'));
}

/* ===================== INÍCIO (4 ABAS) ===================== */
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
document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { homeTab = b.dataset.tab; renderInicio(); });

function renderStatusCard() {
  const m = cur() || lastMatch();
  const st = !m ? 'Nenhum jogo cadastrado'
    : m.status === 'live' ? '🔴 AO VIVO · ' + (m.current === 2 ? '2º tempo' : '1º tempo')
    : m.status === 'paused' ? '⏸ Pausado'
    : m.status === 'break' ? '⏱ Intervalo'
    : m.status === 'finished' ? '✅ Partida encerrada' : 'Aguardando início';
  const sc = m ? scoreOf(m) : null;
  $('matchStatus').innerHTML = `<h3>Jogo atual</h3><p><b>${st}</b></p>` +
    (m ? `<p class="muted">${esc(m.info.local)} · ${esc(m.info.tipo)} · ${esc(m.info.mod)}</p>
          <p><b>${esc(teamOf('A'))} ${sc.A} × ${sc.B} ${esc(teamOf('B'))}</b></p>` : '');
}

function renderQuem() {
  const lf = lastFinished();
  const votos = lf ? Object.keys(db.votes[lf.id] || {}).length : 0;
  const rows = [
    ...db.players.map(p => ({ n: dname(p), r: '⚽ Jogador', p })),
    ...db.techs.map(t => ({ n: t.name, r: '📋 Técnico ' + teamOf(t.team), p: t })),
    ...(db.ref ? [{ n: db.ref.name, r: '🎩 Árbitro', p: db.ref }] : []),
    ...db.fans.map(f => ({ n: f.name, r: '📈 Torcedor', p: f }))
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
      <p class="muted" style="margin-top:12px">Votaram na última partida: <b>${votos}</b></p>
    </div>
    <div class="card">
      <h3>Todos cadastrados</h3>
      <div class="list">${rows.map(r => `
        <div class="item">${r.p.photo ? avatar(r.p, 'sm') : `<span class="av sm">${esc((r.n || '?')[0].toUpperCase())}</span>`}
          <div><b>${esc(r.n)}</b><small>${esc(r.r)}</small></div></div>`).join('') || '<p class="muted">Ninguém cadastrado ainda.</p>'}
      </div>
    </div>`;
}

function pod(list, valor, icone, rotulo) {
  if (!list.length) return '<p class="muted">Sem dados ainda.</p>';
  const ord = list.length >= 3 ? [list[1], list[0], list[2]] : list;
  return `<div class="podium">${ord.map(r => {
    const first = list.indexOf(r) === 0;
    return `<div class="pod ${first ? 'first' : ''}">
      <div>${avatar(r.p, 'sm')}</div>
      <div>${icone}</div>
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
  const gk = goleiros();
  const melhor = gk.length ? gk.slice().sort((a, b) => a.media - b.media)[0] : null;
  const pior = gk.length ? gk.slice().sort((a, b) => b.media - a.media)[0] : null;
  const ult = craqueDoJogo(lastFinished());
  const tabela = rows.slice().sort((a, b) => b.s.gols - a.s.gols || (b.s.nota || 0) - (a.s.nota || 0));

  $('tab-craques').innerHTML = `
    <div class="card"><h3>Artilharia</h3>${pod(artilharia, r => r.s.gols, IC.gol, 'gols')}</div>
    <div class="card"><h3>Garçons</h3>${pod(garcons, r => r.s.ass, IC.ass, 'assistências')}</div>
    <div class="card"><h3>Craques (nota final)</h3>${pod(craques, r => notaTxt(r.s.nota), '⭐', 'nota')}</div>
    <div class="card">
      <h3>Goleiros</h3>
      <div class="list">
        <div class="item"><span>Melhor (menos gols sofridos)</span><b style="margin-left:auto">${melhor ? esc(dname(melhor.p)) + ' · ' + melhor.media.toFixed(1) + ' por jogo' : '—'}</b></div>
        <div class="item"><span>Mão de alface</span><b style="margin-left:auto">${pior ? esc(dname(pior.p)) + ' · ' + pior.media.toFixed(1) + ' por jogo' : '—'}</b></div>
      </div>
    </div>
    <div class="card">
      <h3>Craque do último jogo</h3>
      <p>${ult ? `<b>${esc(dname(ult.p))}</b> · ${ult.pt} pontos` : 'Ainda não há partida encerrada.'}</p>
    </div>
    <div class="card">
      <h3>Tabela geral</h3>
      <div class="tablewrap"><table>
        <thead><tr>
          <th>#</th><th>Jogador</th><th>Camisa</th>
          <th>${IC.gol}</th><th>${IC.ass}</th><th>${IC.am}</th><th>${IC.ve}</th>
          <th>Nota técnico</th><th>Nota torcida</th><th>Final</th>
        </tr></thead>
        <tbody>${tabela.map((r, i) => `
          <tr>
            <td class="neon">${i + 1}º</td>
            <td><div class="who">${avatar(r.p, 'sm')}<div><b>${esc(dname(r.p))}</b><small class="muted" style="display:block">${esc(r.p.pos)}</small></div></div></td>
            <td>${r.p.shirt}</td>
            <td>${r.s.gols}</td><td>${r.s.ass}</td><td>${r.s.am}</td><td>${r.s.ve}</td>
            <td>${notaTxt(r.s.notaTec)}</td><td>${notaTxt(r.s.notaFan)}</td><td><b>${notaTxt(r.s.nota)}</b></td>
          </tr>`).join('') || '<tr><td colspan="10" class="muted">Nenhum jogador cadastrado.</td></tr>'}
        </tbody>
      </table></div>
    </div>`;
}

function renderEscalacao() {
  const m = cur() || lastMatch();
  const info = m ? `
    <div class="card">
      <h3>Jogo</h3>
      <p><b>${esc(m.info.local)}</b></p>
      <p class="muted">${m.info.date ? new Date(m.info.date).toLocaleString('pt-BR') : 'Horário a definir'} · ${esc(m.info.periodo)} · ${esc(m.info.clima)} · gramado ${esc(m.info.gram)}</p>
      <p class="muted">${esc(m.info.tipo)} · ${esc(m.info.mod)}</p>
      ${m.info.veredito ? `<div class="veredito ${m.info.veredito.ok ? 'ok' : 'no'}">${esc(m.info.veredito.texto)}${m.info.veredito.r.length ? `<small>${esc(m.info.veredito.r.join(' · '))}</small>` : ''}</div>` : ''}
    </div>` : `<div class="card"><p class="muted">O árbitro ainda não cadastrou o jogo.</p></div>`;

  const campo = t => {
    const tm = db.teams[t];
    const tec = db.techs.find(x => x.team === t);
    const slots = slotsOf(tm.formation);
    const tit = tm.slots.map((id, i) => ({ p: findP(id), x: slots[i].x, y: slots[i].y })).filter(x => x.p);
    const banco = tm.members.map(findP).filter(p => p && !tm.slots.includes(p.id));
    const itens = tit.map(({ p, x, y }) => {
      const s = statsOf(p.id);
      const nota = s.nota;
      const cls = nota != null && nota / 10 >= 7 ? 'ok' : 'warn';
      return `<div class="pl" style="left:${x}%;top:${y}%">
        ${nota != null ? `<span class="nota ${cls}">${(nota / 10).toFixed(2).replace('.', ',')}</span>` : ''}
        ${avatar(p, 'dot')}
        <div class="pbd">${badges(s)}</div>
        <div class="pn">${p.shirt} ${esc(dname(p))}</div>
      </div>`;
    }).join('');
    return `<div class="card">
      <div class="lineup-title">
        ${tec ? avatar(tec, 'sm') : '<span class="av sm">?</span>'}
        <div><h3 style="margin:0">${esc(teamOf(t))} · ${tm.formation}</h3>
        <small>Técnico: ${esc(tec ? tec.name : 'ainda não cadastrado')}</small></div>
      </div>
      <div class="pitch-esc">${itens || '<p style="position:absolute;top:45%;width:100%;text-align:center;color:#fff">Escalação ainda não montada</p>'}</div>
      ${banco.length ? `<h3>Banco</h3>` + banco.map(p => `<div class="lu-row">${avatar(p, 'sm')}<b>${esc(dname(p))}</b><span class="shirt">${p.shirt}</span></div>`).join('') : ''}
    </div>`;
  };
  $('tab-escalacao').innerHTML = info + `<div class="grid2">${campo('A')}${campo('B')}</div>`;
}

/* ===================== JOGADOR ===================== */
function fillSelects() {
  $('cPos').innerHTML = POS.map(p => `<option>${p}</option>`).join('');
  $('cCamisa').innerHTML = Array.from({ length: 99 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
}
fillSelects();
document.querySelectorAll('input[name=apelidoSN]').forEach(r => r.onchange = () =>
  $('boxApelido').classList.toggle('hidden', document.querySelector('input[name=apelidoSN]:checked').value !== 'sim'));

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
  const team = ['A','B'].find(t => db.teams[t].members.includes(p.id));
  $('jogPerfil').classList.remove('hidden');
  $('jogPerfil').innerHTML = `
    <div class="card">
      <div class="who" style="gap:16px">
        ${avatar(p, 'lg')}
        <div>
          <h2 style="margin:0">${esc(dname(p))}</h2>
          ${p.nick ? `<p class="muted" style="margin:2px 0">${esc(p.name)}</p>` : ''}
          <p style="margin:6px 0"><span class="pill">#${p.shirt}</span><span class="pill">${esc(p.pos)}</span><span class="pill">${esc(p.mod)}</span></p>
          <p class="muted" style="margin:0">${team ? esc(teamOf(team)) : 'Ainda sem time'}</p>
        </div>
      </div>
      <div class="counts" style="margin-top:16px">
        <div class="count"><b>${s.gols}</b><span>Gols</span></div>
        <div class="count"><b>${s.ass}</b><span>Assistências</span></div>
        <div class="count"><b>${s.am}</b><span>🟨 Amarelos</span></div>
        <div class="count"><b>${s.ve}</b><span>🟥 Vermelhos</span></div>
      </div>
      <p class="muted" style="margin-top:12px">Nota final: <b>${notaTxt(s.nota)}</b> · Jogos: ${s.jogos}</p>
    </div>`;
}

$('formJog').onsubmit = async e => {
  e.preventDefault();
  if (me()) return toast('Este aparelho já tem cadastro.', 'bad');
  const pin = $('cPin').value.trim().toUpperCase();
  if (!TESTE && !PINS.jogador.includes(pin)) return toast('PIN inválido para jogador.', 'bad');
  if (!TESTE && db.pinsUsed[pin]) return toast('Este PIN já foi usado.', 'bad');
  const nome = $('cNome').value.trim();
  if (!nome) return toast('Informe o nome completo.', 'bad');
  const temApelido = document.querySelector('input[name=apelidoSN]:checked').value === 'sim';
  const apelido = temApelido ? $('cApelido').value.trim() : '';
  if (temApelido && !apelido) return toast('Digite o apelido ou marque "Não".', 'bad');
  let photo = null;
  const f = $('cFoto').files[0];
  if (f && $('cAuth').checked) photo = await compress(f);
  const dev = device();
  db.players.push({
    id: 'p' + Date.now().toString(36), pin, name: nome, nick: apelido || '',
    pos: $('cPos').value, mod: $('cMod').value, shirt: +$('cCamisa').value, photo, device: dev
  });
  if (pin) db.pinsUsed[pin] = dev;
  save();
  toast('Perfil criado!', 'ok');
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
  if (!TESTE && !PINS.tecnico.includes(pin)) return toast('PIN inválido para técnico.', 'bad');
  if (!TESTE && db.pinsUsed[pin]) return toast('Este PIN já foi usado.', 'bad');
  const team = $('tTime').value;
  if (db.techs.some(t => t.team === team)) return toast(`${teamOf(team)} já tem técnico.`, 'bad');
  const nome = $('tNome').value.trim();
  if (!nome) return toast('Informe seu nome.', 'bad');
  let photo = null;
  const f = $('tFoto').files[0];
  if (f) photo = await compress(f);
  const dev = device();
  db.techs.push({ id: 't' + Date.now().toString(36), pin, name: nome, team, photo, device: dev });
  if (pin) db.pinsUsed[pin] = dev;
  save();
  toast('Técnico cadastrado!', 'ok');
  renderTecnico();
};

function drawTecBoard(team) {
  const t = db.teams[team];
  const tec = db.techs.find(x => x.team === team);
  $('tTitulo').textContent = `${teamOf(team)} · Técnico: ${tec ? tec.name : ''}`;
  $('tNomeTime').value = t.nome || '';
  if (!$('tFormation').options.length) {
    $('tFormation').innerHTML = Object.keys(FORM).map(f => `<option>${f}</option>`).join('');
  }
  $('tFormation').value = t.formation;
  drawMembers(team);
  drawPitch(team);
  drawBench(team);
  drawRatings(team);
}

function drawMembers(team) {
  const other = otherTeam(team);
  const mine = db.teams[team].members, theirs = db.teams[other].members;
  $('tMembers').innerHTML = db.players.map(p => {
    const inThis = mine.includes(p.id), inOther = theirs.includes(p.id);
    return `<button class="pick ${inThis ? 'on' : ''} ${inOther ? 'off' : ''}" data-pid="${p.id}" ${inOther ? 'disabled' : ''}>
      ${avatar(p, 'sm')}
      <span>${esc(dname(p))}<small>#${p.shirt} · ${esc(p.pos)}${inThis ? ' · no time' : ''}</small></span>
    </button>`;
  }).join('') || '<p class="muted">Nenhum jogador cadastrado ainda.</p>';
}

function drawPitch(team) {
  const t = db.teams[team];
  const slots = slotsOf(t.formation);
  const pitch = $('tPitch');
  pitch.innerHTML = '<div class="mid"></div><div class="area"></div><div class="circle"></div>';
  slots.forEach((s, i) => {
    const p = findP(t.slots[i]);
    const b = document.createElement('button');
    b.className = 'slot';
    b.style.left = s.x + '%';
    b.style.top = s.y + '%';
    b.innerHTML = p
      ? `${avatar(p, 'dot')}<span class="nm">${esc(dname(p))}</span><span class="rl">${s.code} · #${p.shirt}</span>`
      : `<span class="av dot empty">+</span><span class="rl">${s.code}</span>`;
    b.onclick = () => slotModal(team, i);
    pitch.appendChild(b);
  });
}

function drawBench(team) {
  const t = db.teams[team];
  const banco = t.members.map(findP).filter(p => p && !t.slots.includes(p.id));
  $('tBench').innerHTML = banco.length
    ? banco.map(p => `<span class="chip">${esc(dname(p))} · #${p.shirt} · ${esc(p.pos)}</span>`).join('')
    : '<span class="muted">Ninguém no banco.</span>';
}

function drawRatings(team) {
  const lf = lastFinished();
  if (!lf) { $('tRatings').innerHTML = '<p class="muted">As notas aparecem depois que a partida terminar.</p>'; return; }
  const ids = lf.roster ? lf.roster[team] : [];
  const rows = ids.map(findP).filter(Boolean);
  $('tRatings').innerHTML = rows.map(p => {
    const v = lf.techRatings && lf.techRatings[p.id] != null ? lf.techRatings[p.id] : 50;
    return `<div class="who" style="margin:8px 0">
      <span style="width:120px;font-weight:700">${esc(dname(p))}</span>
      <input type="range" min="0" max="100" value="${v}" data-rate="${p.id}" style="flex:1">
      <b style="width:36px;text-align:right">${v}</b></div>`;
  }).join('') || '<p class="muted">Sem jogadores nesta partida.</p>';
}

function slotModal(team, i) {
  const t = db.teams[team];
  const codes = slotsOf(t.formation);
  const atual = t.slots[i];
  const cands = t.members.map(findP).filter(p => p && p.id !== atual);
  openModal(`
    <h3>Vaga ${codes[i].code}</h3>
    <div class="grid-names">${cands.map(p => `
      <button class="pick" data-id="${p.id}">${avatar(p, 'sm')}<span>${esc(dname(p))}<small>${esc(p.pos)}</small></span></button>`).join('') ||
      '<p class="muted">Adicione jogadores ao time primeiro.</p>'}</div>
    <div class="row wrap">
      <button class="btn-danger" data-id="">Tirar desta vaga</button>
      <button class="btn-ghost" id="mClose">Fechar</button>
    </div>`);
  document.querySelectorAll('#modalBody [data-id]').forEach(b => b.onclick = () => {
    const id = b.dataset.id;
    if (id) {
      const j = t.slots.indexOf(id);
      if (j >= 0) t.slots[j] = atual || null;
      t.slots[i] = id;
    } else {
      t.slots[i] = null;
    }
    save(); closeModal(); drawTecBoard(team);
  });
  $('mClose').onclick = closeModal;
}

function toggleMember(team, pid) {
  const t = db.teams[team];
  const p = findP(pid); if (!p) return;
  if (t.members.includes(pid)) {
    t.members = t.members.filter(x => x !== pid);
    t.slots = t.slots.map(x => x === pid ? null : x);
  } else {
    const dup = t.members.map(findP).find(q => q && q.shirt === p.shirt);
    if (dup) return toast(`A camisa ${p.shirt} já é de ${dname(dup)} neste time.`, 'bad');
    t.members.push(pid);
    placeAuto(team, p);
  }
  save(); drawTecBoard(team);
}

$('tMembers').onclick = e => {
  const b = e.target.closest('[data-pid]');
  if (!b || b.disabled) return;
  const r = me(); if (!r || r.role !== 'tecnico') return;
  toggleMember(r.rec.team, b.dataset.pid);
};
$('tFormation').onchange = () => {
  const r = me(); if (!r || r.role !== 'tecnico') return;
  const team = r.rec.team;
  db.teams[team].formation = $('tFormation').value;
  reflow(team); save(); drawTecBoard(team);
};
$('btnZerar').onclick = () => {
  const r = me(); if (!r || r.role !== 'tecnico') return;
  if (!confirm('Zerar a escalação? Os jogadores continuam no time, no banco.')) return;
  db.teams[r.rec.team].slots = Array(11).fill(null);
  save(); drawTecBoard(r.rec.team);
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
$('tNomeTime').onchange = () => {
  const r = me(); if (!r || r.role !== 'tecnico') return;
  db.teams[r.rec.team].nome = $('tNomeTime').value.trim();
  save(); drawTecBoard(r.rec.team);
};
$('btnEmbaralhar').onclick = () => {
  const r = me(); if (!r || r.role !== 'tecnico') return;
  const team = r.rec.team;
  const f = pick(Object.keys(FORM));
  db.teams[team].formation = f;
  db.teams[team].members.sort(() => Math.random() - 0.5);
  reflow(team); save(); drawTecBoard(team);
  toast('Esquema ' + f + ' embaralhado.', 'ok');
};

/* ===================== ÁRBITRO ===================== */
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
  if (!TESTE && !PINS.arbitro.includes(pin)) return toast('PIN inválido para árbitro.', 'bad');
  if (!TESTE && db.pinsUsed[pin]) return toast('Este PIN já foi usado.', 'bad');
  const nome = $('rNome').value.trim();
  if (!nome) return toast('Informe seu nome.', 'bad');
  const dev = device();
  db.ref = { pin, name: nome, device: dev };
  if (pin) db.pinsUsed[pin] = dev;
  save();
  toast('Bem-vindo, árbitro!', 'ok');
  renderArbitro();
};

function readPre() {
  return {
    local: $('pLocal').value.trim(), date: $('pDate').value,
    clima: $('pClima').value, gram: $('pGram').value, periodo: $('pPeriodo').value,
    ilum: $('pIlum').checked, mod: $('pMod').value, tipo: $('pTipo').value,
    tempo: +$('pTempo').value || 20
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
['pClima','pGram','pPeriodo','pIlum'].forEach(id => $(id).addEventListener('change', drawVeredito));

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
  }
  drawVeredito();
}

function snapshotRosters(m) {
  m.roster = { A: [...db.teams.A.members], B: [...db.teams.B.members] };
  m.starters = { A: [...db.teams.A.slots], B: [...db.teams.B.slots] };
  m.form = { A: db.teams.A.formation, B: db.teams.B.formation };
}

$('btnSalvarPre').onclick = () => {
  const info = readPre();
  if (!info.local) return toast('Informe o local.', 'bad');
  info.veredito = veredito(info);
  let m = cur();
  if (!m) {
    m = { id: 'm' + Date.now().toString(36), info, status: 'idle', current: 1, base: 0,
          startedAt: null, h1: 0, events: [], notes: '', link: '', techRatings: {} };
    db.matches.push(m);
  }
  m.info = info;
  if (m.status === 'idle') snapshotRosters(m);
  save();
  toast('Pré-jogo salvo.', 'ok');
  drawAll();
};

function startPlay() {
  const m = cur();
  if (!m) return toast('Salve o pré-jogo primeiro.', 'bad');
  if (m.status === 'live') return;
  if (m.status === 'idle')  { m.current = 1; m.base = 0; }
  if (m.status === 'break') { m.current = 2; m.base = 0; }
  m.status = 'live';
  m.startedAt = Date.now();
  save(); startTicker(); drawAll();
}
function pausePlay() {
  const m = cur(); if (!m || m.status !== 'live') return;
  m.base = elapsedCur(m); m.status = 'paused'; m.startedAt = null;
  save(); stopTicker(); drawAll();
}
function intervalo() {
  const m = cur();
  if (!m || m.current !== 1 || (m.status !== 'live' && m.status !== 'paused'))
    return toast('O intervalo só vale durante o 1º tempo.', 'bad');
  if (m.status === 'live') m.base = elapsedCur(m);
  m.h1 = m.base; m.base = 0; m.status = 'break'; m.startedAt = null;
  save(); stopTicker(); drawAll();
}
function encerrar() {
  const m = cur(); if (!m) return;
  if (!confirm('Encerrar a partida? A torcida poderá votar.')) return;
  if (m.status === 'live') m.base = elapsedCur(m);
  if (m.status !== 'break' && m.current === 1) m.h1 = m.base;
  m.status = 'finished'; m.startedAt = null;
  save(); stopTicker(); stopSim(); drawAll();
  toast('Partida encerrada.', 'ok');
}
$('bPlay').onclick = startPlay;
$('bPause').onclick = pausePlay;
$('bInt').onclick = intervalo;
$('bEnd').onclick = encerrar;

let ticker = null;
function startTicker() { if (!ticker) ticker = setInterval(tickLoop, 1000); }
function stopTicker() { clearInterval(ticker); ticker = null; }
function tickLoop() { drawClock(); syncLive(); notifyCheck(); }

function drawClock() {
  const m = lastMatch();
  if (!m) { $('clock').textContent = '00:00'; $('halfLabel').textContent = 'Aguardando início'; return; }
  $('clock').textContent = fmt(elapsedCur(m));
  const txt = { idle:'Aguardando início', live: (m.current === 2 ? '2º tempo' : '1º tempo'),
                paused:'Pausado', break:'Intervalo', finished:'Partida encerrada' }[m.status];
  $('halfLabel').textContent = txt;
}
function drawScore() {
  const m = lastMatch(); const s = m ? scoreOf(m) : { A: 0, B: 0 };
  $('placarA').textContent = s.A;
  $('placarB').textContent = s.B;
  $('lblA').textContent = teamOf('A');
  $('lblB').textContent = teamOf('B');
  $('bTimeA').textContent = teamOf('A');
  $('bTimeB').textContent = teamOf('B');
}

$('bTimeA').onclick = () => { refTeam = 'A'; drawRoster(); };
$('bTimeB').onclick = () => { refTeam = 'B'; drawRoster(); };

function drawRoster() {
  const m = cur() || lastMatch();
  $('bTimeA').className = refTeam === 'A' ? 'btn-small' : 'btn-ghost';
  $('bTimeB').className = refTeam === 'B' ? 'btn-small' : 'btn-ghost';
  if (!m || !m.roster) { $('roster').innerHTML = '<p class="muted">Salve o pré-jogo para carregar as escalações.</p>'; return; }
  const tec = db.techs.find(x => x.team === refTeam);
  const cab = `<p class="muted" style="grid-column:1/-1;margin:0">${esc(teamOf(refTeam))} · técnico: ${esc(tec ? tec.name : '—')}</p>`;
  const ids = m.roster[refTeam];
  $('roster').innerHTML = cab + ids.map(findP).filter(Boolean).map(p => {
    const gols = (m.events || []).filter(e => e.tipo === 'goal' && e.jog === p.id).length;
    return `<button class="pick" data-pid="${p.id}">${avatar(p, 'sm')}
      <span>${esc(dname(p))}<small>#${p.shirt} · ${esc(p.pos)}${gols ? ' · gols ' + gols : ''}</small></span></button>`;
  }).join('');
}
$('roster').onclick = e => {
  const b = e.target.closest('[data-pid]'); if (!b) return;
  const m = cur(); if (!m) return toast('Inicie a partida para lançar lances.', 'bad');
  eventModal(refTeam, b.dataset.pid);
};

function eventModal(team, pid) {
  const p = findP(pid);
  openModal(`
    <h3>${esc(dname(p))} <span class="muted">#${p.shirt}</span></h3>
    <div class="row wrap" style="margin-bottom:12px">
      <button class="btn-small" data-ev="goal">⚽ Gol</button>
      <button class="btn-ghost" data-ev="yellow">🟨 Amarelo</button>
      <button class="btn-danger" data-ev="red">🟥 Vermelho</button>
    </div>
    <label>Minuto (opcional)<input id="mMin" type="number" min="0" max="200" placeholder="Vazio = minuto atual"></label>
    <button class="btn-ghost" id="mClose">Cancelar</button>`);
  document.querySelectorAll('#modalBody [data-ev]').forEach(b => b.onclick = () => {
    const tipo = b.dataset.ev, min = $('mMin').value;
    if (tipo === 'goal') return assistModal(team, pid, min);
    closeModal();
    addEvent({ tipo, team, jog: pid, ass: null, min });
  });
  $('mClose').onclick = closeModal;
}

function assistModal(team, pid, min) {
  const m = cur();
  const outros = m.roster[team].filter(id => id !== pid).map(findP).filter(Boolean);
  openModal(`
    <h3>Quem deu a assistência?</h3>
    <div class="grid-names">${outros.map(p => `
      <button class="pick" data-id="${p.id}">${avatar(p, 'sm')}<span>${esc(dname(p))}</span></button>`).join('')}</div>
    <div class="row wrap">
      <button class="btn-ghost" data-id="">Sem assistência</button>
      <button class="btn-ghost" id="mClose">Cancelar</button>
    </div>`);
  document.querySelectorAll('#modalBody [data-id]').forEach(b => b.onclick = () => {
    closeModal();
    addEvent({ tipo: 'goal', team, jog: pid, ass: b.dataset.id || null, min });
  });
  $('mClose').onclick = closeModal;
}

function addEvent({ tipo, team, jog, ass, min }) {
  const m = cur();
  if (!m) return toast('Salve o pré-jogo primeiro.', 'bad');
  if (!['live', 'paused', 'break'].includes(m.status)) return toast('Inicie a partida para lançar lances.', 'bad');
  const agora = curMinute(m);
  const minute = (min === '' || min == null) ? agora : parseInt(min, 10);
  if (isNaN(minute) || minute < 0) return toast('Minuto inválido.', 'bad');
  if (minute > agora) return toast(`O minuto não pode passar de ${agora}'.`, 'bad');
  const note = minute < agora ? `Registrado com atraso: lance aos ${minute}' (registrado aos ${agora}').` : '';
  m.events.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), tipo, team, jog, ass: ass || null, min: minute, note });
  save(); drawAll(); notifyCheck();
  toast('Lance registrado.', 'ok');
}

function drawFeed() {
  const m = lastMatch();
  const list = m ? (m.events || []).slice().reverse() : [];
  const ic = { goal: '⚽ Gol', yellow: IC.am + ' Amarelo', red: IC.ve + ' Vermelho' };
  $('feed').innerHTML = list.length ? list.map(e => `
    <div class="ev">
      <div><b>${ic[e.tipo]}</b> · ${esc(nameOf(e.jog))}
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

/* ===================== EDITAR E APAGAR LANCES ===================== */
function findEvent(id) {
  const m = lastMatch();
  return { m, e: m ? (m.events || []).find(x => x.id === id) : null };
}

function removeEvent(id) {
  const { m, e } = findEvent(id);
  if (!e) return;
  if (!confirm(`Apagar este lance (${e.min}' · ${nameOf(e.jog)})?`)) return;
  m.events = m.events.filter(x => x.id !== id);
  save(); drawAll(); toast('Lance apagado.', 'ok');
}

function editModal(id) {
  const { m, e } = findEvent(id);
  if (!e) return;
  const roster = m.roster[e.team].map(findP).filter(Boolean);
  const opts = (arr, sel, vazio) => (vazio ? `<option value="">${vazio}</option>` : '') +
    arr.map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(dname(p))} #${p.shirt}</option>`).join('');
  openModal(`
    <h3>Editar lance</h3>
    <label>Tipo
      <select id="eTipo">
        <option value="goal" ${e.tipo === 'goal' ? 'selected' : ''}>⚽ Gol</option>
        <option value="yellow" ${e.tipo === 'yellow' ? 'selected' : ''}>🟨 Amarelo</option>
        <option value="red" ${e.tipo === 'red' ? 'selected' : ''}>🟥 Vermelho</option>
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
    save(); closeModal(); drawAll(); toast('Lance atualizado.', 'ok');
  };
  $('eDel').onclick = () => { closeModal(); removeEvent(id); };
  $('mClose').onclick = closeModal;
}

$('feed').onclick = e => {
  const ed = e.target.closest('[data-edit]');
  const dl = e.target.closest('[data-del]');
  if (ed) return editModal(ed.dataset.edit);
  if (dl) return removeEvent(dl.dataset.del);
};

$('btnGolTeste').onclick = () => {
  const m = cur();
  if (!m || !m.roster) return toast('Inicie o jogo antes.', 'bad');
  const team = pick(['A', 'B']);
  const ids = m.roster[team];
  if (!ids || !ids.length) return toast('Sem jogadores neste time.', 'bad');
  const jog = pick(ids);
  const outros = ids.filter(x => x !== jog);
  const ass = outros.length && Math.random() < 0.6 ? pick(outros) : null;
  addEvent({ tipo: 'goal', team, jog, ass, min: '' });
};

$('btnDesfazer').onclick = () => {
  const m = cur(); if (!m || !m.events.length) return;
  if (!confirm('Desfazer o último lance?')) return;
  m.events.pop(); save(); drawAll();
};

$('btnSalvarNotas').onclick = () => {
  const m = cur() || lastMatch();
  if (!m) return toast('Cadastre o jogo primeiro.', 'bad');
  m.notes = $('notas').value;
  m.link = $('link').value.trim();
  save(); toast('Salvo.', 'ok');
};

function resumo(m) {
  const sym = { goal: '⚽ Gol', yellow: '🟨 Amarelo', red: '🟥 Vermelho' };
  const linhas = (m.events || []).map(e => `${e.min}' ${sym[e.tipo]} · ${nameOf(e.jog)}${e.ass ? ' (assist. ' + nameOf(e.ass) + ')' : ''}`);
  const s = scoreOf(m);
  const data = m.info.date ? new Date(m.info.date).toLocaleString('pt-BR') : '-';
  return `*JR — Súmula*\n${m.info.local} | ${m.info.tipo}\n${data}\n${teamOf('A')} ${s.A} x ${s.B} ${teamOf('B')}\n\n` +
    `${linhas.join('\n') || 'Sem lances'}\n${m.notes ? '\n' + m.notes : ''}${m.link ? '\n' + m.link : ''}\n\n@jogorapido`;
}

$('btnZap').onclick = () => {
  const m = lastMatch(); if (!m) return toast('Sem jogo para enviar.', 'bad');
  window.open('https://wa.me/?text=' + encodeURIComponent(resumo(m)), '_blank');
};
$('btnPrint').onclick = () => {
  const m = lastMatch(); if (!m) return toast('Sem jogo para imprimir.', 'bad');
  $('printArea').innerHTML = `<h1>Súmula Oficial — JR</h1><pre style="white-space:pre-wrap">${esc(resumo(m))}</pre>`;
  window.print();
};

function drawAll() {
  drawScore(); drawClock(); drawFeed(); drawRoster(); syncLive();
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
  const txt = e.tipo === 'goal'
    ? `⚽ Gol de ${nameOf(e.jog)}${e.ass ? ' · assistência: ' + nameOf(e.ass) : ' · sem assistência'} (${e.min}')`
    : `${e.tipo === 'yellow' ? '🟨 Amarelo' : '🟥 Vermelho'} para ${nameOf(e.jog)} (${e.min}')`;
  showNotify(txt);
}
let notifyTimer = null;
function showNotify(txt) {
  const b = $('notifyBar');
  b.textContent = txt;
  b.classList.remove('hidden');
  clearTimeout(notifyTimer);
  notifyTimer = setTimeout(() => b.classList.add('hidden'), 5000);
}

/* ===================== TORCIDA ===================== */
const hasVoted = m => !!(db.votes[m.id] && db.votes[m.id][device()]);

function renderTorcida() {
  const r = me();
  $('formFan').classList.toggle('hidden', !!r);
  $('fanBox').classList.toggle('hidden', !r);
  if (!r) return;
  const lf = lastFinished();
  $('fQ').classList.add('hidden');
  $('fVote').classList.add('hidden');
  if (!lf) {
    $('fStatus').textContent = 'Aguardando o árbitro encerrar a partida.';
  } else if (hasVoted(lf)) {
    $('fStatus').textContent = 'Você já votou nesta partida. Obrigado!';
  } else {
    const s = scoreOf(lf);
    $('fStatus').textContent = `Partida encerrada: ${teamOf('A')} ${s.A} x ${s.B} ${teamOf('B')}. Você assistiu o jogo?`;
    $('fQ').classList.remove('hidden');
  }
  renderMural();
}

$('formFan').onsubmit = e => {
  e.preventDefault();
  if (me()) return;
  const nome = $('fNome').value.trim();
  if (!nome) return toast('Informe seu nome.', 'bad');
  db.fans.push({ id: 'f' + Date.now().toString(36), name: nome, device: device() });
  save(); toast('Bem-vindo à torcida!', 'ok');
  renderTorcida();
};

$('btnSim').onclick = () => {
  const lf = lastFinished(); if (!lf) return;
  $('fQ').classList.add('hidden');
  $('fVote').classList.remove('hidden');
  voteSel = null;
  const ids = [...lf.roster.A, ...lf.roster.B].map(findP).filter(Boolean);
  $('fGrid').innerHTML = ids.map(p => {
    const b = badges(statsOf(p.id));
    return `<button class="pick" data-pid="${p.id}">${avatar(p, 'sm')}<span>${esc(dname(p))}<small>${esc(teamOf(lf.roster.A.includes(p.id) ? 'A' : 'B'))} · #${p.shirt}</small><small>${b}</small></span></button>`;
  }).join('') || '<p class="muted">Sem jogadores nesta partida.</p>';
};
$('btnNao').onclick = () => toast('Só quem assistiu o jogo pode votar.', 'bad');
$('fGrid').onclick = e => {
  const b = e.target.closest('[data-pid]'); if (!b) return;
  voteSel = b.dataset.pid;
  document.querySelectorAll('#fGrid .pick').forEach(x => x.classList.toggle('on', x === b));
};
$('fRange').oninput = () => { $('fNota').textContent = $('fRange').value; };

$('btnVotar').onclick = () => {
  const lf = lastFinished(); if (!lf) return;
  if (hasVoted(lf)) return toast('Você já votou nesta partida.', 'bad');
  if (!voteSel) return toast('Escolha um jogador.', 'bad');
  if (!db.votes[lf.id]) db.votes[lf.id] = {};
  db.votes[lf.id][device()] = { player: voteSel, score: +$('fRange').value };
  save(); toast('Voto registrado!', 'ok');
  renderTorcida();
};

function renderMural() {
  $('mural').innerHTML = db.comments.length
    ? db.comments.slice(-50).reverse().map(c => `<div class="msg">${esc(c.text)}</div>`).join('')
    : '<p class="muted">Seja o primeiro a comentar.</p>';
}
$('btnComentar').onclick = () => {
  const t = $('comment').value.trim();
  if (!t) return;
  const n = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (BANNED.some(w => new RegExp('(^|\\W)' + w + '(\\W|$)').test(n)))
    return toast('Comentário bloqueado: linguagem inadequada.', 'bad');
  db.comments.push({ text: t, at: Date.now() });
  save(); $('comment').value = ''; renderMural();
};

/* ===================== BOTÕES GERAIS ===================== */
$('btnTut').onclick = () => {
  db.tutorialDone = true; save(); renderInicio();
  openModal(`
    <h3>Como usar</h3>
    <ol>
      <li><b>Jogador:</b> cadastre-se com o PIN JR- uma vez. Depois o aparelho te reconhece.</li>
      <li><b>Técnico:</b> cadastre-se com o PIN TEC-, escolha o time e monte a escalação.</li>
      <li><b>🎩 Árbitro:</b> salve o pré-jogo, inicie o tempo e registre os lances.</li>
      <li><b>📈 Torcida:</b> depois da partida, diga se assistiu e vote uma vez.</li>
    </ol>
    <button class="btn" id="mClose">Entendi</button>`);
  $('mClose').onclick = closeModal;
};
$('btnSkip').onclick = () => { db.tutorialDone = true; save(); renderInicio(); };
$('brandHome').onclick = () => { location.hash = '#/inicio'; };
$('btnBack').onclick = () => { location.hash = '#/inicio'; };
$('liveBadge').onclick = () => {
  homeTab = 'escalacao';
  location.hash = '#/inicio';
  route();
};

/* ===================== ELENCO E FERRAMENTAS DE TESTE ===================== */
const NOMES = ['Lucas','Rafael','Bruno','Gustavo','Felipe','Diego','Thiago','Matheus','Caio','Vinicius','João','Pedro','Gabriel','Leandro','Renan','Igor','Eduardo','Murilo','Douglas','Wesley','Rodrigo','Kauã'];
const SOBRENOMES = ['Silva','Souza','Oliveira','Costa','Pereira','Lima','Gomes','Ribeiro','Almeida','Nascimento','Carvalho','Rocha','Dias','Barbosa','Moreira','Teixeira','Mendes','Araújo','Cardoso','Correia','Melo','Freitas'];
const POS_TIME = ['Goleiro','Zagueiro','Zagueiro','Lateral direito','Lateral esquerdo','Volante','Volante','Meia','Meia-atacante','Ponta esquerda','Centroavante'];
const COR_TIME = { A: '#2563eb', B: '#16a34a' };

function seedElenco() {
  if (!confirm('Criar elenco de teste? Use só uma vez por aparelho.')) return;
  const stamp = Date.now().toString(36);
  ['A','B'].forEach(team => {
    const t = db.teams[team];
    POS_TIME.forEach((pos, k) => {
      const id = 'tp' + team + k + stamp;
      const nome = pick(NOMES) + ' ' + pick(SOBRENOMES);
      const shirt = k * 2 + (team === 'B' ? 2 : 1);
      db.players.push({
        id, pin: '', name: nome, nick: k % 3 === 0 ? nome.split(' ')[0] : '',
        pos, mod: pick(['Campo','Quadra','Os dois']),
        shirt, photo: fakeFoto(shirt, COR_TIME[team]), device: 'seed_' + id
      });
      t.members.push(id);
      placeAuto(team, db.players[db.players.length - 1]);
    });
    if (!t.nome) t.nome = team === 'A' ? 'Time Azul' : 'Time Verde';
  });
  ['A','B'].forEach(team => {
    if (db.techs.some(x => x.team === team)) return;
    db.techs.push({ id: 'st' + team + stamp, pin: '', name: 'Técnico ' + team + ' ' + pick(SOBRENOMES),
                    team, photo: fakeFoto(null, '#0f172a'), device: 'seed_tec_' + team + stamp });
  });
  if (!db.ref) db.ref = { pin: '', name: 'Árbitro Teste', device: 'seed_ref_' + stamp };
  for (let i = 1; i <= 5; i++) {
    db.fans.push({ id: 'sf' + i + stamp, name: 'Torcedor ' + i + ' ' + pick(NOMES),
                   photo: fakeFoto(null, pick(['#7c3aed','#db2777','#ea580c','#0891b2','#65a30d'])),
                   device: 'seed_fan_' + i + stamp });
  }
  save(); refreshWho(); renderInicio();
  toast('Elenco de teste criado!', 'ok');
}

function refreshWho() {
  const opts = [
    ...db.players.map(p => ({ d: p.device, l: '⚽ ' + dname(p) })),
    ...db.techs.map(t => ({ d: t.device, l: '📋 ' + t.name + ' (' + teamOf(t.team) + ')' })),
    ...(db.ref ? [{ d: db.ref.device, l: '🎩 ' + db.ref.name }] : []),
    ...db.fans.map(f => ({ d: f.device, l: '📈 ' + f.name }))
  ].filter(o => o.d);
  const atual = device();
  $('whoSel').innerHTML = '<option value="">Entrar como…</option>' +
    opts.map(o => `<option value="${esc(o.d)}" ${o.d === atual ? 'selected' : ''}>${esc(o.l)}</option>`).join('');
}
$('whoSel').onchange = () => {
  const v = $('whoSel').value; if (!v) return;
  localStorage.setItem(DEVK, v);
  location.hash = '#/inicio';
  location.reload();
};

let simTimer = null;
function simStep() {
  const m = cur();
  if (!m || m.status !== 'live' || !m.roster) return stopSim();
  const team = Math.random() < 0.5 ? 'A' : 'B';
  const ids = m.roster[team];
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
  $('btnSimular').textContent = '▶ Simular lances (teste)';
}
$('btnSimular').onclick = () => {
  if (simTimer) return stopSim();
  const m = cur();
  if (!m || m.status !== 'live') return toast('Inicie o jogo antes de simular.', 'bad');
  simTimer = setInterval(simStep, 3000);
  $('btnSimular').textContent = '⏹ Parar simulação';
};

if (TESTE) {
  $('btnTeste').classList.remove('hidden');
  $('btnTeste').onclick = () => {
    localStorage.removeItem(DEVK);
    location.hash = '#/inicio';
    location.reload();
  };
  $('btnZerarTudo').classList.remove('hidden');
  $('btnZerarTudo').onclick = () => {
    if (!confirm('Apagar TODOS os dados de teste?')) return;
    localStorage.removeItem(KEY);
    localStorage.removeItem(DEVK);
    localStorage.removeItem(SEENK);
    location.hash = '#/inicio';
    location.reload();
  };
  $('btnSeed').classList.remove('hidden');
  $('btnSeed').onclick = seedElenco;
  $('whoSel').classList.remove('hidden');
  $('btnSimular').classList.remove('hidden');
  $('btnGolTeste').classList.remove('hidden');
}

/* ===================== INICIALIZAÇÃO ===================== */
window.addEventListener('hashchange', route);
refreshWho();
route();
if (cur() && cur().status === 'live') startTicker();