// enemyBehaviors.js — Define o comportamento especial de cada inimigo durante o combate (habilidades únicas, ataques especiais, buffs/debuffs aplicados), integrado ao motor de combate.

/* =====================[ TRECHO 1: HANDLERS DE COMPORTAMENTO DE INIMIGOS ]===================== */
const ENEMY_BEHAVIORS = {
    // Monstros comuns do Capítulo 1
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
            applyPlayerDebuff("grilhoes_naturais", 0, 2);
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
            applyPlayerDebuff("gelatina_pegajosa", 0, 2);
            applyPlayerDebuff("defesa", 2, 2);
            applyPlayerDebuff("agilidade", 2, 2);
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
            applyPlayerDebuff("chama_neon", 0, 2);
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
            applyPlayerDebuff("aura_sombria", 0, 2);
            applyPlayerDebuff("defesa", 2, 2);
            if (!gameState.debuffs["aura_sombria"]) gameState.debuffs["aura_sombria"] = { value: 5, turns: 2 };
            else {
                gameState.debuffs["aura_sombria"].turns = Math.max(gameState.debuffs["aura_sombria"].turns, 2);
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

    // Bosses Capítulo 1 — habilidades exclusivas
    "Slime Sábio": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("gosma_paralisante", 0, 3);
            applyPlayerDebuff("agilidade", 3, 3);
            applyPlayerDebuff("defesa", 3, 3);
            addMessage("O Slime Sábio lança uma gosma paralisante! Sua defesa e agilidade caem drasticamente.", true);
        }
    },
    "Cogumelo Ancestral": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("esporos_alucinogenos", 0, 3);
            applyPlayerDebuff("precisao", 3, 3);
            if (!gameState.sanity) gameState.sanity = 50;
            gameState.sanity = Math.max(0, gameState.sanity - 4);
            addMessage("Esporos do Cogumelo Ancestral confundem sua mente e visão!", true);
        }
    },
    "Planta Voraz": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            applyEnemyBuff("crescimento_selvagem", 0, 2, enemy);
            if (!enemy.buffs) enemy.buffs = {};
            if (!enemy.buffs["forca"]) enemy.buffs["forca"] = { value: 3, turns: 2 };
            if (!enemy.buffs["agilidade"]) enemy.buffs["agilidade"] = { value: 2, turns: 2 };
            addMessage("A Planta Voraz se enrosca e cresce rapidamente, ficando mais forte e ágil!", true);
        }
    },
    "Fada Sombria": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("encantamento_noturno", 0, 2);
            applyPlayerDebuff("stun", 1, 1);
            applyPlayerDebuff("defesa", 2, 2);
            addMessage("A Fada Sombria lança magia negra — você fica atordoado e sente sua defesa se esvaindo!", true);
        }
    },
    "Cubo de Espinhos": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("perfuracao_profunda", 0, 2);
            applyPlayerDebuff("defesa", 4, 2);
            if (!gameState.debuffs["perfuracao_profunda"]) gameState.debuffs["perfuracao_profunda"] = { turns: 2 };
            addMessage("Espinhos perfuram sua armadura, reduzindo defesa e causando dano contínuo!", true);
        }
    },
    "Livro Proibido": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("revelacao_proibida", 0, 3);
            applyPlayerDebuff("sanidade", 4, 3);
            applyPlayerDebuff("precisao", 3, 3);
            addMessage("Palavras proibidas enfraquecem sua sanidade e precisão!", true);
        }
    },
    "Salamandra Radiante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            applyEnemyBuff("chamas_ardentes", 0, 2, enemy);
            if (!enemy.buffs) enemy.buffs = {};
            if (!enemy.buffs["agilidade"]) enemy.buffs["agilidade"] = { value: 4, turns: 2 };
            addMessage("A Salamandra se envolve em chamas, movendo-se com velocidade extrema!", true);
        }
    },
    "Olho Onisciente": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("olhar_penetrante", 0, 2);
            applyPlayerDebuff("defesa", 3, 2);
            applyPlayerDebuff("precisao", 2, 2);
            addMessage("O Olho Onisciente expõe suas fraquezas e confunde sua mente!", true);
        }
    },
    "Orbe Abissal": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("vortice_abissal", 0, 2);
            applyPlayerDebuff("sanidade", 3, 2);
            applyPlayerDebuff("defesa", 3, 2);
            addMessage("Energias abissais drenam sua mente e proteção!", true);
        }
    },
    "Gárgula Ancestral": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            applyEnemyBuff("endurecimento_ancestral", 0, 3, enemy);
            if (!enemy.buffs) enemy.buffs = {};
            if (!enemy.buffs["defesa"]) enemy.buffs["defesa"] = { value: 4, turns: 3 };
            addMessage("A Gárgula Ancestral endurece sua pele pétrea, tornando-se quase invulnerável!", true);
        }
    }
};
/* =====================[ FIM TRECHO 1 ]===================== */

/* =====================[ TRECHO 2: EXPORTAÇÃO GLOBAL ]===================== */
window.ENEMY_BEHAVIORS = ENEMY_BEHAVIORS;
/* =====================[ FIM DO ARQUIVO enemyBehaviors.js ]===================== */
