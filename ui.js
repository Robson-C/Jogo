// ui.js — Controla a interface do usuário: exibição de mensagens, opções de ação, processamento de escolhas, fim de jogo, histórico, renderização dos botões, navegação por teclado/touch.

/* =====================[ TRECHO 1: BLOQUEIO/DESBLOQUEIO DAS OPÇÕES ]===================== */

/**
 * Bloqueia todas as opções do jogador (ex: durante animações de combate)
 * Garante acessibilidade (aria-live), previne clique/teclado e mostra visualmente
 */
function bloquearOpcoesJogador(msg = "Aguarde...") {
    const optionsBox = DOM_ELEMENTS.options;
    if (!optionsBox) return;
    optionsBox.classList.add("options-bloqueadas");
    Array.from(optionsBox.querySelectorAll("button")).forEach(btn => {
        btn.disabled = true;
        btn.setAttribute("aria-disabled", "true");
        btn.style.cursor = "not-allowed";
        btn.tabIndex = -1;
    });
    // Mensagem de espera acessível (apenas se não já existe)
    if (!optionsBox.querySelector(".bloqueio-msg")) {
        const div = document.createElement("div");
        div.className = "bloqueio-msg";
        div.setAttribute("aria-live", "polite");
        div.style.padding = "8px 0";
        div.style.textAlign = "center";
        div.style.opacity = "0.85";
        div.innerText = msg;
        optionsBox.appendChild(div);
    }
}
function desbloquearOpcoesJogador() {
    const optionsBox = DOM_ELEMENTS.options;
    if (!optionsBox) return;
    optionsBox.classList.remove("options-bloqueadas");
    Array.from(optionsBox.querySelectorAll("button")).forEach(btn => {
        btn.disabled = btn.getAttribute("data-original-disabled") === "true" ? true : false;
        btn.removeAttribute("aria-disabled");
        btn.style.cursor = "";
        btn.tabIndex = 0;
        btn.removeAttribute("data-original-disabled");
    });
    Array.from(optionsBox.querySelectorAll(".bloqueio-msg")).forEach(el => el.remove());
}

/* =====================[ TRECHO 2: SISTEMA DE MENSAGENS ]===================== */

const messageCount = 20;

function addMessage(text, isCritical = false, isHighlighted = false, customClass = '') {
    const roomName = getRoomName();
    const timestamp = `Dia ${gameState.day}, Andar ${gameState.currentFloor} (${roomName})`;
    const fullMessage = `${timestamp}: ${text}`;

    gameState.messageHistory.push({ text: fullMessage, isCritical, isHighlighted, customClass });

    if (gameState.messageHistory.length > 50) {
        gameState.messageHistory.shift();
    }

    updateMessageDisplay();
}

function scrollFullHistoryToEnd() {
    if (DOM_ELEMENTS.fullHistory) {
        DOM_ELEMENTS.fullHistory.scrollTo({
            top: DOM_ELEMENTS.fullHistory.scrollHeight,
            behavior: 'smooth'
        });
    }
}

function updateMessageDisplay() {
    const lastMessages = gameState.messageHistory.slice(-messageCount);

    DOM_ELEMENTS.fullHistory.innerHTML = lastMessages
        .map(msg => {
            let classes = "message";
            if (msg.isCritical) classes += " damage";
            if (msg.isHighlighted) classes += " levelup";
            if (msg.customClass) classes += ` ${msg.customClass}`;
            return `<div class="${classes}">${msg.text}</div>`;
        })
        .join('');

    scrollFullHistoryToEnd();
}

function getRoomName() {
    switch (gameState.currentRoom) {
        case 'vazia': return 'Sala Vazia';
        case 'com fonte de água': return 'Fonte de Água';
        case 'com armadilha': return 'Sala com Armadilha';
        case 'com monstro': return 'Sala com Monstro';
        case 'boss': return 'Sala do Chefe';
        default: return 'Sala Desconhecida';
    }
}

