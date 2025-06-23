// enemyBehaviors.js — Define o comportamento especial de cada inimigo durante o combate (habilidades únicas, ataques especiais, buffs/debuffs aplicados), integrado ao motor de combate.

// ===== EXPLORAÇÃO DE SALAS =====
function exploreRoom() {
    if (gameState.gameOver) return;

    gameState.roomsExploredOnFloor++;

    // Marca sala como explorada (para pontuação)
    if (!gameState.visitedRooms.includes(gameState.roomsExploredOnFloor)) {
        gameState.visitedRooms.push(gameState.roomsExploredOnFloor);
    }

    gameState.isGainingDayPoints = true;

    // Checa boss ou respawn de boss
    if (shouldProcessBossRoom()) {
        gameState.lastRoomType = ROOM_TYPES.BOSS;
        processarBossRoom();
        return;
    }
    if (shouldProcessBossRespawn()) {
        gameState.lastRoomType = ROOM_TYPES.BOSS;
        processarBossRespawn();
        return;
    }

    // Contagem para reencontro do boss após fuga
    if (gameState.bossPending) {
        gameState.bossEncounterCounter++;
    }

    // ===== GARANTIR PRIMEIRA SALA VAZIA NO NOVO ANDAR =====
    if (gameState.roomsExploredOnFloor === 1) {
        gameState.lastRoomType = ROOM_TYPES.EMPTY;
        processarSala(ROOM_TYPES.EMPTY);
        updateStatus();
        return;
    }

    // Sorteia tipo de sala e processa normalmente a partir da segunda sala
    const roomType = sortearTipoDeSala();
    gameState.lastRoomType = roomType;
    processarSala(roomType);

    updateStatus();
}

function shouldProcessBossRoom() {
    return (
        gameState.roomsExploredOnFloor >= gameState.roomsToNextFloor &&
        !gameState.bossPending
    );
}
function shouldProcessBossRespawn() {
    return (
        gameState.bossPending &&
        gameState.bossEncounterCounter >= gameState.bossRespawnThreshold
    );
}

function processarBossRoom() {
    gameState.currentRoom = ROOM_TYPES.BOSS;
    addMessage('Você sente uma presença poderosa... O chefe deste andar está à sua espera!');
    startCombat(true);
}

function processarBossRespawn() {
    gameState.currentRoom = ROOM_TYPES.BOSS;
    addMessage('O chefe te encontrou novamente!');
    startCombat(true);
    gameState.bossEncounterCounter = 0;
    gameState.bossRespawnThreshold = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
}

function sortearTipoDeSala() {
    const roomChance = Math.random();
    if (roomChance < 0.15) {
        return ROOM_TYPES.WATER;
    } else if (roomChance < 0.27) {
        return ROOM_TYPES.TRAP;
    } else if (roomChance < 0.5) {
        return ROOM_TYPES.MONSTER;
    } else {
        return ROOM_TYPES.EMPTY;
    }
}

function processarSala(roomType) {
    // Sempre limpa buffs/debuffs ao entrar em sala que NÃO seja de combate
    if (roomType !== ROOM_TYPES.MONSTER && roomType !== ROOM_TYPES.BOSS) {
        if (gameState.debuffs) gameState.debuffs = {};
        if (gameState.currentEnemy && gameState.currentEnemy.buffs) gameState.currentEnemy.buffs = {};
        gameState.stunnedTurns = 0;
    }

    gameState.currentRoom = roomType;
    switch (roomType) {
        case ROOM_TYPES.WATER:
            addMessage('Você adentra uma sala úmida com uma fonte de água cristalina no centro.');
            break;
        case ROOM_TYPES.TRAP:
            addMessage('Ao pisar na sala, você ouve um clique mecânico sob seus pés...');
            handleTrapRoom();
            break;
        case ROOM_TYPES.MONSTER:
            addMessage('O som de rosnados ecoa pela sala escura...');
            startCombat();
            break;
        case ROOM_TYPES.EMPTY:
        default:
            // --- NOVA LÓGICA EXPANSÍVEL PARA FRASES DE FIM DE CAPÍTULO ---
            // Capítulo é sempre a cada 10 andares (1: 1-10, 2: 11-20, ...)
            const capitulo = Math.ceil(gameState.currentFloor / 10);
            const ehUltimoAndarDoCapitulo = gameState.currentFloor === capitulo * 10;
            if (
                ehUltimoAndarDoCapitulo &&
                gameState.roomsExploredOnFloor > 1 && // Não na primeira sala do andar
                typeof FRASES_FIM_CAPITULO === "object" &&
                FRASES_FIM_CAPITULO[capitulo] &&
                FRASES_FIM_CAPITULO[capitulo].length > 0
            ) {
                const sorteio = Math.random();
                if (sorteio < 0.15) { // 15% de chance
                    const frases = FRASES_FIM_CAPITULO[capitulo];
                    const frase = frases[Math.floor(Math.random() * frases.length)];
                    addMessage(frase, false, false, "memory");
                    break;
                }
            }
            // ---- FIM LÓGICA EXPANSÍVEL ----

            if (gameState.roomsExploredOnFloor === 1 && memories[gameState.currentFloor]) {
                const texto = Array.isArray(memories[gameState.currentFloor])
                    ? memories[gameState.currentFloor][Math.floor(Math.random() * memories[gameState.currentFloor].length)]
                    : memories[gameState.currentFloor];
                addMessage(texto, false, false, "memory");
            } else {
                const emptyRoomMessages = [
                    'Você entra em uma sala empoeirada, sem nada de valor aparente.',
                    'Uma sala abandonada, apenas móveis quebrados e teias de aranha.',
                    'Paredes marcadas pelo tempo são tudo que você encontra nesta sala.',
                    'Uma brisa fria atravessa a sala vazia, levantando poeira no chão.',
                    'Sala tranquila, apenas o som de seus passos ecoando nas paredes.'
                ];
                addMessage(emptyRoomMessages[Math.floor(Math.random() * emptyRoomMessages.length)]);
            }
            break;
    }
}

// ===== ARMADILHAS =====
function handleTrapRoom() {
    // Novo cálculo: 10% do HP máximo + 3 x andar atual, sem mitigação
    const percentDamage = Math.floor(gameState.maxHp * 0.10);
    const floorDamage = 3 * gameState.currentFloor;
    const damage = percentDamage + floorDamage;

    const trapStaminaPenalty = 10;
    const trapSanityPenalty = 10;

    gameState.hp = Math.max(0, gameState.hp - damage);
    gameState.stamina = Math.max(0, gameState.stamina - trapStaminaPenalty);
    gameState.sanity = Math.max(0, gameState.sanity - trapSanityPenalty);

    addMessage(
        `Armadilha! Você sofreu ${damage} de dano, perdeu ${trapStaminaPenalty} de stamina e ${trapSanityPenalty} de sanidade.`,
        true
    );

    // Checagem imediata de morte após armadilha
    if (gameState.hp <= 0) {
        processarGameOverEspecial("Você caiu em uma armadilha e sucumbiu aos ferimentos.");
        return;
    }
}
