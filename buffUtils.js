// buffUtils.js — Centraliza a definição, aplicação, atualização e remoção de buffs/debuffs para jogador e inimigo. Inclui funções auxiliares para cálculo de stats ajustados e informações de efeito.

/* =====================[ TRECHO 1: DICIONÁRIO CENTRAL DE BUFFS/DEBUFFS ]===================== */
const BUFFS_INFO = {
    // Buffs compostos exclusivos por inimigo
    teia_pegajosa: {
        nome: "Teia Pegajosa",
        descricao: "Reduz sua agilidade e defesa por teia grudenta.",
        icone: "🕸️",
        efeitos: { agilidade: "-X", defesa: "-X" }
    },
    gelatina_pegajosa: {
        nome: "Gelatina Pegajosa",
        descricao: "O cubo gruda em você, reduzindo defesa e agilidade.",
        icone: "🟩",
        efeitos: { agilidade: "-X", defesa: "-X" }
    },
    grilhoes_naturais: {
        nome: "Grilhões Naturais",
        descricao: "A planta prende seus pés e drena sua força e agilidade.",
        icone: "🌿",
        efeitos: { agilidade: "-X", forca: "-X" }
    },
    chama_neon: {
        nome: "Chama de Néon",
        descricao: "Você sofre queimaduras e se move mais devagar.",
        icone: "🔥",
        efeitos: { vida: "-3/turno", agilidade: "-2" }
    },
    aura_sombria: {
        nome: "Aura Sombria",
        descricao: "O orbe corrompe sua defesa e sanidade.",
        icone: "🌑",
        efeitos: { defesa: "-X", sanidade: "-5/turno" }
    },
    // Buff composto global que ainda é usado por boss (Rato-Rei)
    aura_real: {
        nome: "Aura Real",
        descricao: "Aumenta força e defesa.",
        icone: "👑",
        efeitos: { forca: "+4", defesa: "+1" }
    },

    // Debuffs simples em uso
    veneno: {
        nome: "Veneno",
        descricao: "Você sofre dano contínuo a cada turno.",
        icone: "☠️",
        efeitos: { vida: "-X/turno" }
    },
    agilidade: {
        nome: "Lentidão",
        descricao: "Reduz sua agilidade.",
        icone: "🐢",
        efeitos: { agilidade: "-X" }
    },
    forca: {
        nome: "Enfraquecimento",
        descricao: "Reduz sua força.",
        icone: "💪",
        efeitos: { forca: "-X" }
    },
    defesa: {
        nome: "Fraqueza",
        descricao: "Reduz sua defesa.",
        icone: "🛡️",
        efeitos: { defesa: "-X" }
    },
    precisao: {
        nome: "Ofuscamento",
        descricao: "Reduz sua precisão.",
        icone: "🎯",
        efeitos: { precisao: "-X%" }
    },
    stun: {
        nome: "Atordoamento",
        descricao: "Você perde o turno.",
        icone: "🌀",
        efeitos: {}
    }
};
/* =====================[ FIM TRECHO 1 ]===================== */


/* =====================[ TRECHO 2: REGISTRO DE BUFFS COMPOSTOS ]===================== */
const COMPOSITE_BUFFS = {
    teia_pegajosa: ["agilidade", "defesa"],            // Usado pela Aranha Cinzenta
    gelatina_pegajosa: ["agilidade", "defesa"],        // Usado pelo Cubo de Gelatina
    grilhoes_naturais: ["agilidade", "forca"],         // Usado pela Planta que ri
    chama_neon: ["agilidade", "vida"],                 // Usado pela Salamandra de Néon (reduz agilidade e dá dano por turno)
    aura_sombria: ["defesa", "sanidade"],              // Usado pelo Orbe Sombria
    aura_real: ["forca", "defesa"]                     // Boss/miniboss (Rato-Rei)
};
/* =====================[ FIM TRECHO 2 ]===================== */

/* =====================[ TRECHO 3: UTILITÁRIOS DE BUFFS/DEBUFFS ]===================== */
// Utilitário para buscar info do buff/debuff
function getBuffInfo(buffKey) {
    return BUFFS_INFO[buffKey] || null;
}isTituloEquipado
function isCompositeBuff(buffKey) {
    return !!COMPOSITE_BUFFS[buffKey];
}
/* =====================[ FIM TRECHO 3 ]===================== */