/* =====================[ TRECHO 3: CÁLCULO DE PONTUAÇÃO FINAL ]===================== */

function calculateScore() {
    const daysPoints = gameState.day * 10;
    const roomsPoints = gameState.visitedRooms.length * 3;
    const monsterPoints = gameState.monstersDefeated * 12;
    const floorsPoints = gameState.currentFloor * 25;
    const total = daysPoints + roomsPoints + monsterPoints + floorsPoints;
    return { daysPoints, roomsPoints, monsterPoints, floorsPoints, total };
}

/* =====================[ TRECHO 4: CHECAGEM DE FIM DE JOGO POR LOUCURA ]===================== */

function checkExaustaoOuLoucura() {
    if (gameState.sanity <= 0) {
        gameState.sanity = 0;
        processarGameOverEspecial("Sua mente se parte em mil fragmentos. Você sucumbe à loucura...");
        return true;
    }
    return false;
}

function processarGameOverEspecial(msgFinal) {
    gameState.gameOver = true;
    addMessage(msgFinal, true);
    presentOptions();
}

/* =====================[ TRECHO 5: EXIBIÇÃO DE OPÇÕES DO JOGADOR ]===================== */

/**
 * Função utilitária: Detecta se o painel do inimigo está animando
 * (checando presença do requestAnimationFrame ativo ou classe visível durante transição)
 */
function painelInimigoAnimando() {
    const panel = document.getElementById('enemyPanel');
    // Importa ENEMY_PANEL_ANIMATION_DURATION do status.js
    if (!panel) return false;
    return panel.classList.contains('animando') || (typeof window.enemyPanelAnimationFrame !== "undefined" && window.enemyPanelAnimationFrame !== null);
}

/**
 * Versão modificada para bloquear/desbloquear opções durante animação do painel do inimigo.
 * Só renderiza opções quando seguro interagir!
 */
function presentOptions() {
    DOM_ELEMENTS.options.innerHTML = '';

    // Se o painel do inimigo está animando, bloqueia opções e espera animação terminar
    if (painelInimigoAnimando()) {
        bloquearOpcoesJogador("Aguardando o inimigo...");
        // Aguarda animação terminar para renderizar as opções
        setTimeout(() => {
            if (!painelInimigoAnimando()) {
                desbloquearOpcoesJogador();
                presentOptions();
            }
        }, ENEMY_PANEL_ANIMATION_DURATION + 50);
        return;
    } else {
        desbloquearOpcoesJogador();
    }

    if (gameState.gameOver) {
        renderGameOverOptions();
        return;
    }

    // Dead-end pós-combate: se não puder explorar, morrer imediatamente
    if (
        !gameState.inCombat &&
        gameState.currentRoom === 'com monstro' &&
        (!gameState.currentEnemy || gameState.currentEnemy.hp <= 0)
    ) {
        if (gameState.stamina < 5) {
            processarGameOverEspecial("Você tenta forçar seu corpo, mas não tem energia para continuar. A exaustão te vence...");
            return;
        }
        if (gameState.sanity < 5) {
            processarGameOverEspecial("Você tenta encontrar sentido, mas sua mente não suporta mais. A loucura te consome...");
            return;
        }
        renderOptions([
            { text: '-', action: null },
            { text: '-', action: null },
            { text: '🔍 Continuar Explorando', action: 'explore', ariaLabel: "Continuar explorando a sala" }
        ]);
        return;
    }

    if (gameState.inCombat && (gameState.stunnedTurns > 0 || gameState.hp <= 0 || (gameState.currentEnemy && gameState.currentEnemy.hp <= 0))) {
        // Painel de stun é mostrado por renderPlayerStunPanel (não faz nada aqui)
        return;
    }

    let actions = [];
    if (gameState.inCombat) {
        actions = getCombatActions();
    } else {
        actions = getExplorationActions();
    }

    while (actions.length < 3) {
        actions.unshift({ text: '-', action: null });
    }

    renderOptions(actions);
}

