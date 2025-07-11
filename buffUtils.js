// buffUtils.js — Centraliza a definição, aplicação, atualização e remoção de buffs/debuffs para jogador e inimigo. Inclui funções auxiliares para cálculo de stats ajustados e informações de efeito.

/* =====================[ TRECHO 1: DICIONÁRIO CENTRAL DE BUFFS/DEBUFFS ]===================== */
const BUFFS_INFO = {
    // Buffs compostos usados por chefes/inimigos (mantidos!)
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
    aura_real: {
        nome: "Aura Real",
        descricao: "Aumenta força e defesa.",
        icone: "👑",
        efeitos: { forca: "+4", defesa: "+1" }
    },
    fraqueza_aranha: {
        nome: "Fraqueza da Aranha",
        descricao: "Por injetar todo o seu veneno na presa fica fraca pela duração do veneno.",
        icone: "🕷️",
        efeitos: { forca: "-X" }
        },furia_abissal: {
        nome: "Fúria Abissal",
        descricao: "O inimigo está em fúria: força e defesa aumentadas, agilidade e precisão reduzidas.",
        icone: "🐻‍❄️"
    },
    pisao_demolidor: {
        nome: "Pisão Demolidor",
        descricao: "Você está atordoado e com atributos reduzidos pelo impacto.",
        icone: "🦦"
    },
    eco_sombrio: {
        nome: "Eco Sombrio",
        descricao: "Você está atordoado, confuso e com reflexos lentos.",
        icone: "🦇"
    },
    aura_sombria: {
        nome: "Aura Sombria",
        descricao: "Você está sob efeito de energia sombria e perde sanidade a cada turno.",
        icone: "🌑",
        efeitos: { sanidade: "-X/turno", defesa: "-Y" }
    },
    chamas_debilitantes: {
        nome: "Chamas Debilitantes",
        descricao: "Você está queimando e sua agilidade está reduzida.",
        icone: "🔥🐢",
        efeitos: { vida: "-X/turno", agilidade: "-Y" }
    },


    // DOTs padronizados (apenas estes foram alterados)
    veneno: {
        nome: "Envenenado",
        descricao: "Você sofre dano contínuo a cada turno.",
        icone: "☠️",
        efeitos: { vida: "-X/turno" }
    },
    sangramento: {
        nome: "Sangrando",
        descricao: "Você está sangrando e perde vida a cada turno.",
        icone: "🩸",
        efeitos: { vida: "-X/turno" }
    },
    chamas: {
        nome: "Chamas",
        descricao: "Você está queimando e perde vida a cada rodada.",
        icone: "🔥",
        efeitos: { vida: "-X/turno" }
    },
    enlouquecendo: {
        nome: "Enlouquecendo",
        descricao: "Você está perdendo sanidade a cada rodada.",
        icone: "🧠",
        efeitos: { sanidade: "-X/turno" }
    },

    // Debuffs simples globais
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

/* =====================[ TRECHO 2: COMPOSITE_BUFFS (BUFFS COMPUESTOS/MÁSCARAS) ]===================== */
const COMPOSITE_BUFFS = {
    // Capítulo 1 & históricos
    gosma_paralisante: ["agilidade", "defesa"],             // Slime Sábio
    esporos_alucinogenos: ["precisao", "sanidade"],         // Cogumelo Ancestral
    crescimento_selvagem: ["forca", "agilidade"],           // Planta Voraz (buff próprio)
    encantamento_noturno: ["stun", "defesa"],               // Fada Sombria
    perfuracao_profunda: ["defesa", "vida"],                // Cubo de Espinhos (antigo, se ainda usa)
    revelacao_proibida: ["sanidade", "precisao"],           // Livro Proibido
    chamas_ardentes: ["agilidade"],                         // Salamandra Radiante (buff próprio)
    olhar_penetrante: ["defesa", "precisao"],               // Olho Onisciente
    vortice_abissal: ["sanidade", "defesa"],                // Orbe Abissal (antigo, agora "enlouquecendo" + defesa, veja padronização)
    endurecimento_ancestral: ["defesa"],                    // Gárgula Ancestral (buff próprio)
    // Legados e mascaras para visuais clássicos
    teia_pegajosa: ["agilidade", "defesa"],
    chamas_debilitantes: ["chamas", "agilidade"],
    gelatina_pegajosa: ["agilidade", "defesa"],
    grilhoes_naturais: ["agilidade", "forca"],
    aura_sombria: ["defesa", "sanidade"],                   // Orbe Sombria/Aura visual clássica
    aura_real: ["forca", "defesa"],                         // (histórico, boss especial)
    // Novos compostos/padronizados Cap 2 e chefes
    furia_abissal: ["forca", "defesa", "agilidade", "precisao"],    // Urso Abissal
    pisao_demolidor: ["stun", "agilidade", "forca"],                // Tatu Demolidor
    eco_sombrio: ["stun", "agilidade", "precisao"],                 // Morcego Prismático
    presa_toxica: ["sangramento", "veneno"],                        // Aranha Carniceira
    golpe_perfurante: ["sangramento", "defesa"],                    // Cubo de Espinhos
    teia_lerdeza: ["defesa", "agilidade"],                          // Aranha Cinzenta
    encantamento_noturno: ["stun", "defesa"],                       // Fada Sombria
    // Adicione aqui sempre que houver skill multi-efeito
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
// SANGRAMENTO: Aceita apenas valor inicial, ignora "turns", duração sempre fixa em 3 turnos.
// Comentário: Isso é obrigatório para manter a consistência do DOT e evitar bugs por uso incorreto.
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

    // Sangramento: SEMPRE aceita só o valor inicial, ignora "turns" recebido (sempre 3 turnos, ticks decrescentes).
    // ATENÇÃO: O parâmetro "turns" é ignorado por padrão aqui!
    if (type === "sangramento") {
        if (typeof value !== "number" || value < 1) return;
        let ticks = [];
        if (value > 20) {
            ticks = [value, value - 3, value - 6];
        } else if (value > 10) {
            ticks = [value, value - 2, value - 4];
        } else {
            ticks = [value, value - 1, value - 2];
        }
        // Previne ticks negativos
        ticks = ticks.map(v => (v > 0 ? v : 1));
        // Sempre duração 3 turnos
        gameState.debuffs.sangramento = { value: ticks[0], ticks, turn: 0, turns: 3 };
        return;
    }

    // ===== AURA SOMBRIA: Suporta objeto { sanidade: X, defesa: Y }, duração igual para ambos =====
    // - DOT de sanidade: diminui X por tick.
    // - Defesa: redução fixa no atributo enquanto durar (volta ao normal ao expirar).
    // - Comentário: Ambos expiram juntos, DOT e redução de defesa atrelados.
    if (type === "aura_sombria" && typeof value === "object" && value !== null) {
        // Aceita: applyPlayerDebuff("aura_sombria", { sanidade: X, defesa: Y }, turns)
        const sanidadeTick = typeof value.sanidade === "number" ? value.sanidade : 0;
        const defesaRed = typeof value.defesa === "number" ? value.defesa : 0;
        // Aplica o DOT de sanidade como parte do debuff composto
        gameState.debuffs.aura_sombria = {
            sanidadeTick,
            defesaRed,
            turns: typeof turns === "number" && turns > 0 ? turns : 1,
            turn: 0
        };
        // Redução de defesa entra como debuff secundário "defesa", mas volta ao normal ao expirar
        if (defesaRed > 0) {
            // Guarda valor anterior, se já houver, acumula
            if (gameState.debuffs.defesa) {
                gameState.debuffs.defesa.value += defesaRed;
                gameState.debuffs.defesa.turns = Math.max(gameState.debuffs.defesa.turns, turns);
            } else {
                gameState.debuffs.defesa = { value: defesaRed, turns: typeof turns === "number" && turns > 0 ? turns : 1 };
            }
        }
        return;
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
    // Precisão, veneno: sempre value/turns custom — não acumulam, apenas renovam duração e valor
    else if (type === "precisao" || type === "veneno") {
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
        // Sangramento (novo algoritmo, ticks decrescentes, duração sempre 3 turnos)
        if (type === "sangramento") {
            const debuff = gameState.debuffs[type];
            const ticks = debuff.ticks;
            const turno = debuff.turn;
            if (ticks && ticks[turno] > 0) {
                gameState.vida = Math.max(0, gameState.vida - ticks[turno]);
                addMessage(`Você sofre ${ticks[turno]} de dano do sangramento!`, true);
            }
            gameState.debuffs[type].turn++;
        }
        // Em Chamas (DOT padronizado)
        if (type === "em_chamas") {
            const debuff = gameState.debuffs[type];
            if (debuff && typeof debuff.value === "object" && debuff.value !== null) {
                const dano = typeof debuff.value.dano === "number" ? debuff.value.dano : 0;
                if (dano > 0) {
                    gameState.vida = Math.max(0, gameState.vida - dano);
                    addMessage(`Você sofre ${dano} de dano das chamas!`, true);
                }
            }
        }
        // ===== AURA SOMBRIA: DOT de sanidade + defesa fixa, ambos expiram juntos =====
        if (type === "aura_sombria") {
            const debuff = gameState.debuffs[type];
            if (debuff && typeof debuff.sanidadeTick === "number" && debuff.sanidadeTick > 0) {
                if (typeof gameState.sanity === "number") {
                    gameState.sanity = Math.max(0, gameState.sanity - debuff.sanidadeTick);
                    addMessage(`A aura sombria drena sua sanidade! (-${debuff.sanidadeTick})`, true);
                }
            }
            // Redução de defesa é aplicada na aplicação do debuff (applyPlayerDebuff) e expirada aqui
            // Quando o DOT expira, a redução de defesa também expira (removida junto)
        }

        gameState.debuffs[type].turns -= 1;
        // Remove sangramento se passou dos ticks (após 3)
        if (type === "sangramento") {
            if (gameState.debuffs[type].turn >= 3) {
                delete gameState.debuffs[type];
                continue;
            }
        }
        // Expiração de AURA SOMBRIA: remove também redução de defesa associada, se houver
        if (type === "aura_sombria" && gameState.debuffs[type].turns <= 0) {
            // Remove redução de defesa associada a esse DOT, se ativa
            if (gameState.debuffs.defesa && typeof gameState.debuffs[type].defesaRed === "number") {
                gameState.debuffs.defesa.value -= gameState.debuffs[type].defesaRed;
                if (gameState.debuffs.defesa.value <= 0) {
                    delete gameState.debuffs.defesa;
                }
            }
            delete gameState.debuffs[type];
            continue;
        }
        // Remove buff/debuff se acabou a duração (exceto sangramento que já é removido acima)
        if (gameState.debuffs[type] && type !== "sangramento" && type !== "aura_sombria" && gameState.debuffs[type].turns <= 0) {
            delete gameState.debuffs[type];
        }
    }
}
/* =====================[ FIM TRECHO 4 ]===================== */

/* =====================[ TRECHO 5: BUFFS DO INIMIGO — APLICAÇÃO E ATUALIZAÇÃO ]===================== */

// Similar ao player, mas não precisa alterar agora (mantém padrão original)
function applyEnemyBuff(type, value, turns) {
    if (!gameState.currentEnemy) return;
    if (!gameState.currentEnemy.buffs) gameState.currentEnemy.buffs = {};
    if (gameState.currentEnemy.buffs[type]) {
        gameState.currentEnemy.buffs[type].value += value;
        gameState.currentEnemy.buffs[type].turns = Math.max(gameState.currentEnemy.buffs[type].turns, turns);
    } else {
        gameState.currentEnemy.buffs[type] = { value, turns };
    }
}
function tickEnemyBuffs() {
    if (!gameState.currentEnemy || !gameState.currentEnemy.buffs) return;
    for (const type in gameState.currentEnemy.buffs) {
        gameState.currentEnemy.buffs[type].turns -= 1;
        if (gameState.currentEnemy.buffs[type].turns <= 0) {
            delete gameState.currentEnemy.buffs[type];
        }
    }
}
/* =====================[ FIM TRECHO 5 ]===================== */

/* =====================[ TRECHO 6: GETTERS DE STATS COM BUFFS/DEBUFFS ]===================== */
// Funções de cálculo real dos stats, somando buffs/debuffs ativos (mantém padrão do projeto)
function getPlayerForcaAtual() {
    let base = gameState.forca;
    if (gameState.debuffs && gameState.debuffs.forca) base -= gameState.debuffs.forca.value;
    if (gameState.debuffs && gameState.debuffs.aura_sombria && typeof gameState.debuffs.aura_sombria.defesaRed === "number") base -= gameState.debuffs.aura_sombria.defesaRed;
    return Math.max(1, base);
}
function getPlayerDefesaAtual() {
    let base = gameState.defesa;
    if (gameState.debuffs && gameState.debuffs.defesa) base -= gameState.debuffs.defesa.value;
    return Math.max(0, base);
}
function getPlayerAgilidadeAtual() {
    let base = gameState.agilidade;
    if (gameState.debuffs && gameState.debuffs.agilidade) base -= gameState.debuffs.agilidade.value;
    return Math.max(1, base);
}
function getPlayerPrecisaoAtual() {
    let base = gameState.precisao;
    if (gameState.debuffs && gameState.debuffs.precisao) base -= gameState.debuffs.precisao.value;
    return Math.max(1, base);
}
function getEnemyForcaAtual() {
    let base = gameState.currentEnemy.forca;
    if (gameState.currentEnemy.buffs && gameState.currentEnemy.buffs.forca) base += gameState.currentEnemy.buffs.forca.value;
    return Math.max(1, base);
}
function getEnemyDefesaAtual() {
    let base = gameState.currentEnemy.defesa;
    if (gameState.currentEnemy.buffs && gameState.currentEnemy.buffs.defesa) base += gameState.currentEnemy.buffs.defesa.value;
    return Math.max(0, base);
}
function getEnemyAgilidadeAtual() {
    let base = gameState.currentEnemy.agilidade;
    if (gameState.currentEnemy.buffs && gameState.currentEnemy.buffs.agilidade) base += gameState.currentEnemy.buffs.agilidade.value;
    return Math.max(1, base);
}
function getEnemyPrecisaoAtual() {
    let base = gameState.currentEnemy.precisao;
    if (gameState.currentEnemy.buffs && gameState.currentEnemy.buffs.precisao) base += gameState.currentEnemy.buffs.precisao.value;
    return Math.max(1, base);
}

/* =====================[ EXPORTS GLOBAIS ]===================== */
window.BUFFS_INFO = BUFFS_INFO;
window.COMPOSITE_BUFFS = COMPOSITE_BUFFS;
window.getBuffInfo = getBuffInfo;
window.applyPlayerDebuff = applyPlayerDebuff;
window.tickPlayerDebuffs = tickPlayerDebuffs;
window.applyEnemyBuff = applyEnemyBuff;
window.tickEnemyBuffs = tickEnemyBuffs;
window.getPlayerForcaAtual = getPlayerForcaAtual;
window.getPlayerDefesaAtual = getPlayerDefesaAtual;
window.getPlayerAgilidadeAtual = getPlayerAgilidadeAtual;
window.getPlayerPrecisaoAtual = getPlayerPrecisaoAtual;
window.getEnemyForcaAtual = getEnemyForcaAtual;
window.getEnemyDefesaAtual = getEnemyDefesaAtual;
window.getEnemyAgilidadeAtual = getEnemyAgilidadeAtual;
window.getEnemyPrecisaoAtual = getEnemyPrecisaoAtual;

/* =====================[ FIM DO ARQUIVO buffUtils.js ]===================== */
