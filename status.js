// status.js — Responsável pela renderização do painel de status do jogador e inimigo,
// mostrando atributos, buffs/debuffs ativos, barras de vida/energia e tooltips de acessibilidade.
// Inclui agora transição fluida sincronizada entre painel do inimigo e histórico de mensagens.

const MAX_HISTORY_HEIGHT_DESKTOP = 250; // px (sem inimigo)
const MAX_HISTORY_HEIGHT_MOBILE = 250;  // px (sem inimigo)
const MIN_HISTORY_HEIGHT_COMBAT = 120;  // px (com inimigo aberto totalmente)
const ENEMY_PANEL_ANIMATION_DURATION = 1000; // ms, mesma duração do CSS .enemy-status-wrapper

// Estado para controlar animação sincronizada
let enemyPanelAnimationFrame = null;

/**
 * Anima sincronizadamente o painel do inimigo e ajusta a altura do histórico de mensagens.
 * @param {boolean} abrir true = abrir painel do inimigo, false = fechar
 * @param {number} [startTime] (não definir manualmente)
 */
function animateEnemyPanelAndHistory(abrir, startTime) {
    const panel = document.getElementById('enemyPanel');
    const fullHistory = DOM_ELEMENTS.fullHistory;

    if (!panel || !fullHistory) return;

    // Cancela animação anterior (se houver)
    if (enemyPanelAnimationFrame !== null) {
        cancelAnimationFrame(enemyPanelAnimationFrame);
        enemyPanelAnimationFrame = null;
    }

    // Alturas alvo para animação
    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    const maxHistoryHeight = isMobile ? MAX_HISTORY_HEIGHT_MOBILE : MAX_HISTORY_HEIGHT_DESKTOP;

    // Calcula altura final do painel inimigo ao abrir (renderiza "inner" de antemão)
    let finalEnemyPanelHeight = 0;
    if (abrir) {
        panel.classList.add('visible');
        panel.style.maxHeight = ""; // Remove limite para medir o natural
        // Renderiza conteúdo (garante elemento existe)
        const inner = panel.querySelector('.enemy-status');
        if (inner) {
            inner.style.position = 'absolute'; // Evita afetar layout durante medição
            inner.style.visibility = 'hidden';
            finalEnemyPanelHeight = inner.scrollHeight;
            inner.style.position = '';
            inner.style.visibility = '';
        } else {
            finalEnemyPanelHeight = 110; // fallback razoável
        }
        // Reseta maxHeight
        panel.style.maxHeight = "0px";
    } else {
        // Ao fechar, pega altura atual
        finalEnemyPanelHeight = panel.scrollHeight;
    }

    const initialPanelHeight = abrir ? 0 : finalEnemyPanelHeight;
    const targetPanelHeight = abrir ? finalEnemyPanelHeight : 0;
    const initialHistoryHeight = maxHistoryHeight - initialPanelHeight;
    const targetHistoryHeight = maxHistoryHeight - targetPanelHeight;

    // Protege para não setar valores negativos
    const clamp = v => Math.max(40, v);

    function step(now) {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / ENEMY_PANEL_ANIMATION_DURATION);

        // EaseInOutCubic
        const ease = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        // Interpola alturas
        const currPanelHeight = Math.round(initialPanelHeight + (targetPanelHeight - initialPanelHeight) * ease);
        const currHistoryHeight = clamp(Math.round(initialHistoryHeight + (targetHistoryHeight - initialHistoryHeight) * ease));

        // Aplica ao DOM
        panel.style.maxHeight = currPanelHeight + "px";
        fullHistory.style.height = currHistoryHeight + "px";

        if (progress < 1) {
            enemyPanelAnimationFrame = requestAnimationFrame(step);
        } else {
            // Ajusta finais
            panel.style.maxHeight = targetPanelHeight + "px";
            fullHistory.style.height = clamp(targetHistoryHeight) + "px";
            enemyPanelAnimationFrame = null;
            // Se fechou, esconde o painel
            if (!abrir) {
                panel.classList.remove('visible');
                setTimeout(() => {
                    panel.innerHTML = `<div class="enemy-status"></div>`;
                }, 80); // Pequeno delay para transição CSS terminar
            }
        }
    }

    // Inicia animação
    requestAnimationFrame(step);
}

