// buffUtils.js — Centraliza a definição, aplicação, atualização e remoção de buffs/debuffs para jogador e inimigo. Inclui funções auxiliares para cálculo de stats ajustados e informações de efeito.

/* =====================[ TRECHO 1: DICIONÁRIO CENTRAL DE BUFFS/DEBUFFS ]===================== */
const BUFFS_INFO = {
    // Buffs compostos
    aura_real: {
        nome: "Aura Real",
        descricao: "Aumenta força e defesa",
        icone: "👑",
        efeitos: { forca: "+4", defesa: "+1" }
    },
    teia_pegajosa: {
        nome: "Teia Pegajosa",
        descricao: "Reduz agilidade e defesa",
        icone: "🕸️",
        efeitos: { agilidade: "-X", defesa: "-X" }
    },
    // Buffs/debuffs simples
    lentidao: {
        nome: "Lentidão",
        descricao: "Reduz sua agilidade",
        icone: "🐢",
        efeitos: { agilidade: "-X" }
    },
    defesa: {
        nome: "Fraqueza",
        descricao: "Reduz sua defesa",
        icone: "🛡️",
        efeitos: { defesa: "-X" }
    },
    forca: {
        nome: "Enfraquecimento",
        descricao: "Reduz sua força",
        icone: "💪",
        efeitos: { forca: "-X" }
    },
    precisao: {
        nome: "Ofuscamento",
        descricao: "Reduz sua precisão",
        icone: "🎯",
        efeitos: { precisao: "-X%" }
    },
    veneno: {
        nome: "Veneno",
        descricao: "Dano contínuo a cada turno",
        icone: "☠️",
        efeitos: { vida: "-X/turno" }
    },
    agilidade: {
        nome: "Lentidão",
        descricao: "Reduz sua agilidade",
        icone: "🐢",
        efeitos: { agilidade: "-X" }
    },
    stun: {
        nome: "Atordoamento",
        descricao: "Você perde o turno",
        icone: "🌀",
        efeitos: {}
    }
    // Adicione novos buffs/debuffs aqui!
};
/* =====================[ FIM TRECHO 1 ]===================== */

/* =====================[ TRECHO 2: REGISTRO DE BUFFS COMPOSTOS ]===================== */
const COMPOSITE_BUFFS = {
    // Exemplo: buff do Rato-Rei
    aura_real: ["forca", "defesa"],
    teia_pegajosa: ["agilidade", "defesa"]
    // Adicione outros compostos se quiser
};
/* =====================[ FIM TRECHO 2 ]===================== */

/* =====================[ TRECHO 3: UTILITÁRIOS DE BUFFS/DEBUFFS ]===================== */
// Utilitário para buscar info do buff/debuff
function getBuffInfo(buffKey) {
    return BUFFS_INFO[buffKey] || null;
}
function isCompositeBuff(buffKey) {
    return !!COMPOSITE_BUFFS[buffKey];
}
/* =====================[ FIM TRECHO 3 ]===================== */

/* =====================[ TRECHO 4: DEBUFFS DO JOGADOR — APLICAÇÃO E ATUALIZAÇÃO ]===================== */

// -- Aplicar debuff genérico no player --
// Valor ACUMULA, duração é sempre a maior (exceto precisão/veneno)
function applyPlayerDebuff(type, value, turns) {
    if (!gameState.debuffs) gameState.debuffs = {};

    // Stacking inteligente: soma valor, duração = maior (exceto precisão/veneno)
    if (type === "defesa" || type === "agilidade" || type === "forca") {
        if (gameState.debuffs[type]) {
            gameState.debuffs[type].value += value;
            gameState.debuffs[type].turns = Math.max(gameState.debuffs[type].turns, turns);
        } else {
            gameState.debuffs[type] = { value, turns };
        }
    }
    // Precisão: valor é sempre -5% por turno, só soma turnos (até -15%)
    else if (type === "precisao") {
        if (gameState.debuffs[type]) {
            gameState.debuffs[type].turns += turns;
        } else {
            gameState.debuffs[type] = { value: 0, turns };
        }
        // Registro global de ofuscamento para títulos (agora em playerProfile)
        if (!playerProfile.ofuscamentosSofridos) playerProfile.ofuscamentosSofridos = 0;
        playerProfile.ofuscamentosSofridos++;
    }
    // Veneno: só renova duração (um só efeito)
    else if (type === "veneno") {
        gameState.debuffs[type] = { value: 0, turns };
        // Registro global de veneno para títulos (agora em playerProfile)
        if (!playerProfile.venenamentosSofridos) playerProfile.venenamentosSofridos = 0;
        playerProfile.venenamentosSofridos++;
    }
    // Default genérico
    else {
        if (gameState.debuffs[type]) {
            gameState.debuffs[type].value += value;
            gameState.debuffs[type].turns = Math.max(gameState.debuffs[type].turns, turns);
        } else {
            gameState.debuffs[type] = { value, turns };
        }
    }
}

// -- Atualizar buffs/debuffs do player a cada turno, processando efeitos como veneno --
function tickPlayerDebuffs() {
    if (!gameState.debuffs) return;
    for (const type in gameState.debuffs) {
        // Efeito especial: veneno dá dano direto
        if (type === "veneno") {
            const danoVeneno = Math.max(3, Math.floor(gameState.maxVida * 0.04));
            gameState.vida = Math.max(0, gameState.vida - danoVeneno);
            addMessage(`Você sofre ${danoVeneno} de dano do veneno!`, true);
        }
        gameState.debuffs[type].turns -= 1;
        if (gameState.debuffs[type].turns <= 0) {
            delete gameState.debuffs[type];
        }
    }
    // Limpa o debuff composto teia_pegajosa se um dos dois sumir
    if (
        gameState.debuffs["teia_pegajosa"] &&
        (!gameState.debuffs["agilidade"] || !gameState.debuffs["defesa"])
    ) {
        delete gameState.debuffs["teia_pegajosa"];
    }
}
/* =====================[ FIM TRECHO 4 ]===================== */

