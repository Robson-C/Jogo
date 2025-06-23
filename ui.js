const messageCount = 20;

// ===== SISTEMA DE MENSAGENS =====
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

// ===== CÁLCULO DE PONTUAÇÃO FINAL =====
function calculateScore() {
    const daysPoints = gameState.day * 10;
    const roomsPoints = gameState.visitedRooms.length * 3;
    const monsterPoints = gameState.monstersDefeated * 12;
    const floorsPoints = gameState.currentFloor * 25;
    const total = daysPoints + roomsPoints + monsterPoints + floorsPoints;
    return { daysPoints, roomsPoints, monsterPoints, floorsPoints, total };
}

// ===== CHECAGEM DE FIM DE JOGO POR LOUCURA =====
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

// ===== EXIBIÇÃO DE OPÇÕES DO JOGADOR =====
function presentOptions() {
    DOM_ELEMENTS.options.innerHTML = '';

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
            { text: '🔍 Continuar Explorando', action: 'explore' }
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

function renderGameOverOptions() {
    const score = calculateScore();
    const scoreMessage = `
        <div class="message damage">
            🏆 <b>Pontuação Final:</b> ${score.total}<br>
            🗓️ Dias: +${score.daysPoints}<br>
            🚪 Salas: +${score.roomsPoints}<br>
            💀 Monstros: +${score.monsterPoints}<br>
            🏢 Andares: +${score.floorsPoints}
        </div>
    `;
    DOM_ELEMENTS.options.innerHTML = scoreMessage + '<button onclick="initGame()">Jogar Novamente</button>';
}

function getCombatActions() {
    const actions = [];
    if (gameState.stamina >= 5) {
        actions.push({ text: '⚔️ Atacar (-5 ⚡)', action: 'attack' });
    }
    if (gameState.mp >= 15) {
        actions.push({ text: '✨ Cura Mágica (-15 🔮)', action: 'healSpell' });
    }
    const fleeChance = 40 + gameState.agilidade;
    actions.push({ text: `🏃 Fugir (${fleeChance}% 💨)`, action: 'flee' });
    return actions;
}

function getExplorationActions() {
    const actions = [];

    // Fonte de Água — Meditar só 1 vez por sala
    if (gameState.currentRoom === ROOM_TYPES.WATER) {
        actions.push({
            text: '🧘 Meditar (Recupera todo o 🔮 MP)',
            action: gameState.meditouNaSala ? null : 'meditate',
            disabled: !!gameState.meditouNaSala
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
            disabled: !!gameState.descansouNaSala
        });
    }

    actions.push({ text: '🔍 Continuar Explorando', action: 'explore' });
    return actions;
}

function renderOptions(actions) {
    actions.forEach(slot => {
        const button = document.createElement('button');
        button.textContent = slot.text;

        if (slot.action) {
            button.onclick = () => chooseOption(slot.action);
        } else {
            button.onclick = () => {};
            button.style.cursor = 'default';
            button.disabled = true;
        }

        if (slot.disabled) {
            button.disabled = true;
            button.style.opacity = 0.6;
        }

        DOM_ELEMENTS.options.appendChild(button);
    });
}

function processarFimDeAcao() {
    updateStatus();
    presentOptions();
}

// ===== AÇÕES DE EXPLORAÇÃO (agora limitadas a 1 uso por sala) =====
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

// ===== ESCOLHA DO JOGADOR =====
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

// ======= PAINEL DE STUN =======
function renderPlayerStunPanel() {
    // Desabilita todas as opções e exibe um painel de stun com ícone e mensagem
    DOM_ELEMENTS.options.innerHTML = `
        <div style="text-align:center;padding:16px 0;">
            <span style="font-size:2.5rem;display:block;">🌀</span>
            <span style="font-size:1.2rem;display:block;margin:8px 0;">Você está atordoado!<br>Espere um instante...</span>
        </div>
    `;
}
function clearPlayerStunPanel() {
    // Após o stun, basta chamar presentOptions() para restaurar o painel normalmente
    presentOptions();
}

// ======= CHECAGEM DE LOUCURA EM COMBATE =======
window.checkExaustaoOuLoucura = checkExaustaoOuLoucura;
// Expor painel de stun para o combate
window.renderPlayerStunPanel = renderPlayerStunPanel;
window.clearPlayerStunPanel = clearPlayerStunPanel;
window.processarFimDeAcao = processarFimDeAcao;
