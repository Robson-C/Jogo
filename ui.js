/* =====================[ TRECHO 1: ui.js — Cabeçalho e contexto / IIFE ]===================== */
/* [DOC]
   Propósito geral do módulo:
     - Isolar a camada de UI do jogo: cache de DOM, renders, bindings e modal de log.
     - Garantir boas práticas de segurança (sem innerHTML/eval), acessibilidade básica e agendamento de render.
   Observações:
     - Sem dependências externas; usa window.I18N opcionalmente.
     - Todos os listeners são declarados aqui mas registrados centralmente fora (game.js).
     - Estado global único referenciado por S (injetado via UI.init).
*/
(function(){
  'use strict';
/* =====================[ FIM TRECHO 1 ]===================== */


/* =====================[ TRECHO 2: I18N seguro, ícones e utilidades de rótulo ]===================== */
/* [DOC] I18N_SAFE: fallback robusto para t(key, params). */
const I18N_SAFE = (function(){
  const api = (typeof window !== 'undefined' && window.I18N) ? window.I18N : null;
  const t = api && typeof api.t === 'function' ? api.t.bind(api) : (key, params)=>{
    if (params && typeof key === 'string') {
      let out = key;
      for (const k of Object.keys(params)) out = out.replaceAll(`{${k}}`, String(params[k]));
      return out;
    }
    return key;
  };
  return { t };
})();

/* [CONST] Ícones de UI */
const ICON = {
  energy:'⚡', hp:'❤️', sanity:'🧠', mp:'🔮', xp:'⭐',
  explore:'🧭', rest:'🛌', meditate:'🧘', drink:'💧', wash:'🚿', contemplate:'👁️'
};

/* [UTIL] Wrapper i18n com fallback seguro */
function tLabel(k, fallback){
  const v = I18N_SAFE.t(k, null);
  return (typeof v === 'string' && v !== k) ? v : (fallback || k);
}

/* [UTIL] Formata sufixo de efeitos: " [ +X⚡ +Y❤️ ... ] " omitindo zeros */
function fmtEffects(e){
  const parts = [];
  if (e.energy > 0) parts.push('+' + e.energy + ICON.energy);
  if (e.hp     > 0) parts.push('+' + e.hp     + ICON.hp);
  if (e.sanity > 0) parts.push('+' + e.sanity + ICON.sanity);
  if (e.mp     > 0) parts.push('+' + e.mp     + ICON.mp);
  if (e.xp     > 0) parts.push('+' + e.xp     + ICON.xp);
  return parts.length ? ' [' + parts.join(' ') + ']' : '';
}
/* =====================[ FIM TRECHO 2 ]===================== */


/* =====================[ TRECHO 3: [STATE] Referência ao estado do jogo e flags de render ]===================== */
/* [STATE] S: referência ao state do jogo; dirty: flags; rafId: agenda de render */
let S = null;
let dirty = { hud:false, secStats:false, log:false };
let rafId = 0;
/* =====================[ FIM TRECHO 3 ]===================== */


/* =====================[ TRECHO 4: Cache de referências do DOM ]===================== */
/* [DOC] cacheRefs(state): localiza e guarda referências de UI em state.ui */
function cacheRefs(state){
  S = state;
  const ui = S.ui || (S.ui = {});
  ui.roomTitle = document.querySelector('.room .room-title');
  ui.runDay    = document.querySelector('.runline .runline-day');
  ui.runFloor  = document.querySelector('.runline .runline-floor');
  ui.btnExplore= document.getElementById('act-4');

  // Contêiner do log curto
  ui.logView   = document.querySelector('.log-view');

  ui.chipAtk   = document.querySelector('.secstats .stat-chip--atk');
  ui.chipDef   = document.querySelector('.secstats .stat-chip--def');
  ui.chipAcc   = document.querySelector('.secstats .stat-chip--acc');
  ui.chipAgi   = document.querySelector('.secstats .stat-chip--agi');

  // Refs de XP (header)
  ui.xpLabel  = document.querySelector('.toprow .xp-label');
  ui.xpBar    = document.querySelector('.toprow .xp-bar');
  ui.xpFill   = ui.xpBar ? ui.xpBar.querySelector('.xp-fill') : null;

  // Container do nível
  ui.levelEl  = document.querySelector('.toprow .level');

  // Helper para capturar refs de barras principais
  function _getStatRefs(fillSelector){
    const fillEl = document.querySelector(fillSelector);
    if (!fillEl) return { bar:null, fill:null, val:null };
    const barEl = fillEl.parentElement;                   // .bar
    const card  = fillEl.closest('.stat-card');           // <article class="stat-card">
    const valEl = card ? card.querySelector('.stat-head .stat-val') : null; // <span class="stat-val">
    return { bar:barEl, fill:fillEl, val:valEl };
  }
  ui.primBars = {
    life:   _getStatRefs('.fill.life'),
    mana:   _getStatRefs('.fill.mana'),
    energy: _getStatRefs('.fill.energy'),
    sanity: _getStatRefs('.fill.sanity'),
  };
}
/* =====================[ FIM TRECHO 4 ]===================== */


/* =====================[ TRECHO 5: bindGame — declaração de bindings (sem registrar) ]===================== */
/* [DOC]
   Retorna a lista de {el,type,handler,opts} para registro centralizado (game.js).
   Também define refs do modal de log quando disponíveis.
*/
function bindGame(handlers){
  const binds = [];

  // Botão EXPLORAR
  if (S && S.ui && S.ui.btnExplore && handlers && typeof handlers.onExplore === 'function'){
    binds.push({ el: S.ui.btnExplore, type: 'click', handler: handlers.onExplore, opts: { passive:false } });
  }

  // Ações contextuais (1..3)
  const ui = S && S.ui ? S.ui : (S.ui = {});
  ui.btnAct1 = ui.btnAct1 || document.getElementById('act-1');
  ui.btnAct2 = ui.btnAct2 || document.getElementById('act-2');
  ui.btnAct3 = ui.btnAct3 || document.getElementById('act-3');

  if (ui.btnAct1 && handlers && typeof handlers.onAct1 === 'function'){
    binds.push({ el: ui.btnAct1, type: 'click', handler: handlers.onAct1, opts: { passive:false } });
  }
  if (ui.btnAct2 && handlers && typeof handlers.onAct2 === 'function'){
    binds.push({ el: ui.btnAct2, type: 'click', handler: handlers.onAct2, opts: { passive:false } });
  }
  if (ui.btnAct3 && handlers && typeof handlers.onAct3 === 'function'){
    binds.push({ el: ui.btnAct3, type: 'click', handler: handlers.onAct3, opts: { passive:false } });
  }

  // Modal de Log — refs/binds
  if (S){
    ui.logBox        = ui.logBox        || document.querySelector('.log');
    ui.logModal      = ui.logModal      || document.getElementById('log-modal');
    ui.modalDialog   = ui.modalDialog   || (ui.logModal ? ui.logModal.querySelector('.modal-dialog') : null);
    ui.logModalBody  = ui.logModalBody  || document.getElementById('log-modal-body');
    ui.logModalClose = ui.logModalClose || (ui.logModal ? ui.logModal.querySelector('.modal-close') : null);

    if (ui.logBox){
      binds.push({ el: ui.logBox, type: 'click', handler: _openLogModal, opts: { passive:false } });
    }
    if (ui.logModal){
      binds.push({ el: ui.logModal, type: 'click', handler: _backdropClick, opts: { passive:false } });
    }
    if (ui.logModalClose){
      binds.push({ el: ui.logModalClose, type: 'click', handler: _closeLogModal, opts: { passive:false } });
    }
    binds.push({ el: document, type: 'keydown', handler: _docKeydown, opts: { passive:false } });
  }

  return binds;
}
/* =====================[ FIM TRECHO 5 ]===================== */


/* =====================[ TRECHO 6: Scheduler de render (markDirty/flush) ]===================== */
function markDirty(part){
  if (!dirty) dirty = { hud:false, secStats:false, log:false };
  if (part === '*' || part === 'all'){
    dirty.hud = dirty.secStats = dirty.log = true;
  } else if (part && Object.prototype.hasOwnProperty.call(dirty, part)){
    dirty[part] = true;
  } else {
    // default: HUD
    dirty.hud = true;
  }
  if (!rafId){
    rafId = requestAnimationFrame(flush);
  }
}

function flush(){
  rafId = 0;
  if (!S || !S.ui || !dirty) return;

  if (dirty.hud){ renderHUD(); dirty.hud = false; }
  if (dirty.secStats){ renderSecStats(); dirty.secStats = false; }
  if (dirty.log){ renderLog(); dirty.log = false; }
}
/* =====================[ FIM TRECHO 6 ]===================== */


/* =====================[ TRECHO 7: renderHUD — atualização principal da UI ]===================== */
/* [DOC]
   Atualiza: título da sala, dia/andar, XP, nível, barras, atributos, log curto e rótulos de ações.
*/
function renderHUD(){
  if (!S || !S.ui) return;

  // 1) Título da sala
  if (S.ui.roomTitle){
    const isFountain = (S.room && S.room.kind === 'fountain');
    const title = isFountain
      ? (I18N_SAFE.t('room.fountain') || 'Sala com Fonte')
      : (I18N_SAFE.t('room.empty')    || 'Sala Vazia');
    S.ui.roomTitle.textContent = title;
  }

  // 2) Dia / Andar
  if (S.ui.runDay){
    S.ui.runDay.textContent = (I18N_SAFE.t('hud.day') || 'Dia') + ' ' + (S.run && S.run.day || 0);
  }
  if (S.ui.runFloor){
    S.ui.runFloor.textContent = (I18N_SAFE.t('hud.floor') || 'Andar') + ' ' + (S.run && S.run.floor || 0);
  }

  // 3) XP (rótulo e barra com ARIA)
  if (S.ui.xpLabel){
    const cur = Math.max(0, S.player.xp|0);
    const max = Math.max(1, S.player.xpMax|0);
    S.ui.xpLabel.textContent = `${cur}/${max}`;
  }
  if (S.ui.xpBar && S.ui.xpFill){
    const pct = Math.max(0, Math.min(100, Math.round((S.player.xp / Math.max(1, S.player.xpMax)) * 100)));
    S.ui.xpFill.style.width = pct + '%';
    S.ui.xpBar.setAttribute('aria-valuenow', String(pct));
    S.ui.xpBar.setAttribute('aria-valuemin', '0');
    S.ui.xpBar.setAttribute('aria-valuemax', '100');
  }

  // 4) Nível
  renderLevel();

  // 5) Barras principais
  renderBars();

  // 6) Atributos secundários
  renderSecStats();

  // 7) Log curto
  renderLog();

  // 8) Rótulos/habilitação dos botões de ação
  renderActionButtons();
}
/* =====================[ FIM TRECHO 7 ]===================== */


/* =====================[ TRECHO 8: renderLevel — número de nível no cabeçalho ]===================== */
function renderLevel(){
  if (!S || !S.ui || !S.ui.levelEl) return;
  const strong = S.ui.levelEl.querySelector('strong');
  if (strong) strong.textContent = String(S.player.level|0);
}
/* =====================[ FIM TRECHO 8 ]===================== */


/* =====================[ TRECHO 9: renderBars — barras principais (vida/mana/energia/sanidade) ]===================== */
function renderBars(){
  if (!S || !S.ui || !S.ui.primBars) return;

  const pairs = [
    { key:'life',   cur:S.player.hp,      max:S.player.hpMax      },
    { key:'mana',   cur:S.player.mp,      max:S.player.mpMax      },
    { key:'energy', cur:S.player.energy,  max:S.player.energyMax  },
    { key:'sanity', cur:S.player.sanity,  max:S.player.sanityMax  },
  ];

  for (const p of pairs){
    const refs = S.ui.primBars[p.key];
    if (!refs || !refs.fill || !refs.bar) continue;

    const pct = Math.max(0, Math.min(100, Math.round((p.cur / Math.max(1, p.max)) * 100)));
    refs.fill.style.width = pct + '%';
    refs.bar.setAttribute('aria-valuenow', String(pct));
    refs.bar.setAttribute('aria-valuemin', '0');
    refs.bar.setAttribute('aria-valuemax', '100');

    if (refs.val){
      refs.val.textContent = `${Math.max(0, p.cur)}/${Math.max(1, p.max)}`;
    }
  }
}
/* =====================[ FIM TRECHO 9 ]===================== */


/* =====================[ TRECHO 10: renderSecStats — chips atk/def/acc/agi ]===================== */
function renderSecStats(){
  if (!S || !S.ui) return;
  if (S.ui.chipAtk) S.ui.chipAtk.textContent = String(S.player.atk);
  if (S.ui.chipDef) S.ui.chipDef.textContent = String(S.player.def);
  if (S.ui.chipAcc) S.ui.chipAcc.textContent = String(S.player.acc);
  if (S.ui.chipAgi) S.ui.chipAgi.textContent = String(S.player.agi);
}
/* =====================[ FIM TRECHO 10 ]===================== */


/* =====================[ TRECHO 11: Log — severidade e linha única ]===================== */
/* [DOC] mapSev: mapeia tipos em 3 severidades (info/mod/crit) */
function mapSev(t){
  switch(String(t||'').toLowerCase()){
    case 'crit':
    case 'error':
    case 'fatal': return 'crit';
    case 'mod':
    case 'warn':
    case 'warning': return 'mod';
    default: return 'info';
  }
}

/* [DOC] _renderLogLine: renderiza uma linha de log num elemento, com ARIA/title */
function _renderLogLine(el, ev){
  if (!el) return;
  try { el.setAttribute('data-sev', mapSev(ev && ev.type)); } catch(e){}
  const key = ev && ev.key ? String(ev.key) : '';
  const params = (ev && ev.params) || null;
  const txt = I18N_SAFE.t(key, params);
  const out = (typeof txt === 'string') ? txt : String(txt || '');
  el.textContent = out;
  try { el.title = out; } catch(e){}
}
/* =====================[ FIM TRECHO 11 ]===================== */


/* =====================[ TRECHO 12: renderLogCommon — lista de log (painel e modal) ]===================== */
/* [DOC]
   Monta uma lista de eventos de log em um container.
   Segurança: cria elementos via createElement; usa textContent; sem innerHTML.
*/
function renderLogCommon(container, limit, lineClass){
  if (!container) return;
  const evts = Array.isArray(S.log && S.log.events) ? S.log.events : [];
  const arr  = Array.isArray(evts) ? evts : [];
  const last = (typeof limit === 'number' && limit > 0) ? arr.slice(-limit) : arr.slice();

  // Limpa o container sem usar innerHTML
  while (container.firstChild) container.removeChild(container.firstChild);

  const frag = document.createDocumentFragment();

  // Preenche com as linhas disponíveis
  for (let i=0; i<last.length; i++){
    const ev = last[i];
    const div = document.createElement('div');
    div.className = lineClass;
    _renderLogLine(div, ev);
    frag.appendChild(div);
  }

  // Padding para o painel curto: garante 4 linhas visuais (vazias no topo)
  if (lineClass === 'log-line' && typeof limit === 'number' && limit > 0){
    const pad = Math.max(0, limit - last.length);
    for (let i=0; i<pad; i++){
      const empty = document.createElement('div');
      empty.className = lineClass;
      empty.setAttribute('data-sev','info');
      empty.textContent = '';
      frag.insertBefore(empty, frag.firstChild); // linhas vazias no topo
    }
  }

  container.appendChild(frag);
}
/* =====================[ FIM TRECHO 12 ]===================== */


/* =====================[ TRECHO 13: renderLog — painel curto (4 linhas) ]===================== */
function renderLog(){
  if (!S || !S.ui || !S.ui.logView) return;
  renderLogCommon(S.ui.logView, 4, 'log-line');
}
/* =====================[ FIM TRECHO 13 ]===================== */


/* =====================[ TRECHO 14: renderActionButtons — rótulos/habilitação das ações ]===================== */
/* [DOC]
   Constrói rótulos: “Ícone + Nome + [efeitos]”; inclui EXPLORAR com custo exibido.
   Desabilita botões já usados na sala atual (state.room.used[id]).
*/
function renderActionButtons(){
  if (!S || !S.ui) return;

  const P = S.player;

  // [CATÁLOGO] Ações e como calcular efeitos/habilitação
  const ACTIONS = {
    explore: {
      icon: ICON.explore,
      name: tLabel('ui.actions.explore', 'EXPLORAR'),
      effects(){ return { energy:0, hp:0, sanity:0, mp:0, xp:0 }; }, // positivos (não usados)
      cost: { energy: -10, sanity: -5 },
      disabled(){ return !!S._inputLocked; },
      buildLabel(self){
        const costStr = ` [${self.cost.energy}${ICON.energy} ${self.cost.sanity}${ICON.sanity}]`.replace('--','-');
        return `${self.icon} ${self.name}${costStr}`;
      },
      buildAria(self){
        const parts = [];
        parts.push(`${self.name}: ${self.cost.energy} ${tLabel('stats.energy','Energia')}`);
        parts.push(`${self.cost.sanity} ${tLabel('stats.sanity','Sanidade')}`);
        return parts.join(', ');
      }
    },
    rest: {
      icon: ICON.rest,
      name: tLabel('ui.actions.rest','Descansar'),
      effects(){
        return {
          energy: effPct(P.energy, P.energyMax, 0.80),
          hp:     effPct(P.hp,     P.hpMax,     0.50),
          sanity: 0, mp:0, xp:0
        };
      },
      disabled(e){ return (e.energy===0 && e.hp===0); },
    },
    meditate: {
      icon: ICON.meditate,
      name: tLabel('ui.actions.meditate','Meditar'),
      effects(){
        return {
          energy: effPct(P.energy, P.energyMax, 0.10),
          hp:     effPct(P.hp,     P.hpMax,     0.10),
          sanity: effPct(P.sanity, P.sanityMax, 0.60),
          mp:0, xp:0
        };
      },
      disabled(e){ return (e.energy===0 && e.hp===0 && e.sanity===0); },
    },
    drink: {
      icon: ICON.drink,
      name: tLabel('ui.actions.drink','Beber água'),
      effects(){
        return {
          hp: effPct(P.hp, P.hpMax, 0.20),
          mp: effPct(P.mp, P.mpMax, 0.50),
          energy:0, sanity:0, xp:0
        };
      },
      disabled(e){ return (e.hp===0 && e.mp===0); },
    },
    wash: {
      icon: ICON.wash,
      name: tLabel('ui.actions.wash','Lavar o rosto'),
      effects(){
        return {
          sanity: Math.max(0, P.sanityMax - P.sanity),
          energy:0, hp:0, mp:0, xp:0
        };
      },
      disabled(e){ return (e.sanity===0); },
    },
    contemplate: {
      icon: ICON.contemplate,
      name: tLabel('ui.actions.contemplate','Contemplar a água'),
      effects(){
        const sa = effPct(P.sanity, P.sanityMax, 0.05);
        return { sanity: sa, energy:0, hp:0, mp:0, xp: (sa>0 ? 5 : 0) };
      },
      disabled(e){ return (e.sanity===0); },
    },
  };

  // Helper para aplicar rótulos/estado ao botão contextual
  function applyButton(el, act, actId){
    if (!el || !act) return;
    const eff = act.effects ? act.effects() : {energy:0,hp:0,sanity:0,mp:0,xp:0};
    const label = `${act.icon} ${act.name}${fmtEffects(eff)}`;
    el.textContent = label;

    const alreadyUsed = !!(S.room && S.room.used && actId && S.room.used[actId]);
    const disabledByAct = act.disabled ? !!act.disabled(eff) : false;
    el.disabled = alreadyUsed || disabledByAct;

    const ariaParts = [];
    if (eff.energy>0) ariaParts.push(`+${eff.energy} ` + tLabel('stats.energy','Energia'));
    if (eff.hp>0)     ariaParts.push(`+${eff.hp} `     + tLabel('stats.hp','Vida'));
    if (eff.sanity>0) ariaParts.push(`+${eff.sanity} ` + tLabel('stats.sanity','Sanidade'));
    if (eff.mp>0)     ariaParts.push(`+${eff.mp} `     + tLabel('stats.mp','Mana'));
    if (eff.xp>0)     ariaParts.push(`+${eff.xp} XP`);
    let aria = ariaParts.length ? `${act.name}: ${ariaParts.join(', ')}` : `${act.name}`;
    if (alreadyUsed) aria += ' — já usado nesta sala';
    el.setAttribute('aria-label', aria);
  }

  // EXPLORAR: custo exibido
  if (S.ui.btnExplore){
    const ex = ACTIONS.explore;
    S.ui.btnExplore.textContent = ex.buildLabel(ex);
    S.ui.btnExplore.setAttribute('aria-label', ex.buildAria(ex));
    S.ui.btnExplore.disabled = ex.disabled();
  }

  // Ações contextuais
  if (S.ui && S.ui.btnAct1 && S.ui.btnAct2 && S.ui.btnAct3){
    const isFountain = (S.room && S.room.kind === 'fountain');
    const family = isFountain ? ['drink','wash','contemplate'] : ['rest','meditate'];
    const buttons = [S.ui.btnAct1, S.ui.btnAct2, S.ui.btnAct3];

    for (let i=0; i<buttons.length; i++){
      const id = family[i];
      const btn = buttons[i];
      if (id){
        applyButton(btn, ACTIONS[id], id);
      } else {
        btn.textContent = '—';
        btn.disabled = true;
        btn.setAttribute('aria-label', 'Indisponível');
      }
    }
  }
}
/* =====================[ FIM TRECHO 14 ]===================== */


/* =====================[ TRECHO 15: effPct — utilitário para calcular ganhos parciais ]===================== */
function effPct(cur, max, pct){
  const add = Math.floor(Math.max(0, max) * pct);
  return Math.max(0, Math.min(Math.max(0, max) - Math.max(0, cur), add));
}
/* =====================[ FIM TRECHO 15 ]===================== */


/* =====================[ TRECHO 16: Exposição pública (window.UI) ]===================== */
window.UI = {
  /* [DOC] Inicializa a UI para um determinado state e faz cache das refs */
  init(state){ cacheRefs(state); },

  /* [DOC] Retorna a lista de bindings para o game.js registrar */
  bindGame,

  /* [DOC] Marca parte para render e agenda flush (part: 'hud'|'secStats'|'log'|'*') */
  markDirty,

  /* [DOC] Força um flush imediato (geralmente não é necessário chamar manualmente) */
  flush,
};
/* =====================[ FIM TRECHO 16 ]===================== */


/* =====================[ TRECHO 17: Modal de Log — abrir/fechar, foco e acessibilidade ]===================== */
/* [DOC]
   Funções:
     - _openLogModal(ev): abre o modal e popula com renderLogCommon.
     - _closeLogModal(ev): fecha o modal devolvendo foco a alvo seguro.
     - _backdropClick(ev): fecha ao clicar no overlay.
     - _docKeydown(ev): fecha com ESC.
*/
function _ensureModalRefs(){
  const ui = (S && S.ui) ? S.ui : (S.ui = {});
  ui.logModal      = ui.logModal      || document.getElementById('log-modal');
  ui.modalDialog   = ui.modalDialog   || (ui.logModal ? ui.logModal.querySelector('.modal-dialog') : null);
  ui.logModalBody  = ui.logModalBody  || document.getElementById('log-modal-body');
  ui.logModalClose = ui.logModalClose || (ui.logModal ? ui.logModal.querySelector('.modal-close') : null);
  ui.logBox        = ui.logBox        || document.querySelector('.log');
  return ui;
}

// [UTIL] Foca um elemento garantindo focabilidade (tabindex temporário se precisar).
function _focusSafely(el){
  if (!el) return false;
  try {
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    const isNaturallyFocusable =
      (tag === 'button' || tag === 'a' || tag === 'input' || tag === 'select' || tag === 'textarea');
    const hadTabindex = el.hasAttribute && el.hasAttribute('tabindex');
    if (!isNaturallyFocusable && !hadTabindex){
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll:true });
      if (!hadTabindex) el.removeAttribute('tabindex');
    } else {
      el.focus({ preventScroll:true });
    }
    return true;
  } catch(_e){ return false; }
}

