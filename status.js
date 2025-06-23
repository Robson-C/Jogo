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
                buffsArr.push(`
                    <span class="buff-icon" data-buff='${compKey}' data-turns='${turns}' data-desc='${info.descricao}' data-efeitos='${efeitosLinha}'>${info.icone}</span>
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
            buffsArr.push(`
                <span class="buff-icon" data-buff='${type}' data-turns='${turns}' data-desc='${descLinha}' data-efeitos='${efeitoLinha}'>${statIcon}</span>
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
        <div class="secondary-stats">
            <span><b>🗡 Ataque:</b> ${forcaAtual}</span>
            <span><b>🛡 Defesa:</b> ${defesaAtual}</span>
            <span><b>🎯 Precisão:</b> ${precisaoAtual}%</span>
            <span><b>💨 Agilidade:</b> ${agilidadeAtual}%</span>
        </div>
    `;

    // --- Ajuste dinâmico da altura do histórico de mensagens ---
    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    if (gameState.inCombat) {
        DOM_ELEMENTS.fullHistory.style.height = isMobile ? "120px" : "120px";
    } else {
        DOM_ELEMENTS.fullHistory.style.height = isMobile ? "250px" : "250px";
    }

    // Garante smooth scroll ao trocar altura
    const fullHistory = DOM_ELEMENTS.fullHistory;
    if (fullHistory) {
        fullHistory.removeEventListener('_heightScrollListener', fullHistory._heightScrollListener);
        fullHistory._heightScrollListener = function (e) {
            if (e.propertyName === 'height') {
                fullHistory.scrollTo({
                    top: fullHistory.scrollHeight,
                    behavior: 'smooth'
                });
                fullHistory.removeEventListener('transitionend', fullHistory._heightScrollListener);
            }
        };
        fullHistory.addEventListener('transitionend', fullHistory._heightScrollListener);
    }

    // Monta o HTML de status do jogador
    DOM_ELEMENTS.status.innerHTML = `
        <div class="status-item xp-bar" style="position:relative;">
            <span style="width:60%;display:inline-block;">Nível ${gameState.level} (${gameState.xp}/${gameState.nextLevel} XP)</span>
            ${playerBuffsHTML}
            <div class="status-bar">
                <div class="bar-fill xp" style="width: ${xpPercent}%"></div>
            </div>
        </div>
        <div class="status-item hp">
            <span>❤️ HP: ${gameState.hp}/${gameState.maxHp}</span>
            <div class="status-bar">
                <div class="bar-fill" style="width: ${(gameState.hp/gameState.maxHp)*100}%"></div>
            </div>
        </div>
        <div class="status-item mp">
            <span>🔮 MP: ${gameState.mp}/${gameState.maxMp}</span>
            <div class="status-bar">
                <div class="bar-fill" style="width: ${(gameState.mp/gameState.maxMp)*100}%"></div>
            </div>
        </div>
        <div class="status-item stamina">
            <span>⚡ Stamina: ${gameState.stamina}/${gameState.maxStamina}</span>
            <div class="status-bar">
                <div class="bar-fill" style="width: ${(gameState.stamina/gameState.maxStamina)*100}%"></div>
            </div>
        </div>
        <div class="status-item sanity">
            <span>🌌 Sanidade: ${gameState.sanity}/${gameState.maxSanity}</span>
            <div class="status-bar">
                <div class="bar-fill" style="width: ${(gameState.sanity/gameState.maxSanity)*100}%"></div>
            </div>
        </div>
        ${statusSecundarios}
    `;

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
                buffsArr.push(`
                    <span class="buff-icon" data-buff='${compKey}' data-turns='${turns}' data-desc='${info.descricao}' data-efeitos='${efeitosLinha}'>${info.icone}</span>
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
            buffsArr.push(`
                <span class="buff-icon" data-buff='${type}' data-turns='${turns}' data-desc='${info ? info.descricao : ""}' data-efeitos='${efeitoLinha}'>${statIcon}</span>
            `);
        });

        if (buffsArr.length > 0) {
            enemyBuffs = `<span class="enemy-buffs">${buffsArr.join(' ')}</span>`;
        }

        innerHTML = `
            <div class="enemy-status">
                <span>
                    👹 ${gameState.currentEnemy.name}: HP ${gameState.currentEnemy.hp}/${gameState.currentEnemy.maxHp}
                    ${enemyBuffs}
                </span>
                <div class="status-bar enemy-hp">
                    <div class="bar-fill" style="width: ${(gameState.currentEnemy.hp/gameState.currentEnemy.maxHp)*100}%"></div>
                </div>
                <div class="enemy-secondary-stats">
                    <span><b>🗡 Ataque:</b> ${getEnemyStat("forca", gameState.currentEnemy)}</span>
                    <span><b>🛡 Defesa:</b> ${getEnemyStat("defesa", gameState.currentEnemy)}</span>
                    <span><b>🎯 Precisão:</b> ${gameState.currentEnemy.precisao}%</span>
                    <span><b>💨 Agilidade:</b> ${gameState.currentEnemy.agilidade}%</span>
                </div>
            </div>
        `;
    }

    if (shouldShow && !isCurrentlyVisible) {
        // Renderiza conteúdo primeiro
        panel.innerHTML = innerHTML;
        initBuffTooltipHandlers();
        panel.classList.remove('visible');
        // Aguarda próximo repaint para garantir layout atualizado
        requestAnimationFrame(() => {
            panel.classList.add('visible');
        });
    } else if (!shouldShow && isCurrentlyVisible) {
        panel.classList.remove('visible');
        // Mantém o conteúdo até o fim da animação de fechamento
        setTimeout(() => {
            panel.innerHTML = `<div class="enemy-status"></div>`;
        }, 1000); // tempo igual ao transition de max-height/height
    } else {
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

        // Mobile: clique
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
    });
}