// ===== ATUALIZAÇÃO DO STATUS VISUAL (PLAYER) =====
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
                // Acessibilidade: aria-label detalhado
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
            // Correção específica para precisão/ofuscamento
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
            // Acessibilidade: aria-label detalhado
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

    // Status secundários do personagem
    const statusSecundarios = `
        <div class="secondary-stats" tabindex="0" aria-label="Atributos secundários: Ataque ${forcaAtual}, Defesa ${defesaAtual}, Precisão ${precisaoAtual}%, Agilidade ${agilidadeAtual}%">
            <span><b>🗡 Ataque:</b> ${forcaAtual}</span>
            <span><b>🛡 Defesa:</b> ${defesaAtual}</span>
            <span><b>🎯 Precisão:</b> ${precisaoAtual}%</span>
            <span><b>💨 Agilidade:</b> ${agilidadeAtual}%</span>
        </div>
    `;

    // Garante smooth scroll ao trocar altura
    const fullHistory = DOM_ELEMENTS.fullHistory;

    // Monta o HTML de status do jogador, com acessibilidade
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
            aria-valuenow="${gameState.hp}" aria-valuemax="${gameState.maxHp}" aria-label="HP: ${gameState.hp} de ${gameState.maxHp}"
            tabindex="0"
        >
            <span>❤️ HP: ${gameState.hp}/${gameState.maxHp}</span>
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

// ===== ATUALIZAÇÃO DO PAINEL DO MONSTRO =====
function updateEnemyPanel() {
    const panel = document.getElementById('enemyPanel');
    if (!panel) return;

    // Salva se já está visível
    const shouldShow = gameState.inCombat && gameState.currentEnemy;
    const isCurrentlyVisible = panel.classList.contains('visible');

    // Conteúdo do painel
    let innerHTML = `<div class="enemy-status"></div>`;
    if (shouldShow) {
        let enemyBuffs = '';
        let buffsArr = [];
        const handledBuffs = new Set();

        // Buffs compostos do inimigo
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
                // Acessibilidade: aria-label detalhado
                buffsArr.push(`
                    <span class="buff-icon" data-buff='${compKey}' data-turns='${turns}' data-desc='${info.descricao}' data-efeitos='${efeitosLinha}'
                        tabindex="0"
                        aria-label="${info.nome}: ${info.descricao}. Efeitos: ${efeitosLinha}. Duração: ${turns} turno(s)."
                    >${info.icone}</span>
                `);
                stats.forEach(stat => handledBuffs.add(stat));
            }
        });
        // Buffs simples do inimigo
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
            // Acessibilidade: aria-label detalhado
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


    if (!shouldShow && isCurrentlyVisible) {
        // FECHA: anima para fechar
        DOM_ELEMENTS.fullHistory.style.height =
            (window.matchMedia("(max-width: 600px)").matches
                ? MAX_HISTORY_HEIGHT_MOBILE
                : MAX_HISTORY_HEIGHT_DESKTOP
            ) + "px";
        animateEnemyPanelAndHistory(false);
        setTimeout(() => {
            panel.innerHTML = `<div class="enemy-status"></div>`;
        }, ENEMY_PANEL_ANIMATION_DURATION + 80);
    } else if (shouldShow && !isCurrentlyVisible) {
        // ABRE: anima para abrir
        panel.innerHTML = innerHTML;
        initBuffTooltipHandlers();
        // chama animação de ABERTURA
        animateEnemyPanelAndHistory(true);
    } else {
        // Apenas atualiza o conteúdo, se já está aberto
        panel.innerHTML = innerHTML;
        initBuffTooltipHandlers();
    }

}

// ===== Utilitário: mostra stat do inimigo já com buff se houver =====
function getEnemyStat(stat, enemy) {
    let value = enemy[stat];
    if (enemy.buffs && enemy.buffs[stat]) {
        value += enemy.buffs[stat].value;
    }
    return value;
}

// ===== TOOLTIP DOS BUFFS/DEBUFFS (DESKTOP E MOBILE) =====
function initBuffTooltipHandlers() {
    // Remove tooltips existentes
    document.querySelectorAll('.buff-tooltip').forEach(tip => tip.remove());

    // Lógica para tooltip
    document.querySelectorAll('.buff-icon').forEach(el => {
        // Tooltip HTML
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

        // Desktop: hover
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

        // Mobile e teclado: clique ou foco por tab
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
