// status.js — Responsável pela renderização do painel de status do jogador e inimigo,
// mostrando atributos, buffs/debuffs ativos, barras de vida/energia e tooltips de acessibilidade.
// Inclui agora transição fluida sincronizada entre painel do inimigo e histórico de mensagens.

/* =====================[ TRECHO 1: CONSTANTES E ANIMAÇÃO DO PAINEL ]===================== */

const MAX_HISTORY_HEIGHT_DESKTOP = 250; // px (sem inimigo)
const MAX_HISTORY_HEIGHT_MOBILE = 250;  // px (sem inimigo)
const MIN_HISTORY_HEIGHT_COMBAT = 100;  // px (com inimigo aberto totalmente)
const ENEMY_PANEL_ANIMATION_DURATION = 1000; // ms, mesma duração do CSS .enemy-status-wrapper

let enemyPanelAnimationFrame = null;

function animateEnemyPanelAndHistory(abrir, startTime) {
    const panel = document.getElementById('enemyPanel');
    const fullHistory = DOM_ELEMENTS.fullHistory;
    if (!panel || !fullHistory) return;

    if (enemyPanelAnimationFrame !== null) {
        cancelAnimationFrame(enemyPanelAnimationFrame);
        enemyPanelAnimationFrame = null;
    }

    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    const maxHistoryHeight = isMobile ? MAX_HISTORY_HEIGHT_MOBILE : MAX_HISTORY_HEIGHT_DESKTOP;

    let panelInitialHeight = panel.offsetHeight;
    let panelTargetHeight = 0;
    let historyInitialHeight = fullHistory.offsetHeight;
    let historyTargetHeight = 0;

    if (abrir) {
        panel.style.display = "";
        panel.classList.add('visible');
        const inner = panel.querySelector('.enemy-status');
        let enemyPanelHeight = inner ? inner.scrollHeight : 110;
        enemyPanelHeight += 7;
        panelInitialHeight = 0;
        panelTargetHeight = enemyPanelHeight;
        historyInitialHeight = maxHistoryHeight;
        historyTargetHeight = maxHistoryHeight - enemyPanelHeight;
        panel.style.maxHeight = "0px";
    } else {
        let currentPanelHeight = panel.scrollHeight;
        panelInitialHeight = currentPanelHeight;
        panelTargetHeight = 0;
        historyInitialHeight = maxHistoryHeight - currentPanelHeight;
        historyTargetHeight = maxHistoryHeight;
        panel.style.display = ""; // Mantém o painel ocupando espaço até a animação acabar!
    }

    function clamp(v) { return Math.max(40, v); }

    function step(now) {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;
        let progress = elapsed / ENEMY_PANEL_ANIMATION_DURATION;
        if (progress > 1) progress = 1;

        const currPanelHeight = Math.round(panelInitialHeight + (panelTargetHeight - panelInitialHeight) * progress);
        const currHistoryHeight = clamp(Math.round(historyInitialHeight + (historyTargetHeight - historyInitialHeight) * progress));

        panel.style.maxHeight = currPanelHeight + "px";
        fullHistory.style.height = currHistoryHeight + "px";

        if (progress < 1) {
            enemyPanelAnimationFrame = requestAnimationFrame(step);
        } else {
            // Valores finais exatos:
            panel.style.maxHeight = panelTargetHeight + "px";
            fullHistory.style.height = clamp(historyTargetHeight) + "px";
            enemyPanelAnimationFrame = null;

            if (!abrir) {
                panel.classList.remove('visible');
                // Corrigido: só limpa e esconde DEPOIS de mais um repaint/frame do histórico!
                requestAnimationFrame(() => {
                    panel.innerHTML = `<div class="enemy-status"></div>`;
                    panel.style.display = "none";
                });
            }
        }
    }
    requestAnimationFrame(step);
}

/* =====================[ TRECHO 2: STATUS DO JOGADOR E BARRAS ]===================== */

