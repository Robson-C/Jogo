// ===== MOTOR DE COMBATE: AVANÇO DE TURNOS =====
function advanceCombatTurn() {
    if (!gameState.inCombat || gameState.gameOver || !gameState.currentEnemy || gameState.hp <= 0) return;

    if (gameState.currentEnemy.hp <= 0 || gameState.hp <= 0) return;

    if (gameState.stunnedTurns && gameState.stunnedTurns > 0) {
        renderPlayerStunPanel();
        addMessage("Você está atordoado e perde o turno! 🌀");
        gameState.stunnedTurns--;
        setTimeout(() => {
            clearPlayerStunPanel();
            enemyTurn();
        }, 2000);
        return;
    }

    playerTurn();
}

// ===== INÍCIO DE COMBATE =====
function startCombat(isBoss = false) {
    gameState.inCombat = true;

    if (isBoss) {
        gameState.currentRoom = ROOM_TYPES.BOSS;
        gameState.currentEnemy = { ...getBossForCurrentFloor() };
        gameState.bossPending = true;
    } else {
        gameState.currentRoom = ROOM_TYPES.MONSTER;
        gameState.currentEnemy = { ...getEnemyForCurrentFloor() };
    }

    addMessage(`Um ${gameState.currentEnemy.name} apareceu!`, true);
    updateStatus();
    setTimeout(() => {
        advanceCombatTurn();
    }, 600);
}

// ===== PLAYER TURN: SÓ CHAMA UI =====
function playerTurn() {
    updateStatus();
    presentOptions();
}

// ===== AÇÕES DO PLAYER =====
function playerAttack() {
    if (!gameState.inCombat) return;

    if (gameState.stamina < 5) {
        processarDerrotaPorExaustao();
        return;
    }

    gameState.stamina -= 5;
    if (typeof checkExaustaoOuLoucura === "function" && checkExaustaoOuLoucura()) return;

    const attacker = {
        ...gameState,
        forca: getPlayerForcaAtual(),
        precisao: getPlayerPrecisaoAtual(),
        defesa: getPlayerDefesaAtual(),
        agilidade: getPlayerAgilidadeAtual()
    };

    const result = calculateDamage(attacker, gameState.currentEnemy);

    if (result.damage > 0) {
        gameState.currentEnemy.hp -= result.damage;
        addMessage(
            `Você atacou! ${gameState.currentEnemy.name} sofreu ${result.damage} de dano.`,
            false, false, "attack"
        );
    } else {
        addMessage(result.message, false, false, "attack");
    }

    if (gameState.stamina <= 0) {
        processarDerrotaPorExaustao();
        return;
    }

    checkCombatEndOrNextTurn();
}

function processarDerrotaPorExaustao() {
    gameState.hp = 0;
    addMessage('Você caiu de exaustão durante o combate. Seu corpo não aguenta mais lutar...', true);
    if (gameState.debuffs) gameState.debuffs = {};
    if (gameState.currentEnemy && gameState.currentEnemy.buffs) gameState.currentEnemy.buffs = {};
    gameState.stunnedTurns = 0;
    gameState.gameOver = true;
    updateStatus();
    presentOptions();
}

function playerHealSpell() {
    if (!gameState.inCombat || gameState.mp < 15) return;
    gameState.mp -= 15;
    const healAmount = 25 + gameState.level * 2;
    gameState.hp = Math.min(gameState.maxHp, gameState.hp + healAmount);
    addMessage(`Você se curou em ${healAmount} ❤️ HP!`);
    checkCombatEndOrNextTurn();
}

