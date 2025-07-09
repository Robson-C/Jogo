// buffUtils.js — Centraliza a definição, aplicação, atualização e remoção de buffs/debuffs para jogador e inimigo. Inclui funções auxiliares para cálculo de stats ajustados e informações de efeito.

/* =====================[ TRECHO 1: DICIONÁRIO CENTRAL DE BUFFS/DEBUFFS ]===================== */
const BUFFS_INFO = {
    // Boss Capítulo 1 — Buffs e Debuffs exclusivos

    gosma_paralisante: {
        nome: "Gosma Paralisante",
        descricao: "Você está paralisado por uma gosma viscosa.",
        icone: "🟢",
        efeitos: { agilidade: "-3", defesa: "-3" }
    },
    esporos_alucinogenos: {
        nome: "Esporos Alucinógenos",
        descricao: "Sua mente e visão estão alteradas por esporos tóxicos.",
        icone: "🍄",
        efeitos: { precisao: "-3", sanidade: "-4" }
    },
    crescimento_selvagem: {
        nome: "Crescimento Selvagem",
        descricao: "A planta voraz ficou mais forte e ágil.",
        icone: "🌱",
        efeitos: { forca: "+3", agilidade: "+2" }
    },
    encantamento_noturno: {
        nome: "Encantamento Noturno",
        descricao: "Você está atordoado e sua defesa foi reduzida.",
        icone: "🌑",
        efeitos: { stun: "1", defesa: "-2" }
    },
    perfuracao_profunda: {
        nome: "Perfuração Profunda",
        descricao: "Defesa drasticamente reduzida e sofre dano contínuo.",
        icone: "🦔",
        efeitos: { defesa: "-4", vida: "-5/turno" }
    },
    revelacao_proibida: {
        nome: "Revelação Proibida",
        descricao: "Palavras proibidas enfraquecem sua sanidade e precisão.",
        icone: "📖",
        efeitos: { sanidade: "-4", precisao: "-3" }
    },
    chamas_ardentes: {
        nome: "Chamas Ardentes",
        descricao: "A Salamandra está muito mais veloz.",
        icone: "🔥",
        efeitos: { agilidade: "+4" }
    },
    olhar_penetrante: {
        nome: "Olhar Penetrante",
        descricao: "Sua defesa e precisão foram expostas.",
        icone: "👁️",
        efeitos: { defesa: "-3", precisao: "-2" }
    },
    vortice_abissal: {
        nome: "Vórtice Abissal",
        descricao: "Sua mente e proteção estão sendo drenadas.",
        icone: "🌀",
        efeitos: { sanidade: "-3", defesa: "-3" }
    },
    endurecimento_ancestral: {
        nome: "Endurecimento Ancestral",
        descricao: "A Gárgula está incrivelmente resistente.",
        icone: "🪨",
        efeitos: { defesa: "+4" }
    },

    // Outros buffs compostos realmente usados
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
    aura_real: {
        nome: "Aura Real",
        descricao: "Aumenta força e defesa.",
        icone: "👑",
        efeitos: { forca: "+4", defesa: "+1" }
    },

    // Debuffs simples
    veneno: {
        nome: "Veneno",
        descricao: "Você sofre dano contínuo a cada turno.",
        icone: "☠️",
        efeitos: { vida: "-X/turno" }
    },
    sangramento: {
        nome: "Sangramento",
        descricao: "Você está sangrando e perde vida a cada turno.",
        icone: "🩸",
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
        efeitos: { precisao: "-X" }
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
    gosma_paralisante: ["agilidade", "defesa"],         // Slime Sábio
    esporos_alucinogenos: ["precisao", "sanidade"],     // Cogumelo Ancestral
    crescimento_selvagem: ["forca", "agilidade"],       // Planta Voraz (buff próprio)
    encantamento_noturno: ["stun", "defesa"],           // Fada Sombria
    perfuracao_profunda: ["defesa", "vida"],            // Cubo de Espinhos
    revelacao_proibida: ["sanidade", "precisao"],       // Livro Proibido
    chamas_ardentes: ["agilidade"],                     // Salamandra Radiante (buff próprio)
    olhar_penetrante: ["defesa", "precisao"],           // Olho Onisciente
    vortice_abissal: ["sanidade", "defesa"],            // Orbe Abissal
    endurecimento_ancestral: ["defesa"],                // Gárgula Ancestral (buff próprio)
    // Outros compostos em uso por monstros comuns ou bosses de outros capítulos:
    teia_pegajosa: ["agilidade", "defesa"],
    gelatina_pegajosa: ["agilidade", "defesa"],
    grilhoes_naturais: ["agilidade", "forca"],
    chama_neon: ["agilidade", "vida"],
    aura_sombria: ["defesa", "sanidade"],
    aura_real: ["forca", "defesa"]
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
// Agora veneno, sangramento e precisão aceitam value e turns custom
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

    // Stacking inteligente: soma valor, duração = maior (exceto precisão, veneno e sangramento)
    if (type === "defesa" || type === "agilidade" || type === "forca") {
        if (gameState.debuffs[type]) {
            gameState.debuffs[type].value += value;
            gameState.debuffs[type].turns = Math.max(gameState.debuffs[type].turns, turns);
        } else {
            gameState.debuffs[type] = { value, turns };
        }
    }
    // Precisão, veneno e sangramento: sempre value/turns custom — não acumulam, apenas renovam duração e valor
    else if (type === "precisao" || type === "veneno" || type === "sangramento") {
        gameState.debuffs[type] = { value, turns };
        if (type === "precisao") {
            if (!playerProfile.ofuscamentosSofridos) playerProfile.ofuscamentosSofridos = 0;
            playerProfile.ofuscamentosSofridos++;
        }
        if (type === "veneno") {
            if (!playerProfile.venenamentosSofridos) playerProfile.venenamentosSofridos = 0;
            playerProfile.venenamentosSofridos++;
        }
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

// -- Atualizar buffs/debuffs do player a cada turno, processando efeitos como veneno, sangramento, buffs compostos etc --
function tickPlayerDebuffs() {
    if (!gameState.debuffs) return;
    for (const type in gameState.debuffs) {
        // Veneno (valor fixo)
        if (type === "veneno") {
            const danoVeneno = gameState.debuffs[type].value || 0;
            if (danoVeneno > 0) {
                gameState.vida = Math.max(0, gameState.vida - danoVeneno);
                addMessage(`Você sofre ${danoVeneno} de dano do veneno!`, true);
            }
        }
        // Sangramento (valor fixo)
        if (type === "sangramento") {
            const danoSangue = gameState.debuffs[type].value || 0;
            if (danoSangue > 0) {
                gameState.vida = Math.max(0, gameState.vida - danoSangue);
                addMessage(`Você sofre ${danoSangue} de dano do sangramento!`, true);
            }
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

// Precisão do player considerando debuff (agora valor fixo)
function getPlayerPrecisaoAtual() {
    let precisao = gameState.precisao;
    if (gameState.debuffs && gameState.debuffs["precisao"]) {
        precisao = Math.max(0, precisao - gameState.debuffs["precisao"].value);
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