/* =====================[ TRECHO 5: BUFFS DO INIMIGO — APLICAÇÃO E ATUALIZAÇÃO ]===================== */

// -- Aplicar buff genérico no inimigo --
function applyEnemyBuff(type, value, turns) {
    if (!gameState.currentEnemy.buffs) gameState.currentEnemy.buffs = {};

    // Stacking inteligente: soma valor, duração = maior (exceto precisão/agilidade, que acumulam só turnos)
    if (type === "defesa" || type === "forca") {
        if (gameState.currentEnemy.buffs[type]) {
            gameState.currentEnemy.buffs[type].value += value;
            gameState.currentEnemy.buffs[type].turns = Math.max(gameState.currentEnemy.buffs[type].turns, turns);
        } else {
            gameState.currentEnemy.buffs[type] = { value, turns };
        }
    }
    // Precisão/agilidade: só acumulam turnos
    else if (type === "agilidade" || type === "precisao") {
        if (gameState.currentEnemy.buffs[type]) {
            gameState.currentEnemy.buffs[type].turns += turns;
        } else {
            gameState.currentEnemy.buffs[type] = { value, turns };
        }
    }
    // Default genérico
    else {
        if (gameState.currentEnemy.buffs[type]) {
            gameState.currentEnemy.buffs[type].value += value;
            gameState.currentEnemy.buffs[type].turns = Math.max(gameState.currentEnemy.buffs[type].turns, turns);
        } else {
            gameState.currentEnemy.buffs[type] = { value, turns };
        }
    }
}

// -- Atualizar buffs do inimigo a cada turno --
function tickEnemyBuffs() {
    if (!gameState.currentEnemy.buffs) return;
    for (const type in gameState.currentEnemy.buffs) {
        gameState.currentEnemy.buffs[type].turns -= 1;
        if (gameState.currentEnemy.buffs[type].turns <= 0) {
            delete gameState.currentEnemy.buffs[type];
        }
    }
}
/* =====================[ FIM TRECHO 5 ]===================== */

/* =====================[ TRECHO 6: FUNÇÕES DE STATUS REAIS (PLAYER E INIMIGO) ]===================== */

// Força do inimigo considerando buff
function getEnemyForcaAtual() {
    let forca = gameState.currentEnemy.forca;
    if (gameState.currentEnemy.buffs && gameState.currentEnemy.buffs["forca"]) {
        forca += gameState.currentEnemy.buffs["forca"].value;
    }
    return forca;
}

// Defesa do inimigo considerando buff
function getEnemyDefesaAtual() {
    let defesa = gameState.currentEnemy.defesa;
    if (gameState.currentEnemy.buffs && gameState.currentEnemy.buffs["defesa"]) {
        defesa += gameState.currentEnemy.buffs["defesa"].value;
    }
    return defesa;
}

// Agilidade do player considerando debuff
function getPlayerAgilidadeAtual() {
    let agi = gameState.agilidade;
    if (gameState.debuffs && gameState.debuffs["agilidade"]) {
        agi = Math.max(0, agi - gameState.debuffs["agilidade"].value);
    }
    return agi;
}

// Defesa do player considerando debuff
function getPlayerDefesaAtual() {
    let def = gameState.defesa;
    if (gameState.debuffs && gameState.debuffs["defesa"]) {
        def = Math.max(0, def - gameState.debuffs["defesa"].value);
    }
    return def;
}

// Precisão do player considerando debuff (Slime Luminoso: -5% por turno restante)
function getPlayerPrecisaoAtual() {
    let precisao = gameState.precisao;
    if (gameState.debuffs && gameState.debuffs["precisao"]) {
        const reducao = Math.min(15, 5 * gameState.debuffs["precisao"].turns);
        precisao = Math.max(0, precisao - reducao);
    }
    return precisao;
}

// Força do player considerando debuff
function getPlayerForcaAtual() {
    let forca = gameState.forca;
    if (gameState.debuffs && gameState.debuffs["forca"]) {
        forca = Math.max(1, forca - gameState.debuffs["forca"].value);
    }
    return forca;
}
/* =====================[ FIM TRECHO 6 ]===================== */

/* =====================[ TRECHO 7: EXPORTAÇÃO GLOBAL ]===================== */
// ----- Exportação para uso global -----
window.BUFFS_INFO = BUFFS_INFO;
window.getBuffInfo = getBuffInfo;
window.isCompositeBuff = isCompositeBuff;
window.applyPlayerDebuff = applyPlayerDebuff;
window.tickPlayerDebuffs = tickPlayerDebuffs;
window.applyEnemyBuff = applyEnemyBuff;
window.tickEnemyBuffs = tickEnemyBuffs;
window.getEnemyForcaAtual = getEnemyForcaAtual;
window.getEnemyDefesaAtual = getEnemyDefesaAtual;
window.getPlayerAgilidadeAtual = getPlayerAgilidadeAtual;
window.getPlayerDefesaAtual = getPlayerDefesaAtual;
window.getPlayerPrecisaoAtual = getPlayerPrecisaoAtual;
window.getPlayerForcaAtual = getPlayerForcaAtual;
/* =====================[ FIM DO ARQUIVO buffUtils.js ]===================== */