function playerFlee() {
    if (!gameState.inCombat) return;
    gameState.sanity = Math.max(0, gameState.sanity - 5);
    if (typeof checkExaustaoOuLoucura === "function" && checkExaustaoOuLoucura()) return;

    const fleeChance = 40 + gameState.agilidade;
    if (Math.random() * 100 < fleeChance) {
        if (gameState.currentRoom === ROOM_TYPES.BOSS) {
            addMessage('Você fugiu do chefe... mas ele irá te encontrar novamente em breve!');
            gameState.inCombat = false;
            gameState.bossEncounterCounter = 0;
            gameState.bossRespawnThreshold = Math.floor(Math.random() * (10 - 6 + 1)) + 6;
        } else {
            addMessage('Você fugiu com sucesso!');
            gameState.inCombat = false;
        }
        updateStatus();
        presentOptions();
    } else {
        addMessage('Falha ao fugir!', true);
        checkCombatEndOrNextTurn();
    }
}

// ===== LÓGICA DO INIMIGO ESCALÁVEL =====
function enemyTurn() {
    if (!gameState.inCombat || gameState.hp <= 0 || !gameState.currentEnemy) return;

    tickPlayerDebuffs();
    tickEnemyBuffs();

    const enemy = gameState.currentEnemy;
    const handler = window.ENEMY_BEHAVIORS && window.ENEMY_BEHAVIORS[enemy.name];

    if (handler) {
        handler(enemy);
    } else {
        ataqueInimigoBasico(enemy);
    }

    checkCombatEndOrNextTurnAfterEnemy();
}

function ataqueInimigoBasico(enemy, buffado = false) {
    let forca = buffado ? getEnemyForcaAtual() : enemy.forca;
    let defesa = buffado ? getEnemyDefesaAtual() : enemy.defesa;
    const result = calculateDamage({ ...enemy, forca, defesa }, gameState);
    if (result.damage > 0) {
        gameState.hp = Math.max(0, gameState.hp - result.damage);
        addMessage(`${enemy.name} atacou! Você sofreu ${result.damage} de dano.`, true);
    } else {
        addMessage(`O ataque do inimigo falhou, você esquivou!`, true);
    }
}

// ===== Alternância de turnos após o inimigo agir =====
function checkCombatEndOrNextTurnAfterEnemy() {
    if (!gameState.inCombat || !gameState.currentEnemy) return;

    if (gameState.currentEnemy.hp <= 0) {
        processarVitoria();
        return;
    }
    if (gameState.hp <= 0) {
        processarDerrota();
        return;
    }

    advanceCombatTurn();
}

// ===== Alternância após o player agir =====
function checkCombatEndOrNextTurn() {
    if (!gameState.inCombat || !gameState.currentEnemy) return;

    if (gameState.currentEnemy.hp <= 0) {
        processarVitoria();
        return;
    }
    if (gameState.hp <= 0) {
        processarDerrota();
        return;
    }

    enemyTurn();
}

// ===== VITÓRIA, DERROTA, LEVEL UP, ETC =====
function processarVitoria() {
    const xpGained = Math.floor(gameState.currentEnemy.maxHp * 0.5 + 10);
    gameState.xp += xpGained;
    gameState.monstersDefeated++;

    if (gameState.debuffs) gameState.debuffs = {};
    if (gameState.currentEnemy && gameState.currentEnemy.buffs) gameState.currentEnemy.buffs = {};
    gameState.stunnedTurns = 0;

    if (gameState.currentRoom === ROOM_TYPES.BOSS) {
        addMessage(
            `Você derrotou o chefe ${gameState.currentEnemy.name}! Ganhou ${xpGained} XP.`, true
        );
        checkLevelUp();
        gameState.bossPending = false;
        gameState.inCombat = false;
        advanceToNextFloor();
        return;
    } else {
        addMessage(
            `Você derrotou o ${gameState.currentEnemy.name}! Ganhou ${xpGained} XP.`
        );
        gameState.inCombat = false;
        updateStatus();
        presentOptions();
        checkLevelUp();
    }
}

function processarDerrota() {
    gameState.hp = 0;
    addMessage('Você foi derrotado em combate!', true);
    if (gameState.debuffs) gameState.debuffs = {};
    if (gameState.currentEnemy && gameState.currentEnemy.buffs) gameState.currentEnemy.buffs = {};
    gameState.stunnedTurns = 0;
    gameState.gameOver = true;
}