/* =====================[ TRECHO 4: DEBUFFS DO JOGADOR — APLICAÇÃO E ATUALIZAÇÃO ]===================== */

// -- Aplicar debuff genérico no player --
// Valor ACUMULA, duração é sempre a maior (exceto precisão/veneno)
function applyPlayerDebuff(type, value, turns) {
    if (!gameState.debuffs) gameState.debuffs = {};

    // ---- IMUNIDADES POR TÍTULO EQUIPADO ----
    if (typeof isTituloEquipado === "function") {
        if (type === "forca" && isTituloEquipado("monstroSupino")) {
            if (typeof addMessage === "function") addMessage("Você absorveu o enfraquecimento e ficou MAIS forte!", true);
            gameState.forca += Math.abs(value);
            return;
        }
        if (type === "defesa" && isTituloEquipado("peleRinoceronte")) {
            if (typeof addMessage === "function") addMessage("Você está imune a redução de defesa!", true);
            return;
        }
        if (type === "agilidade" && isTituloEquipado("chineloVeloz")) {
            if (typeof addMessage === "function") addMessage("Você está imune a redução de agilidade!", true);
            return;
        }
        if (type === "precisao" && isTituloEquipado("oculosSol")) {
            if (typeof addMessage === "function") addMessage("Você está imune a ofuscamento!", true);
            return;
        }
        if (type === "veneno" && isTituloEquipado("reiDoSoro")) {
            if (typeof addMessage === "function") addMessage("Você está imune a veneno!", true);
            return;
        }
    }

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
        if (!playerProfile.ofuscamentosSofridos) playerProfile.ofuscamentosSofridos = 0;
        playerProfile.ofuscamentosSofridos++;
    }
    // Veneno: só renova duração (um só efeito)
    else if (type === "veneno") {
        gameState.debuffs[type] = { value: 0, turns };
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

// -- Atualizar buffs/debuffs do player a cada turno, processando efeitos como veneno, buffs compostos etc --
function tickPlayerDebuffs() {
    if (!gameState.debuffs) return;
    for (const type in gameState.debuffs) {
        // --- EFEITOS ESPECIAIS POR BUFF COMPOSTO OU SIMPLES ---
        // Veneno (simples)
        if (type === "veneno") {
            const danoVeneno = Math.max(3, Math.floor(gameState.maxVida * 0.04));
            gameState.vida = Math.max(0, gameState.vida - danoVeneno);
            addMessage(`Você sofre ${danoVeneno} de dano do veneno!`, true);
        }
        // Chama de Néon (composto)
        if (type === "chama_neon") {
            gameState.vida = Math.max(0, gameState.vida - 3);
            addMessage("As queimaduras das Chamas de Néon causam 3 de dano!", true);
        }
        // Aura Sombria (composto)
        if (type === "aura_sombria") {
            if (typeof gameState.sanity === "number") {
                gameState.sanity = Math.max(0, gameState.sanity - 5);
                addMessage("A aura sombria drena sua sanidade! (-5)", true);
            }
        }
        // Debuffs compostos exclusivos visuais (teia, gelatina, grilhoes) não têm efeito extra além dos stats afetados
        // Efeito de stun já tratado no fluxo de combate

        gameState.debuffs[type].turns -= 1;
        if (gameState.debuffs[type].turns <= 0) {
            delete gameState.debuffs[type];
        }
    }
    // Limpa debuff composto se um dos componentes sumir
    if (gameState.debuffs["teia_pegajosa"] &&
        (!gameState.debuffs["agilidade"] || !gameState.debuffs["defesa"])) {
        delete gameState.debuffs["teia_pegajosa"];
    }
    if (gameState.debuffs["gelatina_pegajosa"] &&
        (!gameState.debuffs["agilidade"] || !gameState.debuffs["defesa"])) {
        delete gameState.debuffs["gelatina_pegajosa"];
    }
    if (gameState.debuffs["grilhoes_naturais"] &&
        (!gameState.debuffs["agilidade"] || !gameState.debuffs["forca"])) {
        delete gameState.debuffs["grilhoes_naturais"];
    }
    if (gameState.debuffs["chama_neon"] &&
        (!gameState.debuffs["agilidade"])) {
        delete gameState.debuffs["chama_neon"];
    }
    if (gameState.debuffs["aura_sombria"] &&
        (!gameState.debuffs["defesa"])) {
        delete gameState.debuffs["aura_sombria"];
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