function updateStatus() {
    // ===== Buffs/Debuffs do Player na linha do Nível (ícone único + tooltip) =====
    let playerBuffsHTML = '';
    if (gameState.debuffs) {
        let buffsArr = [];
        const handledBuffs = new Set();
        // Primeiro, checa buffs compostos
        Object.keys(COMPOSITE_BUFFS).forEach(compKey => {
            const stats = COMPOSITE_BUFFS[compKey];
            const active = stats.every(stat => gameState.debuffs[stat]);
            if (active && !stats.some(stat => handledBuffs.has(stat))) {
                const info = getBuffInfo(compKey);
                const turns = Math.max(...stats.map(stat => gameState.debuffs[stat].turns));
                let efeitosLinha = stats.map(stat => {
                    let statIcon = stat === "forca" ? "🗡️" : stat === "defesa" ? "🛡️" : stat === "agilidade" ? "💨" : stat;
                    let value = gameState.debuffs[stat].value;
                    let sign = value < 0 ? "" : "-";
                    value = Math.abs(value);
                    return `${statIcon} ${sign}${value}`;
                }).join(", ");
                buffsArr.push(`
                    <span class="buff-icon" data-buff='${compKey}' data-turns='${turns}' data-desc='${info.descricao}' data-efeitos='${efeitosLinha}'
                        tabindex="0"
                        aria-label="${info.nome}: ${info.descricao}. Efeitos: ${efeitosLinha}. Duração: ${turns} turno(s)."
                    >${info.icone}</span>
                `);
                stats.forEach(stat => handledBuffs.add(stat));
            }
        });
        // Agora exibe buffs/debuffs simples restantes
        Object.keys(gameState.debuffs).forEach(type => {
            if (handledBuffs.has(type)) return;
            const info = getBuffInfo(type);
            const turns = gameState.debuffs[type].turns;
            let statIcon = info && info.icone ? info.icone : "❓";
            let value = gameState.debuffs[type].value !== undefined ? gameState.debuffs[type].value : "";
            let efeitoLinha = "";
            let descLinha = info ? info.descricao : "";
            if (type === "precisao") {
                const totalRed = Math.min(15, 5 * turns);
                efeitoLinha = `🎯 -${totalRed}% precisão`;
                descLinha += ` (-${totalRed}% de precisão)`;
            } else {
                let sign = value < 0 ? "" : "-";
                value = Math.abs(value);
                efeitoLinha = info && info.efeitos ? Object.keys(info.efeitos).map(stat => {
                    let icon = stat === "forca" ? "🗡️" : stat === "defesa" ? "🛡️" : stat === "agilidade" ? "💨" : stat;
                    return `${icon} ${sign}${value}`;
                }).join(", ") : "";
            }
            buffsArr.push(`
                <span class="buff-icon" data-buff='${type}' data-turns='${turns}' data-desc='${descLinha}' data-efeitos='${efeitoLinha}'
                    tabindex="0"
                    aria-label="${info && info.nome ? info.nome : type}: ${descLinha}. Efeitos: ${efeitoLinha}. Duração: ${turns} turno(s)."
                >${statIcon}</span>
            `);
        });
        if (buffsArr.length > 0) {
            playerBuffsHTML = `<span class="player-buffs">${buffsArr.join(' ')}</span>`;
        }
    }

    // Calcular stats do player já considerando debuffs
    let agilidadeAtual = getPlayerAgilidadeAtual();
    let defesaAtual = getPlayerDefesaAtual();
    let precisaoAtual = getPlayerPrecisaoAtual();
    let forcaAtual = getPlayerForcaAtual();
    const xpPercent = (gameState.nextLevel > 0)
        ? Math.max(0, Math.min(100, (gameState.xp / gameState.nextLevel) * 100))
        : 0;

    const statusSecundarios = `
        <div class="secondary-stats" tabindex="0" aria-label="Atributos secundários: Ataque ${forcaAtual}, Defesa ${defesaAtual}, Precisão ${precisaoAtual}%, Agilidade ${agilidadeAtual}%">
            <span><b>🗡 Ataque:</b> ${forcaAtual}</span>
            <span><b>🛡 Defesa:</b> ${defesaAtual}</span>
            <span><b>🎯 Precisão:</b> ${precisaoAtual}%</span>
            <span><b>💨 Agilidade:</b> ${agilidadeAtual}%</span>
        </div>
    `;

    DOM_ELEMENTS.status.innerHTML = `
        <div class="status-item xp-bar" style="position:relative;"
            role="progressbar"
            aria-label="Nível ${gameState.level}, experiência ${gameState.xp} de ${gameState.nextLevel}"
            tabindex="0"
        >
            <span style="width:60%;display:inline-block;">Nível ${gameState.level} (${gameState.xp}/${gameState.nextLevel} XP)</span>
            ${playerBuffsHTML}
            <div class="status-bar">
                <div class="bar-fill xp" style="width: ${xpPercent}%"></div>
            </div>
        </div>
        <div class="status-item hp"
            role="progressbar"
            aria-valuenow="${gameState.hp}" aria-valuemax="${gameState.maxHp}" aria-label="Vida: ${gameState.hp} de ${gameState.maxHp}"
            tabindex="0"
        >
            <span>❤️ Vida: ${gameState.hp}/${gameState.maxHp}</span>
            <div class="status-bar">
                <div class="bar-fill" style="width: ${(gameState.hp/gameState.maxHp)*100}%"></div>
            </div>
        </div>
        <div class="status-item mp"
            role="progressbar"
            aria-valuenow="${gameState.mp}" aria-valuemax="${gameState.maxMp}" aria-label="MP: ${gameState.mp} de ${gameState.maxMp}"
            tabindex="0"
        >
            <span>🔮 MP: ${gameState.mp}/${gameState.maxMp}</span>
            <div class="status-bar">
                <div class="bar-fill" style="width: ${(gameState.mp/gameState.maxMp)*100}%"></div>
            </div>
        </div>
        <div class="status-item stamina"
            role="progressbar"
            aria-valuenow="${gameState.stamina}" aria-valuemax="${gameState.maxStamina}" aria-label="Stamina: ${gameState.stamina} de ${gameState.maxStamina}"
            tabindex="0"
        >
            <span>⚡ Stamina: ${gameState.stamina}/${gameState.maxStamina}</span>
            <div class="status-bar">
                <div class="bar-fill" style="width: ${(gameState.stamina/gameState.maxStamina)*100}%"></div>
            </div>
        </div>
        <div class="status-item sanity"
            role="progressbar"
            aria-valuenow="${gameState.sanity}" aria-valuemax="${gameState.maxSanity}" aria-label="Sanidade: ${gameState.sanity} de ${gameState.maxSanity}"
            tabindex="0"
        >
            <span>🌌 Sanidade: ${gameState.sanity}/${gameState.maxSanity}</span>
            <div class="status-bar">
                <div class="bar-fill" style="width: ${(gameState.sanity/gameState.maxSanity)*100}%"></div>
            </div>
        </div>
        ${statusSecundarios}
    `;

    // Painel do inimigo com animação sincronizada
    updateEnemyPanel();
    initBuffTooltipHandlers();
}

