// buffUtils.js — Centraliza a definição, aplicação, atualização e remoção de buffs/debuffs para jogador e inimigo. Inclui funções auxiliares para cálculo de stats ajustados e informações de efeito.

/* =====================[ TRECHO 1: DICIONÁRIO CENTRAL DE BUFFS/DEBUFFS ]===================== */
const BUFFS_INFO = {
    // Buffs simples e compostos(máscaras) usados por chefes/inimigos (todas as habilidades do jogo devem se listadas aqui!)
    gosma_paralisante: {
        nome: "Gosma Paralisante",
        descricao: "Você está paralisado por uma gosma viscosa.",
        icone: "🟢",
        efeitos: { agilidade: "-X", defesa: "-Y" }
    },
    esporos_alucinogenos: {
        nome: "Esporos Alucinógenos",
        descricao: "Sua mente e visão estão alteradas por esporos tóxicos.",
        icone: "🍄",
        efeitos: { precisao: "-X", sanidade: "-Y" }
    },
    crescimento_selvagem: {
        nome: "Crescimento Selvagem",
        descricao: "A planta voraz ficou mais forte e ágil.",
        icone: "🌱",
        efeitos: { forca: "+X", agilidade: "+Y" }
    },
    encantamento_noturno: {
        nome: "Encantamento Noturno",
        descricao: "Você está atordoado e sua defesa foi reduzida.",
        icone: "🌑",
        efeitos: { stun: "1", defesa: "-X" }
    },
    revelacao_proibida: {
        nome: "Revelação Proibida",
        descricao: "Palavras proibidas enfraquecem sua sanidade e precisão.",
        icone: "📜",
        efeitos: { sanidade: "-X", precisao: "-Y" }
    },
    chamas_ardentes: {
        nome: "Chamas Ardentes",
        descricao: "A Salamandra está muito mais veloz.",
        icone: "🔥",
        efeitos: { agilidade: "+X" }
    },
    olhar_penetrante: {
        nome: "Olhar Penetrante",
        descricao: "Sua defesa e precisão foram expostas.",
        icone: "👁️",
        efeitos: { defesa: "-X", precisao: "-Y" }
    },
    vortice_abissal: {
        nome: "Vórtice Abissal",
        descricao: "Sua mente e proteção estão sendo drenadas.",
        icone: "🌀",
        efeitos: { sanidade: "-X", defesa: "-Y" }
    },
    endurecimento_ancestral: {
        nome: "Endurecimento Ancestral",
        descricao: "A Gárgula está incrivelmente resistente.",
        icone: "🪨",
        efeitos: { defesa: "+X" }
    },
    teia_pegajosa: {
        nome: "Teia Pegajosa",
        descricao: "Reduz sua agilidade e defesa por teia grudenta.",
        icone: "🕸️",
        efeitos: { agilidade: "-X", defesa: "-Y" }
    },
    gelatina_pegajosa: {
        nome: "Gelatina Pegajosa",
        descricao: "O cubo gruda em você, reduzindo defesa e agilidade.",
        icone: "🟩",
        efeitos: { agilidade: "-X", defesa: "-Y" }
    },
    grilhoes_naturais: {
        nome: "Grilhões Naturais",
        descricao: "A planta prende seus pés e drena sua força e agilidade.",
        icone: "🌿",
        efeitos: { agilidade: "-X", forca: "-Y" }
    },
    aura_real: {
        nome: "Aura Real",
        descricao: "Aumenta força e defesa.",
        icone: "👑",
        efeitos: { forca: "+X", defesa: "+Y" }
    },
    fraqueza_aranha: {
        nome: "Fraqueza da Aranha",
        descricao: "Por injetar todo o seu veneno na presa fica fraca pela duração do veneno.",
        icone: "🕷️",
        efeitos: { forca: "-X" }
    },
    furia_abissal: {
        nome: "Fúria Abissal",
        descricao: "O inimigo está em fúria: força e defesa aumentadas, agilidade e precisão reduzidas.",
        icone: "🐻‍❄️",
        efeitos: { forca: "+X", defesa: "+Y", agilidade: "-Z", precisao: "-W" }
    },
    pisao_demolidor: {
        nome: "Pisão Demolidor",
        descricao: "Você está atordoado e com atributos reduzidos pelo impacto.",
        icone: "🦦",
        efeitos: { stun: "1", agilidade: "-X", forca: "-Y" }
    },
    eco_sombrio: {
        nome: "Eco Sombrio",
        descricao: "Você está atordoado, confuso e com reflexos lentos.",
        icone: "🦇",
        efeitos: { stun: "1", agilidade: "-X", precisao: "-Y" }
    },
    aura_sombria: {
        nome: "Aura Sombria",
        descricao: "Você está sob efeito de energia sombria e perde sanidade a cada turno.",
        icone: "🌑",
        efeitos: { sanidade: "-X/turno", defesa: "-Y" }
    },
    golpe_perfurante: {
        nome: "Golpe Perfurante",
        descricao: "O cubo de espinhos perfura profundamente, causando sangramento e reduzindo sua defesa.",
        icone: "🗡️",
        efeitos: { sangramento: "-X", defesa: "-Y" }
    },
    veneno_hemorragico: {
        nome: "Veneno Hemorrágico",
        descricao: "Você está sangrando e envenenado ao mesmo tempo.",
        icone: "💉☠️",
        efeitos: { sangramento: "-X", veneno: "-Y" }
    },
    mordida_adeus: {
        nome: "Mordida de Adeus",
        descricao: "Ambos sofrem efeitos opostos: você está envenenado, a aranha está temporariamente enfraquecida.",
        icone: "☠️",
        efeitos: { veneno: "-X", forca: "-Y" }
    },
    visao_futura: {
        nome: "Visão do Futuro",
        descricao: "A Coruja Vidente prevê seus movimentos, aumentando drasticamente sua agilidade e precisão.",
        icone: "👁️‍🗨️",
        efeitos: { agilidade: "+X", precisao: "+Y" }
    },
    truque_sujo: {
        nome: "Truque Sujo",
        descricao: "Você foi atingido por areia nos olhos. Sua agilidade e precisão caem.",
        icone: "🪨",
        efeitos: { agilidade: "-X", precisao: "-Y" }
    },
    fios_enrolados: {
        nome: "Fios Enrolados",
        descricao: "Fios presos nos seus membros reduzem agilidade, energia e podem atordoar.",
        icone: "🪢",
        efeitos: { agilidade: "-X", energia: "-Y", stun: "1" }
    },
    canto_hipnotico: {
        nome: "Canto Hipnótico",
        descricao: "O canto da Harpia abala sua sanidade e defesa.",
        icone: "🎶",
        efeitos: { sanidade: "-X", defesa: "-Y" }
    },
    reflexo_imortal: {
        nome: "Reflexo Imortal",
        descricao: "O brilho da armadura enfraquece seu ataque enquanto o inimigo se protege.",
        icone: "🛡️",
        efeitos: { forca: "-X", buff_defesa_inimigo: "+Y" }
    },
    costura_cruel: {
        nome: "Costura Cruel",
        descricao: "O orc costurado te faz sangrar, reduz sua defesa e agilidade.",
        icone: "🧵",
        efeitos: { sangramento: "-X", defesa: "-Y", agilidade: "-Z" }
    },
    terra_perturbadora: {
        nome: "Terra Perturbadora",
        descricao: "Uma onda mágica drena sua energia vital e abala sua mente.",
        icone: "🌎",
        efeitos: { sanidade: "-X", energia: "-Y" }
    },
    poder_brutal: {
        nome: "Poder Brutal",
        descricao: "O ogro de crista fica mais forte e muito mais resistente.",
        icone: "🦍",
        efeitos: { buff_forca_inimigo: "+X", buff_defesa_inimigo: "+Y" }
    },
    investida_furiosa: {
        nome: "Investida Furiosa",
        descricao: "O minotauro aumenta sua força e precisão após investir contra você.",
        icone: "🐂",
        efeitos: { buff_forca_inimigo: "+X", buff_precisao_inimigo: "+Y" }
    },
    buff_defesa_inimigo: {
        nome: "Defesa Reforçada",
        descricao: "O inimigo aumentou muito sua defesa.",
        icone: "🛡️",
        efeitos: { defesa: "+X" }
    },
    buff_forca_inimigo: {
        nome: "Força Reforçada",
        descricao: "O inimigo aumentou muito sua força.",
        icone: "🗡️",
        efeitos: { forca: "+X" }
    },
    buff_precisao_inimigo: {
        nome: "Precisão Reforçada",
        descricao: "O inimigo aumentou muito sua precisão.",
        icone: "🎯",
        efeitos: { precisao: "+X" }
    },
    regeneracao_selvagem: {
        nome: "Regeneração Selvagem",
        descricao: "O Troll se regenera rapidamente a cada turno.",
        icone: "🧬",
        efeitos: { vida: "+X/turno" }
    },
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
        nome: "Visão Turva",
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
// Mapeia máscaras para os debuffs simples correspondentes. Comentado por boss/inimigo identificado:
// Apenas faz um mapa das máscaras, toda habilidade que usa alguma máscara em vez de debuffs/buffs simples deve ficar aqui!

const COMPOSITE_BUFFS = {
    gosma_paralisante: ["agilidade", "defesa"],                 // Slime Sábio
    esporos_alucinogenos: ["precisao", "sanidade"],             // Cogumelo Ancestral
    crescimento_selvagem: ["forca", "agilidade"],               // Planta Voraz (auto-buff)
    encantamento_noturno: ["stun", "defesa"],                   // Fada Sombria
    revelacao_proibida: ["sanidade", "precisao"],               // Livro Proibido
    chamas_ardentes: ["agilidade"],                             // Salamandra Radiante (auto-buff)
    olhar_penetrante: ["defesa", "precisao"],                   // Olho Onisciente
    vortice_abissal: ["sanidade", "defesa"],                    // Orbe Abissal
    endurecimento_ancestral: ["defesa"],                        // Gárgula Ancestral (auto-buff)
    teia_pegajosa: ["agilidade", "defesa"],                     // Aranha Gigante, Aranha Cinzenta
    gelatina_pegajosa: ["agilidade", "defesa"],                 // Cubo de Gelatina
    grilhoes_naturais: ["agilidade", "forca"],                  // Planta cativante/cipós
    aura_real: ["forca", "defesa"],                             // Rato Rei
    furia_abissal: ["forca", "defesa", "agilidade", "precisao"],// Urso Abissal
    pisao_demolidor: ["stun", "agilidade", "forca"],            // Tatu Demolidor
    eco_sombrio: ["stun", "agilidade", "precisao"],             // Morcego Prismático
    aura_sombria: ["sanidade", "defesa"],                       // Orbe Sombria
    golpe_perfurante: ["sangramento", "defesa"],                // Cubo de Espinhos
    veneno_hemorragico: ["sangramento", "veneno"],              // Aranha Carniceira e Aranha da Peste
    visao_futura: ["agilidade", "precisao"],                    // Coruja Vidente
    truque_sujo: ["agilidade", "precisao"],                         // Globin pequeno
    fios_enrolados: ["agilidade", "energia", "stun"],               // Marionete viva
    canto_hipnotico: ["sanidade", "defesa"],                        // Harpia
    reflexo_imortal: ["forca", "buff_defesa_inimigo"],              // Esqueleto de armadura
    costura_cruel: ["sangramento", "defesa", "agilidade"],          // Orc costurado
    terra_perturbadora: ["sanidade", "energia"],                    // Anjo de barro
    // Troll não precisa de máscara composta (buff simples + regeneração passiva)
    poder_brutal: ["buff_forca_inimigo", "buff_defesa_inimigo"],    // Ogro de Crista
    investida_furiosa: ["buff_forca_inimigo", "buff_precisao_inimigo"], // Minotauro
    metal_refletor: ["buff_defesa_inimigo", "precisao"]             // Golem de Aço
};
// Se criar buff/debuff simples novos, adicione ao dicionário BUFFS_INFO para descrição/ícone na UI!
/* =====================[ FIM TRECHO 2 ]===================== */


/* =====================[ TRECHO 3: UTILITÁRIOS DE BUFFS/DEBUFFS ]===================== */
//Para garantir que, ao mostrar a máscara para o player, exista nome/descrição/ícone/efeitos para exibir.
function getBuffInfo(buffKey) {
    return BUFFS_INFO[buffKey] || null;
}
//Lógica interna para o sistema saber “quando mostrar máscara no painel ao invés dos debuffs simples individuais”.
function isCompositeBuff(buffKey) {
    return !!COMPOSITE_BUFFS[buffKey];
}
/* =====================[ FIM TRECHO 3 ]===================== */

/* =====================[ TRECHO 4: DEBUFFS DO JOGADOR — APLICAÇÃO E ATUALIZAÇÃO ]===================== */

// Função central de aplicação de debuffs no player.
// Aceita debuff simples (string) OU composto (máscara).
// Para composto: aceita valor único (aplica igual para todos), ou objeto {stat: valor, ...} para valores diferenciados.
// Os debuffs simples são aplicados individualmente, a máscara é registrada no estado apenas para exibição unificada na interface.
// A expiração de todos do grupo é sincronizada pela máscara (simples só expiram junto da máscara).

function applyPlayerDebuff(type, value, turns) {
    if (!gameState.debuffs) gameState.debuffs = {};

    // IMUNIDADES por título continuam funcionando normalmente (mantém lógica anterior).

    // ==== Máscaras/Compostos ====
    if (isCompositeBuff(type)) {
        const group = COMPOSITE_BUFFS[type];
        if (!group || !Array.isArray(group)) return;

        // Salva máscara no estado (para UI exibir unificado e expiração sincronizada)
        gameState.debuffs[type] = {
            group,
            values: value,
            turns: turns,
            applied: true // flag para saber que é máscara ativa
        };

        // Aplica cada debuff simples individualmente
        group.forEach(stat => {
            let val = typeof value === "object" ? value[stat] : value;
            if (typeof val !== "number") return;
            // No caso de sangramento (tick) ou outros dots, manter regra própria!
            if (stat === "sangramento") {
                // Para sangramento, sempre 3 turnos, ticks decrescentes
                let ticks = [];
                if (val > 20) {
                    ticks = [val, val - 3, val - 6];
                } else if (val > 10) {
                    ticks = [val, val - 2, val - 4];
                } else {
                    ticks = [val, val - 1, val - 2];
                }
                ticks = ticks.map(v => (v > 0 ? v : 1));
                gameState.debuffs[stat] = { value: ticks[0], ticks, turn: 0, turns: 3 };
            } else {
                gameState.debuffs[stat] = { value: val, turns: turns };
            }
        });
        return;
    }

    // ==== Debuffs simples, lógica padrão (sem mudanças) ====
    // (manter todos tratamentos e imunidades existentes, para não quebrar design legado)
    // -- IMUNIDADES POR TÍTULO EQUIPADO (conforme padrão anterior) --
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
        ticks = ticks.map(v => (v > 0 ? v : 1));
        gameState.debuffs.sangramento = { value: ticks[0], ticks, turn: 0, turns: 3 };
        return;
    }

    // AURA SOMBRIA: Suporta objeto { sanidade: X, defesa: Y }, duração igual para ambos.
    if (type === "aura_sombria" && typeof value === "object" && value !== null) {
        const sanidadeTick = typeof value.sanidade === "number" ? value.sanidade : 0;
        const defesaRed = typeof value.defesa === "number" ? value.defesa : 0;
        gameState.debuffs.aura_sombria = {
            sanidadeTick,
            defesaRed,
            turns: typeof turns === "number" && turns > 0 ? turns : 1,
            turn: 0
        };
        if (defesaRed > 0) {
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

/* =====================[ FIM TRECHO 4 ]===================== */

/* =====================[ TRECHO 5: BUFFS DO INIMIGO — APLICAÇÃO E ATUALIZAÇÃO ]===================== */
// Não alterado, segue padrão original
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
/* =====================[ FIM TRECHO 6 ]===================== */

/* =====================[ TRECHO 7: TICK DEBUFFS DO PLAYER — ATUALIZAÇÃO POR TURNO ]===================== */
// Mantido padrão anterior, mas debuffs simples agora são expurgados juntos quando a máscara expira (feito na lógica da UI/status.js, caso necessário).

function tickPlayerDebuffs() {
    if (!gameState.debuffs) return;
    for (const type in gameState.debuffs) {
        // Veneno (valor fixo), chamas tbm é processado aqui
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

        // AURA SOMBRIA: DOT de sanidade + defesa fixa, ambos expiram juntos
        if (type === "aura_sombria") {
            const debuff = gameState.debuffs[type];
            if (debuff && typeof debuff.sanidadeTick === "number" && debuff.sanidadeTick > 0) {
                if (typeof gameState.sanity === "number") {
                    gameState.sanity = Math.max(0, gameState.sanity - debuff.sanidadeTick);
                    addMessage(`A aura sombria drena sua sanidade! (-${debuff.sanidadeTick})`, true);
                }
            }
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
            if (gameState.debuffs.defesa && typeof gameState.debuffs[type].defesaRed === "number") {
                gameState.debuffs.defesa.value -= gameState.debuffs[type].defesaRed;
                if (gameState.debuffs.defesa.value <= 0) {
                    delete gameState.debuffs.defesa;
                }
            }
            delete gameState.debuffs[type];
            continue;
        }
        // Expiração de máscara composta: remove todos simples do grupo sincronizados.
        if (isCompositeBuff(type) && gameState.debuffs[type].turns <= 0) {
            const group = COMPOSITE_BUFFS[type];
            if (Array.isArray(group)) {
                group.forEach(stat => {
                    if (gameState.debuffs[stat]) delete gameState.debuffs[stat];
                });
            }
            delete gameState.debuffs[type];
            continue;
        }
        // Remove buff/debuff se acabou a duração (exceto sangramento/aura_sombria já removidos acima)
        if (gameState.debuffs[type] && type !== "sangramento" && type !== "aura_sombria" && !isCompositeBuff(type) && gameState.debuffs[type].turns <= 0) {
            delete gameState.debuffs[type];
        }
    }
}
/* =====================[ FIM TRECHO 7 ]===================== */

/* =====================[ EXPORTS GLOBAIS PARA DEBUG/INTEGRAÇÃO ]===================== */
window.applyPlayerDebuff = applyPlayerDebuff;
window.applyEnemyBuff = applyEnemyBuff;
window.tickPlayerDebuffs = tickPlayerDebuffs;
window.tickEnemyBuffs = tickEnemyBuffs;
window.getBuffInfo = getBuffInfo;
window.isCompositeBuff = isCompositeBuff;
window.getPlayerForcaAtual = getPlayerForcaAtual;
window.getPlayerDefesaAtual = getPlayerDefesaAtual;
window.getPlayerAgilidadeAtual = getPlayerAgilidadeAtual;
window.getPlayerPrecisaoAtual = getPlayerPrecisaoAtual;
window.getEnemyForcaAtual = getEnemyForcaAtual;
window.getEnemyDefesaAtual = getEnemyDefesaAtual;
window.getEnemyAgilidadeAtual = getEnemyAgilidadeAtual;
window.getEnemyPrecisaoAtual = getEnemyPrecisaoAtual;
/* =====================[ FIM DO ARQUIVO buffUtils.js ]===================== */