/* =====================[ TRECHO 6: GAME OVER E OPÇÕES DE COMBATE ]===================== */

function renderGameOverOptions() {
    const score = calculateScore();
    const scoreMessage = `
        <div class="message damage" aria-live="assertive">
            🏆 <b>Pontuação Final:</b> ${score.total}<br>
            🗓️ Dias: +${score.daysPoints}<br>
            🚪 Salas: +${score.roomsPoints}<br>
            💀 Monstros: +${score.monsterPoints}<br>
            🏢 Andares: +${score.floorsPoints}
        </div>
    `;
    DOM_ELEMENTS.options.innerHTML = scoreMessage + '<button onclick="initGame()" aria-label="Jogar Novamente">Jogar Novamente</button>';
    // Foco automático ao botão de reiniciar
    const btn = DOM_ELEMENTS.options.querySelector('button');
    if (btn) btn.focus();
}

/**
 * Garante que as três opções de combate SEMPRE aparecem no mesmo lugar:
 * 1. Atacar (pode ser desabilitado por falta de stamina)
 * 2. Cura Mágica (pode ser desabilitado por falta de MP)
 * 3. Fugir (sempre aparece, mas pode ser desabilitado em edge cases)
 */
function getCombatActions() {
    const actions = [];

    // 1. Atacar
    if (gameState.stamina >= 5) {
        actions.push({
            text: '⚔️ Atacar (-5 ⚡)',
            action: 'attack',
            ariaLabel: 'Atacar gastando 5 de stamina',
            disabled: false
        });
    } else {
        actions.push({
            text: '⚔️ Atacar (Sem Stamina)',
            action: null,
            ariaLabel: 'Atacar indisponível: sem stamina suficiente',
            disabled: true
        });
    }

    // 2. Cura Mágica
    if (gameState.mp >= 15) {
        actions.push({
            text: '✨ Cura Mágica (-15 🔮)',
            action: 'healSpell',
            ariaLabel: 'Cura Mágica, gasta 15 de MP e restaura HP',
            disabled: false
        });
    } else {
        actions.push({
            text: '✨ Cura Mágica (Sem MP)',
            action: null,
            ariaLabel: 'Cura Mágica indisponível: sem MP suficiente',
            disabled: true
        });
    }

    // 3. Fugir (sempre disponível, mas aqui para manter padrão)
    const fleeChance = 40 + gameState.agilidade;
    actions.push({
        text: `🏃 Fugir (${fleeChance}% 💨)`,
        action: 'flee',
        ariaLabel: `Tentar fugir, chance de sucesso: ${fleeChance}%`,
        disabled: false
    });

    return actions;
}

function getExplorationActions() {
    const actions = [];

    // Fonte de Água — Meditar só 1 vez por sala
    if (gameState.currentRoom === ROOM_TYPES.WATER) {
        actions.push({
            text: '🧘 Meditar (Recupera todo o 🔮 MP)',
            action: gameState.meditouNaSala ? null : 'meditate',
            disabled: !!gameState.meditouNaSala,
            ariaLabel: gameState.meditouNaSala ? 'Já meditou nesta sala, opção indisponível' : 'Meditar e recuperar todo o MP'
        });
    }

    // Descansar só 1 vez por sala (não em sala de monstro, armadilha ou boss)
    if (
        gameState.currentRoom !== ROOM_TYPES.TRAP &&
        gameState.currentRoom !== ROOM_TYPES.MONSTER &&
        gameState.currentRoom !== ROOM_TYPES.BOSS
    ) {
        let hpRec, staminaRec, sanityRec;
        if (gameState.currentRoom === ROOM_TYPES.EMPTY) {
            hpRec = Math.floor(gameState.maxHp * 0.2);
            staminaRec = gameState.maxStamina;
            sanityRec = gameState.maxSanity;
        } else {
            hpRec = Math.floor(gameState.maxHp * 0.1);
            staminaRec = Math.floor(gameState.maxStamina * 0.5);
            sanityRec = Math.floor(gameState.maxSanity * 0.5);
        }
        actions.push({
            text: `🛌 Descansar (+${hpRec} ❤️, +${staminaRec} ⚡, +${sanityRec} 🌌)`,
            action: gameState.descansouNaSala ? null : 'rest',
            disabled: !!gameState.descansouNaSala,
            ariaLabel: gameState.descansouNaSala ? 'Já descansou nesta sala, opção indisponível' : `Descansar e recuperar ${hpRec} HP, ${staminaRec} Stamina e ${sanityRec} Sanidade`
        });
    }

    actions.push({ text: '🔍 Continuar Explorando', action: 'explore', ariaLabel: 'Continuar explorando a torre' });
    return actions;
}