/* =====================[ TRECHO 3: ATUALIZAÇÃO DO PAINEL DO INIMIGO ]===================== */

let enemyPanelCloseToken = 0; // Novo: token para garantir que só a última animação pode limpar/esconder

function updateEnemyPanel() {
    const panel = document.getElementById('enemyPanel');
    if (!panel) return;

    const shouldShow = gameState.inCombat && gameState.currentEnemy;
    const isCurrentlyVisible = panel.classList.contains('visible');

    let innerHTML = `<div class="enemy-status"></div>`;
    if (shouldShow) {
        let enemyBuffs = '';
        let buffsArr = [];
        const handledBuffs = new Set();

        Object.keys(COMPOSITE_BUFFS).forEach(compKey => {
            const stats = COMPOSITE_BUFFS[compKey];
            const buffsObj = gameState.currentEnemy.buffs || {};
            const active = stats.every(stat => buffsObj[stat]);
            if (active && !stats.some(stat => handledBuffs.has(stat))) {
                const info = getBuffInfo(compKey);
                const turns = Math.max(...stats.map(stat => buffsObj[stat].turns));
                let efeitosLinha = stats.map(stat => {
                    let statIcon = stat === "forca" ? "🗡️" : stat === "defesa" ? "🛡️" : stat === "agilidade" ? "💨" : stat;
                    let value = buffsObj[stat].value;
                    let sign = value > 0 ? "+" : "-";
                    value = Math.abs(value);
                    return `${statIcon} ${sign}${value}`;
                }).join(", ");
                buffsArr.push(`
                    <span class="buff-icon" data-buff='${compKey}' data-turns='${turns}' data-desc='${info.descricao}' data-efeitos='${efeitosLinha}'
                        tabindex="0"
                        aria-label="${info.nome}: ${info.descricao}. Efeitos: ${efeitosLinha}. Duração: ${turns} turno(s)."
                    >${info.icone}</span>
                `);
                stats.forEach(stat => handledBuffs.add(stat));
            }
        });
        const buffsObj = gameState.currentEnemy.buffs || {};
        Object.keys(buffsObj).forEach(type => {
            if (handledBuffs.has(type)) return;
            const info = getBuffInfo(type);
            const turns = buffsObj[type].turns;
            let statIcon = info && info.icone ? info.icone : "❓";
            let value = buffsObj[type].value !== undefined ? buffsObj[type].value : "";
            let sign = value > 0 ? "+" : "-";
            value = Math.abs(value);
            let efeitoLinha = info && info.efeitos ? Object.keys(info.efeitos).map(stat => {
                let icon = stat === "forca" ? "🗡️" : stat === "defesa" ? "🛡️" : stat === "agilidade" ? "💨" : stat;
                return `${icon} ${sign}${value}`;
            }).join(", ") : "";
            buffsArr.push(`
                <span class="buff-icon" data-buff='${type}' data-turns='${turns}' data-desc='${info ? info.descricao : ""}' data-efeitos='${efeitoLinha}'
                    tabindex="0"
                    aria-label="${info && info.nome ? info.nome : type}: ${info && info.descricao ? info.descricao : ""}. Efeitos: ${efeitoLinha}. Duração: ${turns} turno(s)."
                >${statIcon}</span>
            `);
        });

        if (buffsArr.length > 0) {
            enemyBuffs = `<span class="enemy-buffs">${buffsArr.join(' ')}</span>`;
        }

        innerHTML = `
            <div class="enemy-status" tabindex="0" aria-label="Status do inimigo: ${gameState.currentEnemy.name}, HP ${gameState.currentEnemy.hp} de ${gameState.currentEnemy.maxHp}">
                <span>
                    👹 ${gameState.currentEnemy.name}: HP ${gameState.currentEnemy.hp}/${gameState.currentEnemy.maxHp}
                    ${enemyBuffs}
                </span>
                <div class="status-bar enemy-hp" role="progressbar" aria-label="HP do inimigo: ${gameState.currentEnemy.hp} de ${gameState.currentEnemy.maxHp}">
                    <div class="bar-fill" style="width: ${(gameState.currentEnemy.hp/gameState.currentEnemy.maxHp)*100}%"></div>
                </div>
                <div class="enemy-secondary-stats" tabindex="0" aria-label="Atributos do inimigo: Ataque ${getEnemyStat("forca", gameState.currentEnemy)}, Defesa ${getEnemyStat("defesa", gameState.currentEnemy)}, Precisão ${gameState.currentEnemy.precisao}%, Agilidade ${gameState.currentEnemy.agilidade}%">
                    <span><b>🗡 Ataque:</b> ${getEnemyStat("forca", gameState.currentEnemy)}</span>
                    <span><b>🛡 Defesa:</b> ${getEnemyStat("defesa", gameState.currentEnemy)}</span>
                    <span><b>🎯 Precisão:</b> ${gameState.currentEnemy.precisao}%</span>
                    <span><b>💨 Agilidade:</b> ${gameState.currentEnemy.agilidade}%</span>
                </div>
            </div>
        `;
    }

    // === CORREÇÃO: Bloqueio de múltiplos fechamentos concorrentes ===
    if (!shouldShow && isCurrentlyVisible) {
        // Novo token a cada fechamento
        enemyPanelCloseToken++;
        const thisToken = enemyPanelCloseToken;

        DOM_ELEMENTS.fullHistory.style.height =
            (window.matchMedia("(max-width: 600px)").matches
                ? MAX_HISTORY_HEIGHT_MOBILE
                : MAX_HISTORY_HEIGHT_DESKTOP
            ) + "px";

        animateEnemyPanelAndHistory(false);

        // Limpeza do DOM do painel agora só ocorre se este fechamento foi o último disparado:
        setTimeout(() => {
            // Se outro open/close disparou depois, não faz nada!
            if (enemyPanelCloseToken === thisToken) {
                panel.innerHTML = `<div class="enemy-status"></div>`;
                panel.style.display = "none";
            }
        }, ENEMY_PANEL_ANIMATION_DURATION + 32); // Garante que tudo já animou/renderizou
        // --- FIM PROTEÇÃO ---
    } else if (shouldShow && !isCurrentlyVisible) {
        // ABRE: anima para abrir
        panel.innerHTML = innerHTML;
        initBuffTooltipHandlers();
        animateEnemyPanelAndHistory(true);
    } else {
        // Apenas atualiza o conteúdo, se já está aberto
        panel.innerHTML = innerHTML;
        initBuffTooltipHandlers();
    }
}