function _openLogModal(ev){
  if (ev && ev.preventDefault) ev.preventDefault();
  const ui = _ensureModalRefs();
  if (!ui.logModal || !ui.logModalBody) return;

  // Usa a função compartilhada para montar as linhas (sem innerHTML)
  renderLogCommon(ui.logModalBody, 30, 'modal-log-line');

  ui.logModal.removeAttribute('hidden');
  ui.logModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  S.ui._modalOpen = true;

  // Move foco para o botão fechar (ou o diálogo)
  if (!_focusSafely(ui.logModalClose)){
    _focusSafely(ui.modalDialog);
  }
}

function _closeLogModal(ev){
  if (ev && ev.preventDefault) ev.preventDefault();
  const ui = _ensureModalRefs();
  if (!ui.logModal) return;

  // Antes de esconder o modal, mover foco para alvo seguro fora dele
  let target = null;

  // 1) Ideal: botão EXPLORAR
  if (S && S.ui && S.ui.btnExplore) target = S.ui.btnExplore;

  // 2) Alternativa: container do log (torná-lo focável temporariamente)
  if (!target && ui.logBox){
    ui.logBox.setAttribute('tabindex', '-1');
    target = ui.logBox;
  }

  // 3) Fallback: body
  if (!target && document && document.body){
    document.body.setAttribute('tabindex', '-1');
    target = document.body;
  }

  if (target) _focusSafely(target);

  // Agora é seguro esconder o modal
  ui.logModal.setAttribute('aria-hidden', 'true');
  ui.logModal.setAttribute('hidden', '');
  document.body.classList.remove('no-scroll');

  S.ui._modalOpen = false;
}

function _backdropClick(ev){
  const ui = (S && S.ui) ? S.ui : null;
  if (!ui) return;
  ui.logModal = ui.logModal || document.getElementById('log-modal');
  if (!ui.logModal) return;
  // Fecha somente se clicou no overlay (fora do dialog e do botão)
  if (ev && ev.target === ui.logModal){
    _closeLogModal(ev);
  }
}

function _docKeydown(ev){
  if (!S || !S.ui || !S.ui._modalOpen) return;
  if (ev && (ev.key === 'Escape' || ev.key === 'Esc')){
    ev.preventDefault();
    _closeLogModal(ev);
  }
}
/* =====================[ FIM TRECHO 17 ]===================== */


/* =====================[ TRECHO 18: Fechamento do IIFE ]===================== */
})();
 /* =====================[ FIM TRECHO 18 ]===================== */
