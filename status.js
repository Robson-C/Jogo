// status.js — Responsável pela renderização do painel de status do jogador e inimigo,
// mostrando atributos, buffs/debuffs ativos, barras de vida/energia e tooltips de acessibilidade.
// Inclui agora transição fluida sincronizada entre painel do inimigo e histórico de mensagens.

/* =====================[ TRECHO 1: CONSTANTES E ANIMAÇÃO DO PAINEL ]===================== */

function expandirPainelInimigo() {
    const panel = document.getElementById('enemyPanel');
    if (panel && !panel.classList.contains('expandido')) {
        panel.classList.add('expandido');
    }
}
function recolherPainelInimigo() {
    const panel = document.getElementById('enemyPanel');
    if (panel && panel.classList.contains('expandido')) {
        panel.classList.remove('expandido');
    }
}

/* =====================[ FIM TRECHO 1 ]===================== */

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
        <div class="status-item vida"
            role="progressbar"
            aria-valuenow="${gameState.vida}" aria-valuemax="${gameState.maxVida}" aria-label="Vida: ${gameState.vida} de ${gameState.maxVida}"
            tabindex="0"
        >
            <span>❤️ Vida: ${gameState.vida}/${gameState.maxVida}</span>
            <div class="status-bar">
                <div class="bar-fill" style="width: ${(gameState.vida/gameState.maxVida)*100}%"></div>
            </div>
        </div>
        <div class="status-item mana"
            role="progressbar"
            aria-valuenow="${gameState.mana}" aria-valuemax="${gameState.maxMana}" aria-label="Mana: ${gameState.mana} de ${gameState.maxMana}"
            tabindex="0"
        >
            <span>🔮 Mana: ${gameState.mana}/${gameState.maxMana}</span>
            <div class="status-bar">
                <div class="bar-fill" style="width: ${(gameState.mana/gameState.maxMana)*100}%"></div>
            </div>
        </div>
        <div class="status-item energia"
            role="progressbar"
            aria-valuenow="${gameState.energia}" aria-valuemax="${gameState.maxEnergia}" aria-label="Energia: ${gameState.energia} de ${gameState.maxEnergia}"
            tabindex="0"
        >
            <span>⚡ Energia: ${gameState.energia}/${gameState.maxEnergia}</span>
            <div class="status-bar">
                <div class="bar-fill" style="width: ${(gameState.energia/gameState.maxEnergia)*100}%"></div>
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

/* =====================[ FIM TRECHO 2 ]===================== */

/* =====================[ TRECHO 3: ATUALIZAÇÃO DO PAINEL DO INIMIGO ]===================== */

function updateEnemyPanel() {
    let panel = document.getElementById('enemyPanel');
    const shouldShow = gameState.inCombat && gameState.currentEnemy;
    const ANIMATION_DURATION = 1000; // Tempo da animação em ms (deve bater com o seu CSS)

    if (typeof window.enemyPanelAnimating === "undefined") window.enemyPanelAnimating = false;

    // Cria o painel dinamicamente se necessário
    if (shouldShow && !panel) {
        panel = document.createElement('div');
        panel.id = 'enemyPanel';
        panel.className = 'enemy-status-wrapper';
        panel.setAttribute('tabindex', '0');
        panel.setAttribute('aria-label', 'Painel de Status do Inimigo');
        const statusBox = document.getElementById('status');
        if (statusBox && statusBox.parentNode) {
            statusBox.parentNode.insertBefore(panel, statusBox.nextSibling);
        }
    }

    if (shouldShow && panel) {
        let innerHTML = `<div class="enemy-status"></div>`;

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
            <div class="enemy-status" tabindex="0" aria-label="Status do inimigo: ${gameState.currentEnemy.name}, HP ${gameState.currentEnemy.vida} de ${gameState.currentEnemy.maxVida}">
                <span>
                    👹 ${gameState.currentEnemy.name}: HP ${gameState.currentEnemy.vida}/${gameState.currentEnemy.maxVida}
                    ${enemyBuffs}
                </span>
                <div class="status-bar enemy-hp" role="progressbar" aria-label="HP do inimigo: ${gameState.currentEnemy.vida} de ${gameState.currentEnemy.maxVida}">
                    <div class="bar-fill" style="width: ${(gameState.currentEnemy.vida/gameState.currentEnemy.maxVida)*100}%"></div>
                </div>
                <div class="enemy-secondary-stats" tabindex="0" aria-label="Atributos do inimigo: Ataque ${getEnemyStat("forca", gameState.currentEnemy)}, Defesa ${getEnemyStat("defesa", gameState.currentEnemy)}, Precisão ${gameState.currentEnemy.precisao}%, Agilidade ${gameState.currentEnemy.agilidade}%">
                    <span><b>🗡 Ataque:</b> ${getEnemyStat("forca", gameState.currentEnemy)}</span>
                    <span><b>🛡 Defesa:</b> ${getEnemyStat("defesa", gameState.currentEnemy)}</span>
                    <span><b>🎯 Precisão:</b> ${gameState.currentEnemy.precisao}%</span>
                    <span><b>💨 Agilidade:</b> ${gameState.currentEnemy.agilidade}%</span>
                </div>
            </div>
        `;

        // Animação de entrada (adiciona .expandido)
        if (!panel.classList.contains('expandido')) {
            // BLOQUEIA opções durante a animação
            window.enemyPanelAnimating = true;
            if (typeof bloquearOpcoesJogador === "function") bloquearOpcoesJogador();
            panel.innerHTML = innerHTML;
            setTimeout(() => {
                panel.classList.add('expandido');
                setTimeout(() => {
                    window.enemyPanelAnimating = false;
                    if (typeof presentOptions === "function") presentOptions();
                }, ANIMATION_DURATION);
            }, 10);
        } else {
            panel.innerHTML = innerHTML;
        }

        initBuffTooltipHandlers();

    } else if (panel) {
        // Animação de saída antes de remover do DOM
        if (panel.classList.contains('expandido')) {
            window.enemyPanelAnimating = true;
            if (typeof bloquearOpcoesJogador === "function") bloquearOpcoesJogador();
            panel.classList.remove('expandido');
            setTimeout(() => {
                if (panel && panel.parentNode) {
                    panel.parentNode.removeChild(panel);
                }
                window.enemyPanelAnimating = false;
                if (typeof presentOptions === "function") presentOptions();
            }, ANIMATION_DURATION);
        } else {
            if (panel && panel.parentNode) {
                panel.parentNode.removeChild(panel);
            }
            window.enemyPanelAnimating = false;
            if (typeof presentOptions === "function") presentOptions();
        }
    }
}

/* =====================[ FIM TRECHO 3 ]===================== */

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
