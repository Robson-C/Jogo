/* =====================[ TRECHO 1: i18n.js — MÓDULO DE IDIOMAS ]===================== */
/* [DOC]
   Propósito: Gerenciar idiomas do app (UI/ARIA/logs fixos) 100% offline, sem fetch.
   Responsabilidades:
     - Guardar dicionários embutidos por locale (pt-BR, en-US).
     - Expor API: I18N.set(lang), I18N.get(), I18N.list(), I18N.t(key[, params]).
     - Aplicar traduções no DOM existente sem alterar HTML (usa seletores estáveis).
     - Persistir escolha em localStorage ("settings.lang").
     - Ajustar <html lang>, <title> e textos estáticos do layout.
   Observações:
     - Sem eval/Function, sem innerHTML, apenas textContent/atributos.
*/

(function(){
  'use strict';

  /* =====================[ TRECHO 2: DICIONÁRIOS ]===================== */
  // [STATE] Dicionários embutidos; amplie aqui quando adicionar mais idiomas.
  const DICTS = {
    'pt-BR': {
      /* [CHANGE] meta.title ajustado para o título real do jogo */
      meta: { title: 'Torre da Redenção' },
      ui: {
        level: 'Nível',
        menu: 'Menu',
        player: 'Você',
        ads: 'ADS',
        actions: {
          explore: 'EXPLORAR',
          // [CHANGE] Novas ações de sala vazia
          rest: 'Descansar',
          meditate: 'Meditar',
          // [CHANGE] Sala com Fonte
          drink: 'Beber água',
          wash: 'Lavar o rosto',
          contemplate: 'Contemplar a água',
        }
      },
      stats: {
        hp: 'Vida', mp: 'Mana', energy: 'Energia', sanity: 'Sanidade',
        atk: 'Ataque', def: 'Defesa', acc: 'Precisão', agi: 'Agilidade'
      },
      room: {
        empty: 'Sala Vazia',
        fountain: 'Sala com Fonte'
      },
      enemy: { name: 'Inimigo' },
      aria: { xpBar: 'Barra de XP', enemyHp: 'HP do inimigo' },
      hud: { day: 'Dia', floor: 'Andar' },
      overlay: {
        rotate: { before: 'Gire o dispositivo para ', strong: 'retrato', after: '.' }
      },
      log: {
        // Logs iniciais
        one: 'Você acorda sem lembranças.',
        two: 'Parece estar em uma torre antiga.',
        three: 'O ar é frio e úmido; passos ecoam ao longe.',
        four: 'Suas mãos tremem ligeiramente, mas você segue.',

        // Variações de sala vazia (A1)
        empty: {
          v1: 'Corredor silencioso. Nada acontece.',
          v2: 'Sala vazia, só poeira no chão.',
          v3: 'Sombras dançam, mas ninguém aqui.',
          v4: 'A porta range; o ambiente está deserto.',
          v5: 'Só ecos respondem. Você segue em frente.'
        },

        // [CHANGE] Feedbacks discretos das novas ações
        rest: 'Você descansou e sente as forças voltarem.',
        meditate: 'Você meditou e clareou a mente.',
        // [CHANGE] Fonte
        fountain: 'Você encontra uma fonte límpida no centro da sala.',
        drink: 'Você bebe a água e sente vigor renovado.',
        wash: 'Você lava o rosto; sua mente fica nítida.',
        contemplate: 'Você contempla a água e aprende algo novo.',
        // [CHANGE] Mensagens de Game Over
        gameover: {
          sanity: 'Sua sanidade chegou a zero. Fim de jogo.',
          energy: 'Você ficou sem energia em uma sala perigosa. Fim de jogo.'
        }
      }
    },

    'en-US': {
      meta: { title: 'Tower of Redemption' },
      ui: {
        level: 'Level',
        menu: 'Menu',
        player: 'You',
        ads: 'ADS',
        actions: {
          explore: 'EXPLORE',
          // [CHANGE] New empty-room actions
          rest: 'Rest',
          meditate: 'Meditate',
          // Fountain
          drink: 'Drink water',
          wash: 'Wash your face',
          contemplate: 'Contemplate the water',
        }
      },
      stats: {
        hp: 'HP', mp: 'MP', energy: 'Energy', sanity: 'Sanity',
        atk: 'Attack', def: 'Defense', acc: 'Accuracy', agi: 'Agility'
      },
      room: { 
        empty: 'Empty Room',
        fountain: 'Fountain Room'
      },
      enemy: { name: 'Enemy' },
      aria: { xpBar: 'Experience Bar', enemyHp: 'Enemy HP' },
      hud: { day: 'Day', floor: 'Floor' },
      overlay: {
        rotate: { before: 'Rotate the device to ', strong: 'portrait', after: '.' }
      },
      log: {
        // Initial logs
        one: 'You wake up with no memories.',
        two: 'It seems you are in an ancient tower.',
        three: 'The air is cold and damp; footsteps echo far away.',
        four: 'Your hands tremble slightly, but you press on.',

        // Empty-room variants (A1)
        empty: {
          v1: 'Silent corridor. Nothing happens.',
          v2: 'Empty room, only dust on the floor.',
          v3: 'Shadows sway, but no one is here.',
          v4: 'The door creaks; the room is deserted.',
          v5: 'Only echoes answer. You move on.'
        },

        // [CHANGE] Discrete feedback for the new actions
        rest: 'You rested and feel your strength returning.',
        meditate: 'You meditated and cleared your mind.',
        fountain: 'You find a clear fountain in the center of the room.',
        drink: 'You drink the water and feel renewed.',
        wash: 'You wash your face; your mind becomes clear.',
        contemplate: 'You contemplate the water and learn something new.',
        // [CHANGE] Game Over messages
        gameover: {
          sanity: 'Your sanity dropped to zero. Game over.',
          energy: 'You ran out of energy in a dangerous room. Game over.'
        }
      }
    }
  };
  /* =====================[ FIM TRECHO 2 ]===================== */

  /* =====================[ TRECHO 3: STORAGE & LINGUAGEM ATUAL ]===================== */
  // [STATE] Linguagem atual e chave de storage. Fallback padrão: 'pt-BR'.
  const STORAGE_KEY = 'settings.lang';
  function readStorageLang(){
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v && DICTS[v] ? v : null;
    } catch(_e){ return null; }
  }
  function writeStorageLang(v){
    try { localStorage.setItem(STORAGE_KEY, v); } catch(_e){}
  }

  let current = readStorageLang() || navigator.language || 'pt-BR';
  if(!DICTS[current]) current = 'pt-BR';

  /* =====================[ TRECHO 4: RESOLUÇÃO DE CHAVES ]===================== */
  // [DOC] t(key, params?) resolve a string no locale atual; fallback para pt-BR; sem innerHTML.
  function t(key, params){
    const val = resolve(DICTS[current], key) ?? resolve(DICTS['pt-BR'], key) ?? key;
    if(params && typeof val === 'string'){
      let out = val;
      for(const k of Object.keys(params)){
        out = out.replaceAll(`{${k}}`, String(params[k]));
      }
      return out;
    }
    return typeof val === 'string' ? val : val;
  }
  function resolve(obj, key){
    return key.split('.').reduce((o,k)=> (o && (k in o)) ? o[k] : undefined, obj);
  }

  /* =====================[ TRECHO 5: APLICAÇÃO NO DOM ]===================== */
  // [DOC] Aplica traduções usando seletores do layout atual (sem mudar HTML).
  function applyToDOM(){
    const docEl = document.documentElement;
    docEl.lang = current;

    // <title>
    if (document.title !== t('meta.title')) document.title = t('meta.title');

    // Header: "Level 99" (preserva número)
    const levelEl = document.querySelector('.toprow .level');
    if(levelEl){
      const num = (levelEl.textContent.match(/\d+/)||[''])[0];
      levelEl.textContent = t('ui.level') + (num ? ' ' + num : '');
    }

    // Botão menu (aria/tooltip)
    const menuBtn = document.querySelector('.toprow .icon-btn');
    if(menuBtn){
      const label = t('ui.menu');
      menuBtn.setAttribute('aria-label', label);
      menuBtn.setAttribute('title', label);
    }

    // Barra de XP (aria)
    const xpBar = document.querySelector('.xp-bar[role="progressbar"]');
    if(xpBar){
      xpBar.setAttribute('aria-label', t('aria.xpBar'));
    }

    // Stats principais 2x2 — por ordem (VIDA, MANA, ENERGIA, SANIDADE)
    const statNames = document.querySelectorAll('.stats-grid .stat-name');
    if(statNames.length >= 4){
      statNames[0].textContent = t('stats.hp');
      statNames[1].textContent = t('stats.mp');
      statNames[2].textContent = t('stats.energy');
      statNames[3].textContent = t('stats.sanity');
    }
    // ARIA das barras principais (mantém ordem)
    const bars = document.querySelectorAll('.stats-grid .bar[role="progressbar"]');
    if(bars.length >= 4){
      bars[0].setAttribute('aria-label', t('stats.hp'));
      bars[1].setAttribute('aria-label', t('stats.mp'));
      bars[2].setAttribute('aria-label', t('stats.energy'));
      bars[3].setAttribute('aria-label', t('stats.sanity'));
    }

    // Chips secundários (jogador)
    const chipAtk = document.querySelector('.secstats .stat-chip--atk');
    const chipDef = document.querySelector('.secstats .stat-chip--def');
    const chipAcc = document.querySelector('.secstats .stat-chip--acc');
    const chipAgi = document.querySelector('.secstats .stat-chip--agi');
    if(chipAtk){ chipAtk.setAttribute('aria-label', t('stats.atk')); chipAtk.setAttribute('title', t('stats.atk')); }
    if(chipDef){ chipDef.setAttribute('aria-label', t('stats.def')); chipDef.setAttribute('title', t('stats.def')); }
    if(chipAcc){ chipAcc.setAttribute('aria-label', t('stats.acc')); chipAcc.setAttribute('title', t('stats.acc')); }
    if(chipAgi){ chipAgi.setAttribute('aria-label', t('stats.agi')); chipAgi.setAttribute('title', t('stats.agi')); }

    // Painel de sala
    const roomTitle = document.querySelector('.room .room-title');
    if(roomTitle){ roomTitle.textContent = t('room.empty'); }

    // Inimigo (nome + aria da barra de HP) — se e quando visível
    const enemyName = document.querySelector('.enemy-card .enemy-name');
    if(enemyName){ enemyName.textContent = t('enemy.name'); }
    const enemyHp = document.querySelector('.enemy-card .enemy-hp[role="progressbar"]');
    if(enemyHp){ enemyHp.setAttribute('aria-label', t('aria.enemyHp')); }

    // Runline: "Dia 1" | "Andar 1"
    const runDay = document.querySelector('.runline .runline-day');
    if(runDay){
      const num = (runDay.textContent.match(/\d+/)||[''])[0];
      runDay.textContent = t('hud.day') + (num ? ' ' + num : '');
    }
    const runFloor = document.querySelector('.runline .runline-floor');
    if(runFloor){
      const num = (runFloor.textContent.match(/\d+/)||[''])[0];
      runFloor.textContent = t('hud.floor') + (num ? ' ' + num : '');
    }

    // Ações: botão primário "EXPLORAR" (demais permanecem ??? por design)
    const act4 = document.getElementById('act-4');
    if(act4){ act4.textContent = t('ui.actions.explore'); }

    // Log placeholder (apenas para o protótipo visual)
    const logLines = document.querySelectorAll('.log-view .log-line');
    if(logLines.length >= 4){
      logLines[0].textContent = t('log.one');
      logLines[1].textContent = t('log.two');
      logLines[2].textContent = t('log.three');
      logLines[3].textContent = t('log.four');
    }

    // ADS placeholder
    const ads = document.querySelector('.ads');
    if(ads){ ads.textContent = t('ui.ads'); }

    // Overlay de rotação (prefixo + <strong> + sufixo), sem innerHTML
    const rotP = document.querySelector('.rotate-card p');
    if(rotP){
      const strong = rotP.querySelector('strong');
      // Estrutura: [textNode prefixo] <strong>...</strong> [textNode sufixo]
      ensureTextNodeAt(rotP, 0);                      // prefixo
      ensureTextNodeAt(rotP, rotP.childNodes.length); // sufixo (se ausente)
      const beforeNode = rotP.childNodes[0];
      const afterNode  = rotP.childNodes[strong ? 2 : 1]; // se há <strong>, ele é índice 1
      beforeNode.textContent = t('overlay.rotate.before');
      if(strong) strong.textContent = t('overlay.rotate.strong');
      if(afterNode) afterNode.textContent = t('overlay.rotate.after');
    }
  }

  // Garante que exista um TextNode em determinada posição (prefixo/sufixo)
  function ensureTextNodeAt(parent, index){
    const node = parent.childNodes[index];
    if(!node || node.nodeType !== Node.TEXT_NODE){
      parent.insertBefore(document.createTextNode(''), parent.childNodes[index] || null);
    }
  }

  /* =====================[ TRECHO 6: API PÚBLICA ]===================== */
  const I18N = {
    /* [DOC] get(): retorna o locale atual (string) */
    get(){ return current; },

    /* [DOC] list(): lista de locales disponíveis */
    list(){ return Object.keys(DICTS); },

    /* [DOC] set(lang): define o idioma, persiste e aplica ao DOM; retorna true/false */
    set(lang){
      if(!DICTS[lang]) return false;
      current = lang;
      writeStorageLang(lang);
      applyToDOM(); // html[lang], <title> e todos os rótulos/ARIA
      return true;
    },

    /* [DOC] t(key, params?): resolve string no idioma atual */
    t,

    /* [DOC] reload(): re-aplica o idioma atual ao DOM (útil após trocas dinâmicas de UI) */
    reload(){ applyToDOM(); }
  };

  // [DOC] Exposição controlada (um único global)
  window.I18N = I18N;

  /* =====================[ TRECHO 7: BOOT ]===================== */
  // [DOC] Inicializa após o parse do DOM (defer garante ordem de execução).
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyToDOM, { once: true });
  } else {
    applyToDOM();
  }

})();