/* =====================[ TRECHO 7: RENDERIZAÇÃO DOS BOTÕES DE OPÇÃO ]===================== */

function renderOptions(actions) {
    actions.forEach((slot, idx) => {
        const button = document.createElement('button');
        button.textContent = slot.text;

        // Acessibilidade: descrição
        if (slot.ariaLabel) button.setAttribute('aria-label', slot.ariaLabel);
        else button.setAttribute('aria-label', slot.text.replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, '').trim());

        if (slot.action) {
            button.onclick = () => chooseOption(slot.action);
        } else {
            button.onclick = () => {};
            button.style.cursor = 'default';
            button.disabled = true;
        }

        // Aplicar disabled caso seja explicitamente desabilitado
        if (slot.disabled) {
            button.disabled = true;
            button.style.opacity = 0.6;
            button.setAttribute("data-original-disabled", "true");
        } else {
            button.setAttribute("data-original-disabled", "false");
        }

        DOM_ELEMENTS.options.appendChild(button);
    });
    // Foco automático ao primeiro botão disponível
    const focusBtn = DOM_ELEMENTS.options.querySelector('button:not(:disabled)');
    if (focusBtn) focusBtn.focus();
}


/* =====================[ TRECHO 8: FLUXO DE AÇÕES DE EXPLORAÇÃO ]===================== */

function processarFimDeAcao() {
    updateStatus();
    presentOptions();
}

function restAction() {
    if (gameState.descansouNaSala) {
        addMessage("Você já descansou nessa sala. Só é possível descansar uma vez por sala.", true);
        presentOptions();
        return;
    }
    let hpRec, staminaRec, sanityRec;
    if (gameState.currentRoom === ROOM_TYPES.EMPTY) {
        hpRec = Math.floor(gameState.maxHp * 0.2);
        staminaRec = gameState.maxStamina;
        sanityRec = gameState.maxSanity;
    } else {
        hpRec = Math.floor(gameState.maxHp * 0.1);
        staminaRec = Math.floor(gameState.maxStamina * 0.5);
        sanityRec = Math.floor(gameState.maxSanity * 0.5);
    }
    gameState.hp = Math.min(gameState.maxHp, gameState.hp + hpRec);
    gameState.stamina = Math.min(gameState.maxStamina, gameState.stamina + staminaRec);
    gameState.sanity = Math.min(gameState.maxSanity, gameState.sanity + sanityRec);
    gameState.descansouNaSala = true;
    addMessage(`Você descansa. Recupera ${hpRec} ❤️, ${staminaRec} ⚡ e ${sanityRec} 🌌.`);
    if (!checkExaustaoOuLoucura()) {
        processarFimDeAcao();
    }
}

function meditateAction() {
    if (gameState.meditouNaSala) {
        addMessage("Você já meditou nessa sala. Só é possível meditar uma vez por sala.", true);
        presentOptions();
        return;
    }
    gameState.mp = gameState.maxMp;
    gameState.meditouNaSala = true;
    addMessage("Você medita e sente sua energia mágica ser restaurada por completo.");
    if (!checkExaustaoOuLoucura()) {
        processarFimDeAcao();
    }
}