/* =====================[ TRECHO 4: UTILS DE STATUS E TOOLTIP ]===================== */

function getEnemyStat(stat, enemy) {
    let value = enemy[stat];
    if (enemy.buffs && enemy.buffs[stat]) {
        value += enemy.buffs[stat].value;
    }
    return value;
}

function initBuffTooltipHandlers() {
    document.querySelectorAll('.buff-tooltip').forEach(tip => tip.remove());

    document.querySelectorAll('.buff-icon').forEach(el => {
        function buildTooltipHtml() {
            const nome = getBuffInfo(el.dataset.buff)?.nome || "";
            const turns = el.dataset.turns || "";
            const desc = el.dataset.desc || "";
            const efeitos = el.dataset.efeitos || "";
            return `
                <div class="buff-tooltip-inner">
                    <div class="buff-tooltip-title">${nome}${turns ? " [" + turns + "T]" : ""}</div>
                    <div class="buff-tooltip-desc">${desc}</div>
                    <div class="buff-tooltip-effects">${efeitos}</div>
                </div>
            `;
        }
        el.onmouseenter = e => {
            if (window.matchMedia("(hover: hover)").matches) {
                const tip = document.createElement('div');
                tip.className = 'buff-tooltip';
                tip.innerHTML = buildTooltipHtml();
                document.body.appendChild(tip);
                const rect = el.getBoundingClientRect();
                tip.style.left = `${rect.left + window.scrollX}px`;
                tip.style.top = `${rect.bottom + window.scrollY + 4}px`;
            }
        };
        el.onmouseleave = e => {
            document.querySelectorAll('.buff-tooltip').forEach(tip => tip.remove());
        };
        el.onclick = e => {
            if (!window.matchMedia("(hover: hover)").matches) {
                document.querySelectorAll('.buff-tooltip').forEach(tip => tip.remove());
                const tip = document.createElement('div');
                tip.className = 'buff-tooltip';
                tip.innerHTML = buildTooltipHtml();
                document.body.appendChild(tip);
                const rect = el.getBoundingClientRect();
                tip.style.left = `${rect.left + window.scrollX}px`;
                tip.style.top = `${rect.bottom + window.scrollY + 6}px`;
                e.stopPropagation();
                const closeTip = () => {
                    tip.remove();
                    document.body.removeEventListener('click', closeTip, true);
                };
                setTimeout(() => {
                    document.body.addEventListener('click', closeTip, true);
                }, 20);
            }
        };
        el.onfocus = e => {
            if (!window.matchMedia("(hover: hover)").matches) {
                document.querySelectorAll('.buff-tooltip').forEach(tip => tip.remove());
                const tip = document.createElement('div');
                tip.className = 'buff-tooltip';
                tip.innerHTML = buildTooltipHtml();
                document.body.appendChild(tip);
                const rect = el.getBoundingClientRect();
                tip.style.left = `${rect.left + window.scrollX}px`;
                tip.style.top = `${rect.bottom + window.scrollY + 6}px`;
                e.stopPropagation();
                const closeTip = () => {
                    tip.remove();
                    el.removeEventListener('blur', closeTip, true);
                };
                setTimeout(() => {
                    el.addEventListener('blur', closeTip, true);
                }, 20);
            }
        };
    });
}