function checkLevelUp() {
    if (gameState.xp >= gameState.nextLevel) {
        gameState.level++;
        gameState.xp -= gameState.nextLevel;
        gameState.nextLevel = Math.floor(gameState.nextLevel * 1.5);

        gameState.maxHp += 10;
        gameState.hp = gameState.maxHp;
        gameState.maxMp += 5;
        gameState.mp = gameState.maxMp;
        gameState.maxStamina += 5;
        gameState.stamina = gameState.maxStamina;
        gameState.maxSanity += 5;
        gameState.sanity = gameState.maxSanity;

        gameState.forca += 2;
        gameState.defesa += 1;
        gameState.precisao += 1;
        gameState.agilidade += 1;

        addMessage(
            `Nível ${gameState.level}! Atributos aumentados!`, false, false, 'levelup'
        );
        updateStatus();
    }
}

function advanceToNextFloor() {
    gameState.currentFloor++;
    gameState.roomsExploredOnFloor = 0;
    gameState.roomsToNextFloor = getRandomRoomsToNextFloor();

    gameState.bossPending = false;
    gameState.bossEncounterCounter = 0;
    gameState.bossRespawnThreshold = null;

    gameState.visitedRooms = [];
    gameState.isGainingDayPoints = true;

    gameState.currentEnemy = null;
    gameState.inCombat = false;

    if (gameState.debuffs) gameState.debuffs = {};
    gameState.stunnedTurns = 0;

    addMessage(`Você avançou para o andar ${gameState.currentFloor}!`);
    gameState.currentRoom = ROOM_TYPES.BOSS;
    updateStatus();
    presentOptions();
}

// ===== CÁLCULO DE DANO E ESCOLHA DE INIMIGO =====

// ====== NOVO: inimigos comuns escalam com o andar ======
function getEnemyForCurrentFloor() {
    const floorKey = gameState.currentFloor >= 10 ? 10 : gameState.currentFloor;
    const pool = ENEMY_POOLS[floorKey];
    const total = pool ? pool.reduce((sum, e) => sum + e.chance, 0) : 0;
    const rand = Math.random() * total;
    let sum = 0;
    let baseEnemy = null;
    if (pool) {
        for (const entry of pool) {
            sum += entry.chance;
            if (rand <= sum) {
                baseEnemy = ENEMIES.find(e => e.name === entry.enemy);
                break;
            }
        }
    }
    if (!baseEnemy) baseEnemy = ENEMIES[0];

    // ===== PROGRESSÃO DINÂMICA DOS INIMIGOS COMUNS =====
    // Chefes NÃO sofrem progressão aqui
    // Clona os dados do inimigo base
    let enemy = { ...baseEnemy };

    // Calcula os upgrades pelo andar atual (a cada 2 andares)
    const upgrades = Math.floor((gameState.currentFloor - 1) / 2);
    if (!isBossEnemy(enemy.name)) {
        enemy.forca += upgrades * 4;
        enemy.defesa += upgrades * 1;
        enemy.hp += upgrades * 3;
        enemy.maxHp += upgrades * 3;
    }
    return enemy;
}

// Utilitário para checar se é chefe (usando a lista MINI_BOSSES_BY_FLOOR)
function isBossEnemy(enemyName) {
    for (let key in MINI_BOSSES_BY_FLOOR) {
        if (MINI_BOSSES_BY_FLOOR[key] === enemyName) return true;
    }
    return false;
}

// ===== MINI-BOSS E BOSS FINAL POR ANDAR =====
function getBossForCurrentFloor() {
    const bossName = MINI_BOSSES_BY_FLOOR[gameState.currentFloor];
    return ENEMIES.find(e => e.name === bossName) || ENEMIES[0];
}

// ===== Expor funções globalmente para integração =====
window.playerAttack = playerAttack;
window.playerHealSpell = playerHealSpell;
window.playerFlee = playerFlee;
window.renderPlayerStunPanel = renderPlayerStunPanel;
window.clearPlayerStunPanel = clearPlayerStunPanel;
