// enemyBehaviors.js — Define o comportamento especial de cada inimigo durante o combate (habilidades únicas, ataques especiais, buffs/debuffs aplicados), integrado ao motor de combate.

/* =====================[ TRECHO 1: HANDLERS DE COMPORTAMENTO DE INIMIGOS ]===================== */
const ENEMY_BEHAVIORS = {
    "Slime Verde": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("veneno", 3, 2);
            addMessage("O Slime Verde expele uma gosma ácida! Você ficará envenenado por 2 turnos.", true);
        }
    },
    "Cogumelo Saltitante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("agilidade", 3, 2);
            addMessage("O Cogumelo Saltitante solta esporos que deixam seus movimentos lentos! Sua agilidade foi reduzida.", true);
        }
    },
    "Planta que ri": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 75) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("agilidade", 2, 2);
            applyPlayerDebuff("forca", 2, 2);
            addMessage("A Planta que ri prende seus pés com vinhas e exala um pólen entorpecente! Sua agilidade e força caem por 2 turnos.", true);
        }
    },
    "Fada Travessa": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 75) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("stun", 1, 1);
            addMessage("A Fada Travessa lança pó de sono em seus olhos. Você fica atordoado e perde o próximo turno!", true);
        }
    },
    "Cubo de Gelatina": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("defesa", 2, 2);
            applyPlayerDebuff("agilidade", 2, 2);
            gameState.debuffs["teia_pegajosa"] = { turns: 2 };
            addMessage("O Cubo de Gelatina gruda em você, diminuindo sua defesa e agilidade por 2 turnos!", true);
        }
    },
    "Livro Falante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("precisao", 10, 2);
            addMessage("O Livro Falante recita enigmas — você se sente confuso, sua precisão cai por 2 turnos!", true);
        }
    },
    "Salamandra de Néon": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 75) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("agilidade", 2, 2);
            if (!gameState.debuffs["chama_neon"]) gameState.debuffs["chama_neon"] = { value: 3, turns: 2 };
            else {
                gameState.debuffs["chama_neon"].turns = Math.max(gameState.debuffs["chama_neon"].turns, 2);
            }
            addMessage("As Chamas de Néon queimam sua pele e retardam seus movimentos!", true);
        }
    },
    "Olho Vigilante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("precisao", 10, 2);
            addMessage("O Olho Vigilante brilha intensamente — você fica momentaneamente cego! Sua precisão cai por 2 turnos.", true);
        }
    },
    "Orbe Sombria": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("defesa", 2, 2);
            if (!gameState.debuffs["sanidade_sombra"]) gameState.debuffs["sanidade_sombra"] = { value: 5, turns: 2 };
            else {
                gameState.debuffs["sanidade_sombra"].turns = Math.max(gameState.debuffs["sanidade_sombra"].turns, 2);
            }
            addMessage("Uma aura negra envolve você, corroendo sua defesa e abalando sua sanidade por 2 turnos!", true);
        }
    },
    "Gárgula de Pedra": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 85) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("defesa", 3, 2);
            addMessage("A Gárgula acerta um golpe brutal, reduzindo sua defesa por 2 turnos!", true);
        }
    },
    // Bosses Capítulo 1 (exemplo com ataques básicos — ajuste para mecânicas especiais se quiser)
    "Slime Sábio": function(enemy) { ataqueInimigoBasico(enemy); },
    "Cogumelo Ancestral": function(enemy) { ataqueInimigoBasico(enemy); },
    "Planta Voraz": function(enemy) { ataqueInimigoBasico(enemy); },
    "Fada Sombria": function(enemy) { ataqueInimigoBasico(enemy); },
    "Cubo de Espinhos": function(enemy) { ataqueInimigoBasico(enemy); },
    "Livro Proibido": function(enemy) { ataqueInimigoBasico(enemy); },
    "Salamandra Radiante": function(enemy) { ataqueInimigoBasico(enemy); },
    "Olho Onisciente": function(enemy) { ataqueInimigoBasico(enemy); },
    "Orbe Abissal": function(enemy) { ataqueInimigoBasico(enemy); },
    "Gárgula Ancestral": function(enemy) { ataqueInimigoBasico(enemy); }
};
/* =====================[ FIM TRECHO 1 ]===================== */

/* =====================[ TRECHO 2: EXPORTAÇÃO GLOBAL ]===================== */
window.ENEMY_BEHAVIORS = ENEMY_BEHAVIORS;
/* =====================[ FIM DO ARQUIVO enemyBehaviors.js ]===================== */