function exploreAction() {
    // Ao explorar nova sala, libera novo descanso e meditação
    gameState.descansouNaSala = false;
    gameState.meditouNaSala = false;

    if (gameState.stamina === 0) {
        processarGameOverEspecial("Você tenta forçar seu corpo, mas não tem energia para continuar. A exaustão te vence...");
        return;
    }
    if (gameState.stamina === 5 || gameState.stamina === 10) {
        gameState.stamina = 0;
        gameState.sanity -= 5;
        gameState.day++;
        if (checkExaustaoOuLoucura()) return;
        exploreRoom();
        if (gameState.lastRoomType !== ROOM_TYPES.EMPTY) {
            processarGameOverEspecial("Você usou sua última energia, mas não encontrou descanso... A exaustão te vence.");
            return;
        }
        processarFimDeAcao();
        return;
    }
    if (gameState.stamina < 5) {
        processarGameOverEspecial("Você tenta forçar seu corpo, mas não tem energia para continuar. A exaustão te vence...");
        return;
    }
    gameState.stamina -= 10;
    if (gameState.stamina < 0) gameState.stamina = 0;
    gameState.sanity -= 5;
    gameState.day++;
    if (checkExaustaoOuLoucura()) return;
    exploreRoom();
    processarFimDeAcao();
}

/* =====================[ TRECHO 9: ESCOLHA DO JOGADOR ]===================== */

function chooseOption(option) {
    if (gameState.gameOver) return;
    if (gameState.stunnedTurns > 0 || (gameState.inCombat && (gameState.hp <= 0 || (gameState.currentEnemy && gameState.currentEnemy.hp <= 0)))) {
        return;
    }

    let isCombatAction = false;

    switch (option) {
        case 'attack':
            playerAttack();
            isCombatAction = true;
            break;
        case 'healSpell':
            playerHealSpell();
            isCombatAction = true;
            break;
        case 'flee':
            playerFlee();
            isCombatAction = true;
            break;
        case 'rest':
            restAction();
            break;
        case 'meditate':
            meditateAction();
            break;
        case 'explore':
            exploreAction();
            break;
    }

    if (!isCombatAction) {
        // processarFimDeAcao() já é chamado dentro das funções de exploração agora
    }
}

/* =====================[ TRECHO 10: PAINEL DE STUN ]===================== */

function renderPlayerStunPanel() {
    // Desabilita todas as opções e exibe um painel de stun com ícone e mensagem
    DOM_ELEMENTS.options.innerHTML = `
        <div style="text-align:center;padding:16px 0;" tabindex="0" aria-live="assertive" aria-label="Você está atordoado, aguarde um instante">
            <span style="font-size:2.5rem;display:block;" aria-hidden="true">🌀</span>
            <span style="font-size:1.2rem;display:block;margin:8px 0;">Você está atordoado!<br>Espere um instante...</span>
        </div>
    `;
    // Foco automático no painel de stun
    const stunDiv = DOM_ELEMENTS.options.querySelector('div[tabindex]');
    if (stunDiv) stunDiv.focus();
}
function clearPlayerStunPanel() {
    // Após o stun, basta chamar presentOptions() para restaurar o painel normalmente
    presentOptions();
}

/* =====================[ TRECHO 11: CHECAGEM DE LOUCURA EM COMBATE E EXPORTS ]===================== */

// Expor funções para outros módulos
window.checkExaustaoOuLoucura = checkExaustaoOuLoucura;
window.renderPlayerStunPanel = renderPlayerStunPanel;
window.clearPlayerStunPanel = clearPlayerStunPanel;
window.processarFimDeAcao = processarFimDeAcao;
// Novos exports de bloqueio para integração direta pelo motor/status.js
window.bloquearOpcoesJogador = bloquearOpcoesJogador;
window.desbloquearOpcoesJogador = desbloquearOpcoesJogador;

