// combat.js — Responsável pela lógica principal de combate: alternância de turnos, ações do jogador e inimigo, vitórias/derrotas, buffs/debuffs, rounds e cálculo de dano.

/* =====================[ TRECHO 1: CÁLCULO DE DANO ]===================== */
function calculateDamage(attacker, defender) {
    try {
        // Força e defesa sempre positivas
        const forca = typeof attacker.forca === 'number' ? attacker.forca : 0;
        const defesa = typeof defender.defesa === 'number' ? defender.defesa : 0;
        const precisao = typeof attacker.precisao === 'number' ? attacker.precisao : 0;
        const agilidade = typeof defender.agilidade === 'number' ? defender.agilidade : 0;

        // Checa se o ataque acerta: chance = precisao atacante - agilidade defensor (mínimo 5%)
        const acertoChance = Math.max(5, Math.min(95, precisao - agilidade));
        if (Math.random() * 100 >= acertoChance) {
            return { damage: 0, message: "O ataque errou seu alvo!" };
        }

        // Dano básico
        let dano = Math.max(1, forca - defesa);

        // Crítico simples (5% chance, dobra dano)
        if (Math.random() < 0.05) {
            dano *= 2;
            return { damage: dano, message: "Acerto crítico!" };
        }
        return { damage: dano, message: "" };
    } catch (e) {
        // Em caso de erro, retorna zero dano e mensagem clara
        return { damage: 0, message: "Falha ao calcular dano." };
    }
}
window.calculateDamage = calculateDamage;

/* =====================[ TRECHO 2: MOTOR DE COMBATE — AVANÇO DE TURNOS ]===================== */
function advanceCombatTurn() {
    if (!gameState.inCombat || gameState.gameOver || !gameState.currentEnemy || gameState.vida <= 0) return;

    if (gameState.currentEnemy.vida <= 0 || gameState.vida <= 0) return;

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

/* =====================[ TRECHO 3: INÍCIO DE COMBATE ]===================== */
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

/* =====================[ TRECHO 4: TURNO DO JOGADOR ]===================== */
function playerTurn() {
    updateStatus();
    presentOptions();
}

/* =====================[ TRECHO 5: AÇÕES DO JOGADOR ]===================== */
function playerAttack() {
    if (!gameState.inCombat) return;

    if (gameState.energia < 5) {
        processarDerrotaPorExaustao();
        return;
    }

    gameState.energia -= 5;
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
        gameState.currentEnemy.vida -= result.damage;
        addMessage(
            `Você atacou! ${gameState.currentEnemy.name} sofreu ${result.damage} de dano.` +
            (result.message ? ` (${result.message})` : ""),
            false, false, "attack"
        );
    } else {
        addMessage(result.message, false, false, "attack");
    }

    if (gameState.energia <= 0) {
        processarDerrotaPorExaustao();
        return;
    }

    checkCombatEndOrNextTurn();
}

function processarDerrotaPorExaustao() {
    // [Ajuste QA 2024-07-02] Game over centralizado via processarGameOverEspecial para sumir painel inimigo.
    gameState.vida = 0;
    if (gameState.debuffs) gameState.debuffs = {};
    if (gameState.currentEnemy && gameState.currentEnemy.buffs) gameState.currentEnemy.buffs = {};
    gameState.stunnedTurns = 0;
    // Centraliza o fim de jogo e toda limpeza visual.
    processarGameOverEspecial('Você caiu de exaustão durante o combate. Seu corpo não aguenta mais lutar...');
}

function playerHealSpell() {
    if (!gameState.inCombat || gameState.mana < 15) return;
    gameState.mana -= 15;
    const healAmount = 25 + gameState.level * 2;
    gameState.vida = Math.min(gameState.maxVida, gameState.vida + healAmount);
    addMessage(`Você se curou em ${healAmount} ❤️ de Vida!`);
    checkCombatEndOrNextTurn();
}

function playerFlee() {
    gameState.combatesSemFugirSeguidos = 0;
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

/* =====================[ TRECHO 6: LÓGICA DO INIMIGO E TURNO ]===================== */
function enemyTurn() {
    if (!gameState.inCombat || gameState.vida <= 0 || !gameState.currentEnemy) return;

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
        gameState.vida = Math.max(0, gameState.vida - result.damage);
        addMessage(`${enemy.name} atacou! Você sofreu ${result.damage} de dano.`, true);
    } else {
        if (!gameState.totalEsquivas) gameState.totalEsquivas = 0;
        gameState.totalEsquivas++;
        addMessage(`O ataque do inimigo falhou, você esquivou!`, true);
    }
}

/* =====================[ TRECHO 7: CHECAGEM DE FIM DE COMBATE ]===================== */
function checkCombatEndOrNextTurnAfterEnemy() {
    if (!gameState.inCombat || !gameState.currentEnemy) return;

    if (gameState.currentEnemy.vida <= 0) {
        processarVitoria();
        return;
    }
    if (gameState.vida <= 0) {
        processarDerrota();
        return;
    }

    advanceCombatTurn();
}

function checkCombatEndOrNextTurn() {
    if (!gameState.inCombat || !gameState.currentEnemy) return;

    if (gameState.currentEnemy.vida <= 0) {
        processarVitoria();
        return;
    }
    if (gameState.vida <= 0) {
        processarDerrota();
        return;
    }

    enemyTurn();
}

/* =====================[ TRECHO 8: VITÓRIA, DERROTA, LEVEL UP ]===================== */
function processarVitoria() {
    const xpGained = Math.floor(gameState.currentEnemy.maxVida * 0.5 + 10);
    gameState.xp += xpGained;
    gameState.monstersDefeated++;
    if (!gameState.combatesSemFugirSeguidos) gameState.combatesSemFugirSeguidos = 0;
    gameState.combatesSemFugirSeguidos++;

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
    if (!gameState.deathsByHp) gameState.deathsByHp = 0;
    gameState.deathsByHp++;
    // [Ajuste QA 2024-07-02] Game over centralizado via processarGameOverEspecial para sumir painel inimigo.
    if (gameState.debuffs) gameState.debuffs = {};
    if (gameState.currentEnemy && gameState.currentEnemy.buffs) gameState.currentEnemy.buffs = {};
    gameState.stunnedTurns = 0;
    // Centraliza o fim de jogo e toda limpeza visual.
    processarGameOverEspecial('Você foi derrotado em combate!');
}

/* =====================[ TRECHO 9: LEVEL UP E ANDARES ]===================== */
function checkLevelUp() {
    if (gameState.xp >= gameState.nextLevel) {
        gameState.level++;
        gameState.xp -= gameState.nextLevel;
        gameState.nextLevel = Math.floor(gameState.nextLevel * 1.5);

        gameState.maxVida += 10;
        gameState.vida = gameState.maxVida;
        gameState.maxMana += 5;
        gameState.mana = gameState.maxMana;
        gameState.maxEnergia += 5;
        gameState.energia = gameState.maxEnergia;
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

/* =====================[ TRECHO 10: INIMIGOS DINÂMICOS E ESCOLHA DE INIMIGO ]===================== */

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
        enemy.vida += upgrades * 3;
        enemy.maxVida += upgrades * 3;
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

/* =====================[ TRECHO 11: EXPORTAÇÃO GLOBAL ]===================== */
window.playerAttack = playerAttack;
window.playerHealSpell = playerHealSpell;
window.playerFlee = playerFlee;
window.renderPlayerStunPanel = renderPlayerStunPanel;
window.clearPlayerStunPanel = clearPlayerStunPanel;

/* =====================[ FIM DO ARQUIVO combat.js ]===================== */
