/* =====================[ TRECHO 1: game.js — Núcleo + Fluxo de Jogo ]===================== */
/* [DOC]
   Propósito:
     - Manter o estado central e as regras do jogo (Explorar, Ações de Sala Vazia e Sala com Fonte).
     - Delegar renderização/binds ao módulo UI (ui.js) e texto ao i18n (i18n.js).
   Regras relevantes:
     - [STATE] único (sem globais soltas).
     - Sem eval/Function; sem innerHTML para textos; sem console.* (pacote final).
     - Anti multi-input: bloqueio simples por sessão de ação; limpar listeners ao trocar de cena.
     - RNG determinístico com seed persistida por slot (saveSlot1.seed) — Regra 3I.
*/
(function(){
  'use strict';
/* =====================[ FIM TRECHO 1 ]===================== */



/* =====================[ TRECHO 2: I18N helper seguro ]===================== */
/* [DOC] Acesso defensivo ao módulo de i18n (pode não existir durante testes). */
const I18N_SAFE = (function(){
  const api = (typeof window !== 'undefined' && window.I18N) ? window.I18N : null;
  const get = api && typeof api.get === 'function' ? api.get.bind(api) : ()=> 'pt-BR';
  return { api, get };
})();
 /* =====================[ FIM TRECHO 2 ]===================== */


/* =====================[ TRECHO 3: [STATE] Único ]===================== */
/* [STATE]
   - settings.lang: idioma atual (pego do i18n)
   - player: atributos e limites
   - run: progresso de dia/andar/salas
   - log: buffer de eventos
   - ui: refs da UI (preenchidas por UI.init)
   - _listeners: lista de listeners para limpeza
   - _rng: PRNG determinístico
   - _inputLocked: trava anti multi-input (reset a cada ação/scene)
*/
const state = {
  settings: {
    lang: I18N_SAFE.get() || 'pt-BR',
  },
  player: {
    level: 1,
    xp: 0, xpMax: 100,
    hp: 100, hpMax: 100,
    mp: 100, mpMax: 100,
    energy: 100, energyMax: 100,
    sanity: 100, sanityMax: 100,
    atk: 5, def: 5, acc: 5, agi: 5,
  },
  run: {
    day: 1,
    floor: 1,
    roomsOnFloor: 0,
    targetRooms: 0,
    time: 0, // hora/dia se necessário
  },
  room: { kind: 'empty', used: {} }, // [CHANGE] marca ações usadas nesta sala/dia
  log: {
    events: [],
    max: 200,
  },
  ui: { btnExplore: null },
  scene: 'BOOT',
  _listeners: [],
  _rng: null,
  _inputLocked: false,

  /* [CHANGE][STATE] (remanescem do ajuste anterior; inativas sem avanço automático) */
  _nextExploreNoEnergyCost: false,
  _nextExploreNoSanityCost: false,
};
 /* =====================[ FIM TRECHO 3 ]===================== */


/* =====================[ TRECHO 4: Registro Central de Listeners ]===================== */
/* [DOC] Facilita limpeza total ao trocar de cena. */
function addListener(el, type, handler, opts){
  if(!el) return;
  el.addEventListener(type, handler, opts || false);
  state._listeners.push({ el, type, handler, opts: !!opts });
}
function clearListeners(){
  for(const it of state._listeners){
    try { it.el.removeEventListener(it.type, it.handler, it.opts); } catch(_e){}
  }
  state._listeners.length = 0;
}
 /* =====================[ FIM TRECHO 4 ]===================== */


/* =====================[ TRECHO 5: Scene Manager (BOOT → GAME) ]===================== */
function setScene(name){
  clearListeners();
  state.scene = name;

  if (name === 'GAME'){
    if (window.UI && typeof UI.init === 'function') UI.init(state);

    if (window.UI){
      UI.markDirty('*'); // hud/secStats/log
      UI.flush();        // aplica imediatamente
    }

    const binds = (window.UI && typeof UI.bindGame === 'function')
      ? UI.bindGame({ onExplore, onAct1, onAct2, onAct3 })
      : [];
    for(const b of binds) addListener(b.el, b.type, b.handler, b.opts);
  }
}
 /* =====================[ FIM TRECHO 5 ]===================== */


/* =====================[ TRECHO 6: Log estruturado ]===================== */
function emitLog({ key, params=null, type='info' }){
  const ev = { ts: Date.now(), key, params, type };
  const arr = state.log.events;
  arr.push(ev);
  if (arr.length > state.log.max) arr.splice(0, arr.length - state.log.max);
  if (window.UI) UI.markDirty('log');
}
 /* =====================[ FIM TRECHO 6 ]===================== */


/* =====================[ TRECHO 7: Helpers de Jogo ]===================== */
function getTargetRoomsForFloor(floor){
  const n = (floor * 13) % 21; // 0..20
  return 30 + n;               // 30..50
}
function pickEmptyRoomLogKey(run){
  const idx = (run.day + run.floor + run.roomsOnFloor) % 5; // 0..4
  return 'log.empty.v' + (idx + 1);
}
function _gainByPctMax(cur, max, pct){
  const add = Math.floor(max * pct);
  return Math.max(0, Math.min(add, max - cur));
}

/* PRNG e seed persistente */
(function ensureSeededRNG(){
  try{
    const KEY = 'saveSlot1.seed';
    let seed = localStorage.getItem(KEY);
    if (!seed){
      seed = String((Math.random() * 0xFFFFFFFF) >>> 0);
      localStorage.setItem(KEY, seed);
    }
    state._rng = mulberry32(Number(seed) >>> 0);
  }catch(_e){
    const seed = Math.floor(Math.random() * 0xFFFFFFFF) >>> 0;
    state._rng = mulberry32(seed);
  }
})();
function mulberry32(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function rngNext(){ return (state && state._rng) ? state._rng() : Math.random(); }

/* [DOC] Encerra a partida conforme o motivo. */
function endGame(reason){
  try {
    const key = (reason === 'sanity') ? 'log.gameover.sanity' : 'log.gameover.energy';
    emitLog({ key, type: 'crit' });
  } catch(_e){}
  state._inputLocked = true;
  const ui = state.ui || {};
  try { if (ui.btnExplore) ui.btnExplore.disabled = true; } catch(_e){}
  try { if (ui.btnAct1)    ui.btnAct1.disabled    = true; } catch(_e){}
  try { if (ui.btnAct2)    ui.btnAct2.disabled    = true; } catch(_e){}
  try { if (ui.btnAct3)    ui.btnAct3.disabled    = true; } catch(_e){}
}

/* [CHANGE][DOC] Marca ação como usada nesta sala/dia e pede re-render da HUD. */
function markActionUsed(id){
  if (!state.room) state.room = { kind:'empty', used:{} };
  if (!state.room.used) state.room.used = {};
  state.room.used[id] = true;
  if (window.UI) UI.markDirty('hud');
}

/* [CHANGE][DOC] Helper para checar se a ação já foi usada na sala atual. */
function isActionUsed(id){
  return !!(state.room && state.room.used && state.room.used[id]);
}
 /* =====================[ FIM TRECHO 7 ]===================== */


/* =====================[ TRECHO 8: Ações de Sala (Vazia e Fonte) ]===================== */
/* [DOC]
   Novo comportamento: ações aplicam efeito e **não** avançam mais automaticamente.
   Cada ação pode ser usada **uma vez por sala/dia** → botão da ação é desabilitado após uso.
*/
function doRest(ev){
  ev.preventDefault();
  if(state._inputLocked) return;
  state._inputLocked = true;

  /* [CHANGE] Bloqueio: só permite 1× por sala/dia */
  if (isActionUsed('rest')){
    emitLog({ key:'log.action.used', type:'mod' });
    state._inputLocked = false;
    return;
  }

  try {
    const p = state.player;
    const gEn = _gainByPctMax(p.energy, p.energyMax, 0.80);
    const gHp = _gainByPctMax(p.hp,     p.hpMax,     0.50);
    p.energy += gEn; p.hp += gHp;

    emitLog({ key:'log.rest', type:'info' });
    if (window.UI) UI.markDirty('hud');

    // [CHANGE] Regra nova: não avançar; apenas marcar ação usada
    markActionUsed('rest');

  } catch(_e){
    alert('Erro ao descansar.');
  } finally {
    state._inputLocked = false;
  }
}
function doMeditate(ev){
  ev.preventDefault();
  if(state._inputLocked) return;
  state._inputLocked = true;

  /* [CHANGE] Bloqueio: só permite 1× por sala/dia */
  if (isActionUsed('meditate')){
    emitLog({ key:'log.action.used', type:'mod' });
    state._inputLocked = false;
    return;
  }

  try {
    const p = state.player;
    const gEn = _gainByPctMax(p.energy,  p.energyMax,  0.10);
    const gHp = _gainByPctMax(p.hp,      p.hpMax,      0.10);
    const gSa = _gainByPctMax(p.sanity,  p.sanityMax,  0.60);
    p.energy += gEn; p.hp += gHp; p.sanity += gSa;

    emitLog({ key:'log.meditate', type:'info' });
    if (window.UI) UI.markDirty('hud');

    // [CHANGE] Não avança; apenas marca usada
    markActionUsed('meditate');

  } catch(_e){
    alert('Erro ao meditar.');
  } finally {
    state._inputLocked = false;
  }
}
function doDrink(ev){
  ev.preventDefault();
  if(state._inputLocked) return;
  state._inputLocked = true;

  /* [CHANGE] Bloqueio: só permite 1× por sala/dia */
  if (isActionUsed('drink')){
    emitLog({ key:'log.action.used', type:'mod' });
    state._inputLocked = false;
    return;
  }

  try{
    const p = state.player;
    const gHp = _gainByPctMax(p.hp, p.hpMax, 0.20);
    const gMp = _gainByPctMax(p.mp, p.mpMax, 0.50);
    p.hp += gHp; p.mp += gMp;

    emitLog({ key:'log.drink', type:'info' });
    if (window.UI) UI.markDirty('hud');

    // [CHANGE] Não avança; apenas marca usada
    markActionUsed('drink');

  }catch(_e){
    alert('Erro ao beber água.');
  } finally {
    state._inputLocked = false;
  }
}
function doWash(ev){
  ev.preventDefault();
  if(state._inputLocked) return;
  state._inputLocked = true;

  /* [CHANGE] Bloqueio: só permite 1× por sala/dia */
  if (isActionUsed('wash')){
    emitLog({ key:'log.action.used', type:'mod' });
    state._inputLocked = false;
    return;
  }

  try{
    const p = state.player;
    const gSa = Math.max(0, p.sanityMax - p.sanity);
    p.sanity += gSa;

    emitLog({ key:'log.wash', type:'info' });
    if (window.UI) UI.markDirty('hud');

    // [CHANGE] Não avança; apenas marca usada
    markActionUsed('wash');

  }catch(_e){
    alert('Erro ao lavar o rosto.');
  } finally {
    state._inputLocked = false;
  }
}
function doContemplate(ev){
  ev.preventDefault();
  if(state._inputLocked) return;
  state._inputLocked = true;

  /* [CHANGE] Bloqueio: só permite 1× por sala/dia */
  if (isActionUsed('contemplate')){
    emitLog({ key:'log.action.used', type:'mod' });
    state._inputLocked = false;
    return;
  }

  try{
    const p = state.player;
    const gSa = _gainByPctMax(p.sanity, p.sanityMax, 0.05);
    p.sanity += gSa;
    p.xp = Math.max(0, (p.xp||0) + (gSa>0 ? 5 : 0));

    emitLog({ key:'log.contemplate', type:'info' });
    if (window.UI) UI.markDirty('hud');

    // [CHANGE] Não avança; apenas marca usada
    markActionUsed('contemplate');

  }catch(_e){
    alert('Erro ao contemplar a água.');
  } finally {
    state._inputLocked = false;
  }
}
 /* =====================[ FIM TRECHO 8 ]===================== */


/* =====================[ TRECHO 9: Roteadores de Ação (contextuais) ]===================== */
function onAct1(ev){ (state.room && state.room.kind === 'fountain') ? doDrink(ev)       : doRest(ev); }
function onAct2(ev){ (state.room && state.room.kind === 'fountain') ? doWash(ev)        : doMeditate(ev); }
function onAct3(ev){ (state.room && state.room.kind === 'fountain') ? doContemplate(ev) : ev.preventDefault(); }
 /* =====================[ FIM TRECHO 9 ]===================== */


/* =====================[ TRECHO 10: Explorar Sala (avanço manual) ]===================== */
/* [DOC]
   - Agora o avanço ocorre **apenas** quando o jogador clica em EXPLORAR.
   - Ao avançar, zera o mapa de ações usadas para a nova sala/dia.
*/
function onExplore(ev){
  ev.preventDefault();
  if(state._inputLocked) return;
  state._inputLocked = true;
  if(state.ui && state.ui.btnExplore) state.ui.btnExplore.disabled = true;

  try {
    // Custo fixo ao explorar
    const p = state.player;
    p.energy = Math.max(0, (p.energy|0) - 10);
    p.sanity = Math.max(0, (p.sanity|0) - 5);
    if (window.UI) UI.markDirty('hud');

    // Game Over por sanidade
    if (p.sanity === 0){
      endGame('sanity');
      var __ended = true;
      return;
    }

    // Avança dia
    state.run.day++;

    // Alvo de salas (30..50) por floor
    if (!state.run.targetRooms || state.run.targetRooms < 30 || state.run.targetRooms > 50){
      state.run.targetRooms = getTargetRoomsForFloor(state.run.floor);
    }

    // Contador de salas no floor
    state.run.roomsOnFloor = (state.run.roomsOnFloor|0) + 1;

    // Chegou ao fim do andar?
    if (state.run.roomsOnFloor >= state.run.targetRooms){
      state.run.floor++;
      state.run.roomsOnFloor = 0;
      emitLog({ key: 'log.empty.v1', type:'info' }); // placeholder de transição
    } else {
      // Seleciona sala: 50% vazia / 50% fonte
      const isFountain = rngNext() < 0.5;
      state.room = { kind: isFountain ? 'fountain' : 'empty', used: {} }; // [CHANGE] reseta ações usadas
      if (isFountain){
        emitLog({ key: 'log.fountain', type:'info' });
      } else {
        const k = pickEmptyRoomLogKey(state.run);
        emitLog({ key: k, type:'info' });
      }
    }

    // Game Over por energia (se sala não for vazia)
    if (p.energy === 0){
      const kind = (state.room && state.room.kind) ? state.room.kind : 'unknown';
      if (kind !== 'empty'){
        endGame('energy');
        var __ended = true;
        return;
      }
    }

    if (window.UI) UI.markDirty('hud');

  } catch(_e){
    alert('Ocorreu um erro ao explorar.');
  } finally {
    // (flags de isenção permanecem, mas sem efeito sem avanço automático)
    state._nextExploreNoEnergyCost = false;
    state._nextExploreNoSanityCost = false;

    if (typeof __ended !== 'undefined' && __ended){ return; }
    state._inputLocked = false;
    if(state.ui && state.ui.btnExplore) state.ui.btnExplore.disabled = false;
  }
}
 /* =====================[ FIM TRECHO 10 ]===================== */


/* =====================[ TRECHO 11: Boot ]===================== */
function init(){
  setScene('GAME');
  emitLog({ key: 'log.one', type: 'info' });
  emitLog({ key: 'log.two', type: 'info' });
  if (window.UI) UI.flush();
}
if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
 /* =====================[ FIM TRECHO 11 ]===================== */

})();
