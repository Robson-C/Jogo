// combat.js — Responsável pela lógica principal de combate: alternância de turnos, ações do jogador e inimigo, vitórias/derrotas, buffs/debuffs, rounds e cálculo de dano.

/* =====================[ TRECHO 1: CÁLCULO DE DANO ]===================== */
function calculateDamage(attacker, defender) {
    try {
        // Usa precisão e agilidade como valores numéricos, não mais %
        const forca = typeof attacker.forca === 'number' ? attacker.forca : 0;
        const defesa = typeof defender.defesa === 'number' ? defender.defesa : 0;
        const precisao = typeof attacker.precisao === 'number' ? attacker.precisao : 0;
        const agilidade = typeof defender.agilidade === 'number' ? defender.agilidade : 0;

        // NOVA FÓRMULA: chance = 70 + (precisao - agilidade) * 2, limitada entre 20% e 95%
        let chance = 70 + (precisao - agilidade) * 2;
        if (chance > 95) chance = 95;
        if (chance < 20) chance = 20;

        if (Math.random() * 100 >= chance) {
            return { damage: 0, message: "O ataque errou seu alvo!" };
        }

        // NOVO CÁLCULO DE DANO MULTIPLICATIVO COM VARIAÇÃO PERCENTUAL
        let danoBase = forca * (80 / (80 + defesa));
        // Adiciona variação aleatória de -10% a +10%
        const variacao = (Math.random() * 0.2) - 0.1; // -0.1 a +0.1
        let danoFinal = danoBase + (danoBase * variacao);

        danoFinal = Math.max(1, Math.round(danoFinal));

        // Crítico simples (5% chance, dobra dano)
        if (Math.random() < 0.05) {
            danoFinal *= 2;
            return { damage: danoFinal, message: "Acerto crítico!" };
        }
        return { damage: danoFinal, message: "" };
    } catch (e) {
        // Em caso de erro, retorna zero dano e mensagem clara
        return { damage: 0, message: "Falha ao calcular dano." };
    }
}
window.calculateDamage = calculateDamage;
/* =====================[ FIM TRECHO 1 ]===================== */



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

    // Gasta energia só se NÃO estiver com o título Maníaco do Combate equipado
    if (!isTituloEquipado || !isTituloEquipado('maniac')) {
        if (gameState.energia < 5) {
            processarDerrotaPorExaustao();
            return;
        }
        gameState.energia -= 5;
        if (typeof checkExaustaoOuLoucura === "function" && checkExaustaoOuLoucura()) return;
    }

    const attacker = {
        ...gameState,
        forca: getPlayerForcaAtual(),
        precisao: getPlayerPrecisaoAtual(),
        defesa: getPlayerDefesaAtual(),
        agilidade: getPlayerAgilidadeAtual()
    };

    let result = calculateDamage(attacker, gameState.currentEnemy);

    // Bônus do título Matador de Gigantes: +30% de dano contra chefes
    if (typeof isTituloEquipado === "function"
        && isTituloEquipado('matadorGigantes')
        && typeof isBossEnemy === "function"
        && isBossEnemy(gameState.currentEnemy.name)
        && result.damage > 0) {
        result.damage = Math.floor(result.damage * 1.3);
    }

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
    gameState.vida = 0;
    if (gameState.debuffs) gameState.debuffs = {};
    if (gameState.currentEnemy && gameState.currentEnemy.buffs) gameState.currentEnemy.buffs = {};
    gameState.stunnedTurns = 0;
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

    // Calcula chance de fuga (Covarde: +20% se equipado)
    let fleeChance = 40 + gameState.agilidade;
    if (typeof isTituloEquipado === "function" && isTituloEquipado('covarde')) {
        fleeChance += 20;
    }
    fleeChance = Math.max(10, Math.min(95, fleeChance));

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
/* =====================[ FIM TRECHO 5 ]===================== */

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
    const xpGainedBase = Math.floor(gameState.currentEnemy.maxVida * 0.5 + 10);
    let xpGained = xpGainedBase;
    // Aplica bônus de XP do título Veterano, se equipado
    if (typeof isTituloEquipado === "function" && isTituloEquipado('veterano')) {
        xpGained = Math.floor(xpGainedBase * 1.1);
    }
    gameState.xp += xpGained;

    // Atualiza progresso de títulos globais no perfil da sessão
    if (!playerProfile.monstersDefeated) playerProfile.monstersDefeated = 0;
    playerProfile.monstersDefeated++;
    if (!playerProfile.combatesSemFugirSeguidos) playerProfile.combatesSemFugirSeguidos = 0;
    playerProfile.combatesSemFugirSeguidos++;

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
    if (!playerProfile.deathsByHp) playerProfile.deathsByHp = 0;
    playerProfile.deathsByHp++;

    if (gameState.debuffs) gameState.debuffs = {};
    if (gameState.currentEnemy && gameState.currentEnemy.buffs) gameState.currentEnemy.buffs = {};
    gameState.stunnedTurns = 0;
    processarGameOverEspecial('Você foi derrotado em combate!');
}

function checkLevelUp() {
    if (gameState.xp >= gameState.nextLevel) {
        gameState.level++;
        gameState.xp -= gameState.nextLevel;
        gameState.nextLevel = Math.floor(gameState.nextLevel * 1.5);

        gameState.maxVida += 5;
        gameState.vida = gameState.maxVida;
        gameState.maxMana += 5;
        gameState.mana = gameState.maxMana;
        gameState.maxEnergia += 5;
        gameState.energia = gameState.maxEnergia;
        gameState.maxSanity += 5;
        gameState.sanity = gameState.maxSanity;

        gameState.forca += 1;
        gameState.defesa += 1;
        gameState.precisao += 1;
        gameState.agilidade += 1;

        addMessage(
            `Nível ${gameState.level}! Atributos aumentados!`, false, false, 'levelup'
        );
        updateStatus();
    }
}
/* =====================[ FIM TRECHO 8 ]===================== */



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
    const upgrades = Math.floor(gameState.currentFloor / 2);
    if (!isBossEnemy(enemy.name)) {
        enemy.maxVida += upgrades * 7;
        enemy.vida += upgrades * 7;
        enemy.forca += upgrades * 5;
        enemy.defesa += upgrades * 2;
        enemy.precisao += upgrades * 1;
        enemy.agilidade += upgrades * 1;
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
